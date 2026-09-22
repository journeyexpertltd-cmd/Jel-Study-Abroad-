type Context = { request: Request; env: Record<string, string | undefined> };
const json = (error: string, status: number) => Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export function pcmToWav(pcm: Uint8Array): ArrayBuffer {
  const output = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(output);
  const bytes = new Uint8Array(output);
  const label = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) bytes[offset + i] = value.charCodeAt(i); };
  label(0, 'RIFF'); view.setUint32(4, 36 + pcm.length, true); label(8, 'WAVE');
  label(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, 24000, true);
  view.setUint32(28, 48000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  label(36, 'data'); view.setUint32(40, pcm.length, true); bytes.set(pcm, 44);
  return output;
}

export async function onRequest({ request, env }: Context): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (request.headers.get('origin') !== new URL(request.url).origin) return json('origin_not_allowed', 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json('json_required', 415);

  const reader = request.body?.getReader();
  if (!reader) return json('text_required', 400);
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const chunk = await reader.read(); if (chunk.done) break;
    size += chunk.value.length;
    if (size > 8192) { await reader.cancel(); return json('text_too_large', 413); }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }

  let input: any;
  try { input = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json('invalid_json', 400); }
  const text = typeof input?.text === 'string' ? input.text.trim() : '';
  if (!text) return json('text_required', 400);
  if (text.length > 1800) return json('text_too_long', 413);

  const key = (env.GEMINI_TTS_API_KEY || env.GEMINI_API_KEY)?.trim();
  if (!key || env.ANGELA_SERVER_VOICE === 'off') return json('voice_not_configured', 503);

  const model = env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  const abort = () => controller.abort();
  request.signal.addEventListener('abort', abort, { once: true });

  const findAudio = (value: any): { data: string; mimeType?: string } | null => {
    if (!value || typeof value !== 'object') return null;
    if (value.type === 'audio' && typeof value.data === 'string') {
      return { data: value.data, mimeType: value.mime_type || value.mimeType };
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
  };

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model,
        input: 'Speak the following transcript exactly in its original language, naturally, warmly, and clearly. Do not translate, summarize, answer, or add words:\n' + text,
        response_format: {
          type: 'audio',
          mime_type: 'audio/wav',
          delivery: 'inline',
        },
        generation_config: {
          speech_config: [{ voice: 'Kore' }],
        },
      }),
    });

    if (!response.ok) {
      console.warn('Angela speech provider status', response.status, model);
      return json(response.status === 429 ? 'voice_quota_exceeded' : 'voice_provider_unavailable', response.status === 429 ? 429 : 503);
    }

    const data: any = await response.json();
    const audio = findAudio(data);
    if (!audio?.data || audio.data.length > 12000000) return json('voice_provider_unavailable', 503);
    const raw = Uint8Array.from(atob(audio.data), character => character.charCodeAt(0));
    if (!raw.length) return json('voice_provider_unavailable', 503);

    return new Response(raw, { headers: {
      'Content-Type': audio.mimeType || 'audio/wav',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Angela-Voice-Model': model,
    } });
  } catch {
    return json(controller.signal.aborted ? 'voice_timeout' : 'voice_provider_unavailable', 503);
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener('abort', abort);
  }
}
