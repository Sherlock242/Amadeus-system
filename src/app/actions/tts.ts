
'use server';

/**
 * @fileOverview Server Action to handle Fish Audio TTS requests.
 * Bypasses CORS restrictions by performing the request server-side.
 */

export async function generateFishAudio(text: string, language?: string, referenceId?: string) {
  // Secured credentials via environment variables
  const API_KEY = process.env.FISH_AUDIO_API_KEY;
  
  // Use provided referenceId, otherwise fallback to env based on language
  let finalReferenceId = referenceId;
  if (!finalReferenceId) {
    if (language === 'jp') {
      finalReferenceId = process.env.FISH_AUDIO_JAP_REFERENCE_ID;
    } else {
      finalReferenceId = process.env.FISH_AUDIO_REFERENCE_ID;
    }
  }

  try {
    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        // Model string adjusted for free tier as per user instructions/screenshot
        'model': 's2.1-pro-free' 
      },
      body: JSON.stringify({
        text: text,
        reference_id: finalReferenceId,
        format: 'mp3',
        normalize: true,
        latency: 'normal'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fish Audio API error: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    
    return { audioData: `data:audio/mpeg;base64,${base64Audio}` };
  } catch (error) {
    console.error('Error generating audio via Fish Audio:', error);
    throw error;
  }
}
