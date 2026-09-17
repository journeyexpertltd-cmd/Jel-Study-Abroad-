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
  const rawText = typeof input?.text === 'string' ? input.text.trim() : '';
  if (!rawText) return json('text_required', 400);
  if (rawText.length > 1800) return json('text_too_long', 413);

  const text = rawText.length > 700
    ? rawText.slice(0, 700).replace(/\s+\S*$/, '').trim()
    : rawText;
  const hasBangla = /[\u0980-\u09FF]/.test(text);

  const key = (env.GEMINI_TTS_API_KEY || env.GEMINI_API_KEY)?.trim();
  if (!key || env.ANGELA_SERVER_VOICE === 'off') return json('voice_not_configured', 503);

  // Keep the primary TTS provider bounded for conversational turn-taking. If it
  // cannot return promptly, the client moves to Angela's Gemini Live/browser
  // fallback instead of leaving the visitor waiting on one cold request.
  const voiceName = 'Aoede';
  const configuredModel = env.GEMINI_TTS_MODEL?.trim();
  const model = !configuredModel || configuredModel === 'gemini-2.5-flash-preview-tts'
    ? 'gemini-3.1-flash-tts'
    : configuredModel;
  const configuredTimeout = Number(env.ANGELA_TTS_TIMEOUT_MS || '8000');
  const timeoutMs = Number.isFinite(configuredTimeout) ? Math.min(10000, Math.max(4500, configuredTimeout)) : 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  request.signal.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Synthesize speech only. Speak as Angela, a warm, natural, professional adult female customer-service assistant. Read the transcript exactly in its original language; preserve English proper names inside Bangla text; do not translate, answer, summarize, or read these instructions aloud. Transcript:\n' + text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
        }
      })
    });

    if (!response.ok) {
      console.warn('Angela speech provider status', response.status, model);
      if (response.status === 429) return json('voice_quota_exceeded', 429);
      return json('voice_provider_unavailable', response.status >= 500 || response.status === 404 ? 503 : 502);
    }

    const data: any = await response.json();
    const audio = data?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData?.data)?.inlineData;
    if (!audio || !/^audio\/(?:L16|pcm)(?:;|$)/i.test(audio.mimeType || '') || audio.data.length > 8000000) {
      console.warn('Angela speech invalid audio', model);
      return json('voice_provider_unavailable', 503);
    }
    const raw = atob(audio.data);
    if (!raw.length || raw.length % 2) {
      console.warn('Angela speech invalid PCM', model);
      return json('voice_provider_unavailable', 503);
    }
    const pcm = Uint8Array.from(raw, character => character.charCodeAt(0));
    return new Response(pcmToWav(pcm), {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Angela-TTS-Model': model,
        'X-Angela-TTS-Voice': voiceName,
        'X-Angela-TTS-Language': hasBangla ? 'bn-auto' : 'en-auto',
      }
    });
  } catch {
    if (request.signal.aborted) return json('voice_timeout', 503);
    if (controller.signal.aborted) return json('voice_timeout', 503);
    return json('voice_provider_unavailable', 503);
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener('abort', abort);
  }
}
