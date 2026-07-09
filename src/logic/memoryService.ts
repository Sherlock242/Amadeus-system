/**
 * AMADEUS MEMORY SYNTHESIS ENGINE
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
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const geminiResp = await apiFetch(geminiEndpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Summarize this conversation as a memory for Makise Kurisu:\n' + transcript }] }],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 1000,
        }
      })
    });

    const geminiData = await geminiResp.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');

    return {
      title: "Conversation Memory",
      summary: text,
      intensity: 50,
      contextTags: ["interaction"],
      emotionalSnapshot: conversation.amadeusState.emotionalState
    };
  } catch (err) {
    return null;
  }
};
