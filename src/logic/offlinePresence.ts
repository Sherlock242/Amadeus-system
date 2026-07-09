
/**
 * AMADEUS OFFLINE PRESENCE ENGINE
 */

import type { EmotionalStateValues, SynthesizedMemory } from '@/types';

const THRESHOLDS = {
  TOO_SOON:           30,
  SHORT_BREAK:        120,
  MEDIUM_BREAK:       240,
  LONG_BREAK:         480,
  VERY_LONG_BREAK:    1440,
  FORGOTTEN_BREAK:    4320,
};

export interface OfflineSnapshot {
  lastEmotions:   EmotionalStateValues;
  lastTimestamp:  number;
  guardedness:    number;
  endedBadly:     boolean;
  endedWarmly:    boolean;
  trustLevel:     number;
  recentMemoryTags:   string[];
  sharedTopics:       string[];
  memoryCount:        number;
  lastMemoryIntensity:number;
}

export interface PresenceDecision {
  amadeusWillCall:  boolean;
  callReason:       string;
  callMood:         'warm' | 'curious' | 'melancholy' | 'awkward';
  willPickUp:       boolean;
  rejectReason:     string;
  rejectType:       'cold' | 'hurt' | 'busy' | 'unavailable';
  evolvedEmotions:  EmotionalStateValues;
  minutesElapsed:   number;
}

const SNAPSHOT_KEY = 'amadeus-offline-snapshot';

export const saveOfflineSnapshot = (snapshot: OfflineSnapshot): void => {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch (e) {}
};

export const loadOfflineSnapshot = (): OfflineSnapshot | null => {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};

export const evolveEmotionsOverTime = (
  emotions: EmotionalStateValues,
  minutesElapsed: number,
  endedBadly: boolean,
  endedWarmly: boolean
): EmotionalStateValues => {
  const t = minutesElapsed;
  const e = { ...emotions };

  const angerDecay = Math.exp(-t / 120);
  e.annoyance    = Math.max(e.annoyance * angerDecay, emotions.annoyance * 0.1);

  const stressDecay = Math.exp(-t / 240);
  e.stress       = Math.max(e.stress * stressDecay, 5);
  e.discomfort   = Math.max(e.discomfort * stressDecay, 0);

  const shameDecay = Math.exp(-t / 480);
  e.shame        = Math.max(e.shame * shameDecay, 0);

  if (t > 120) {
    const melancolyDrift = Math.min(t / 2000, 0.2);
    e.melancholy = Math.min(e.melancholy + (endedBadly ? melancolyDrift * 1.5 : melancolyDrift * 0.5), 85);
  }

  if (t > THRESHOLDS.MEDIUM_BREAK) {
    const curiosityGain = Math.min((t - THRESHOLDS.MEDIUM_BREAK) / 500, 25);
    e.curiosity = Math.min(e.curiosity + curiosityGain, 90);
  }

  return Object.fromEntries(
    Object.entries(e).map(([k, v]) => [k, Math.max(0, Math.min(100, Math.round(v)))] as any)
  ) as unknown as EmotionalStateValues;
};

export const evaluatePresence = (snapshot: OfflineSnapshot): PresenceDecision => {
  const now = Date.now();
  const minutesElapsed = Math.floor((now - snapshot.lastTimestamp) / 60000);
  const evolved = evolveEmotionsOverTime(
    snapshot.lastEmotions,
    minutesElapsed,
    snapshot.endedBadly,
    snapshot.endedWarmly
  );

  let willPickUp    = true;
  let rejectReason  = '';
  let rejectType: PresenceDecision['rejectType'] = 'unavailable';

  let amadeusWillCall = false;
  let callReason      = '';
  let callMood: PresenceDecision['callMood'] = 'curious';

  if (minutesElapsed > THRESHOLDS.MEDIUM_BREAK && Math.random() > 0.7) {
    amadeusWillCall = true;
    callReason = 'Neural link dormant for extended period';
    callMood = 'curious';
  }

  return {
    amadeusWillCall,
    callReason,
    callMood,
    willPickUp,
    rejectReason,
    rejectType,
    evolvedEmotions: evolved,
    minutesElapsed,
  };
};

export const buildSnapshotFromSession = (
  emotions: EmotionalStateValues,
  guardedness: number,
  trustBuilt: number,
  lastMessages: Array<{ text: string; sender: string }>
): OfflineSnapshot => {
  return {
    lastEmotions:   emotions,
    lastTimestamp:  Date.now(),
    guardedness,
    endedBadly: false,
    endedWarmly: true,
    trustLevel:     trustBuilt,
    recentMemoryTags:    [],
    sharedTopics:        [],
    memoryCount:         0,
    lastMemoryIntensity: 0,
  };
};

export const buildSnapshotWithMemories = (
  emotions: EmotionalStateValues,
  guardedness: number,
  trustBuilt: number,
  lastMessages: Array<{ text: string; sender: string }>,
  memories: SynthesizedMemory[]
): OfflineSnapshot => {
  const base = buildSnapshotFromSession(emotions, guardedness, trustBuilt, lastMessages);
  return {
    ...base,
    memoryCount: memories.length,
    lastMemoryIntensity: memories[0]?.intensity ?? 0,
  };
};
