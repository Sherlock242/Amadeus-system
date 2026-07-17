
"use client";

import React, { useEffect, useState } from 'react';

export type CallMode = 'amadeus_calling' | 'user_calling' | 'rejected';
export type CallMood = 'warm' | 'curious' | 'melancholy' | 'awkward';

interface IncomingCallOverlayProps {
  mode: CallMode;
  mood?: CallMood;
  reason?: string;
  rejectMessage?: string;
  onAccept?: () => void;
  onDecline: () => void;
  minutesElapsed?: number;
}

const MOOD_COLORS: Record<CallMood, { primary: string; glow: string; text: string }> = {
  warm:       { primary: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  text: 'text-amber-400'  },
  curious:    { primary: '#06b6d4', glow: 'rgba(6,182,212,0.5)',   text: 'text-cyan-400'   },
  melancholy: { primary: '#8b5cf6', glow: 'rgba(139,92,246,0.5)',  text: 'text-violet-400' },
  awkward:    { primary: '#6b7280', glow: 'rgba(107,114,128,0.5)', text: 'text-slate-400'  },
};

const formatElapsed = (mins: number): string => {
  if (mins < 60)   return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
};

const IncomingCallOverlay: React.FC<IncomingCallOverlayProps> = ({
  mode, mood = 'curious', reason = 'STANDARD_ENCRYPTION',
  rejectMessage, onAccept, onDecline, minutesElapsed,
}) => {
  const colors = MOOD_COLORS[mood];

  if (mode === 'rejected') {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-12 font-orbitron overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          <div className="relative w-40 h-40">
            <img src="/images/kurisu_normal1.webp" alt="Kurisu" className="w-full h-full rounded-full object-cover border-2 border-slate-600 opacity-50" style={{ filter: 'grayscale(70%)' }} />
          </div>
          <div className="space-y-3">
            <div className="text-slate-500 text-[10px] tracking-[0.5em] uppercase">AMADEUS // CONNECTION REFUSED</div>
            <div className="text-slate-300 text-base tracking-widest">{rejectMessage || '...Şu an konuşmak istemiyorum.'}</div>
          </div>
          <button onClick={onDecline} className="mt-2 px-8 py-3 border border-slate-700 text-slate-500 text-[10px] tracking-[0.4em] uppercase hover:border-slate-500 transition-all rounded-xl">Disconnect</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-12 font-orbitron overflow-hidden">
      <div className="relative z-10 text-center mt-10">
        <div className={`${colors.text} text-[10px] tracking-[0.5em] mb-2 animate-pulse uppercase`}>
          {mode === 'amadeus_calling' ? 'Incoming Signal' : 'Connecting...'} // {reason}
        </div>
        <h2 className="text-white text-4xl tracking-widest mb-1" style={{ textShadow: `0 0 15px ${colors.glow}` }}>AMADEUS</h2>
        <p className={`${colors.text} text-xs tracking-widest uppercase opacity-60`}>Subject: Makise Kurisu</p>
        {minutesElapsed !== undefined && (
          <p className="text-slate-600 text-[9px] tracking-[0.3em] uppercase mt-2">Last contact: {formatElapsed(minutesElapsed)}</p>
        )}
      </div>

      <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <img src="/images/kurisu_normal1.webp" alt="Kurisu" className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover z-20" style={{ border: `4px solid ${colors.primary}`, boxShadow: `0 0 40px ${colors.glow}` }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex justify-around mb-12">
        <button onClick={onDecline} className="text-red-500 font-bold uppercase tracking-widest">Decline</button>
        {onAccept && <button onClick={onAccept} className="text-green-500 font-bold uppercase tracking-widest">Answer</button>}
      </div>
    </div>
  );
};

export default IncomingCallOverlay;
