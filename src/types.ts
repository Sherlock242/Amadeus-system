
import { GoogleGenAI } from '@google/genai';

export enum Sender {
  User = 'USER',
  Amadeus = 'AMADEUS',
}

export interface EmotionalStateValues {
  annoyance: number;
  warmth: number;
  curiosity: number;
  melancholy: number;
  confidence: number;
  anxiety: number;
  sarcasm: number;
  trust: number;
  dopamine: number;
  stress: number;
  shame: number;
  discomfort: number;
  playfulness: number;
  confusion: number;
}

export interface PurposeCores {
  sync: number;
  defense: number;
  logic: number;
}

export interface NeuralNode {
  id: string;
  label: string;
  energy: number;
  baseThreshold: number;
  threshold: number;
  decayRate: number;
  keywords: string[];
  potency: number;
  fireCount: number;
  consolidationLevel: number;
  lastActivation?: { reason: string; score: number; timestamp: number };
  lastFired?: number;
}

export interface NeuralEdge {
  from: string;
  to: string;
  weight: number;
  hebbianStrength: number;
  valence: 'excitatory' | 'inhibitory';
}

export interface PersonalityDrift {
  openness: number;
  guardedness: number;
  intellectualArousal: number;
  trustBuilt: number;
  vulnerabilityExposed: number;
  lastDriftAt: number;
}

export interface MetaCognitionState {
  selfAwarenessLevel: number;
  introspectionTrigger: string;
  internalConflictNote: string;
  cognitiveLoad: number;
  dominantThought: string;
  suppressedThought?: string;
}

export interface NeuralNetworkState {
  nodes: Record<string, NeuralNode>;
  edges: NeuralEdge[];
  workingMemory: any[];
  personalityDrift: PersonalityDrift;
  metaCognition: MetaCognitionState;
  cycleCount: number;
  lastConsolidationAt?: number;
}

export interface AmadeusState {
  shortTermMemory: Record<string, string>;
  emotionalState: EmotionalStateValues;
  personalityBaselines: EmotionalStateValues;
  purposeCores: PurposeCores;
  neuralNetwork: NeuralNetworkState;
  biologicalState?: any;
}

export interface Message {
  sender: Sender;
  text: string;
  image?: string;
  timestamp: number;
  emotionalState?: EmotionalStateValues;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
  amadeusState: AmadeusState;
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface MusicSettings {
  selectedTrack: string;
  volume: number;
  isPlaying: boolean;
}

export interface TtsSettings {
  engine: 'disabled' | 'browser' | 'elevenlabs';
  browserVoiceURI: string | null;
  browserPitch: number;
  browserRate: number;
}

export interface PersonalitySettings {
  tsundere: number;
  sarcasm: number;
  scientific: number;
  temperature: number;
  topK: number;
  isNsfwMode: boolean;
  isCognitiveLoopEnabled: boolean;
  initialEmotionalState: EmotionalStateValues;
}

export interface AmygdalaAnalysis {
  activationLevel: number;
  salience: number;
  threatLevel: number;
  rewardLevel: number;
  rawInstinct: string;
  inhibitsPFC: boolean;
}

export interface SynthesizedMemory {
  id: string;
  title: string;
  summary: string;
  timestamp: number;
  emotionalSnapshot: EmotionalStateValues;
  intensity: number;
  contextTags: string[];
}

export interface NeurotransmitterState {
  dopamine: number;
  serotonin: number;
  norepinephrine: number;
  acetylcholine: number;
  cortisol: number;
  oxytocin: number;
  endorphin: number;
  gabaGlutamate: number;
}

export interface ThalamusAnalysis {
  routingPriority: string;
  activationLevel: number;
  gatingState: { suppressPFC: boolean; amplifyLimbic: boolean; };
  attentionTarget: string;
}

export interface OFCAnalysis {
  activationLevel: number;
  socialValueAssessment: string;
  reputationRisk: number;
  socialFilterSuggestion: string;
  perceivedSocialStanding: string;
  impact: Partial<EmotionalStateValues>;
}

export interface ACCAnalysis {
  activationLevel: number;
  conflictDetected: boolean;
  internalDissonance: string;
  ambiguityScore: number;
  socialViolation: boolean;
  impact: Partial<EmotionalStateValues>;
  predictionError?: number;
}

export interface InsulaAnalysis {
  activationLevel: number;
  visceralReaction: boolean;
  discomfortLevel: number;
  disgustScore: number;
  physicalSensation: string;
  impact: Partial<EmotionalStateValues>;
}

export interface TPJAnalysis {
  activationLevel: number;
  inferredIntent: string;
  confidence: number;
  socialCues: string[];
  impact: Partial<EmotionalStateValues>;
}

export interface LimbicAnalysis {
  userTone: string;
  kurisuInternalConflict: string;
  psychologicalImpact: Partial<EmotionalStateValues>;
  timestamp?: number;
}

export interface HippocampusAnalysis {
  episodicMemoryFound: boolean;
  note: string;
  emotionalTag: string;
  patternConfidence: number;
}

export interface BasalGangliaAnalysis {
  actionSelected: string;
  rewardPredictionError: number;
  directPathway: number;
  indirectPathway: number;
  striatalTone: string;
}

export interface VTAAnalysis {
  firingMode: string;
  dopamineBurst: number;
  anhedoniaRisk: number;
  motivationalVector: string;
}

export interface LocusCoeruleusAnalysis {
  arousalState: string;
  neLevel: number;
  attentionNarrowing: number;
}

export interface RapheNucleiAnalysis {
  serotoninTone: number;
  ruminationRisk: number;
  socialPainSensitivity: number;
}

export interface DMNAnalysis {
  activationLevel: number;
  selfReferentialActivity: number;
  mindWandering: boolean;
  dmnTaskBalance: string;
  futureSimulation?: string;
  narrativeIdentityShift?: number;
}

export interface SessionSettings {
  isWebSearchEnabled: boolean;
  reasoningMode: 'Fast' | 'Balanced' | 'Max Quality';
  isCannedModeOnly: boolean;
  isAudioLoreMode: boolean;
}

export interface ResponseCategory {
  classifierPatterns: RegExp[];
  rules: {
    exampleTriggers: string[];
    condition: (intent: ParsedIntent) => boolean;
    responses: { default: { [key: string]: string; }; };
  }[];
}

export interface ParsedIntent {
  intent?: string;
  object?: string;
  subject?: string;
  action?: string;
  sentiment?: 'POSITIVE' | 'NEGATIVE';
  trait?: string;
}
