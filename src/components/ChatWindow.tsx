
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, SessionSettings } from '@/types';
import { Sender } from '@/types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string, imageDataUrl?: string) => void;
  onAnalyzeFrame: (imageDataUrl: string) => Promise<string | null>;
  isLoading: boolean;
  isWebSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  reasoningMode: SessionSettings['reasoningMode'];
  onSetReasoningMode: (mode: SessionSettings['reasoningMode']) => void;
  isCannedModeOnly: boolean;
  onToggleCannedModeOnly: () => void;
  isAudioLoreMode: boolean;
  onToggleAudioLoreMode: () => void;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  onTranslateMessage?: (index: number) => void;
  language?: 'en' | 'jp';
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 rounded-full bg-amber-500/50 flex-shrink-0 mr-3 flex items-center justify-center font-orbitron text-amber-200 text-lg">A</div>
    <div className="rounded-lg px-4 py-2 bg-amber-800/50 flex items-center">
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
    </div>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    messages, onSendMessage, onAnalyzeFrame, isLoading, 
    isWebSearchEnabled, onToggleWebSearch, reasoningMode, onSetReasoningMode, 
    isCannedModeOnly, onToggleCannedModeOnly, isAudioLoreMode, onToggleAudioLoreMode,
    isListening, transcript, 
    startListening, stopListening, isSupported,
    onTranslateMessage, language = 'en'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  useEffect(() => {
    if (transcript) setInputValue(prev => prev ? `${prev.trim()} ${transcript}` : transcript);
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (isLoading) return;
    if (inputValue.trim() || image) { onSendMessage(inputValue.trim(), image ?? undefined); setInputValue(''); setImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const cleanMessageText = (text: string, sender: Sender) => {
    if (sender !== Sender.Amadeus) return text;
    return text.replace(/\[[a-z_:]+[^\]]*\]/gi, '').trim();
  };

  return (
    <div className="glass-panel rounded-lg flex flex-col flex-grow overflow-hidden h-full">
      <div className="flex-grow min-h-0 p-4 sm:p-6 overflow-y-auto scrollbar-thin-amber">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end max-w-lg ${msg.sender === Sender.User ? 'self-end' : 'self-start'}`}>
              {msg.sender === Sender.Amadeus && !msg.text.startsWith('*') && (
                <div className="w-8 h-8 rounded-full bg-amber-500/50 flex-shrink-0 mr-3 flex items-center justify-center font-orbitron text-amber-200 text-lg">A</div>
              )}
              {msg.sender === Sender.User ? (
                <div className="rounded-lg px-4 py-2 text-white bg-slate-700/60">
                  {msg.image && <img src={msg.image} alt="User upload" className="rounded-md mb-2 max-w-xs max-h-48" />}
                  {msg.text && <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                </div>
              ) : (
                <div className={`flex flex-col ${msg.text.startsWith('*') ? 'w-full items-center' : ''}`}>
                  {!msg.text.startsWith('*') && (
                    <div className="flex items-center gap-3 ml-3 mb-1">
                      <span className="text-xs text-amber-400 font-roboto-mono uppercase tracking-wider">Makise Kurisu</span>
                      {language === 'jp' && !msg.translation && (
                        <button 
                          onClick={() => onTranslateMessage?.(index)}
                          className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase transition-all tracking-tighter"
                        >
                          [Translate]
                        </button>
                      )}
                    </div>
                  )}
                  <div className={`rounded-lg px-4 py-2 text-white ${msg.text.startsWith('*') ? 'bg-transparent text-amber-400/80 italic text-sm' : 'bg-amber-800/50 chat-bubble prose prose-invert prose-p:my-0'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMessageText(msg.text, msg.sender)}</ReactMarkdown>
                    {msg.translation && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-slate-300 italic text-xs leading-relaxed">
                        {msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && <div className="flex items-end max-w-lg self-start"><TypingIndicator /></div>}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t border-amber-500/30 p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-4">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={isLoading ? "Awaiting..." : "Message Amadeus..."} className="flex-grow bg-slate-800/70 border border-amber-600/50 rounded-full py-2 px-5 text-amber-200 outline-none" />
          <button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full p-3 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
