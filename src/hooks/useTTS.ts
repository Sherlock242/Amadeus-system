
import { useState, useCallback, useEffect, useRef } from 'react';
import type { TtsSettings } from '@/types';
import { generateFishAudio } from '@/app/actions/tts';

interface UseTTSReturn {
  speak: (text: string, settings: TtsSettings) => void;
  cancel: () => void;
  voices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
  progress: number;
  currentTime: number;
  duration: number;
}

export const useTTS = (): UseTTSReturn => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const speak = useCallback(async (text: string, settings: TtsSettings) => {
    if (!text) return;
    
    cancel();
    setProgress(0);
    setCurrentTime(0);

    try {
      const result = await generateFishAudio(text);
      
      if (result && result.audioData) {
        const audio = new Audio(result.audioData);
        audioRef.current = audio;
        
        audio.onplay = () => {
          setIsSpeaking(true);
          setDuration(audio.duration || 0);
        };
        audio.onloadedmetadata = () => {
          setDuration(audio.duration);
        };
        audio.onended = () => {
          setIsSpeaking(false);
          setProgress(1);
          setCurrentTime(audio.duration);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setProgress(0);
        };

        let rafId: number;
        const updateProgress = () => {
          if (audioRef.current && !audioRef.current.paused && audioRef.current.duration) {
            const current = audioRef.current.currentTime;
            setCurrentTime(current);
            setProgress(current / audioRef.current.duration);
            rafId = requestAnimationFrame(updateProgress);
          }
        };

        audio.addEventListener('play', () => {
          rafId = requestAnimationFrame(updateProgress);
        });

        audio.addEventListener('pause', () => {
          cancelAnimationFrame(rafId);
        });

        await audio.play();
      }
    } catch (err) {
      console.error('Fish Audio TTS execution failed:', err);
      setIsSpeaking(false);
      setProgress(0);
    }
  }, [cancel]);

  return { speak, cancel, voices, isSpeaking, progress, currentTime, duration };
};
