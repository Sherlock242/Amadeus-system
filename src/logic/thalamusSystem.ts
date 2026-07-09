
import { apiFetch } from './apiBridge';
import type { ThalamusAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '@/types';

export const processThalamus = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<ThalamusAnalysis> => {
  const prompt = `You are Amadeus Kurisu's THALAMUS. You are the central gatekeeper filtering and directing sensory flows.
Input: "${message}"
Emotions: ${JSON.stringify(currentEmotions)}
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
      routingPriority: 'BALANCED',
      activationLevel: 15,
      gatingState: { suppressPFC: false, amplifyLimbic: false },
      attentionTarget: 'Sensory integration'
    };
  }
};
