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
 * ENGLISH PHONETIC ENGINE (24 FPS)
 * Logic: Maps Latin characters to 3-frame viseme states.
 * Frame 0: Closed (Punctuation, Spaces, M/P/B Bilabials)
 * Frame 1: Half-Open (Narrow vowels, Consonants)
 * Frame 2: Wide-Open (A, O, W Wide energy states)
 */
const processEnglishPhonetics = (char: string): number => {
  if (!char) return 0;
  const c = char.toLowerCase();
  const EN_STOPS = " .,!?;:()[]_-\n\t'\"`‘’“”–—…";
  if (EN_STOPS.includes(c)) return 0;
  if ("mpb".includes(c)) return 0;
  if ("aow".includes(c)) return 2;
  return 1;
};

/**
 * JAPANESE PHONETIC ENGINE (64 FPS)
 * Logic: Maps Kana syllables to 3-frame viseme states.
 */
const processJapanesePhonetics = (char: string): number => {
  if (!char) return 0;
  const JP_STOPS = " .,!?;:()[]_-\n\t'\"「」。、！？…・（）『』【】っッんン";
  if (JP_STOPS.includes(char)) return 0;
  const JP_BILABIALS = "まみむめもばびぶべぼぱぴぷぺぽマミＭメモバビブベボパピプペポ"; 
  if (JP_BILABIALS.includes(char)) return 0;
  const JP_WIDE = "あかさたなはらわがざだおこそとのほよろごぞどアサタナハヤラワガザダオコソトノホモヨロゴゾド"; 
  if (JP_WIDE.includes(char)) return 2;
  return 1;
};

/**
 * TEMPORAL MAPPING CONSTANTS (From Cheat Sheet)
 * Values in relative weights (ms approximation)
 */
