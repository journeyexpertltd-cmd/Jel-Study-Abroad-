import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, onRequestGet, onRequestPost, verifyMetaSignature } from '../functions/api/meta/webhook.ts';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const verifyURL = 'https://journeyexpertbd.com/api/meta/webhook?hub.mode=subscribe&hub.verify_token=local-only&hub.challenge=442199';
const context = (request, env = {}, waitUntil) => ({ request, env, waitUntil });
const bytes = text => new TextEncoder().encode(text);
async function signedRequest(data, appSecret = 'local-app-secret') {
  const raw = typeof data === 'string' ? data : JSON.stringify(data);
  const key = await crypto.subtle.importKey('raw', bytes(appSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, bytes(raw)));
  const hex = Array.from(sig).map(x => x.toString(16).padStart(2, '0')).join('');
  return new Request('https://journeyexpertbd.com/api/meta/webhook', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-signature-256': 'sha256=' + hex },
    body: raw,
  });
}

test('GET verification requires a configured matching token and plain challenge', async () => {
  const req = new Request(verifyURL);
  assert.equal(onRequestGet(context(req, {})).status, 503);
  assert.equal(onRequestGet(context(req, { META_WEBHOOK_VERIFY_TOKEN: 'wrong' })).status, 403);
  const ok = onRequestGet(context(req, { META_WEBHOOK_VERIFY_TOKEN: 'local-only' }));
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), '442199');
  const wrongMode = new Request(verifyURL.replace('subscribe', 'unsubscribe'));
  assert.equal(onRequestGet(context(wrongMode, { META_WEBHOOK_VERIFY_TOKEN: 'local-only' })).status, 403);
});

test('reject POST without app secret or valid HMAC SHA256; fail closed', async () => {
  const valid = await signedRequest({ object: 'page', entry: [] });
  assert.equal((await onRequestPost(context(valid, {}))).status, 503);
  const missingSignature = new Request('https://journeyexpertbd.com/api/meta/webhook', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ object: 'page' }),
  });
  assert.equal((await onRequest(context(missingSignature, { META_APP_SECRET: 'local-app-secret' }))).status, 403);
  assert.equal(await verifyMetaSignature(bytes('{}'), 'sha256=' + 'a'.repeat(64), 'local-app-secret'), false);
  const tampered = await signedRequest({ object: 'page', entry: [] }, 'other-key');
  assert.equal((await onRequestPost(context(tampered, { META_APP_SECRET: 'local-app-secret' }))).status, 403);
});

test('verified payload is accepted but auto replies are OFF by default', async () => {
  globalThis.fetch = async () => { throw new Error('outgoing request must not occur'); };
  const request = await signedRequest({ object: 'page', entry: [{ id: '10', messaging: [{ sender: { id: '20' }, message: { mid: 'm1', text: 'হ্যালো' } }] }] });
  const res = await onRequestPost(context(request, { META_APP_SECRET: 'local-app-secret', META_PAGE_ACCESS_TOKEN: 'unused' }));
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'EVENT_RECEIVED');
});

test('signed Messenger text uses the existing Angela assistant and page send API', async () => {
  const sent = [];
  globalThis.fetch = async (url, options) => {
    sent.push({ url: String(url), options });
    return Response.json({ recipient_id: '20', message_id: 'response-1' });
  };
  const req = await signedRequest({ object: 'page', entry: [{
    id: '10', messaging: [
      { sender: { id: '20' }, message: { mid: 'm1', text: 'What is your name?' } },
      { sender: { id: '10' }, message: { mid: 'm2', text: 'echo', is_echo: true } },
    ],
  }] });
  const res = await onRequestPost(context(req, {
    META_APP_SECRET: 'local-app-secret', META_AUTOREPLY_ENABLED: 'true', META_PAGE_ID: '10',
    META_PAGE_ACCESS_TOKEN: 'local-access-token',
  }));
  assert.equal(res.status, 200);
  assert.equal(sent.length, 1);
  assert.match(sent[0].url, /graph\.facebook\.com\/v25\.0\/10\/messages/);
  const body = JSON.parse(sent[0].options.body);
  assert.equal(body.recipient.id, '20');
  assert.match(body.message.text, /Angela/i);
  assert.equal(sent[0].options.headers.Authorization, 'Bearer local-access-token');
});

test('valid WhatsApp text is delivered through phone-number messaging endpoint', async () => {
  const sent = [];
  globalThis.fetch = async (url, options) => {
    sent.push({ url: String(url), options });
    return Response.json({ messages: [{ id: 'outgoing-1' }] });
  };
  const req = await signedRequest({ object: 'whatsapp_business_account', entry: [{
    changes: [{ field: 'messages', value: {
      metadata: { phone_number_id: '12345' },
      messages: [{ id: 'wamid.abc', from: '8801926400400', type: 'text', text: { body: 'What is your name?' } }],
    } }],
  }] });
  const res = await onRequestPost(context(req, {
    META_APP_SECRET: 'local-app-secret', META_AUTOREPLY_ENABLED: 'true',
    META_WHATSAPP_PHONE_NUMBER_ID: '12345', META_WHATSAPP_TOKEN: 'local-token',
  }));
  assert.equal(res.status, 200);
  assert.equal(sent.length, 1);
  assert.match(sent[0].url, /graph\.facebook\.com\/v25\.0\/12345\/messages/);
  const body = JSON.parse(sent[0].options.body);
  assert.equal(body.messaging_product, 'whatsapp');
  assert.equal(body.to, '8801926400400');
  assert.match(body.text.body, /Angela/i);
});

test('no user message is sent without per-channel access credentials', async () => {
  globalThis.fetch = async () => { throw new Error('should not send'); };
  const req = await signedRequest({ object: 'instagram', entry: [{
    id: '190', messaging: [{ sender: { id: '201' }, message: { mid: 'im1', text: 'Hello' } }],
  }] });
  const res = await onRequestPost(context(req, { META_APP_SECRET: 'local-app-secret', META_AUTOREPLY_ENABLED: 'true' }));
  assert.equal(res.status, 200);
});
