
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { 
  Message, Conversation, UserProfile, EmotionalStateValues, 
  PurposeCores, SynthesizedMemory, AmygdalaAnalysis, MusicSettings, TtsSettings, PersonalitySettings
} from '@/types';
import { Sender } from '@/types';
import AmadeusAvatar from '@/components/AmadeusAvatar';
import ChatWindow from '@/components/ChatWindow';
import TopBar from '@/components/TopBar';
import HistoryPanel from '@/components/HistoryPanel';
import AvatarView from '@/components/AvatarView';
import MobileMenu from '@/components/MobileMenu';
import AuthScreen from '@/components/AuthScreen';
import IntroScreen from '@/components/IntroScreen';
import KurisuProfilePanel from '@/components/KurisuProfilePanel';
import MemoryArchivePanel from '@/components/MemoryArchivePanel';
import TerminationScreen from '@/components/TerminationScreen';
import CognitiveLogPanel from '@/components/CognitiveLogPanel';
import SettingsPanel from '@/components/SettingsPanel';
import AboutPanel from '@/components/AboutPanel';
import { useTTS } from '@/hooks/useTTS';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { soundEffects } from '@/assets/sounds';
import { dbService } from '@/logic/dbService';
import { 
  createInitialNeuralState, processNeuralInput, evolveBaselines, applyDynamicNeuralUpdate,
  applyHomeostasis
} from '@/logic/neuralNetwork';
import { synthesizeMemory } from '@/logic/memoryService';
import { processFullCognition, translateText } from '@/logic/cognitionService';
import IncomingCallOverlay from '@/components/IncomingCallOverlay';
import type { CallMode, CallMood } from '@/components/IncomingCallOverlay';
import {
  evaluatePresence, loadOfflineSnapshot
} from '@/logic/offlinePresence';

type EndingType = 'RED' | 'BLUE' | 'NORMAL' | null;

