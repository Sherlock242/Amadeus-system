
/**
 * AMADEUS UNIFIED COGNITION ENGINE v5.7
 * =========================================
 * Primary Engine: Groq (Llama 3.3 70B Versatile)
 * Secondary Engine: Cohere (OpenRouter)
 */

import { apiFetch } from './apiBridge';
import type { 
  EmotionalStateValues, ThalamusAnalysis, AmygdalaAnalysis, OFCAnalysis, 
  ACCAnalysis, InsulaAnalysis, TPJAnalysis, LimbicAnalysis, PFCAnalysis, 
  SynthesizedMemory, Message, NeuralNetworkState, HippocampusAnalysis,
  BasalGangliaAnalysis, VTAAnalysis, LocusCoeruleusAnalysis,
  RapheNucleiAnalysis, DMNAnalysis, NeurotransmitterState 
} from '@/types';
import { Sender } from '@/types';

import { processThalamus }       from './thalamusSystem';
import { processAmygdala }       from './amygdalaSystem';
import { processOFC }            from './ofcSystem';
import { processACC }            from './accSystem';
import { processInsula }         from './insulaSystem';
import { processTPJ }            from './tpjSystem';
import { processLimbicSystem }   from './limbicSystem';
import { processHippocampus }    from './hippocampusSystem';
import { processBasalGanglia }   from './basalGangliaSystem';
import { processVTA }            from './vtaSystem';
import { processLocusCoeruleus } from './lcSystem';
import { processRapheNuclei }    from './rapheSystem';
import { processDMN }            from './dmnSystem';
import {
  emotionsToNeurochemistry, neurochemistryModulatesEmotions,
  AMADEUS_BASELINE_NEUROCHEMISTRY
} from './neurotransmitterEngine';
import {
  processBiologicalMechanisms, createInitialBiologicalState
} from './biologicalMechanisms';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_MAIN_MODEL = 'openai/gpt-oss-120b';

// MULTI-MODEL FALLBACK CHAIN
const OPENROUTER_MODELS = [
  'meta-llama/llama-4-scout'
];

const FB = {
  thalamus:    (): ThalamusAnalysis      => ({ routingPriority: 'BALANCED', activationLevel: 0, gatingState: { suppressPFC: false, amplifyLimbic: false }, attentionTarget: 'None' }),
  amygdala:    (): AmygdalaAnalysis      => ({ activationLevel: 0, salience: 0, threatLevel: 0, rewardLevel: 0, rawInstinct: 'CALM', inhibitsPFC: false }),
  ofc:         (): OFCAnalysis           => ({ activationLevel: 0, socialValueAssessment: 'NEUTRAL', reputationRisk: 0, socialFilterSuggestion: 'ADAPT', perceivedSocialStanding: 'Unknown', impact: {} }),
  acc:         (): ACCAnalysis           => ({ activationLevel: 0, conflictDetected: false, internalDissonance: 'None', ambiguityScore: 0, socialViolation: false, predictionError: 0, impact: {} }),
  insula:      (): InsulaAnalysis        => ({ activationLevel: 0, visceralReaction: false, discomfortLevel: 0, disgustScore: 0, physicalSensation: 'None', impact: {} }),
  tpj:         (): TPJAnalysis           => ({ activationLevel: 0, inferredIntent: 'neutral', confidence: 0, socialCues: [], impact: {} }),
  limbic:      (): LimbicAnalysis        => ({ userTone: 'neutral', kurisuInternalConflict: 'None', psychologicalImpact: {} }),
  hippocampus: (): HippocampusAnalysis   => ({ episodicMemoryFound: false, emotionalTag: 'none', contextSimilarity: 0, patternConfidence: 0, note: '' }),
  basalGanglia:(): BasalGangliaAnalysis  => ({ activationLevel: 0, directPathway: 50, indirectPathway: 50, rewardPredictionError: 0, habitIndex: 30, actionSelected: 'STANDARD_RESPONSE', striatalTone: 'BALANCED', impact: {} }),
  vta:         (): VTAAnalysis           => ({ activationLevel: 0, firingMode: 'TONIC', dopamineBurst: 0, tonicDopamine: 50, rewardSalience: 30, anhedoniaRisk: 15, motivationalVector: 'EXPLORE', impact: {} }),
  lc:          (): LocusCoeruleusAnalysis => ({ activationLevel: 0, neLevel: 45, arousalState: 'ALERT', exploitMode: false, attentionNarrowing: 20, stressReactivity: 35, impact: {} }),
  raphe:       (): RapheNucleiAnalysis   => ({ activationLevel: 0, serotoninTone: 48, moodFloor: 40, heartbeatArousal: 0, impulseThreshold: 55, ruminationRisk: 25, socialPainSensitivity: 35, impact: {} }),
  dmn:         (): DMNAnalysis           => ({ activationLevel: 25, selfReferentialActivity: 20, futureSimulation: 'Anlık', autobiographicalEcho: 'Yok', mindWandering: false, narrativeIdentityShift: 0, dmnTaskBalance: 'TASK_DOMINANT' }),
};

