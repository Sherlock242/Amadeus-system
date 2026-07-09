
import { apiFetch } from './apiBridge';
import type { InsulaAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '@/types';

export const processInsula = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<InsulaAnalysis> => {
  const prompt = `You are Amadeus Kurisu's INSULA module. Evaluate inner body signals and disgust.
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
      activationLevel: 0, visceralReaction: false, discomfortLevel: 0,
      shameTriggered: false, disgustScore: 0, physicalSensation: 'Calm',
      impact: {}
    };
  }
};
