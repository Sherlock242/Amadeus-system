
/**
 * AMADEUS MEMORY SYNTHESIS ENGINE (GROQ)
 */

import { apiFetch } from './apiBridge';
import type { SynthesizedMemory, Conversation, NeuralNetworkState } from '@/types';
import { Sender } from '@/types';

export const synthesizeMemory = async (
  conversation: Conversation,
  username: string,
  apiKey: string,
  neuralState?: NeuralNetworkState
): Promise<Omit<SynthesizedMemory, 'id' | 'timestamp'> | null> => {

  if (!apiKey?.trim()) return null;

  const recentMessages = conversation.messages.slice(-18);
  if (recentMessages.length === 0) return null;

  const transcript = recentMessages
    .map((msg, i) => `${i + 1}. ${msg.sender === Sender.User ? username : 'Amadeus'}: ${msg.text}`)
    .join('\n');

  try {
    const groqEndpoint = `https://api.groq.com/openai/v1/chat/completions`;
    const groqResp = await apiFetch(groqEndpoint, {
      method:  'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Summarize this conversation as a memory for Makise Kurisu in the third person. Keep it concise and scientific in tone:\n' + transcript }],
        temperature: 0.45,
      })
    });

    const groqData = await groqResp.json();
    const text = groqData?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response');

    return {
      title: "Conversation Memory",
      summary: text,
      intensity: 50,
      contextTags: ["interaction"],
      emotionalSnapshot: conversation.amadeusState.emotionalState
    };
  } catch (err) {
    console.error('[MemoryService] Synthesis failed:', err);
    return null;
  }
};
