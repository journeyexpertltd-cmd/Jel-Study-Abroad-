type Context = { request: Request; env: Record<string, string | undefined> };

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

export async function onRequest({ request, env }: Context): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'origin_not_allowed' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'json_required' }, 415);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 3_600_000) return json({ error: 'audio_too_large' }, 413);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ error: 'invalid_json' }, 400); }

  const audio = typeof body?.audio === 'string' ? body.audio.trim() : '';
  const language = body?.language === 'en' ? 'en' : 'bn';
  const mimeType = (typeof body?.mimeType === 'string' ? body.mimeType : 'audio/webm').split(';')[0].toLowerCase();
  if (!audio) return json({ error: 'audio_required' }, 400);
  if (!/^audio\/(webm|wav|mpeg|mp3|ogg|opus|aac|flac|m4a|mp4)$/i.test(mimeType)) return json({ error: 'audio_type_not_supported' }, 415);

  const keys = Array.from(new Set([
    env.GEMINI_API_KEY?.trim(),
    env.GEMINI_TTS_API_KEY?.trim(),
  ].filter((key): key is string => Boolean(key))));
  if (!keys.length) return json({ error: 'transcription_not_configured' }, 503);

  const prompt = language === 'bn'
    ? 'Transcribe this customer speech accurately. The customer is using Bangla or Banglish. Return only the transcript in natural Bengali script, preserving proper names and brand names when appropriate. Do not answer or add commentary.'
    : 'Transcribe this customer speech accurately in English. Return only the transcript. Do not answer or add commentary.';

  for (const model of ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']) {
    for (const key of keys) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType, data: audio } }] }],
            generationConfig: { temperature: 0, maxOutputTokens: 256 },
          }),
        });
        if (!upstream.ok) continue;
        const data: any = await upstream.json();
        const transcript = data?.candidates?.[0]?.content?.parts
          ?.filter((part: any) => !part.thought && typeof part.text === 'string')
          .map((part: any) => part.text)
          .join('')
          .replace(/^[\"'\s]+|[\"'\s]+$/g, '')
          .trim();
        if (!transcript) continue;
        if (language === 'bn' && !/[\u0980-\u09FF]/.test(transcript)) continue;
        if (language === 'en' && /[\u0980-\u09FF]/.test(transcript)) continue;
        return json({ transcript: transcript.slice(0, 1200), language, mode: 'ai', providerModel: model });
      } catch {
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return json({ error: 'transcription_unavailable' }, 503);
}
