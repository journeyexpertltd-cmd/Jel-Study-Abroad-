type Context = { request: Request; env: Record<string, string | undefined> };

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

export function pcmToWav(pcm: Uint8Array): ArrayBuffer {
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

function findAudio(value: any): { data: string } | null {
  if (!value || typeof value !== 'object') return null;
  if (value.type === 'audio' && typeof value.data === 'string') return { data: value.data };
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

  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const text = typeof body?.text === 'string' ? body.text.replace(/\s+/g, ' ').trim().slice(0, 1800) : '';
  if (!text) return json({ error: 'text_required' }, 400);

  const key = (env.GEMINI_TTS_API_KEY || env.GEMINI_API_KEY || '').trim();
  if (!key || env.ANGELA_SERVER_VOICE === 'off') return json({ error: 'voice_not_configured' }, 503);

  const models = Array.from(new Set([
    env.GEMINI_TTS_MODEL,
    'gemini-3.1-flash-tts-preview',
    'gemini-2.5-flash-preview-tts',
    'gemini-2.5-pro-preview-tts',
  ].filter((model): model is string => Boolean(model))));

  let sawQuota = false;

  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          model,
          input: 'Speak the following transcript exactly in its original language, naturally, warmly, clearly, and in a professional adult female voice. Do not translate, summarize, answer, or add words:\n' + text,
          response_format: { type: 'audio' },
          generation_config: { speech_config: [{ voice: 'Kore' }] },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) sawQuota = true;
        continue;
      }

      const data: any = await response.json();
      const audio = findAudio(data);
      if (!audio?.data) continue;
      const pcm = Uint8Array.from(atob(audio.data), character => character.charCodeAt(0));
      if (!pcm.length) continue;

      return new Response(pcmToWav(pcm), {
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
          'X-Angela-Voice': 'Kore',
          'X-Angela-Voice-Model': model,
        },
      });
    } catch {
      // Try the next supported Google TTS model.
    } finally {
      clearTimeout(timer);
    }
  }

  return json({
    error: sawQuota ? 'voice_quota_exceeded' : 'voice_provider_unavailable',
  }, sawQuota ? 429 : 503);
}
