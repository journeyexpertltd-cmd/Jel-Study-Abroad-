import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/gemini/chat.ts';

const nativeFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = nativeFetch; });

const request = (body) => new Request('https://journeyexpertbd.com/api/gemini/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'https://journeyexpertbd.com' },
  body: JSON.stringify(body),
});

test('Angela transcribe sends inline audio to Gemini and returns Bangla transcript', async () => {
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /gemini-3\.8-flash/);
    const payload = JSON.parse(options.body);
    assert.equal(payload.contents[0].parts[1].inlineData.mimeType, 'audio/webm');
    assert.equal(payload.contents[0].parts[1].inlineData.data, 'AQID');
    return Response.json({ candidates: [{ content: { parts: [{ text: 'আমি যুক্তরাজ্যে মাস্টার্স করতে চাই' }] } }] });
  };
  const response = await onRequest({
    request: request({ mode: 'transcribe', audio: 'AQID', mimeType: 'audio/webm', language: 'bn' }),
    env: { GEMINI_API_KEY: 'test-key' },
  });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.mode, 'ai');
  assert.equal(data.language, 'bn');
  assert.match(data.transcript, /[\u0980-\u09FF]/);
});

test('Angela transcribe fails over to corporate transcription after local quota', async () => {
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('generativelanguage.googleapis.com')) {
      return new Response(JSON.stringify({ error: 'quota' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }
    assert.equal(String(url), 'https://journeyexpertltd.com/angela/transcribe');
    const payload = JSON.parse(options.body);
    assert.equal(payload.language, 'en');
    return Response.json({ transcript: 'Hello Angela I want to study in the United Kingdom', language: 'en', mode: 'ai', providerModel: 'gemini-3.8-flash' });
  };

  const response = await onRequest({
    request: request({ mode: 'transcribe', audio: 'AQID', mimeType: 'audio/wav', language: 'en' }),
    env: { GEMINI_API_KEY: 'quota-key' },
  });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.mode, 'ai');
  assert.equal(data.language, 'en');
  assert.match(data.providerModel, /^jel-corporate-/);
});

test('Angela transcribe validates requests and signals browser fallback when providers are unavailable', async () => {
  const noAudio = await onRequest({ request: request({ mode: 'transcribe', language: 'en' }), env: { GEMINI_API_KEY: 'test-key' } });
  assert.equal(noAudio.status, 400);

  globalThis.fetch = async (url) => {
    assert.equal(String(url), 'https://journeyexpertltd.com/angela/transcribe');
    return new Response(JSON.stringify({ error: 'transcription_unavailable' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  };
  const noKey = await onRequest({
    request: request({ mode: 'transcribe', audio: 'AQID', mimeType: 'audio/webm', language: 'en' }),
    env: {},
  });
  const data = await noKey.json();
  assert.equal(noKey.status, 503);
  assert.equal(data.browserFallback, true);
  assert.equal(data.error, 'transcription_not_configured');
});