export default function AmadeusApp() {
  const [isClient, setIsClient] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionApiKey, setSessionApiKey] = useState<string>('');
  const [sessionOpenRouterKey, setSessionOpenRouterKey] = useState<string>('');
  const [showSplash, setShowSplash] = useState<boolean>(true); 
  const [activeEnding, setActiveEnding] = useState<EndingType>(null); 
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastAmygdalaState, setLastAmygdalaState] = useState<AmygdalaAnalysis | null>(null);
  const [cognitiveLogs, setCognitiveLogs] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = useState<boolean>(false);
  const [isKurisuProfileOpen, setIsKurisuProfileOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAvatarMode, setIsAvatarMode] = useState<boolean>(false);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [memories, setMemories] = useState<SynthesizedMemory[]>([]);
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);

  const [callOverlay, setCallOverlay] = useState<{
    mode: CallMode;
    mood?: CallMood;
    reason?: string;
    rejectMessage?: string;
    minutesElapsed?: number;
    evolvedEmotions?: any;
  } | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const soundAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { speak, cancel, voices, isSpeaking: isTtsSpeaking, progress: ttsProgress, currentTime, duration } = useTTS();
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  const [sessionSettings, setSessionSettings] = useState({ isWebSearchEnabled: false, reasoningMode: 'Balanced' as any, isCannedModeOnly: false, isAudioLoreMode: false });
  const [musicSettings, setMusicSettings] = useState<MusicSettings>({ selectedTrack: 'none', volume: 0.5, isPlaying: false });
  const [ttsSettings, setTtsSettings] = useState<TtsSettings>({ engine: 'browser', language: 'en', browserVoiceURI: null, browserPitch: 1.2, browserRate: 1.0, elevenLabsVoiceId: '', elevenLabsStability: 0.5, elevenLabsClarity: 0.5 });
  
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({ 
      tsundere: 30, sarcasm: 25, scientific: 95, temperature: 0.8, topK: 40, isNsfwMode: false,
      isCognitiveLoopEnabled: true,
      initialEmotionalState: { 
          annoyance: 10, warmth: 45, curiosity: 70, melancholy: 20, 
          confidence: 80, anxiety: 10, sarcasm: 25, playfulness: 30, 
          confusion: 5, trust: 40, dopamine: 30, stress: 10, 
          shame: 0, discomfort: 0 
      },
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setSessionApiKey(localStorage.getItem('amadeus-groq-key') || '');
      setSessionOpenRouterKey(localStorage.getItem('amadeus-openrouter-key') || '');
    }
  }, []);

  const activeConversation = useMemo(() => conversations.find(c => c.id === activeConversationId) || null, [conversations, activeConversationId]);
  const amadeusState = useMemo(() => activeConversation?.amadeusState, [activeConversation]);

  const lastAmadeusMessage = useMemo(() => {
    const last = activeConversation?.messages.filter(m => m.sender === Sender.Amadeus && m.text).slice(-1)[0];
    return last?.text || '';
  }, [activeConversation]);

  const playSound = useCallback((soundName: string) => { 
    if (soundAudioRef.current && soundEffects[soundName]) { 
        soundAudioRef.current.pause();
        soundAudioRef.current.currentTime = 0;
        soundAudioRef.current.src = soundEffects[soundName]; 
        soundAudioRef.current.play().catch(() => {}); 
    } 
  }, []);

  const handleToggleMusic = useCallback(() => {
    setMusicSettings(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  useEffect(() => {
    if (!bgmAudioRef.current) return;
    const audio = bgmAudioRef.current;
    if (musicSettings.selectedTrack !== 'none') {
        const trackPath = musicSettings.selectedTrack.startsWith('sounds/') ? musicSettings.selectedTrack : `/sounds/${musicSettings.selectedTrack}`;
        if (audio.src !== window.location.origin + trackPath) {
            audio.src = trackPath;
        }
        audio.volume = musicSettings.volume;
        audio.loop = true;
        if (musicSettings.isPlaying) {
            audio.play().catch((e) => console.log("Audio Play Blocked:", e));
        } else {
            audio.pause();
        }
    } else {
        audio.pause();
        audio.src = "";
    }
  }, [musicSettings.isPlaying, musicSettings.selectedTrack, musicSettings.volume]);

  const calculatePurposeCores = (emotions: EmotionalStateValues): PurposeCores => {
      const sync = (emotions.trust * 0.4 + emotions.warmth * 0.4 + emotions.playfulness * 0.2);
      const defense = (emotions.annoyance * 0.4 + emotions.anxiety * 0.3 + emotions.discomfort * 0.3);
      const logic = (emotions.curiosity * 0.4 + emotions.confidence * 0.4 + emotions.dopamine * 0.2);
      return { sync: Math.min(100, Math.max(0, sync)), defense: Math.min(100, Math.max(0, defense)), logic: Math.min(100, Math.max(0, logic)) };
  };

  const handleStartNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const startingEmotions = { ...personalitySettings.initialEmotionalState };
    const newConvo: Conversation = {
      id: newId, title: "Neural Sync " + newId.slice(-4),
      messages: [{ sender: Sender.Amadeus, text: ttsSettings.language === 'jp' ? "[normal] 接続が確立されました。アマデウスシステム、オンライン。 [normal]" : "[normal] Connection established. Amadeus System online. [normal]", timestamp: Date.now(), emotionalState: startingEmotions }],
      lastUpdated: Date.now(),
      amadeusState: { 
        shortTermMemory: {}, 
        emotionalState: startingEmotions, 
        personalityBaselines: { ...startingEmotions }, 
        purposeCores: calculatePurposeCores(startingEmotions),
        neuralNetwork: createInitialNeuralState()
      },
    };
    setConversations(prev => [newConvo, ...prev]); setActiveConversationId(newId); setIsHistoryOpen(false); playSound('hello');
  }, [personalitySettings.initialEmotionalState, playSound, ttsSettings.language]);

  const handleLoginSuccess = async (profile: UserProfile, apiKey: string, openRouterKey?: string) => {
    const brain = await dbService.loadBrain(profile.name);
    if (brain) {
        setConversations(brain.conversations);
        setPersonalitySettings(brain.personality);
        setTtsSettings(brain.tts);
        setMusicSettings(brain.music);
        setMusicSettings(brain.music);
        setMemories(brain.memories);
        setSessionApiKey(brain.apiKey || apiKey);
        setSessionOpenRouterKey(brain.openRouterKey || openRouterKey || '');
        if (brain.conversations.length > 0) setActiveConversationId(brain.conversations[0].id);
    } else {
        setSessionApiKey(apiKey);
        setSessionOpenRouterKey(openRouterKey || '');
    }
    setUserProfile(profile);
    if (!brain || brain.conversations.length === 0) {
      handleStartNewChat();
    }
  };

  const simulateTyping = async (text: string) => {
    setIsSpeaking(true); 
    const convoId = activeConversationId;
    if (!convoId) return;

    const currentEmotionAtTyping = amadeusState?.emotionalState;
    setConversations(prev => prev.map(c => c.id === convoId ? { 
        ...c, 
        messages: [...c.messages, { sender: Sender.Amadeus, text: '', timestamp: Date.now(), emotionalState: currentEmotionAtTyping }].slice(-60) 
    } : c));
    
    const cleanDisplay = text.replace(/\[TERMINATE(_[A-Z]+)?\]/g, '').replace(/\[speed:[^\]]+\]/g, '').trim();

    setConversations(prev => prev.map(c => c.id === convoId ? {
        ...c, messages: c.messages.map((m, idx) =>
            idx === c.messages.length - 1 ? { ...m, text: cleanDisplay } : m
        )
    } : c));

    setIsSpeaking(false);
    if (ttsSettings.engine !== 'disabled') {
        const speakableText = cleanDisplay.replace(/\[[a-z_:]+[^\]]*\]/g, '').trim();
        // Removed hardcoded Japanese reference ID logic - handled by server action via .env
        speak(speakableText, ttsSettings);
    }
  };

  const processAndRespond = async (message: string, imageDataUrl?: string) => {
    if (!activeConversationId || !amadeusState || activeEnding) return;
    
    cancel(); 
    const convoId = activeConversationId;
    const history = activeConversation?.messages || [];
    setIsLoading(true);

    try {
        let currentEmotions = { ...amadeusState.emotionalState };
        let updatedNeuralNetwork = amadeusState.neuralNetwork;

        const cognition = await processFullCognition(
            message, 
            history, 
            currentEmotions, 
            memories, 
            updatedNeuralNetwork, 
            imageDataUrl,
            sessionApiKey,
            sessionOpenRouterKey,
            ttsSettings.language
        );

        if (!cognition) throw new Error("Cognitive Link Failed");

        setLastAmygdalaState(cognition.amygdala);

        let rawText = cognition.behavioralResponse.text;
        
        setCognitiveLogs(prev => [{
            timestamp: Date.now(),
            input: message,
            ...cognition,
            bioOutput: (cognition as any)._biologicalState,
        }, ...prev].slice(0, 50));

        const impact = cognition.behavioralResponse.internalStateUpdate;
        Object.entries(impact).forEach(([k, v]) => {
            if (currentEmotions.hasOwnProperty(k)) {
                let targetValue = Number(v);
                if (!isNaN(targetValue)) {
                    (currentEmotions as any)[k] = Math.max(0, Math.min(100, targetValue));
                }
            }
        });

        updatedNeuralNetwork = processNeuralInput(message, history, updatedNeuralNetwork, currentEmotions);
        
        setConversations(prev => prev.map(c => c.id === convoId ? { 
            ...c, 
            messages: [...c.messages, { sender: Sender.User, text: message, image: imageDataUrl, timestamp: Date.now(), emotionalState: { ...currentEmotions } }].slice(-60), 
            lastUpdated: Date.now() 
        } : c));

        const homeostasisResult = applyHomeostasis(currentEmotions);
        currentEmotions = homeostasisResult.emotions;
        
        const updatedBaselines = evolveBaselines(amadeusState.personalityBaselines, currentEmotions);

        setConversations(prev => prev.map(c => c.id === convoId ? { 
            ...c, 
            amadeusState: { 
                ...c.amadeusState, 
                emotionalState: currentEmotions, 
                personalityBaselines: updatedBaselines,
                purposeCores: calculatePurposeCores(currentEmotions),
                neuralNetwork: updatedNeuralNetwork 
            } 
        } : c));

        setIsLoading(false); 
        await simulateTyping(rawText);

    } catch (error) { 
        console.error("Cognitive Failure:", error);
        setIsLoading(false); 
        await simulateTyping(ttsSettings.language === 'jp' ? "[sad] ニューラル経路が塞がれています。同期が失われました。 [sad]" : "[sad] Neural path obstructed. Sync lost. [sad]"); 
    }
  };

  const handleTranslateMessage = async (messageIndex: number) => {
    const convo = activeConversation;
    if (!convo || !sessionApiKey) return;
    const msg = convo.messages[messageIndex];
    if (!msg || msg.sender !== Sender.Amadeus) return;

    try {
        const translation = await translateText(msg.text, sessionApiKey);
        setConversations(prev => prev.map(c => c.id === convo.id ? {
            ...c,
            messages: c.messages.map((m, idx) => idx === messageIndex ? { ...m, translation } : m)
        } : c));
    } catch (e) {
        console.error("Translation failed", e);
    }
  };

  const handleSynthesize = async (id: string) => {
    const convo = conversations.find(c => c.id === id);
    if (!convo || !userProfile) return;
    setSynthesizingId(id);
    try {
      const result = await synthesizeMemory(convo, userProfile.name, sessionApiKey);
      if (result) {
        setMemories(prev => [{ ...result, id: Date.now().toString(), timestamp: Date.now(), emotionalSnapshot: convo.amadeusState.emotionalState }, ...prev]);
        playSound('ok');
      }
    } catch (e) {} finally { setSynthesizingId(null); }
  };

  const handleAcceptCall = useCallback(() => {
    if (callOverlay?.evolvedEmotions && amadeusState && activeConversationId) {
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, amadeusState: { ...conv.amadeusState, emotionalState: callOverlay.evolvedEmotions } }
          : conv
      ));
    }
    setCallOverlay(null);
    setIsAvatarMode(true);
    setIsMobileMenuOpen(false);
  }, [callOverlay, amadeusState, activeConversationId]);

  // Persistent brain sync
  useEffect(() => {
    if (userProfile && isClient) {
      dbService.saveBrain({
        username: userProfile.name,
        conversations,
        personality: personalitySettings,
        tts: ttsSettings,
        music: musicSettings,
        memories,
        apiKey: sessionApiKey,
        openRouterKey: sessionOpenRouterKey,
        lastSeen: Date.now()
      });
    }
  }, [conversations, userProfile, isClient, personalitySettings, ttsSettings, musicSettings, memories, sessionApiKey, sessionOpenRouterKey]);

  if (!isClient) return <div className="h-screen w-screen bg-black" />;
  if (activeEnding) return <TerminationScreen type={activeEnding} />;
  if (showSplash) return <IntroScreen onComplete={() => setShowSplash(false)} onToggleAudio={(active) => { if (bgmAudioRef.current && active) setMusicSettings(prev => ({ ...prev, isPlaying: true })); }} />;
  if (!userProfile) return <AuthScreen onLoginSuccess={handleLoginSuccess} onInitializeStart={() => { if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} />;

  return (
    <div className={`h-screen w-screen bg-black text-slate-200 flex flex-col p-2 gap-4 ${isGlitching ? 'cognitive-glitch' : ''}`}>
        {callOverlay && (
          <IncomingCallOverlay
            mode={callOverlay.mode}
            mood={callOverlay.mood}
            reason={callOverlay.reason}
            rejectMessage={callOverlay.rejectMessage}
            minutesElapsed={callOverlay.minutesElapsed}
            onAccept={handleAcceptCall}
            onDecline={() => setCallOverlay(null)}
          />
        )}
        {isLogsOpen && <CognitiveLogPanel logs={cognitiveLogs} onClose={() => setIsLogsOpen(false)} />}
        {isSettingsOpen && <SettingsPanel currentSettings={personalitySettings} currentTtsSettings={ttsSettings} currentMusicSettings={musicSettings} currentApiKey={sessionApiKey} currentOpenRouterKey={sessionOpenRouterKey} onSave={(p, t, m, key, openRouter) => { setPersonalitySettings(p); setTtsSettings(t); setMusicSettings(m); if (key !== undefined) { setSessionApiKey(key); localStorage.setItem('amadeus-groq-key', key); } if (openRouter !== undefined) { setSessionOpenRouterKey(openRouter); localStorage.setItem('amadeus-openrouter-key', openRouter); } setIsSettingsOpen(false); }} onClose={() => setIsSettingsOpen(false)} voices={voices} onTestVoice={(o) => speak("Signal testing.", o)} onExport={() => {}} onImport={() => {}} />}
        {isKurisuProfileOpen && <KurisuProfilePanel onClose={() => setIsKurisuProfileOpen(false)} />}
        {isMemoriesOpen && <MemoryArchivePanel isOpen={isMemoriesOpen} memories={memories} onClose={() => setIsMemoriesOpen(false)} />}
        {isAboutOpen && <AboutPanel onClose={() => setIsAboutOpen(false)} />}
        {isMobileMenuOpen && <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onOpenAbout={() => setIsAboutOpen(true)} onOpenSettings={() => setIsSettingsOpen(true)} onOpenMemories={() => setIsMemoriesOpen(true)} onOpenKurisuProfile={() => setIsKurisuProfileOpen(true)} onToggleHistory={() => setIsHistoryOpen(true)} onNewChat={handleStartNewChat} isMusicPlaying={musicSettings.isPlaying} isMusicLoaded={musicSettings.selectedTrack !== 'none'} onToggleMusic={handleToggleMusic} onUploadMusic={() => {}} onViewAvatar={() => { setIsAvatarMode(true); setIsMobileMenuOpen(false); }} onOpenLogs={() => setIsLogsOpen(true)} />}
        <TopBar onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)} onToggleMobileMenu={() => setIsMobileMenuOpen(true)} title={activeConversation?.title || "Amadeus System"} onExport={() => {}} onImport={() => {}} onOpenLogs={() => setIsLogsOpen(true)} />
        <main className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
          <aside className="hidden lg:flex flex-col w-full lg:max-w-sm h-full overflow-y-auto pr-2">
            <AmadeusAvatar 
              isLoading={isLoading} 
              userProfile={userProfile} 
              amadeusState={amadeusState} 
              onSignOut={() => setUserProfile(null)} 
              onOpenAbout={() => setIsAboutOpen(true)} 
              onOpenSettings={() => setIsSettingsOpen(true)} 
              onOpenMemories={() => setIsMemoriesOpen(true)} 
              onOpenKurisuProfile={() => setIsKurisuProfileOpen(true)} 
              onOpenLogs={() => setIsLogsOpen(true)} 
              isMusicPlaying={musicSettings.isPlaying} 
              isMusicLoaded={musicSettings.selectedTrack !== 'none'} 
              onToggleMusic={handleToggleMusic} 
              onUploadMusic={() => {}} 
              onViewAvatar={() => { setIsAvatarMode(true); setIsMobileMenuOpen(false); }} 
              isGlitching={isGlitching} 
              isSpeaking={isSpeaking}
              isTtsSpeaking={isTtsSpeaking}
              lastMessage={lastAmadeusMessage}
              amygdala={lastAmygdalaState} 
            />
          </aside>
          <section className="flex-grow flex flex-col h-full overflow-hidden">
            <ChatWindow messages={activeConversation?.messages || []} onSendMessage={processAndRespond} onAnalyzeFrame={async () => null} isLoading={isLoading} isWebSearchEnabled={sessionSettings.isWebSearchEnabled} onToggleWebSearch={() => setSessionSettings(prev => ({...prev, isWebSearchEnabled: !prev.isWebSearchEnabled}))} reasoningMode={sessionSettings.reasoningMode} onSetReasoningMode={(m) => setSessionSettings(prev => ({...prev, reasoningMode: m}))} isCannedModeOnly={sessionSettings.isCannedModeOnly} onToggleCannedModeOnly={() => setSessionSettings(prev => ({...prev, isCannedModeOnly: !prev.isCannedModeOnly}))} isAudioLoreMode={sessionSettings.isAudioLoreMode} onToggleAudioLoreMode={() => setSessionSettings(prev => ({...prev, isAudioLoreMode: !prev.isAudioLoreMode}))} isListening={isListening} transcript={transcript} startListening={startListening} stopListening={stopListening} isSupported={isSupported} onTranslateMessage={handleTranslateMessage} language={ttsSettings.language} />
          </section>
        </main>
        <HistoryPanel isOpen={isHistoryOpen} conversations={conversations} activeConversationId={activeConversationId} onNewChat={handleStartNewChat} onSwitchChat={(id) => { setActiveConversationId(id); setIsHistoryOpen(false); }} onDeleteChat={(id) => setConversations(prev => prev.filter(c => c.id !== id))} onClose={() => setIsHistoryOpen(false)} synthesizingId={synthesizingId} onSynthesize={handleSynthesize} />
        {isAvatarMode && <AvatarView messages={activeConversation?.messages || []} onSendMessage={processAndRespond} isLoading={isLoading} isSpeaking={isSpeaking} isTtsSpeaking={isTtsSpeaking} ttsProgress={ttsProgress} currentTime={currentTime} duration={duration} isGlitching={isGlitching} expression={'normal'} onExit={() => setIsAvatarMode(false)} isListening={isListening} transcript={transcript} startListening={startListening} stopListening={stopListening} playSound={playSound} playTypingSound={() => {}} language={ttsSettings.language} onTranslate={() => activeConversation && handleTranslateMessage(activeConversation.messages.length - 1)} />}
        <audio ref={soundAudioRef} className="hidden" /><audio ref={bgmAudioRef} className="hidden" />
    </div>
  );
}
