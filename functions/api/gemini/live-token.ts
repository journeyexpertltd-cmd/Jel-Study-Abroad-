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

  const keys = Array.from(new Set([
    env.GEMINI_API_KEY?.trim(),
    env.GEMINI_TTS_API_KEY?.trim(),
  ].filter((key): key is string => Boolean(key))));
  if (!keys.length) return json({ error: 'live_voice_not_configured' }, 503);

  const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  let sawQuota = false;

  for (const key of keys) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);

    try {
      let upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
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

      // Some Gemini projects reject constrained ephemeral-token creation with
      // HTTP 400 even though unconstrained short-lived tokens are supported.
      // Retry without constraints; the browser still pins the Live model and
      // AUDIO/Aoede setup when it opens the WebSocket session.
      if (upstream.status === 400) {
        upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify({
            uses: 1,
            expireTime,
            newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
          }),
        });
      }

      if (!upstream.ok) {
        const detail = await upstream.text().catch(() => '');
        console.warn('Angela Live token provider status', upstream.status, detail.slice(0, 300));
        if (upstream.status === 429) {
          sawQuota = true;
          continue;
        }
        if (upstream.status === 401 || upstream.status === 403) continue;
        continue;
      }

      const data: any = await upstream.json();
      const token = typeof data?.name === 'string' ? data.name : '';
      if (!token) continue;

      return json({ token, model: LIVE_MODEL, expiresAt: expireTime });
    } catch (error) {
      console.warn('Angela Live token error', controller.signal.aborted ? 'timeout' : (error instanceof Error ? error.message : 'unknown'));
    } finally {
      clearTimeout(timer);
    }
  }

  return sawQuota
    ? json({ error: 'live_voice_quota_exceeded', providerStatus: 429 }, 429)
    : json({ error: 'live_voice_unavailable' }, 503);
}
