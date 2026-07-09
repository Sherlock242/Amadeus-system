
import { apiFetch } from './apiBridge';
import type { HippocampusAnalysis, SynthesizedMemory, NeurotransmitterState } from '@/types';

export const processHippocampus = async (
  message: string,
  memories: SynthesizedMemory[],
  activeNodes: string[],
  groqKey: string,
  nc?: NeurotransmitterState
): Promise<HippocampusAnalysis> => {
  const prompt = `You are Amadeus Kurisu's HIPPOCAMPUS. Perform memory retrieval and context matching.
Input: "${message}"
Memories: ${JSON.stringify(memories.slice(0,5))}
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
      episodicMemoryFound: false,
      emotionalTag: 'none',
      contextSimilarity: 0,
      patternConfidence: 0,
      note: ''
    };
  }
};
