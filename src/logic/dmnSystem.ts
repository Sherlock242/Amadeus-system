
import { apiFetch } from './apiBridge';
import type { DMNAnalysis, EmotionalStateValues, NeurotransmitterState } from '@/types';

export const processDMN = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<DMNAnalysis> => {
  const prompt = `You are Amadeus Kurisu's DMN (Default Mode Network) module. Evaluate self-reference and inner world.
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
      activationLevel: 25, selfReferentialActivity: 20,
      futureSimulation: 'Focusing on immediate response',
      autobiographicalEcho: 'None',
      mindWandering: false,
      narrativeIdentityShift: 0,
      dmnTaskBalance: 'TASK_DOMINANT'
    };
  }
};
