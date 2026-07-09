
import React from 'react';

interface TopBarProps {
  onToggleHistory: () => void;
  onToggleMobileMenu: () => void;
  title: string;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenLogs?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleHistory, onToggleMobileMenu, title, onOpenLogs }) => {
  return (
    <div className="flex-shrink-0 flex items-center p-4 glass-panel rounded-lg mb-4">
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden mr-4 p-2 text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-full transition-colors"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>
      
       <button
        onClick={onToggleHistory}
        className="hidden lg:block mr-4 p-2 text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-full transition-colors"
        aria-label="Toggle chat history"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex flex-col flex-grow min-w-0 mr-4">
          <h2 className="text-xl font-orbitron text-white truncate" title={title}>
            {title}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
              <span className="text-[8px] text-green-500/70 font-roboto-mono tracking-tighter uppercase">Neural Matrix: Cloud Sync Active</span>
          </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenLogs}
          className="p-2 text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-500/10 rounded transition-all font-orbitron text-[10px] tracking-widest uppercase flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <span className="hidden sm:inline">Neural Log</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
