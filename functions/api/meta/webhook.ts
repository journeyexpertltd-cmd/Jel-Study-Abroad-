import { onRequest as answerWithAngela } from '../gemini/chat';

type KV = { get(key: string): Promise<string | null>; put(key: string, value: string, options?: { expirationTtl: number }): Promise<void> };
type Env = Record<string, string | KV | undefined> & {
  META_WEBHOOK_VERIFY_TOKEN?: string;
  META_APP_SECRET?: string;
  META_AUTOREPLY_ENABLED?: string;
  META_PAGE_ACCESS_TOKEN?: string;
  META_PAGE_ID?: string;
  META_IG_ACCESS_TOKEN?: string;
  META_IG_ACCOUNT_ID?: string;
  META_WHATSAPP_TOKEN?: string;
  META_WHATSAPP_PHONE_NUMBER_ID?: string;
  META_MESSAGE_DEDUPE?: KV;
};
type Context = { request: Request; env: Env; waitUntil?: (p: Promise<unknown>) => void };
type Channel = 'messenger' | 'instagram' | 'whatsapp';
type Incoming = { channel: Channel; id: string; sender: string; destination: string; text: string };
const GRAPH = 'v25.0';
const MAX_PAYLOAD = 1_000_000;
const response = (body: string, status = 200) => new Response(body, {
  status, headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
});
const secret = (env: Env, key: string) => {
  const v = env[key];
  return typeof v === 'string' ? v.trim() : '';
};

export function onRequestGet({ request, env }: Context): Response {
  const token = secret(env, 'META_WEBHOOK_VERIFY_TOKEN');
  if (!token) return response('Webhook is not configured', 503);
  const params = new URL(request.url).searchParams;
  const expected = params.get('hub.verify_token') || '';
  const challenge = params.get('hub.challenge') || '';
  if (params.get('hub.mode') !== 'subscribe' || !expected || expected !== token || !challenge)
    return response('Verification failed', 403);
  return response(challenge);
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length !== 64 || !/^[0-9a-f]{64}$/i.test(hex)) return null;
  return Uint8Array.from(hex.match(/../g)!, pair => parseInt(pair, 16));
}

/** Meta signs the original raw request bytes. Verify before JSON parsing or AI processing. */
export async function verifyMetaSignature(raw: Uint8Array, header: string | null, appSecret: string): Promise<boolean> {
  if (!appSecret || !header?.startsWith('sha256=')) return false;
  const signature = hexToBytes(header.slice(7));
  if (!signature) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, signature, raw);
}

function inbound(payload: any, env: Env): Incoming[] {
  const result: Incoming[] = [];
  const object = payload?.object;
  const entries: any[] = Array.isArray(payload?.entry) ? payload.entry.slice(0, 20) : [];
  if (object === 'page' || object === 'instagram') {
    const channel: Channel = object === 'instagram' ? 'instagram' : 'messenger';
    const allowDestination = channel === 'instagram' ? secret(env, 'META_IG_ACCOUNT_ID') : secret(env, 'META_PAGE_ID');
    for (const entry of entries) {
      const destination = String(entry?.id || '');
      if (!destination || (allowDestination && destination !== allowDestination)) continue;
      for (const event of (Array.isArray(entry?.messaging) ? entry.messaging.slice(0, 20) : [])) {
        const id = String(event?.message?.mid || '');
        const sender = String(event?.sender?.id || '');
        const text = typeof event?.message?.text === 'string' ? event.message.text.trim().slice(0, 1800) : '';
        if (!id || !/^\d+$/.test(sender) || !text || event.message?.is_echo || event.message?.is_deleted) continue;
        result.push({ channel, id, sender, destination, text });
      }
    }
  } else if (object === 'whatsapp_business_account') {
    for (const entry of entries) {
      for (const change of (Array.isArray(entry?.changes) ? entry.changes.slice(0, 20) : [])) {
        if (change?.field !== 'messages') continue;
        const value = change.value || {};
        const destination = String(value?.metadata?.phone_number_id || '');
        if (!destination || (secret(env, 'META_WHATSAPP_PHONE_NUMBER_ID') && destination !== secret(env, 'META_WHATSAPP_PHONE_NUMBER_ID'))) continue;
        for (const message of (Array.isArray(value?.messages) ? value.messages.slice(0, 20) : [])) {
          const sender = String(message?.from || '');
          const id = String(message?.id || '');
          const text = message?.type === 'text' && typeof message?.text?.body === 'string'
            ? message.text.body.trim().slice(0, 1800) : '';
          if (!id || !/^\d{6,20}$/.test(sender) || !text) continue;
          result.push({ channel: 'whatsapp', id, sender, destination, text });
        }
      }
    }
  }
  return result.slice(0, 10);
}

