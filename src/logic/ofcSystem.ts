
import { apiFetch } from './apiBridge';
import type { OFCAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '@/types';

export const processOFC = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<OFCAnalysis> => {
  const prompt = `You are Amadeus Kurisu's OFC (Orbitofrontal Cortex) module. Perform social value and reward analysis.
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
      activationLevel: 10, socialValueAssessment: 'MEDIUM',
      reputationRisk: 0, socialFilterSuggestion: 'ADAPT',
      perceivedSocialStanding: 'Stranger', impact: {}
    };
  }
};
