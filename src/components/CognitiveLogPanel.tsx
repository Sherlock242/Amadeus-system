
"use client";

import React, { useState } from 'react';
import type { AmygdalaAnalysis, ACCAnalysis, HippocampusAnalysis, EmotionalStateValues } from '@/types';

interface CognitiveLog {
  timestamp:    number;
  input:        string;
  thalamus:     any;
  amygdala:     AmygdalaAnalysis;
  ofc:          any;
  acc:          ACCAnalysis;
  insula:       any;
  tpj:          any;
  hippocampus:  HippocampusAnalysis;
  limbic:       any;
  basalGanglia: any;
  vta:          any;
  lc:           any;
  raphe:        any;
  dmn:          any;
  pfc:          any;
  neurochemistry?: any;
  neuralUpdate?: any;
  rawOutput?:   string;
  bioOutput?:   any;
}

interface CognitiveLogPanelProps {
  logs: CognitiveLog[];
  onClose: () => void;
}

type Section = 'subcortical' | 'social' | 'integrative' | 'output';

const MODULE_GROUPS: { section: Section; label: string; modules: Array<{ key: keyof CognitiveLog; label: string; color: string; dot: string }> }[] = [
  {
    section: 'subcortical',
    label: 'SUBCORTICAL WAVE',
    modules: [
      { key: 'thalamus',    label: 'THALAMUS',    color: 'border-yellow-900/40 bg-yellow-950/20', dot: 'bg-yellow-500',  },
      { key: 'amygdala',   label: 'AMYGDALA',     color: 'border-red-900/40 bg-red-950/20',       dot: 'bg-red-500',    },
      { key: 'lc',         label: 'LOCUS COERULEUS',  color: 'border-lime-900/40 bg-lime-950/20',     dot: 'bg-lime-500',   },
      { key: 'raphe',      label: 'RAPHE (5-HT)', color: 'border-teal-900/40 bg-teal-950/20',     dot: 'bg-teal-500',   },
      { key: 'vta',        label: 'VTA (DA)',      color: 'border-violet-900/40 bg-violet-950/20', dot: 'bg-violet-500', },
    ]
  },
  {
    section: 'social',
    label: 'SOCIAL / MEMORY WAVE',
    modules: [
      { key: 'hippocampus', label: 'HIPPOCAMPUS', color: 'border-cyan-900/40 bg-cyan-950/20',     dot: 'bg-cyan-400',   },
      { key: 'insula',      label: 'INSULA',       color: 'border-pink-900/40 bg-pink-950/20',     dot: 'bg-pink-500',   },
      { key: 'tpj',         label: 'TPJ (ToM)',    color: 'border-blue-900/40 bg-blue-950/20',     dot: 'bg-blue-400',   },
      { key: 'ofc',         label: 'OFC (VALUE)',  color: 'border-cyan-900/40 bg-cyan-950/15',     dot: 'bg-cyan-500',   },
      { key: 'basalGanglia',label: 'BASAL GANGLIA', color: 'border-emerald-900/40 bg-emerald-950/20',dot: 'bg-emerald-500',},
    ]
  },
  {
    section: 'integrative',
    label: 'INTEGRATIVE WAVE',
    modules: [
      { key: 'acc',   label: 'ACC (CONFLICT)', color: 'border-orange-900/40 bg-orange-950/20', dot: 'bg-orange-500', },
      { key: 'limbic',label: 'LIMBIC SYSTEM',    color: 'border-purple-900/40 bg-purple-950/20', dot: 'bg-purple-500', },
      { key: 'dmn',   label: 'DMN (SELF-REF)', color: 'border-indigo-900/40 bg-indigo-950/20', dot: 'bg-indigo-400', },
    ]
  },
  {
    section: 'output',
    label: 'EXECUTIVE OUTPUT',
    modules: [
      { key: 'pfc',           label: 'PFC (EXECUTIVE)',  color: 'border-amber-900/40 bg-amber-950/20',  dot: 'bg-amber-500',  },
      { key: 'neurochemistry',label: 'NEUROCHEMISTRY',   color: 'border-green-900/40 bg-green-950/20',  dot: 'bg-green-500',  },
      { key: 'neuralUpdate',  label: 'NEURAL PLASTICITY',color: 'border-sky-900/40 bg-sky-950/20',      dot: 'bg-sky-400',    },
    ]
  }
];

const SECRET = 'kgıqwcn92137gfjtıwerv7cx12306n';