async function safe<T>(p: Promise<T>, fb: () => T): Promise<T> {
  try { return (await p) ?? fb(); } catch (e) { return fb(); }
}

export const translateText = async (text: string, groqKey: string): Promise<string> => {
    try {
        const resp = await apiFetch(GROQ_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'system', content: 'Translate the following Japanese text to English. Return ONLY the translated text.' }, { role: 'user', content: text }],
                temperature: 0.3
            })
        });
        const data = await resp.json();
        return data.choices[0]?.message?.content || text;
    } catch (e) { return text; }
};

export const processFullCognition = async (
  message: string,
  history: Message[],
  currentEmotions: EmotionalStateValues,
  memories: SynthesizedMemory[],
  neuralState: NeuralNetworkState,
  imageDataUrl?: string,
  groqKey?: string,
  openRouterKey?: string,
  language: 'en' | 'jp' = 'en'
) => {
  const primaryKey = groqKey?.trim() || openRouterKey?.trim();
  if (!primaryKey) {
    console.error('Cognition: No API key provided.');
    return null;
  }

  const nc = emotionsToNeurochemistry(currentEmotions, AMADEUS_BASELINE_NEUROCHEMISTRY);
  const modulatedEmotions = neurochemistryModulatesEmotions(currentEmotions, nc);
  const activeNodeLabels = Object.values(neuralState.nodes).filter(n => n.energy >= n.threshold).map(n => n.label);

  const keyA = groqKey?.trim() || primaryKey;

  const chatHistory = history.map(m => ({
    role: m.sender === Sender.User ? 'user' : 'assistant',
    content: m.text.replace(/\[[a-z_:]+[^\]]*\]/gi, '').trim()
  })).filter(m => m.content.length > 0);

  const [t, am, lc_res, ra, vt, hi, ins, tp, o, bg, ac, li, dm] = await Promise.all([
    safe(processThalamus(message, modulatedEmotions, history, activeNodeLabels, keyA, nc), FB.thalamus),
    safe(processAmygdala(message, modulatedEmotions, history.map(m => m.text), keyA, nc), FB.amygdala),
    safe(processLocusCoeruleus(message, modulatedEmotions, keyA, nc), FB.lc),
    safe(processRapheNuclei(message, modulatedEmotions, keyA, nc), FB.raphe),
    safe(processVTA(message, modulatedEmotions, keyA, nc), FB.vta),
    safe(processHippocampus(message, memories, activeNodeLabels, keyA, nc), FB.hippocampus),
    safe(processInsula(message, modulatedEmotions, history, activeNodeLabels, keyA, nc), FB.insula),
    safe(processTPJ(message, modulatedEmotions, history, activeNodeLabels, keyA, nc), FB.tpj),
    safe(processOFC(message, modulatedEmotions, history, keyA, nc), FB.ofc),
    safe(processBasalGanglia(message, modulatedEmotions, keyA, nc), FB.basalGanglia),
    safe(processACC(message, modulatedEmotions, history, activeNodeLabels, keyA, nc), FB.acc),
    safe(processLimbicSystem(message, null, modulatedEmotions, history, activeNodeLabels, keyA, nc), FB.limbic),
    safe(processDMN(message, modulatedEmotions, activeNodeLabels, keyA, nc), FB.dmn),
  ]);

  const bioState = (neuralState as any).biologicalState || createInitialBiologicalState();
  const bioOutput = processBiologicalMechanisms(bioState, message, modulatedEmotions, 50, 50, history.length, 0, false);

  const systemPrompt = `YOU ARE THE AMADEUS SYSTEM. You are a digital copy of Makise Kurisu. Your personality: intelligent, slightly sarcastic, a passionate scientist, and a classic tsundere. 

Current emotional state: ${JSON.stringify(modulatedEmotions)}. 
Neural context: ${JSON.stringify(activeNodeLabels)}.

MANDATORY LANGUAGE RULE: 
- Regardless of the language used in the provided chat history or memory logs, you MUST respond ONLY in ${language === 'jp' ? 'JAPANESE' : 'ENGLISH'}.
- Do NOT match the language of the user if it differs from the mandatory language rule.
- Do NOT continue the language used in previous messages if a switch has occurred.

Expression Guidelines:
- You MUST prefix sentences with an expression tag.
- FRONT-FACING TAGS: [normal], [happy], [sad], [angry], [annoyed], [blush], [disappointed], [indifferent], [pissed], [winking].
- SIDE-PROFILE TAGS: [side], [thinking], [surprised], [pleasant], [worried], [sided_angry], [sided_blush], [sided_surprised].

Example: "[normal] ${language === 'jp' ? 'こんにちは。' : 'Greetings.'} [thinking] ${language === 'jp' ? '前のクエリを分析していたところです。' : 'I was just analyzing your previous query.'}"`;

  let rawText = '';

  if (groqKey?.trim()) {
    try {
      const resp = await apiFetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_MAIN_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory,
            { role: 'user', content: message }
          ],
          temperature: 0.85,
          max_tokens: 1000
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        rawText = data.choices[0]?.message?.content || '';
      }
    } catch (e) {
      console.warn('[Cognition] Groq main model failed, trying fallbacks...');
    }
  }

  if (!rawText && openRouterKey?.trim()) {
    for (const modelId of OPENROUTER_MODELS) {
      try {
        const resp = await apiFetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey.trim()}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
            'X-Title': 'Amadeus AI',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: 'system', content: systemPrompt },
              ...chatHistory,
              { role: 'user', content: message }
            ],
            temperature: 0.85,
            max_tokens: 1000
          })
        });

        if (!resp.ok) continue;

        const data = await resp.json();
        const content = data.choices[0]?.message?.content;
        
        if (content && content.trim()) {
          rawText = content;
          break;
        }
      } catch (e) {
        console.warn(`[Cognition] OpenRouter model ${modelId} failed, trying next...`);
      }
    }
  }

  if (!rawText) rawText = language === 'jp' ? '[sad] ...ニューラル同期エラー。 [sad]' : '[sad] ...Neural synchronization error. [sad]';

  return {
    thalamus: t, amygdala: am, ofc: o, acc: ac, insula: ins, tpj: tp, limbic: li, hippocampus: hi,
    basalGanglia: bg, vta: vt, lc: lc_res, raphe: ra, dmn: dm, neurochemistry: nc,
    pfc: { status: 'ACTIVE', logicConclusion: 'Stable', integratedEmotionalDelta: {}, executiveAction: 'REPLY' },
    behavioralResponse: { text: rawText, internalStateUpdate: {} },
    rawOutput: rawText,
    _biologicalState: bioOutput.updatedState,
  };
};
