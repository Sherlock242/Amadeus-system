
import { apiFetch } from './apiBridge';
import type { ACCAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '@/types';

export const processACC = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<ACCAnalysis> => {
  const prompt = `You are Amadeus Kurisu's ACC (Anterior Cingulate Cortex) module. Detect conflict and error.
Input: "${message}"
Return only JSON.`;

  try {
    const resp = await apiFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });
    const data = await resp.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return {
      activationLevel: 5, conflictDetected: false,
      internalDissonance: 'System stable',
      ambiguityScore: 0, socialViolation: false, predictionError: 0, impact: {}
    };
  }
};