async function replyText(message: Incoming, env: Env): Promise<string> {
  // Invoke the existing Angela intelligence and guardrails in-process, never a duplicate AI persona.
  const req = new Request('https://journeyexpertbd.com/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message.text, language: 'auto', source: 'text' }),
  });
  const answer = await answerWithAngela({ request: req, env: env as Record<string, string | undefined> });
  if (!answer.ok) throw new Error('angela_unavailable');
  const data: any = await answer.json();
  const text = typeof data?.reply === 'string' ? data.reply.trim() : '';
  if (!text) throw new Error('angela_empty');
  return text.slice(0, message.channel === 'whatsapp' ? 2400 : 1000);
}

async function sendMessage(message: Incoming, answer: string, env: Env): Promise<void> {
  let url: string;
  let token: string;
  let body: unknown;
  if (message.channel === 'messenger') {
    token = secret(env, 'META_PAGE_ACCESS_TOKEN');
    url = 'https://graph.facebook.com/' + GRAPH + '/' + encodeURIComponent(message.destination) + '/messages';
    body = { recipient: { id: message.sender }, messaging_type: 'RESPONSE', message: { text: answer } };
  } else if (message.channel === 'instagram') {
    token = secret(env, 'META_IG_ACCESS_TOKEN');
    url = 'https://graph.instagram.com/' + GRAPH + '/me/messages';
    body = { recipient: { id: message.sender }, message: { text: answer } };
  } else {
    token = secret(env, 'META_WHATSAPP_TOKEN');
    url = 'https://graph.facebook.com/' + GRAPH + '/' + encodeURIComponent(message.destination) + '/messages';
    body = { messaging_product: 'whatsapp', to: message.sender, type: 'text', text: { body: answer, preview_url: false } };
  }
  if (!token) return; // Never send unauthenticated requests or expose a token.
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error('meta_send_http_' + res.status); // No response body: avoid logging PII.
}

async function processMessage(message: Incoming, env: Env): Promise<void> {
  const key = message.channel === 'instagram' ? 'META_IG_ACCESS_TOKEN'
    : message.channel === 'messenger' ? 'META_PAGE_ACCESS_TOKEN' : 'META_WHATSAPP_TOKEN';
  if (!secret(env, key)) return;
  const kv = env.META_MESSAGE_DEDUPE;
  const dedupeKey = 'meta-msg:' + message.channel + ':' + message.id;
  // Durable deduplication requires the optional Cloudflare KV binding.
  if (kv && typeof kv.get === 'function' && typeof kv.put === 'function') {
    if (await kv.get(dedupeKey)) return;
    await kv.put(dedupeKey, 'processing', { expirationTtl: 900 });
  }
  try {
    const answer = await replyText(message, env);
    await sendMessage(message, answer, env);
  } catch {
    // Never log message bodies, tokens or raw Meta payloads.
    console.warn('JEL Meta outgoing message failed for channel', message.channel);
    throw new Error('meta_delivery_failed');
  }
}

export async function onRequestPost({ request, env, waitUntil }: Context): Promise<Response> {
  const appSecret = secret(env, 'META_APP_SECRET');
  if (!appSecret) return response('Webhook is not configured', 503);
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json'))
    return response('JSON required', 415);
  if (Number(request.headers.get('content-length') || '0') > MAX_PAYLOAD)
    return response('Payload too large', 413);
  const raw = new Uint8Array(await request.arrayBuffer());
  if (raw.byteLength > MAX_PAYLOAD) return response('Payload too large', 413);
  if (!await verifyMetaSignature(raw, request.headers.get('x-hub-signature-256'), appSecret))
    return response('Invalid signature', 403);
  let data: any;
  try { data = JSON.parse(new TextDecoder().decode(raw)); }
  catch { return response('Invalid JSON', 400); }
  // Webhook subscription can be verified safely before outbound messaging is enabled.
  if (secret(env, 'META_AUTOREPLY_ENABLED') !== 'true') return response('EVENT_RECEIVED');
  const messages = inbound(data, env);
  const delivery = Promise.allSettled(messages.map(m => processMessage(m, env)));
  if (waitUntil) { waitUntil(delivery); return response('EVENT_RECEIVED'); }
  await delivery;
  return response('EVENT_RECEIVED');
}

export async function onRequest(context: Context): Promise<Response> {
  if (context.request.method === 'GET') return onRequestGet(context);
  if (context.request.method === 'POST') return onRequestPost(context);
  return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
}
