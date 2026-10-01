type Context = { request: Request; env: Record<string, string | undefined> };

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

export function pcmToWav(pcm: Uint8Array): ArrayBuffer {
  // Preserve complete unary WAV output; only legacy PCM needs wrapping.
  if (pcm.length >= 12 && String.fromCharCode(...pcm.slice(0, 4)) === 'RIFF' && String.fromCharCode(...pcm.slice(8, 12)) === 'WAVE') return new Uint8Array(pcm).buffer;
  const output = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(output);
  const bytes = new Uint8Array(output);
  const label = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) bytes[offset + i] = value.charCodeAt(i);
  };
  label(0, 'RIFF'); view.setUint32(4, 36 + pcm.length, true); label(8, 'WAVE');
  label(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true); view.setUint32(28, 48000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  label(36, 'data'); view.setUint32(40, pcm.length, true); bytes.set(pcm, 44);
  return output;
}

function findAudio(value: any): { data: string; mimeType?: string } | null {
  if (!value || typeof value !== 'object') return null;
  if (typeof value.data === 'string' && (
    value.type === 'audio' ||
    (typeof value.mimeType === 'string' && value.mimeType.startsWith('audio/'))
  )) return { data: value.data, mimeType: value.mime_type || value.mimeType };
  if (value.inlineData && typeof value.inlineData.data === 'string' &&
      String(value.inlineData.mimeType || '').startsWith('audio/')) {
    return { data: value.inlineData.data, mimeType: value.inlineData.mimeType };
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findAudio(item);
      if (found) return found;
    }
    return null;
  }
  for (const item of Object.values(value)) {
    const found = findAudio(item);
    if (found) return found;
  }
  return null;
}

export async function onRequest({ request, env }: Context): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'origin_not_allowed' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'json_required' }, 415);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 8192) return json({ error: 'text_too_large' }, 413);

  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ error: 'invalid_json' }, 400); }
  const originalText = typeof body?.text === 'string' ? body.text : '';
  if (originalText.length > 1800) return json({ error: 'text_too_long' }, 413);
  const text = originalText.replace(/\s+/g, ' ').trim();
  if (!text) return json({ error: 'text_required' }, 400);

  const keys = Array.from(new Set([
    env.GEMINI_TTS_API_KEY?.trim(),
    env.GEMINI_API_KEY?.trim(),
  ].filter((key): key is string => Boolean(key))));
  if (!keys.length || env.ANGELA_SERVER_VOICE === 'off') return json({ error: 'voice_not_configured' }, 503);

  const models = Array.from(new Set([
    env.GEMINI_TTS_MODEL,
    'gemini-3.8-flash-lite-tts',
    'gemini-3.8-flash-tts',
  ].filter((model): model is string => Boolean(model))));

  let sawQuota = false;
  let lastProviderStatus = 0;
  const voiceDeadline = Date.now() + 9000;

  outer: for (const key of keys) {
    for (const model of models) {
      const remaining = voiceDeadline - Date.now();
      if (remaining < 800) break outer;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(7000, remaining));

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': key,
            },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{
                  text,
                  speech_metadata: {
                    style: 'Warm, natural, professional adult female delivery. Speak the text exactly as written in its original language.',
                  },
                }],
              }],
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: { voice: 'Aoede' },
                },
              },
            }),
          },
        );

        lastProviderStatus = response.status;
        if (!response.ok) {
          if (response.status === 429) {
            sawQuota = true;
            break;
          }
          if (response.status === 401 || response.status === 403) break;
          continue;
        }

        const data: any = await response.json();
        const audio = data?.candidates?.[0]?.content?.parts
          ?.map((part: any) => part?.inlineData)
          .find((part: any) => part && typeof part.data === 'string' && String(part.mimeType || '').startsWith('audio/'));

        if (!audio?.data) continue;
        const rawAudio = Uint8Array.from(atob(audio.data), character => character.charCodeAt(0));
        if (!rawAudio.length) continue;

        const isWav = rawAudio.length >= 12
          && String.fromCharCode(...rawAudio.slice(0, 4)) === 'RIFF'
          && String.fromCharCode(...rawAudio.slice(8, 12)) === 'WAVE';
        const outputBody = isWav ? rawAudio : new Uint8Array(pcmToWav(rawAudio));

        return new Response(outputBody, {
          headers: {
            'Content-Type': 'audio/wav',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
            'X-Angela-Voice': 'Aoede',
            'X-Angela-Voice-Model': model,
          },
        });
      } catch (error) {
        console.warn('Angela TTS failed', model, controller.signal.aborted ? 'timeout' : (error instanceof Error ? error.message : 'unknown'));
      } finally {
        clearTimeout(timer);
      }
    }
  }

  if (sawQuota) {
    return Response.json({
      error: 'voice_quota_exceeded',
      providerStatus: lastProviderStatus || 429,
    }, {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Retry-After': '60',
      },
    });
  }

  return json({
    error: 'voice_provider_unavailable',
    providerStatus: lastProviderStatus || undefined,
  }, 503);
}
