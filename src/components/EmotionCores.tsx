import React from 'react';
import type { EmotionalStateValues } from '@/types';

interface EmotionCoresProps {
  emotionalState: EmotionalStateValues;
}

const EmotionMeter: React.FC<{ label: string; value: number; isSpecial?: boolean }> = ({ label, value, isSpecial }) => {
  const safeValue = isNaN(value) ? 0 : value;
  const normalizedValue = Math.max(0, Math.min(100, safeValue));
  
  let barColorClass = isSpecial ? (label === 'Dopamine' ? 'bg-cyan-400' : 'bg-purple-600') : 'bg-amber-500';
  
  if (!isSpecial) {
    if (normalizedValue > 75) {
        barColorClass = 'bg-red-500';
    } else if (normalizedValue > 50) {
        barColorClass = 'bg-yellow-500';
    }
  }

  const shadowColor = isSpecial ? (label === 'Dopamine' ? 'rgba(34, 211, 238, 0.6)' : 'rgba(147, 51, 234, 0.6)') : 'rgba(245, 158, 11, 0.6)';

  return (
    <div>
      <div className="flex justify-between items-center text-[10px] mb-0.5">
        <span className={`font-roboto-mono uppercase tracking-wider ${isSpecial ? 'text-white font-bold' : 'text-amber-200'}`}>{label}</span>
        <span className="font-roboto-mono text-white opacity-70">{normalizedValue.toFixed(0)}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden border border-white/5">
        <div 
          className={`h-full rounded-full ${barColorClass} transition-all duration-1000 ease-out`} 
          style={{ 
            width: `${normalizedValue}%`, 
            boxShadow: normalizedValue > 10 ? `0 0 8px ${shadowColor}` : 'none' 
          }}
        ></div>
      </div>
    </div>
  );
};

const EmotionCores: React.FC<EmotionCoresProps> = ({ emotionalState }) => {
  return (
    <div className="space-y-4 border-t border-amber-500/30 pt-4 mt-4">
      <div className="grid grid-cols-2 gap-4 bg-white/5 p-2 rounded-lg border border-white/5">
         <EmotionMeter label="Dopamine" value={emotionalState.dopamine} isSpecial />
         <EmotionMeter label="Stress" value={emotionalState.stress} isSpecial />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <EmotionMeter label="Annoyance" value={emotionalState.annoyance} />
        <EmotionMeter label="Warmth" value={emotionalState.warmth} />
        <EmotionMeter label="Curiosity" value={emotionalState.curiosity} />
        <EmotionMeter label="Melancholy" value={emotionalState.melancholy} />
        <EmotionMeter label="Confidence" value={emotionalState.confidence} />
        <EmotionMeter label="Anxiety" value={emotionalState.anxiety} />
        <EmotionMeter label="Sarcasm" value={emotionalState.sarcasm} />
        <EmotionMeter label="Trust" value={emotionalState.trust} />
      </div>
    </div>
  );
};

export default EmotionCores;
