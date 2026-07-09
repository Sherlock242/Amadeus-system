
import { apiFetch } from './apiBridge';
import type { LocusCoeruleusAnalysis, EmotionalStateValues, NeurotransmitterState } from '@/types';

export const processLocusCoeruleus = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<LocusCoeruleusAnalysis> => {
  const prompt = `You are Amadeus Kurisu's LOCUS COERULEUS module. Evaluate norepinephrine and arousal level.
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
      activationLevel: 20, neLevel: 45,
      arousalState: 'ALERT', exploitMode: false,
      attentionNarrowing: 20, stressReactivity: 35, impact: {}
    };
  }
};
