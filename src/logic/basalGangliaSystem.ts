
import { apiFetch } from './apiBridge';
import type { BasalGangliaAnalysis, EmotionalStateValues, NeurotransmitterState } from '@/types';

export const processBasalGanglia = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState,
  previousRewardPrediction?: number
): Promise<BasalGangliaAnalysis> => {
  const prompt = `You are Amadeus Kurisu's BASAL GANGLIA. Perform action selection and reward prediction.
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
      activationLevel: 20, directPathway: 50, indirectPathway: 50,
      rewardPredictionError: 0, habitIndex: 30,
      actionSelected: 'STANDARD_RESPONSE',
      striatalTone: 'BALANCED', impact: {}
    };
  }
};
