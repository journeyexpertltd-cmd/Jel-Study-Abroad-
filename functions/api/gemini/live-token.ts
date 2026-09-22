type Context = { request: Request; env: Record<string, string | undefined> };

const LIVE_MODEL = 'gemini-3.8-live';

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});

export async function onRequest({ request, env }: Context): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'origin_not_allowed' }, 403);

  const key = (env.GEMINI_API_KEY || env.GEMINI_TTS_API_KEY || '').trim();
  if (!key) return json({ error: 'live_voice_not_configured' }, 503);

  const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
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
        liveConnectConstraints: {
          model: 'models/gemini-3.8-live',
          config: {
            sessionResumption: {},
            responseModalities: ['AUDIO'],
          },
        },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      console.warn('Angela Live token provider status', upstream.status, detail.slice(0, 300));
      if (upstream.status === 429) return json({ error: 'live_voice_quota_exceeded', providerStatus: 429 }, 429);
      return json({ error: 'live_voice_unavailable', providerStatus: upstream.status }, 424);
    }

    const data: any = await upstream.json();
    const token = typeof data?.name === 'string' ? data.name : '';
    if (!token) return json({ error: 'live_voice_unavailable' }, 424);

    return json({ token, model: LIVE_MODEL, expiresAt: expireTime });
  } catch (error) {
    if (controller.signal.aborted) return json({ error: 'live_voice_timeout' }, 503);
    console.warn('Angela Live token error', error instanceof Error ? error.message : 'unknown');
    return json({ error: 'live_voice_unavailable' }, 503);
  } finally {
    clearTimeout(timer);
  }
}
