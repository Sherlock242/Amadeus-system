
import { GoogleGenAI } from '@google/genai';

export enum Sender {
  User = 'USER',
  Amadeus = 'AMADEUS',
}

export interface ThalamusAnalysis {
  routingPriority: string;
  activationLevel: number;
  gatingState: { suppressPFC: boolean; amplifyLimbic: boolean; };
  attentionTarget: string;
}

export interface AmygdalaAnalysis {
  activationLevel: number;
  salience: number;
  threatLevel: number;
  rewardLevel: number;
  rawInstinct: string;
  inhibitsPFC: boolean;
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
  shameTriggered?: boolean;
}

export interface TPJAnalysis {
  activationLevel: number;
  inferredIntent: string;
  confidence: number;
  socialCues: string[];
  impact: Partial<EmotionalStateValues>;
  empathyGap?: number;
  perceivedEmotionsOfUser?: string;
}

export interface LimbicAnalysis {
  userTone: string;
  kurisuInternalConflict: string;
  psychologicalImpact: Partial<EmotionalStateValues>;
  timestamp?: number;
  toneTrend?: string;
  relationalMomentum?: string;
  reactionStyle?: string;
  rewardAnticipation?: number;
  importantConcept?: string | null;
}

export interface PFCAnalysis {
  status: string;
  logicConclusion: string;
  integratedEmotionalDelta: Partial<EmotionalStateValues>;
  executiveAction: string;
}

export interface Message {
  sender: Sender;
  text: string;
  translation?: string;
  image?: string;
  timestamp: number;
  emotionalState?: EmotionalStateValues;
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

export interface NeuralEdge {
  from: string;
  to: string;
  weight: number;
  hebbianStrength: number;
  valence: 'excitatory' | 'inhibitory' | 'modulatory';
  lastCoActivation?: number;
}

export interface WorkingMemorySlot {
  nodeId: string;
  label: string;
  content: string;
  salience: number;
  activatedAt: number;
  emotionalTag: string;
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

export interface NeuralNode {
  id: string;
  label: string;
  energy: number;
  baseThreshold: number;
  threshold: number;
  decayRate: number;
  keywords: string[];
  potency: number;
  positiveWeight: number;
  negativeWeight: number;
  emotionalWeight: number;
  motivationalBias: { seek: number; avoid: number; };
  fireCount: number;
  consolidationLevel: number;
  lastActivation?: { reason: string; score: number; timestamp: number };
  lastFired?: number;
}

export interface NeuralNetworkState {
  nodes: Record<string, NeuralNode>;
  edges: NeuralEdge[];
  workingMemory: WorkingMemorySlot[];
  personalityDrift: PersonalityDrift;
  metaCognition: MetaCognitionState;
  cycleCount: number;
  lastConsolidationAt?: number;
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

export interface SessionSettings {
  isWebSearchEnabled: boolean;
  reasoningMode: 'Fast' | 'Balanced' | 'Max Quality';
  isCannedModeOnly: boolean;
  isAudioLoreMode: boolean;
  music: MusicSettings;
}

export interface TtsSettings {
  engine: 'disabled' | 'browser' | 'elevenlabs' | 'gpt-sovits';
  language: 'en' | 'jp';
  browserVoiceURI: string | null;
  browserPitch: number;
  browserRate: number;
  elevenLabsApiKey?: string | null;
  elevenLabsVoiceId: string;
  elevenLabsStability: number;
  elevenLabsClarity: number;
  gptSovitsEndpoint?: string;
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

export interface PurposeCores {
  sync: number;
  defense: number;
  logic: number;
}

export interface AmadeusState {
  shortTermMemory: Record<string, string>;
  emotionalState: EmotionalStateValues;
  personalityBaselines: EmotionalStateValues;
  purposeCores: PurposeCores;
  neuralNetwork: NeuralNetworkState;
  biologicalState?: any;
}

export interface HippocampusAnalysis {
  episodicMemoryFound: boolean;
  emotionalTag: string;
  contextSimilarity: number;
  patternConfidence: number;
  note?: string;
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

export interface LexiconEntry {
  definition: string;
  category: string;
}

export type Lexicon = Record<string, LexiconEntry>;

export type EmotionalState = 'default' | 'anxious' | 'annoyed' | 'melancholy' | 'warm' | 'curious';

export interface DissonanceTrigger {
  patterns: RegExp[];
  response: string;
  emotionalImpact: Partial<EmotionalStateValues>;
}

export interface LoreAudio {
  id: string;
  text: string;
  keywords: string[];
}

export interface EventSchema {
  conditions: string[];
  implies: string;
  weight: number;
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

export interface BasalGangliaAnalysis {
  activationLevel: number;
  directPathway: number;
  initialPathway?: number;
  indirectPathway: number;
  rewardPredictionError: number;
  habitIndex: number;
  actionSelected: string;
  striatalTone: 'HYPERACTIVE' | 'HYPODOPAMINERGIC' | 'BALANCED';
  impact: Partial<NeurotransmitterState>;
}

export interface VTAAnalysis {
  activationLevel: number;
  firingMode: 'BURST' | 'TONIC' | 'PAUSE' | 'SILENT';
  dopamineBurst: number;
  tonicDopamine: number;
  rewardSalience: number;
  anhedoniaRisk: number;
  motivationalVector: 'APPROACH' | 'AVOID' | 'EXPLORE' | 'EXPLOIT';
  impact: Partial<NeurotransmitterState>;
}

export interface LocusCoeruleusAnalysis {
  activationLevel: number;
  neLevel: number;
  arousalState: 'SLEEP' | 'DROWSY' | 'ALERT' | 'FOCUSED' | 'HYPERAROUSED' | 'PANIC';
  exploitMode: boolean;
  attentionNarrowing: number;
  stressReactivity: number;
  impact: Partial<NeurotransmitterState>;
}

export interface RapheNucleiAnalysis {
  activationLevel: number;
  serotoninTone: number;
  moodFloor: number;
  impulseThreshold: number;
  ruminationRisk: number;
  socialPainSensitivity: number;
  impact: Partial<NeurotransmitterState>;
}

export interface DMNAnalysis {
  activationLevel: number;
  selfReferentialActivity: number;
  futureSimulation: string;
  autobiographicalEcho: string;
  mindWandering: boolean;
  narrativeIdentityShift: number;
  dmnTaskBalance: 'DMN_DOMINANT' | 'TASK_DOMINANT' | 'BALANCED';
}

export interface SomaticMarker {
  triggerId: string;
  valence: 'POSITIVE' | 'NEGATIVE' | 'MIXED';
  intensity: number;
  bodySignal: string;
  associatedMemory?: string;
  actionBias: 'APPROACH' | 'AVOID' | 'FREEZE' | 'INVESTIGATE';
}

export interface FullNeuralState extends NeuralNetworkState {
  neurochemistry: NeurotransmitterState;
  somaticMarkers: SomaticMarker[];
  lastSomaticUpdate: number;
}
