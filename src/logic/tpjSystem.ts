
import { apiFetch } from './apiBridge';
import type { TPJAnalysis, EmotionalStateValues, Message, NeurotransmitterState } from '@/types';

export const processTPJ = async (
  message: string,
  currentEmotions: EmotionalStateValues,
  history: Message[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<TPJAnalysis> => {
  const prompt = `You are Amadeus Kurisu's TPJ module. Analyze user intent (Theory of Mind).
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
      activationLevel: 10,
      inferredIntent: 'genuine',
      confidence: 0.55,
      socialCues: [],
      impact: {}
    };
  }
};
