
import { apiFetch } from './apiBridge';
import type { AmygdalaAnalysis, EmotionalStateValues, NeurotransmitterState } from '@/types';

export const processAmygdala = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<AmygdalaAnalysis> => {
  const prompt = `You are Amadeus Kurisu's AMYGDALA. Perform threat and reward detection.
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
      activationLevel: 5, salience: 10, threatLevel: 0, rewardLevel: 0,
      rawInstinct: 'CALM', inhibitsPFC: false
    };
  }
};
