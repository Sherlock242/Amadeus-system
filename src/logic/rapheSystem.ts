
import { apiFetch } from './apiBridge';
import type { RapheNucleiAnalysis, EmotionalStateValues, NeurotransmitterState } from '@/types';

export const processRapheNuclei = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<RapheNucleiAnalysis> => {
  const prompt = `You are Amadeus Kurisu's RAPHE NUCLEI module. Manage serotonin and mood floor.
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
      activationLevel: 20, serotoninTone: 48,
      moodFloor: 40, impulseThreshold: 55,
      ruminationRisk: 25, socialPainSensitivity: 35, impact: {}
    };
  }
};