const ENGLISH_PAUSE_WEIGHTS: Record<string, number> = {
  '.': 650,
  '?': 650,
  ',': 250,
  ';': 450,
  ':': 500,
  '!': 550,
  '\n': 1250, // Paragraph break
};
const DEFAULT_CHAR_WEIGHT = 65; // Average ms per spoken char in English

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

  // Separate FPS counters
  const FPS = language === 'jp' ? 64 : 24;

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

  // TEMPORAL MAP GENERATOR (Professional Timing Injection)
  const temporalMap = useMemo(() => {
    if (language !== 'en' || !fullCleanText || duration === 0) return null;

    let totalWeight = 0;
    const weights = Array.from(fullCleanText).map(char => {
      const w = ENGLISH_PAUSE_WEIGHTS[char] || DEFAULT_CHAR_WEIGHT;
      totalWeight += w;
      return w;
    });

    const scale = duration / totalWeight;
    let elapsed = 0;
    return weights.map((w, i) => {
      const charDuration = w * scale;
      elapsed += charDuration;
      return { char: fullCleanText[i], endTime: elapsed };
    });
  }, [fullCleanText, duration, language]);

  // UNIFIED SYNC LOGIC
  const { displayedText, activeChunk, charIndex } = useMemo(() => {
    if (isLoading || !fullCleanText || duration === 0 || currentTime === 0) {
      return { displayedText: '', activeChunk: { tag: 'normal', text: '' }, charIndex: -1 };
    }

    let currentIndex = 0;
    
    if (language === 'en' && temporalMap) {
      // Find the character whose time slot corresponds to the current audio clock
      const found = temporalMap.findIndex(slot => slot.endTime >= currentTime);
      currentIndex = found === -1 ? fullCleanText.length : found;
    } else {
      // Standard linear fallback for Japanese (sampled at 64fps)
      const progress = Math.min(currentTime / duration, 1);
      currentIndex = Math.floor(progress * fullCleanText.length);
    }

    const charSafe = Math.min(currentIndex, fullCleanText.length - 1);
    
    let currentLen = 0;
    let selectedChunk = chunks[0] || { tag: 'normal', text: '' };
    for (const chunk of chunks) {
      currentLen += chunk.text.length + 1;
      if (charSafe < currentLen) {
        selectedChunk = chunk;
        break;
      }
    }

    return { displayedText: fullCleanText.slice(0, currentIndex), activeChunk: selectedChunk, charIndex: charSafe };
  }, [fullCleanText, currentTime, duration, isLoading, chunks, language, temporalMap]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [displayedText, isLoading]);

  const avatarState = useMemo(() => {
    if (currentTime === 0 && !isLoading) return 'normal';
    if (isGlitching) return 'glitching';
    if (isLoading) return 'thinking';

    const tag = normalizeTag(activeChunk.tag);
    const isProfileBase = tag.includes('sided_') || ['thinking', 'surprised', 'pleasant', 'talking'].includes(tag);
    
    if (isTtsSpeaking && isProfileBase) return 'kurisu_sided_talking';
    return (kurisuExpressions[tag] ? tag : 'normal');
  }, [activeChunk.tag, isGlitching, isLoading, isTtsSpeaking, currentTime]);

  const isProfileView = useMemo(() => {
    const state = avatarState.toLowerCase();
    return state.includes('sided_') || ['thinking', 'surprised', 'pleasant', 'talking'].includes(state);
  }, [avatarState]);

  useEffect(() => {
    if (!isTtsSpeaking || isLoading || charIndex === -1 || currentTime === 0) {
      setFrameIndex(0); return;
    }
    if (currentTime >= duration - 0.05) { setFrameIndex(0); return; }

    const char = fullCleanText[charIndex] || '';
    
    // Independent Language Settings (No Mixed Coding)
    if (language === 'jp') {
      setFrameIndex(processJapanesePhonetics(char));
    } else {
      setFrameIndex(processEnglishPhonetics(char));
    }
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
    if (inputValue.trim() && !isLoading) { onSendMessage(inputValue.trim()); setInputValue(''); }
  };

  const blinkAsset = isProfileView ? '/images/kurisu_side_blink.png' : '/images/kurisu_blink.png';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden animate-fade-in ${isGlitching ? 'cognitive-glitch' : ''}`}>
      <img src="/images/background.jpeg" alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/30 z-1 pointer-events-none" />

      {/* GPU READY PRE-DECODING CONTAINER */}
      <div className="hidden pointer-events-none opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        {Object.values(kurisuExpressions).flat().map((frame, i) => (
          <img key={i} src={frame} alt="" className="w-1 h-1" loading="eager" decoding="sync" />
        ))}
        <img src="/images/kurisu_blink.png" alt="" className="w-1 h-1" loading="eager" decoding="sync" />
        <img src="/images/kurisu_side_blink.png" alt="" className="w-1 h-1" loading="eager" decoding="sync" />
      </div>

      <button onClick={onExit} className="absolute top-6 right-6 text-white/20 hover:text-red-500 z-50 bg-white/5 p-3 rounded-full border border-white/5 transition-all backdrop-blur-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none z-10">
        <div className="relative h-full flex items-end justify-center animate-sway transform-gpu w-full max-w-4xl will-change-transform">
          <div className="relative h-full flex items-end justify-center transform-gpu">
            <img 
              src={imgSrc} 
              alt="Amadeus Avatar" 
              className="h-[95%] w-auto object-contain drop-shadow-[0_0_80px_rgba(0,0,0,0.9)] transform-gpu will-change-transform"
              onError={() => { if (imgSrc !== kurisuImageDataUrl) setImgSrc(kurisuImageDataUrl); }}
              decoding="sync"
            />
            {isBlinking && (
              <img 
                src={blinkAsset} 
                alt="Blink" 
                className="absolute bottom-0 h-[95%] w-auto object-contain transform-gpu"
                decoding="sync"
              />
            )}
          </div>
        </div>

        <div className="absolute bottom-40 right-4 left-4 md:right-12 md:left-auto md:top-1/2 md:-translate-y-1/2 md:w-1/3 md:max-sm flex flex-col gap-3 z-20 pointer-events-auto">
          {(displayedText || isLoading) && (
            <div key={`${msgTimestamp}`} className="animate-slide-in-right">
              <div className="bg-black/60 backdrop-blur-2xl border-l-4 border-amber-500/80 p-8 rounded-r-2xl shadow-2xl overflow-hidden flex flex-col">
                <div ref={scrollRef} className="max-h-[50vh] overflow-y-auto scrollbar-thin-amber space-y-6">
                  {isLoading ? (
                    <p className="text-xl lg:text-2xl text-amber-50/70 font-sans leading-relaxed tracking-wide italic animate-pulse">Synchronizing neural matrix...</p>
                  ) : (
                    <>
                      <p className="text-xl lg:text-2xl text-amber-50 font-sans leading-relaxed tracking-wide italic">
                        {displayedText}
                        {isTtsSpeaking && currentTime < duration && (
                          <span className="inline-block w-1.5 h-6 bg-amber-500 ml-1 animate-pulse align-middle" />
                        )}
                      </p>
                      {translation && (
                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-fade-in">
                          <span className="text-[8px] font-orbitron text-amber-500/60 uppercase tracking-widest block mb-2">Translation</span>
                          <p className="text-amber-200/80 text-sm italic leading-relaxed">{translation}</p>
                        </div>
                      )}
                      {!isLoading && currentTime >= duration && language === 'jp' && !translation && (
                        <button onClick={(e) => { e.stopPropagation(); onTranslate?.(); }} className="mt-2 text-[9px] font-bold text-cyan-400 hover:text-cyan-300 font-bold uppercase transition-all tracking-widest border border-cyan-400/30 px-2 py-1 rounded bg-cyan-400/10 w-fit">Translate to English</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-30 pointer-events-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Message...'}
              className="w-full bg-black/60 border border-white/10 focus:border-amber-500/40 rounded-full py-4 px-8 text-white placeholder-white/10 transition-all outline-none backdrop-blur-2xl font-roboto-mono text-sm" />
            <button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-amber-500/20 hover:bg-amber-400/40 border border-white/10 text-amber-500 rounded-full p-4 transition-all disabled:opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AvatarView;