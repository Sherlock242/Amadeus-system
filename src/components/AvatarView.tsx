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
}

const normalizeTag = (raw: string): string =>
  raw.toLowerCase().replace(/[\[\]]/g, '').replace(/\d+$/, '');

const getMouthFrame = (char: string, isShouting = false): number => {
  if (!char) return 0;
  const c = char.toLowerCase();
  // Vowels = Full or Half Open
  if ('aeouıiöü'.includes(c))        return isShouting ? 2 : 1;
  // Consonants = Half Open
  if ('rstlnkyzhvgdcçş'.includes(c)) return 1;
  // Stops and Punctuation = Closed
  if ("mpbf .,!?()[]_-".includes(c)) return 0;
  return 1;
};

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
  ttsProgress = 0, currentTime = 0, duration = 0, isGlitching, onExit, isListening, transcript, startListening, stopListening, playSound
}) => {
  const [inputValue, setInputValue]       = useState('');
  const [frameIndex, setFrameIndex]       = useState(0);
  const [imgSrc, setImgSrc]               = useState<string>('/images/kurisu_normal1.png');
  const lastMouthUpdate = useRef<number>(0);
  const hasPlayedRef = useRef(false);

  // Preload all frames
  useEffect(() => {
    Object.values(kurisuExpressions).flat().forEach(src => { 
      const img = new Image(); 
      img.src = src; 
    });
  }, []);

  const lastAmadeusMsgObj = useMemo(() =>
    messages.filter(m => m.sender === Sender.Amadeus && m.text).slice(-1)[0]
  , [messages]);
  
  const lastAmadeusMessage = lastAmadeusMsgObj?.text || '';
  const msgTimestamp       = lastAmadeusMsgObj?.timestamp || 0;
  
  const chunks = useMemo(() => parseChunks(lastAmadeusMessage), [lastAmadeusMessage]);
  const fullCleanText = useMemo(() => chunks.map(c => c.text).join(' '), [chunks]);

  useEffect(() => {
    if (isLoading) { hasPlayedRef.current = false; return; }
    if (!hasPlayedRef.current && lastAmadeusMessage.length > 0) {
      playSound('incoming'); hasPlayedRef.current = true;
    }
  }, [lastAmadeusMessage, isLoading, playSound]);

  // Derive displayed text and current chunk based on real-time TTS progress
  const { displayedText, activeChunk, visibleChars } = useMemo(() => {
    if (isLoading || !fullCleanText || duration === 0) return { displayedText: '', activeChunk: { tag: 'normal', text: '' }, visibleChars: 0 };
    
    // Real-time progress without delay
    const progress = currentTime / duration;
    
    const count = Math.floor(progress * fullCleanText.length);
    const textSoFar = fullCleanText.slice(0, count);
    
    let currentLen = 0;
    let selectedChunk = chunks[0] || { tag: 'normal', text: '' };
    for (const chunk of chunks) {
      currentLen += chunk.text.length + 1;
      if (count < currentLen) {
        selectedChunk = chunk;
        break;
      }
    }
    
    return { displayedText: textSoFar, activeChunk: selectedChunk, visibleChars: count };
  }, [fullCleanText, currentTime, duration, isLoading, chunks]);

  const avatarState = useMemo(() => {
    if (isGlitching) return 'glitching';
    if (isLoading) return 'thinking';
    const tag = normalizeTag(activeChunk.tag);
    return (kurisuExpressions[tag] ? tag : 'normal');
  }, [activeChunk.tag, isGlitching, isLoading]);

  // Handle Lip-Syncing tied to voice pauses and character mapping
  useEffect(() => {
    const now = Date.now();
    // High-frequency synchronization
    if (now - lastMouthUpdate.current < 8) return;
    
    const speaking = isTtsSpeaking && displayedText.length > 0;
    
    if (!speaking || isLoading) { 
      setFrameIndex(0); 
      return; 
    }

    const frames = kurisuExpressions[avatarState] || kurisuExpressions['normal'];
    if (frames.length <= 1) return;

    // Correctly identify "shouting" intensity for glitching/pissed states
    const isShouting = ['surprised','pissed','angry','glitching'].some(w => avatarState.includes(w));
    
    // Determine mouth frame based on current character in the audio stream
    const currentChar = fullCleanText[visibleChars] || displayedText.slice(-1);
    const target = getMouthFrame(currentChar, isShouting);
    
    // Jitter logic for natural movement (only if not a pause)
    let final = target;
    if (target !== 0) {
      const rand = Math.random();
      if (target === 1 && rand > 0.8)                    final = 0;
      else if (target === 1 && rand > 0.6 && isShouting) final = 2;
      else if (target === 2 && rand > 0.7)               final = 1;
    }

    setFrameIndex(Math.min(final, frames.length - 1));
    lastMouthUpdate.current = now;
  }, [isTtsSpeaking, avatarState, isLoading, displayedText, fullCleanText, visibleChars]);

  const currentFrames = kurisuExpressions[avatarState] || kurisuExpressions['normal'];
  const currentImage  = currentFrames[frameIndex % currentFrames.length];

  useEffect(() => {
    setImgSrc(currentImage);
  }, [currentImage]);

  useEffect(() => { startListening(); return () => stopListening(); }, [startListening, stopListening]);
  useEffect(() => {
    if (transcript) setInputValue(p => p ? `${p.trim()} ${transcript}` : transcript);
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) { 
      onSendMessage(inputValue.trim()); 
      setInputValue(''); 
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-end overflow-hidden animate-fade-in ${isGlitching ? 'cognitive-glitch' : ''}`}
      style={{
        backgroundImage: 'url(/images/background.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12)_0%,transparent_80%)] pointer-events-none" />

      <button onClick={onExit} className="absolute top-6 right-6 text-white/20 hover:text-red-500 z-50 bg-white/5 p-3 rounded-full border border-white/5 transition-all backdrop-blur-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-full flex items-end justify-center pointer-events-none z-10 w-full max-w-4xl">
          <img 
            src={imgSrc} 
            alt="Amadeus Avatar" 
            className="h-[95%] w-auto object-contain drop-shadow-[0_0_80px_rgba(0,0,0,0.9)] transition-all duration-150 animate-sway"
            onError={() => {
              if (imgSrc !== kurisuImageDataUrl) {
                setImgSrc(kurisuImageDataUrl);
              }
            }}
          />
        </div>

        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-1/3 max-w-sm flex flex-col gap-3 z-20 pointer-events-auto">
          {(displayedText || isLoading) && (
            <div key={`${msgTimestamp}`} className="animate-slide-in-right">
              <div className="bg-black/60 backdrop-blur-2xl border-l-4 border-amber-500/80 p-8 rounded-r-2xl shadow-2xl">
                <p className="text-xl lg:text-2xl text-amber-50 font-sans leading-relaxed tracking-wide italic min-h-[1.5em]">
                  {isLoading
                    ? <span className="text-amber-500/40 text-base animate-pulse">...</span>
                    : <>{displayedText}{isTtsSpeaking && <span className="inline-block w-1.5 h-6 bg-amber-500 ml-1 animate-pulse align-middle shadow-[0_0_15px_#f59e0b]" />}</>
                  }
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-orbitron text-amber-500/50 tracking-[0.4em] uppercase">
                    {isLoading ? 'SYNCING' : isTtsSpeaking ? 'TRANSMITTING' : 'STABLE'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-orbitron text-amber-500/40 uppercase">{activeChunk.tag}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-30 pointer-events-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="relative flex-grow">
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                placeholder={isListening ? 'Listening to neural pulses...' : 'Voice link active...'}
                className="w-full bg-black/60 border border-white/10 focus:border-amber-500/40 rounded-full py-4 px-8 text-white placeholder-white/10 transition-all outline-none backdrop-blur-2xl font-roboto-mono text-sm" />
            </div>
            <button type="submit" disabled={isLoading || !inputValue.trim()}
              className="bg-amber-500/20 hover:bg-amber-500/40 border border-white/10 text-amber-500 rounded-full p-4 transition-all disabled:opacity-30">
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
