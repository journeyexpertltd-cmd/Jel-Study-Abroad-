import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/gemini/chat.ts';
const nativeFetch = globalThis.fetch;
beforeEach(() => { globalThis.fetch = async () => { throw new Error('Network is disabled in unit tests'); }; });
afterEach(() => { globalThis.fetch = nativeFetch; });

const request = (body, options = {}) => new Request('https://journeyexpertbd.com/api/gemini/chat', {
  method: 'POST', body: JSON.stringify(body), ...options,
});

test('Pages chat validates input and provides a Bangla fallback without credentials', async () => {
  const response = await onRequest({ request: request({ message: 'আমি পড়তে চাই' }), env: {} });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.mode, 'fallback');
  assert.equal(data.language, 'bn');
  assert.match(data.reply, /নিরাপদ সহায়তা মোড/);
  assert.doesNotMatch(data.reply, /â|Ã|Â|ï¿½|�|à¦|à§/);
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

test('Actual Bengali input overrides stale UI language and rejects an English-only model reply', async () => {
  const originalFetch = globalThis.fetch;
  try {
    let answer = 'Hello, I am Angela';
    globalThis.fetch = async (_url, options) => {
      const payload = JSON.parse(options.body);
      assert.match(payload.systemInstruction.parts[0].text, /Respond in natural Bengali script/);
      return Response.json({ candidates: [{ content: { parts: [{ text: answer }] } }] });
    };
    const send = () => onRequest({ request: request({ language: 'bn', messages: [{ sender: 'assistant', text: 'Hello' }, { sender: 'user', text: 'Introduce yourself' }] }), env: { GEMINI_API_KEY: 'test-only', GEMINI_MODEL: 'configured-model' } });
    const wrongLanguage = await (await send()).json();
    assert.equal(wrongLanguage.mode, 'fallback');
    assert.match(wrongLanguage.reply, /[\u0980-\u09FF]/);
    answer = 'আমি অ্যাঞ্জেলা। আপনাকে কীভাবে সাহায্য করতে পারি?';
    const correctLanguage = await (await send()).json();
    assert.equal(correctLanguage.mode, 'ai');
    assert.equal(correctLanguage.reply, answer);

    globalThis.fetch = async () => { throw new Error('Network unavailable'); };
    const staleEnglishMode = await (await onRequest({ request: request({ language: 'en', message: 'পরিচয় দিন' }), env: {} })).json();
    assert.equal(staleEnglishMode.language, 'bn');
    const actualEnglish = await (await onRequest({ request: request({ language: 'en', message: 'Introduce yourself' }), env: {} })).json();
    assert.equal(actualEnglish.language, 'en');
  } finally { globalThis.fetch = originalFetch; }
});

test('Bangla fallback stays useful and preserves UTF-8 for common intents', async () => {
  const study = await (await onRequest({ request: request({ language: 'bn', message: 'আমি যুক্তরাজ্যে মাস্টার্স পড়তে চাই' }), env: {} })).json();
  assert.equal(study.language, 'bn');
  assert.match(study.reply, /প্রোফাইল মূল্যায়ন/);
  assert.doesNotMatch(study.reply, /â|Ã|Â|ï¿½|�|à¦|à§/);

  const contact = await (await onRequest({ request: request({ language: 'bn', message: 'অফিসের ঠিকানা ও ফোন নম্বর দিন' }), env: {} })).json();
  assert.match(contact.reply, /তেজগাঁও/);
  assert.match(contact.reply, /\+8801926400400/);
});

test('Study Abroad uses the company Angela gateway with bounded conversation and Banglish detection', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://journeyexpertltd.com/api/ai/voice-agent');
    assert.equal(options.headers['x-goog-api-key'], undefined);
    const body = JSON.parse(options.body);
    assert.equal(body.language, 'bn');
    assert.equal(body.message, 'ami UK te porte chai');
    assert.deepEqual(body.history, [{ role: 'assistant', content: 'How can I help?' }]);
    return Response.json({ reply: 'ইউকেতে পড়াশোনার জন্য আপনার পছন্দের বিষয় কী?', mode: 'ai' });
  };
  const result = await onRequest({ request: request({ messages: [{ sender: 'assistant', text: 'How can I help?' }, { sender: 'user', text: 'ami UK te porte chai' }] }), env: {} });
  assert.equal((await result.json()).mode, 'ai');
});

test('Cloudflare dispatch includes the Bengali speech function', async () => {
  const { readFile } = await import('node:fs/promises');
  const routes = JSON.parse(await readFile(new URL('../public/_routes.json', import.meta.url), 'utf8'));
  assert.ok(routes.include.includes('/angela/speech'));
});

test('English service words stay English in Auto, while Banglish stays Bengali', async () => {
  for (const message of ['What are your visa services?', 'I need a flight ticket', 'What services do you offer for university applications? Please answer in English.']) {
    const data = await (await onRequest({ request: request({ message, language: 'auto' }), env: {} })).json();
    assert.equal(data.language, 'en', message);
    assert.doesNotMatch(data.reply, /[\u0980-\u09FF]/);
  }
  const banglish = await (await onRequest({ request: request({ message: 'ami UK te porte chai', language: 'auto' }), env: {} })).json();
  assert.equal(banglish.language, 'bn');
  const explicit = await (await onRequest({ request: request({ message: 'Please answer in English', language: 'bn' }), env: {} })).json();
  assert.equal(explicit.language, 'en');
});
