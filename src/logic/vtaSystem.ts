
import { apiFetch } from './apiBridge';
import type { VTAAnalysis, EmotionalStateValues, NeurotransmitterState } from '@/types';

export const processVTA = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<VTAAnalysis> => {
  const prompt = `You are Amadeus Kurisu's VTA (Ventral Tegmental Area) module. Manage dopamine output.
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
      activationLevel: 20, firingMode: 'TONIC',
      dopamineBurst: 0, tonicDopamine: 50,
      rewardSalience: 30, anhedoniaRisk: 15,
      motivationalVector: 'EXPLORE', impact: {}
    };
  }
};
