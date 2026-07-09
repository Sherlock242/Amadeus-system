
import { apiFetch } from './apiBridge';
import type { LimbicAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '@/types';

export const processLimbicSystem = async (
  message: string,
  previousLimbicState: LimbicAnalysis | null,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<LimbicAnalysis> => {
  const prompt = `You are Amadeus Kurisu's LIMBIC SYSTEM. Evaluate emotional memory and motivation.
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
      userTone: 'neutral',
      kurisuInternalConflict: 'None',
      psychologicalImpact: {}
    };
  }
};
