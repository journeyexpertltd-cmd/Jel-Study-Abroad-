type Context = { request: Request; env: Record<string, string | undefined> };

const LIVE_MODEL = 'gemini-3.1-flash-live-preview';
const LIVE_SYSTEM_INSTRUCTION = 'You are Angela, a warm, natural, professional adult female speech renderer for Journey Expert Limited. Speak the supplied transcript verbatim in the same language, including Bangla and English proper names. Do not answer it, translate it, summarize it, or add any extra words.';

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

export async function onRequest({ request, env }: Context): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }

  const url = new URL(request.url);
  if (request.headers.get('origin') !== url.origin) {
    return json({ error: 'origin_not_allowed' }, 403);
  }

  const key = env.GEMINI_API_KEY?.trim();
  if (!key) return json({ error: 'live_voice_not_configured' }, 503);

  const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 2 * 60 * 1000).toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        uses: 1,
        expireTime,
        newSessionExpireTime,
        bidiGenerateContentSetup: {
          model: `models/${LIVE_MODEL}`,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Aoede' },
              },
            },
          },
          systemInstruction: {
            parts: [{ text: LIVE_SYSTEM_INSTRUCTION }],
          },
        },
      }),
    });

    if (!upstream.ok) {
      console.warn('Angela Live token provider status', upstream.status);
      if (upstream.status === 429) {
        return json({ error: 'live_voice_quota_exceeded' }, 429);
      }
      return json({ error: 'live_voice_unavailable' }, 424);
    }

    const data: any = await upstream.json();
    const token = typeof data?.name === 'string' ? data.name : '';
    if (!token) return json({ error: 'live_voice_unavailable' }, 424);

    return json({
      token,
      model: LIVE_MODEL,
      expiresAt: expireTime,
    });
  } catch (error) {
    if (controller.signal.aborted) return json({ error: 'live_voice_timeout' }, 503);
    console.warn('Angela Live token error', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'live_voice_unavailable' }, 503);
  } finally {
    clearTimeout(timer);
  }
}