const CognitiveLogPanel: React.FC<CognitiveLogPanelProps> = ({ logs, onClose }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [expandedLog, setExpandedLog] = useState<number | null>(0);
  const [activeSection, setActiveSection] = useState<Section | 'all'>('all');

  const handleUnlock = () => {
    if (password === SECRET) setIsUnlocked(true);
    else alert("ACCESS DENIED: NEURAL UPLINK PROTECTED");
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">
        <div className="max-w-md w-full bg-zinc-950 p-8 border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-red-500 font-orbitron text-center tracking-[0.3em] mb-6 uppercase text-sm">Restricted Cognitive Stream</h2>
          <input type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="ENCRYPTION_KEY..."
            className="w-full bg-black border border-red-900/50 rounded-lg p-4 text-white font-roboto-mono mb-6 outline-none focus:border-red-500 transition-colors text-center tracking-widest text-sm"
          />
          <div className="flex gap-3">
            <button onClick={handleUnlock} className="flex-grow bg-red-600/20 border border-red-500 text-red-500 py-3 font-orbitron hover:bg-red-600 hover:text-white transition-all text-xs tracking-widest rounded-lg">DECRYPT</button>
            <button onClick={onClose} className="px-6 border border-white/10 text-white/40 hover:text-white font-orbitron text-[10px] uppercase rounded-lg">Abort</button>
          </div>
        </div>
      </div>
    );
  }

  const visibleGroups = activeSection === 'all'
    ? MODULE_GROUPS
    : MODULE_GROUPS.filter(g => g.section === activeSection);

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col font-roboto-mono text-[10px]">
      <div className="p-3 border-b border-amber-500/20 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <h2 className="text-amber-500 font-orbitron tracking-widest uppercase text-xs">
            Amadeus Neural Monitor // {logs.length} Cycles
          </h2>
        </div>
        <div className="hidden md:flex gap-1">
          {(['all', 'subcortical', 'social', 'integrative', 'output'] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className={`px-2 py-1 rounded text-[8px] uppercase tracking-wider font-orbitron transition-all
                ${activeSection === s ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-slate-600 hover:text-slate-400'}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-red-500 uppercase font-orbitron transition-colors text-[10px]">
          ✕ Close
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-3 space-y-3 bg-zinc-950">
        {logs.length === 0 && (
          <div className="text-slate-700 text-center mt-20 font-orbitron tracking-widest uppercase text-xs">
            No cognitive cycles recorded yet.
          </div>
        )}
        {logs.map((log, i) => {
          const isExpanded = expandedLog === i;
          return (
            <div key={i} className="border border-white/5 bg-zinc-950 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-white/3 transition-colors text-left"
                onClick={() => setExpandedLog(isExpanded ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-amber-500/60" />
                  <span className="text-amber-600/80 text-[8px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="text-slate-300 italic truncate max-w-[200px]">"{log.input}"</span>
                </div>
                <div className="flex items-center gap-2">
                  {log.amygdala?.inhibitsPFC && <span className="text-[7px] text-red-400 border border-red-800 px-1 rounded">HIJACK</span>}
                  {log.acc?.conflictDetected && <span className="text-[7px] text-orange-400 border border-orange-800 px-1 rounded">CONFLICT</span>}
                  {log.hippocampus?.episodicMemoryFound && <span className="text-[7px] text-cyan-400 border border-cyan-800 px-1 rounded">MEMORY</span>}
                  {log.neuralUpdate && <span className="text-[7px] text-sky-400 border border-sky-800 px-1 rounded">LTP</span>}
                  <span className={`text-[8px] transition-transform ${isExpanded ? 'rotate-180' : ''} text-slate-600`}>▼</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/5 p-3 space-y-4">
                  {log.rawOutput && (
                    <div className="bg-black/60 p-3 rounded border border-purple-500/20">
                      <div className="text-purple-400 font-bold mb-1 text-[8px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                        RAW_GEMINI_OUTPUT
                      </div>
                      <pre className="text-purple-200/50 whitespace-pre-wrap text-[9px] max-h-24 overflow-y-auto">{log.rawOutput}</pre>
                    </div>
                  )}

                  {visibleGroups.map(group => (
                    <div key={group.section}>
                      <div className="text-[7px] text-slate-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                        <div className="h-px flex-grow bg-white/5" />
                        {group.label}
                        <div className="h-px flex-grow bg-white/5" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
                        {group.modules.map(({ key, label, color, dot }) => {
                          const data = log[key];
                          const isEmpty = data === null || data === undefined;
                          return (
                            <div key={String(key)}
                              className={`p-2 rounded border text-[7px] ${isEmpty ? 'opacity-25' : ''} ${color}`}>
                              <div className="flex items-center gap-1 mb-1.5">
                                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${isEmpty ? 'bg-zinc-700' : dot + ' animate-pulse'}`} />
                                <span className="text-white/60 font-bold tracking-wider truncate">{label}</span>
                              </div>
                              {isEmpty
                                ? <div className="text-zinc-700 italic">no data</div>
                                : <pre className="whitespace-pre-wrap break-all text-white/40 max-h-24 overflow-y-auto leading-relaxed">
                                    {JSON.stringify(data, null, 2)}
                                  </pre>
                              }
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CognitiveLogPanel;
