
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Message } from '@/types';
import { Sender } from '@/types';
import { kurisuExpressions } from '@/assets/kurisu_expressions';
import { kurisuImageDataUrl } from '@/assets/kurisu_image';

interface AvatarViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isSpeaking: boolean;
  isTtsSpeaking?: boolean;
  ttsProgress?: number;
  currentTime?: number;
  duration?: number;
  isGlitching: boolean;
  expression: string;
  onExit: () => void;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  playSound: (name: string) => void;
  playTypingSound: () => void;
  language?: 'en' | 'jp';
  onTranslate?: () => void;
}

/**
 * PROFESSIONAL VISEME MAPPING ENGINE
 * Industry-standard phonetic grouping for 2D lipsync
 */

// Japanese Phonetic Map
const JP_0_CLOSED = " .,!?;:()[]_-\n\t'\"「」。、！？…・（）『』【】っッんンまみむめもばびぶべぼぱぴぷぺぽマミムメモバビブベボパピプペポ";
const JP_2_OPEN   = "あかさたなはらわがざだおこそとのほよろごぞどぼぽアサタナハヤラワガザダオコソトノホモヨロゴゾドボポぁゃャ";

// English Phonetic Map
const EN_STOPS    = " .,!?;:()[]_-\n\t'\"`‘’“”–—…"; // Punctuation & Whitespace
const EN_BILABIAL = "mpb"; // Lips must touch
const EN_2_OPEN   = "aow";   // Wide/Rounded vowels

const getProfessionalVisemeFrame = (text: string, index: number, language: 'en' | 'jp'): number => {
  if (!text || index < 0 || index >= text.length) return 0;
  
  const char = text[index].toLowerCase();

  if (language === 'en') {
    // Current character triggers
    if (EN_STOPS.includes(char) || EN_BILABIAL.includes(char)) return 0;
    if (EN_2_OPEN.includes(char)) return 2;
    return 1; // Default to half-open
  } else {
    // Current character triggers
    if (JP_0_CLOSED.includes(char)) return 0;
    if (JP_2_OPEN.includes(char)) return 2;
    return 1; // Default to half-open
  }
};

const normalizeTag = (raw: string): string =>
  raw.toLowerCase().replace(/[\[\]]/g, '').replace(/\d+$/, '').trim();

interface Chunk { tag: string; text: string; }

const parseChunks = (message: string): Chunk[] => {
  if (!message) return [];
  const clean = message
    .replace(/\[TERMINATE(_[A-Z]+)?\]/g, '')
    .replace(/\[STATE:[\s\S]*?\]/g, '')
    .replace(/\[NEURAL:[\s\S]*?\]/g, '')
    .replace(/\[speed:[^\]]+\]/g, '')
    .trim();
  
  const matches = Array.from(clean.matchAll(/\[([a-z_]+\d*)\]\s*([^[]+)/g));
  if (matches.length > 0) {
    return matches
      .map(m => ({ tag: normalizeTag(m[1]), text: m[2].trim() }))
      .filter(c => c.text.length > 0);
  }
  
  const plain = clean.replace(/\[.*?\]/g, '').trim();
  return plain ? [{ tag: 'normal', text: plain }] : [];
};

