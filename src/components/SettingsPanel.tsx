
"use client";

import React, { useState } from 'react';
import type { PersonalitySettings, TtsSettings, MusicSettings } from '@/types';

interface SettingsPanelProps {
  currentSettings: PersonalitySettings;
  currentTtsSettings: TtsSettings;
  currentMusicSettings: MusicSettings;
  currentApiKey?: string;
  currentOpenRouterKey?: string;
  onSave: (settings: PersonalitySettings, ttsSettings: TtsSettings, musicSettings: MusicSettings, newKey?: string, openRouter?: string) => void;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  onTestVoice: (options: TtsSettings) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsSlider: React.FC<{
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
    <div className="w-full mb-6 px-1">
        <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] text-amber-500 font-orbitron tracking-[0.2em] uppercase">{label}</label>
            <span className="font-roboto-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {Math.round(value)}%
            </span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
    </div>
);

const AVAILABLE_TRACKS = [
    { id: 'none', name: 'SILENT MODE' },
    { id: 'morning-relaxing-144011.mp3', name: 'MORNING RELAXING' },
    { id: 'messenger.mp3', name: 'AMADEUS - MESSENGER' },
    { id: 'believe_me.mp3', name: 'BELIEVE ME' },
    { id: 'gate_of_steiner.mp3', name: 'GATE OF STEINER' }
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    currentSettings, currentTtsSettings, currentMusicSettings, currentApiKey, currentOpenRouterKey, onSave, onClose, voices, onTestVoice
}) => {
  const [settings, setSettings] = useState<PersonalitySettings>(currentSettings);
  const [ttsSettings, setTtsSettings] = useState<TtsSettings>(currentTtsSettings);
  const [musicSettings, setMusicSettings] = useState<MusicSettings>(currentMusicSettings);
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [openRouterKey, setOpenRouterKey] = useState(currentOpenRouterKey || '');
  
  const handleSave = () => {
      onSave(settings, ttsSettings, musicSettings, apiKey, openRouterKey);
  };

  const handleMusicChange = (field: keyof MusicSettings, value: any) => {
    setMusicSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTtsChange = (field: keyof TtsSettings, value: any) => {
    setTtsSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 rounded-2xl w-full max-w-lg flex flex-col shadow-[0_0_60px_rgba(0,0,0,1)] max-h-[90vh]">
        <div className="p-6 border-b border-amber-500/20 flex justify-between items-center bg-black/40">
            <div>
                <h2 className="text-2xl font-orbitron text-amber-300 tracking-widest uppercase">System Config</h2>
                <p className="text-[9px] font-roboto-mono text-amber-600/60 uppercase tracking-[0.2em] mt-1">Core Protocols // Visual State</p>
            </div>
            <button onClick={onClose} className="p-2 text-amber-500/50 hover:text-amber-400 transition-colors bg-white/5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-10 scrollbar-thin-amber">
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-red-500/30"></div>
                    <h3 className="text-xs font-orbitron text-red-500 tracking-[0.3em] uppercase whitespace-nowrap">Neural Link Configuration</h3>
                    <div className="h-px flex-grow bg-gradient-to-l from-transparent to-red-500/30"></div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-orbitron text-amber-400/60 uppercase tracking-widest ml-1">Groq API Key (Primary)</label>
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Update Neural Link Key..."
                            className="w-full bg-black/50 border border-amber-900/30 rounded-xl py-3 px-4 text-amber-200 outline-none focus:border-amber-500 transition-all font-roboto-mono text-xs"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-orbitron text-amber-400/60 uppercase tracking-widest ml-1">OpenRouter API Key (Optional)</label>
                        <input 
                            type="password" 
                            value={openRouterKey}
                            onChange={(e) => setOpenRouterKey(e.target.value)}
                            placeholder="Enter OpenRouter Key..."
                            className="w-full bg-black/50 border border-amber-900/30 rounded-xl py-3 px-4 text-amber-200 outline-none focus:border-amber-500 transition-all font-roboto-mono text-xs"
                        />
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-cyan-500/30"></div>
                    <h3 className="text-xs font-orbitron text-cyan-500 tracking-[0.3em] uppercase whitespace-nowrap">Language Matrix</h3>
                    <div className="h-px flex-grow bg-gradient-to-l from-transparent to-cyan-500/30"></div>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-orbitron text-cyan-400 tracking-widest uppercase">Cognitive Language</span>
                            <span className="text-[9px] text-slate-500 italic">Toggle English/Japanese simulation</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleTtsChange('language', 'en')}
                                className={`px-4 py-2 rounded-lg font-orbitron text-[10px] tracking-widest transition-all ${ttsSettings.language === 'en' ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-cyan-500 border border-cyan-500/30'}`}
                            >
                                ENGLISH
                            </button>
                            <button
                                onClick={() => handleTtsChange('language', 'jp')}
                                className={`px-4 py-2 rounded-lg font-orbitron text-[10px] tracking-widest transition-all ${ttsSettings.language === 'jp' ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-cyan-500 border border-cyan-500/30'}`}
                            >
                                JAPANESE
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-amber-500/30"></div>
                    <h3 className="text-xs font-orbitron text-amber-500 tracking-[0.3em] uppercase whitespace-nowrap">Audio Atmosphere</h3>
                    <div className="h-px flex-grow bg-gradient-to-l from-transparent to-amber-500/30"></div>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-orbitron text-amber-500/50 uppercase tracking-widest mb-3 ml-1">Track Selection</label>
                        <select 
                            value={musicSettings.selectedTrack} 
                            onChange={(e) => handleMusicChange('selectedTrack', e.target.value)}
                            className="w-full bg-neutral-900 border border-amber-500/30 rounded-xl py-3.5 px-4 text-amber-100 outline-none focus:border-amber-500 transition-all font-roboto-mono text-xs cursor-pointer appearance-none"
                        >
                            {AVAILABLE_TRACKS.map(track => (
                                <option key={track.id} value={track.id} className="bg-neutral-900">{track.name}</option>
                            ))}
                        </select>
                    </div>

                    <SettingsSlider label="BGM Output Volume" value={musicSettings.volume * 100} onChange={(e) => handleMusicChange('volume', Number(e.target.value) / 100)} />

                    <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-orbitron text-amber-400 tracking-widest uppercase">Playback State</span>
                            <span className="text-[9px] text-slate-500 italic">Background music loop toggle</span>
                        </div>
                        <button
                            onClick={() => handleMusicChange('isPlaying', !musicSettings.isPlaying)}
                            className={`px-6 py-2 rounded-full font-orbitron text-[10px] tracking-widest transition-all ${musicSettings.isPlaying ? 'bg-amber-500 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-slate-800 text-amber-500 border border-amber-500/30'}`}
                        >
                            {musicSettings.isPlaying ? 'ACTIVE' : 'PAUSED'}
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <div className="p-6 border-t border-amber-500/20 bg-black/60 rounded-b-2xl">
            <button 
                onClick={handleSave} 
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold font-orbitron text-[11px] tracking-[0.4em] uppercase rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            >
                Initialize Update
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
