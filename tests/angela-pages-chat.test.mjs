import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/gemini/chat.ts';

const request = (body, options = {}) => new Request('https://journeyexpertbd.com/api/gemini/chat', {
  method: 'POST', body: JSON.stringify(body), ...options,
});

test('Pages chat validates input and provides a Bangla fallback without credentials', async () => {
  const response = await onRequest({ request: request({ message: 'আমি পড়তে চাই' }), env: {} });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.mode, 'fallback');
  assert.equal(data.language, 'bn');
  assert.match(data.reply, /লাইভ AI/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await onRequest({ request: request({}), env: {} })).status, 400);
  assert.equal((await onRequest({ request: request({ message: 'a'.repeat(40000) }), env: {} })).status, 413);
  assert.equal((await onRequest({ request: request({ message: 'hello' }, { headers: { origin: 'https://example.org' } }), env: {} })).status, 403);
  assert.equal((await onRequest({ request: new Request('https://journeyexpertbd.com/api/gemini/chat'), env: {} })).status, 405);
});

test('Gemini receives bounded history and quota failures return usable fallback', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.match(url, /configured-model/);
      assert.equal(options.headers['x-goog-api-key'], 'test-only');
      const body = JSON.parse(options.body);
      assert.ok(body.contents.length <= 8);
      assert.equal(body.contents.at(-1).role, 'user');
      return Response.json({ candidates: [{ content: { parts: [{ text: 'Hello from Angela' }] } }] });
    };
    const response = await onRequest({ request: request({ messages: [{ sender: 'assistant', text: 'Hello' }, { sender: 'user', text: 'Study in UK' }] }), env: { GEMINI_API_KEY: 'test-only', GEMINI_MODEL: 'configured-model' } });
    assert.equal((await response.json()).reply, 'Hello from Angela');
    globalThis.fetch = async () => new Response(null, { status: 429 });
    assert.equal((await (await onRequest({ request: request({ message: 'hello' }), env: { GEMINI_API_KEY: 'test-only' } })).json()).mode, 'fallback');
    globalThis.fetch = async () => { throw new Error('Network unavailable'); };
    assert.equal((await (await onRequest({ request: request({ message: 'hello' }), env: { GEMINI_API_KEY: 'test-only' } })).json()).mode, 'fallback');
  } finally { globalThis.fetch = originalFetch; }
});

test('Explicit Bangla overrides English history and rejects an English-only model reply', async () => {
  const originalFetch = globalThis.fetch;
  try {
    let answer = 'Hello, I am Angela';
    globalThis.fetch = async (_url, options) => {
      const payload = JSON.parse(options.body);
      assert.match(payload.systemInstruction.parts[0].text, /Respond in Bengali script/);
      return Response.json({ candidates: [{ content: { parts: [{ text: answer }] } }] });
    };
    const send = () => onRequest({ request: request({ language: 'bn', messages: [{ sender: 'assistant', text: 'Hello' }, { sender: 'user', text: 'Introduce yourself' }] }), env: { GEMINI_API_KEY: 'test-only' } });
    const wrongLanguage = await (await send()).json();
    assert.equal(wrongLanguage.mode, 'fallback');
    assert.match(wrongLanguage.reply, /[\u0980-\u09FF]/);
    answer = 'আমি অ্যাঞ্জেলা। আপনাকে কীভাবে সাহায্য করতে পারি?';
    const correctLanguage = await (await send()).json();
    assert.equal(correctLanguage.mode, 'ai');
    assert.equal(correctLanguage.reply, answer);
    const english = await (await onRequest({ request: request({ language: 'en', message: 'পরিচয় দিন' }), env: {} })).json();
    assert.equal(english.language, 'en');
  } finally { globalThis.fetch = originalFetch; }
});