const AvatarView: React.FC<AvatarViewProps> = ({
  messages, onSendMessage, isLoading, isSpeaking, isTtsSpeaking = false,
  currentTime = 0, duration = 0, isGlitching, onExit, isListening, transcript, startListening, stopListening, playSound,
  language = 'en', onTranslate
}) => {
  const [inputValue, setInputValue] = useState('');
  const [frameIndex, setFrameIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('/images/kurisu_normal1.png');
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasPlayedIncomingRef = useRef(false);

  // Pre-decoding for smooth initial conversation
  useEffect(() => {
    const allImages = [
      ...Object.values(kurisuExpressions).flat(),
      '/images/kurisu_blink.png',
      '/images/kurisu_side_blink.png'
    ];
    allImages.forEach(src => { 
      const img = new Image(); 
      img.src = src; 
    });
  }, []);

  // Blink logic
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
      const nextDelay = 2500 + Math.random() * 3000;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };
    blinkTimeout = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  const lastAmadeusMsgObj = useMemo(() =>
    messages.filter(m => m.sender === Sender.Amadeus && m.text).slice(-1)[0]
  , [messages]);
  
  const lastAmadeusMessage = lastAmadeusMsgObj?.text || '';
  const msgTimestamp = lastAmadeusMsgObj?.timestamp || 0;
  const translation = lastAmadeusMsgObj?.translation;
  
  const chunks = useMemo(() => parseChunks(lastAmadeusMessage), [lastAmadeusMessage]);
  const fullCleanText = useMemo(() => chunks.map(c => c.text).join(' '), [chunks]);

  useEffect(() => {
    if (isLoading) { hasPlayedIncomingRef.current = false; return; }
    if (!hasPlayedIncomingRef.current && lastAmadeusMessage.length > 0) {
      playSound('incoming'); hasPlayedIncomingRef.current = true;
    }
  }, [lastAmadeusMessage, isLoading, playSound]);

  // Sync Logic: Drives text and mouth from a single audio-locked temporal node
  const { displayedText, activeChunk, charIndex } = useMemo(() => {
    if (isLoading || !fullCleanText || duration === 0) {
      return { displayedText: '', activeChunk: chunks[0] || { tag: 'normal', text: '' }, charIndex: -1 };
    }
    const progress = Math.min(currentTime / duration, 1);
    const index = Math.floor(progress * fullCleanText.length);
    const charSafe = Math.min(index, fullCleanText.length - 1);
    
    let currentLen = 0;
    let selectedChunk = chunks[0] || { tag: 'normal', text: '' };
    for (const chunk of chunks) {
      currentLen += chunk.text.length + 1;
      if (charSafe < currentLen) {
        selectedChunk = chunk;
        break;
      }
    }

    return { 
      displayedText: fullCleanText.slice(0, index), 
      activeChunk: selectedChunk,
      charIndex: charSafe
    };
  }, [fullCleanText, currentTime, duration, isLoading, chunks]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedText, isLoading]);

  const avatarState = useMemo(() => {
    if (isGlitching) return 'glitching';
    if (isLoading) return 'thinking';
    const tag = normalizeTag(activeChunk.tag);
    const isProfileBase = tag.includes('sided_') || ['thinking', 'worried', 'surprised', 'pleasant'].includes(tag);
    if (isTtsSpeaking && isProfileBase) return 'sided_talking';
    return (kurisuExpressions[tag] ? tag : 'normal');
  }, [activeChunk.tag, isGlitching, isLoading, isTtsSpeaking]);

  const isProfileView = useMemo(() => {
    const tag = normalizeTag(activeChunk.tag);
    if (tag === 'side') return false; 
    return avatarState.includes('sided_') || ['thinking', 'worried', 'surprised', 'pleasant'].includes(avatarState);
  }, [avatarState, activeChunk.tag]);

  // Professional Animation Core: Maps current character context to viseme frames
  useEffect(() => {
    if (!isTtsSpeaking || isLoading || charIndex === -1) {
      setFrameIndex(0); return;
    }

    // Force closure at final moment of audio
    if (currentTime >= duration - 0.04) {
      setFrameIndex(0);
      return;
    }

    const targetFrame = getProfessionalVisemeFrame(fullCleanText, charIndex, language);
    setFrameIndex(targetFrame);
  }, [charIndex, fullCleanText, language, isTtsSpeaking, isLoading, currentTime, duration]);

  const currentFrames = kurisuExpressions[avatarState] || kurisuExpressions['normal'];
  const currentImage = currentFrames[frameIndex % currentFrames.length];

  useEffect(() => {
    if (currentImage) setImgSrc(currentImage);
  }, [currentImage]);

  useEffect(() => { 
    startListening(); return () => stopListening(); 
  }, [startListening, stopListening]);

  useEffect(() => {
    if (transcript) setInputValue(p => p ? `${p.trim()} ${transcript}` : transcript);
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) { 
      onSendMessage(inputValue.trim()); setInputValue(''); 
    }
  };

  const blinkAsset = isProfileView ? '/images/kurisu_side_blink.png' : '/images/kurisu_blink.png';

  const paragraphs = useMemo(() => {
    const words = language === 'jp' ? displayedText.split('') : displayedText.split(' ');
    const result: string[] = [];
    const chunkSize = language === 'jp' ? 150 : 100;
    for (let i = 0; i < words.length; i += chunkSize) {
      result.push(words.slice(i, i + chunkSize).join(language === 'jp' ? '' : ' '));
    }
    return result;
  }, [displayedText, language]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden animate-fade-in ${isGlitching ? 'cognitive-glitch' : ''}`}>
      <img src="/images/background.jpeg" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/30 z-1 pointer-events-none" />

      {/* ZERO-LAG PRE-RENDER CONTAINER */}
      <div className="hidden pointer-events-none opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        {Object.values(kurisuExpressions).flat().map((frame, i) => (
          <img key={i} src={frame} alt="" className="w-1 h-1" loading="eager" decoding="sync" />
        ))}
        <img src="/images/kurisu_blink.png" alt="" className="w-1 h-1" loading="eager" decoding="sync" />
        <img src="/images/kurisu_side_blink.png" alt="" className="w-1 h-1" loading="eager" decoding="sync" />
      </div>

      <button onClick={onExit} className="absolute top-6 right-6 text-white/20 hover:text-red-500 z-50 bg-white/5 p-3 rounded-full border border-white/5 transition-all backdrop-blur-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none z-10">
        <div className="relative h-full flex items-end justify-center animate-sway transform-gpu w-full max-w-4xl will-change-transform">
          <div className="relative h-full flex items-end justify-center transform-gpu">
            <img 
              src={imgSrc} 
              alt="Amadeus Avatar" 
              className="h-[95%] w-auto object-contain drop-shadow-[0_0_80px_rgba(0,0,0,0.9)] transform-gpu will-change-transform"
              onError={() => { if (imgSrc !== kurisuImageDataUrl) setImgSrc(kurisuImageDataUrl); }}
            />
            {isBlinking && (
              <img 
                src={blinkAsset} 
                alt="Blink" 
                className="absolute bottom-0 h-[95%] w-auto object-contain transform-gpu"
              />
            )}
          </div>
        </div>

        {/* Dynamic Subtitle Hub */}
        <div className="absolute bottom-40 right-4 left-4 md:right-12 md:left-auto md:top-1/2 md:-translate-y-1/2 md:w-1/3 md:max-sm flex flex-col gap-3 z-20 pointer-events-auto">
          {(displayedText || isLoading) && (
            <div key={`${msgTimestamp}`} className="animate-slide-in-right">
              <div className="bg-black/60 backdrop-blur-2xl border-l-4 border-amber-500/80 p-8 rounded-r-2xl shadow-2xl overflow-hidden flex flex-col">
                <div ref={scrollRef} className="max-h-[50vh] overflow-y-auto scrollbar-thin-amber space-y-6">
                  {isLoading ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xl lg:text-2xl text-amber-50/70 font-sans leading-relaxed tracking-wide italic animate-pulse">
                        Synchronizing neural matrix...
                      </p>
                      <div className="flex gap-1.5 ml-1">
                        <div className="w-1.5 h-1.5 bg-amber-500/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1.5 h-1.5 bg-amber-500/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1.5 h-1.5 bg-amber-500/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {paragraphs.map((para, idx) => (
                        <p key={idx} className="text-xl lg:text-2xl text-amber-50 font-sans leading-relaxed tracking-wide italic">
                          {para}
                          {idx === paragraphs.length - 1 && isTtsSpeaking && currentTime < duration && (
                            <span className="inline-block w-1.5 h-6 bg-amber-500 ml-1 animate-pulse align-middle" />
                          )}
                        </p>
                      ))}
                      {translation && (
                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-fade-in">
                          <span className="text-[8px] font-orbitron text-amber-500/60 uppercase tracking-widest block mb-2">Translation</span>
                          <p className="text-amber-200/80 text-sm italic leading-relaxed">{translation}</p>
                        </div>
                      )}
                      {!isLoading && currentTime >= duration && language === 'jp' && !translation && (
                        <button onClick={(e) => { e.stopPropagation(); onTranslate?.(); }} className="mt-2 text-[9px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest border border-cyan-400/30 px-2 py-1 rounded bg-cyan-400/10 w-fit">
                          Translate to English
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-orbitron text-amber-500/50 tracking-[0.4em] uppercase">{isLoading ? 'THINKING' : 'STABLE'}</span>
                  </div>
                  <span className="text-[10px] font-orbitron text-amber-500/40 uppercase">{activeChunk.tag || 'normal'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-30 pointer-events-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="relative flex-grow">
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Message...'}
                className="w-full bg-black/60 border border-white/10 focus:border-amber-500/40 rounded-full py-4 px-8 text-white placeholder-white/10 transition-all outline-none backdrop-blur-2xl font-roboto-mono text-sm" />
            </div>
            <button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-amber-500/20 hover:bg-amber-400/40 border border-white/10 text-amber-500 rounded-full p-4 transition-all disabled:opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvatarView;
