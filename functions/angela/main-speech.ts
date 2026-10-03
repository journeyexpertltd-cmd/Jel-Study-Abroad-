type Context = { request: Request };

const allowedOrigins = new Set([
  'https://journeyexpertltd.com',
  'https://www.journeyexpertltd.com',
]);

const cors = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
  'Cache-Control': 'no-store',
});

export async function onRequest({ request }: Context): Promise<Response> {
  const origin = request.headers.get('origin') || '';
  if (!allowedOrigins.has(origin)) return Response.json({ error: 'origin_not_allowed' }, { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { ...cors(origin), Allow: 'POST, OPTIONS' } });

  const body = await request.arrayBuffer();
  if (body.byteLength > 8192) return Response.json({ error: 'text_too_large' }, { status: 413, headers: cors(origin) });

  try {
    const target = new URL('/angela/speech', request.url);
    const upstream = await fetch(target.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': target.origin },
      body,
      signal: AbortSignal.timeout(32000),
    });
    const headers = new Headers(upstream.headers);
    Object.entries(cors(origin)).forEach(([key, value]) => headers.set(key, value));
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return Response.json({ error: 'voice_provider_unavailable' }, { status: 503, headers: cors(origin) });
  }
}

