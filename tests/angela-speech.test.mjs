import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/angela/speech.ts';

const request = (text, extra = {}) => new Request('https://example.pages.dev/angela/speech', {
  method: 'POST',
  headers: { origin: 'https://example.pages.dev', 'content-type': 'application/json' },
  body: JSON.stringify({ text }),
  ...extra,
});

const pcmAudio = () => Response.json({
  candidates: [{ content: { parts: [{ inlineData: {
    data: 'AAAAAA==',
    mimeType: 'audio/L16;codec=pcm;rate=24000',
  } }] } }],
});

test('Speech endpoint rejects bad requests and missing credentials without calling Google', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('must not call upstream'); };
  try {
    assert.equal((await onRequest({ request: new Request('https://example.pages.dev/angela/speech'), env: {} })).status, 405);
    assert.equal((await onRequest({ request: request('hello', { headers: { origin: 'https://other.example' } }), env: {} })).status, 403);
    assert.equal((await onRequest({ request: request(''), env: {} })).status, 400);
    assert.equal((await onRequest({ request: request('a'.repeat(9000)), env: {} })).status, 413);
    assert.equal((await onRequest({ request: request('হ্যালো'), env: {} })).status, 503);
  } finally {
    globalThis.fetch = original;
  }
});

test('Speech produces a playable PCM WAV and maps full quota exhaustion safely', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.match(url, /gemini-3\.1-flash-tts-preview:generateContent$/);
      assert.equal(options.headers['x-goog-api-key'], 'test-key');
      const body = JSON.parse(options.body);
      assert.deepEqual(body.generationConfig.responseModalities, ['AUDIO']);
      return pcmAudio();
    };

    const response = await onRequest({ request: request('আমি অ্যাঞ্জেলা'), env: { GEMINI_API_KEY: 'test-key' } });
    assert.equal(response.headers.get('content-type'), 'audio/wav');
    const buffer = await response.arrayBuffer();
    assert.equal(new TextDecoder().decode(buffer.slice(0, 4)), 'RIFF');
    const view = new DataView(buffer);
    assert.equal(view.getUint32(24, true), 24000);
    assert.equal(view.getUint32(40, true), 4);
    assert.equal(buffer.byteLength, 48);

    globalThis.fetch = async () => new Response('private upstream error', { status: 429 });
    const limited = await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY: 'test-key' } });
    assert.equal(limited.status, 429);
    assert.deepEqual(await limited.json(), { error: 'voice_quota_exceeded' });

    globalThis.fetch = async () => Response.json({ candidates: [] });
    const invalid = await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY: 'test-key' } });
    assert.equal(invalid.status, 503);
    assert.deepEqual(await invalid.json(), { error: 'voice_provider_unavailable' });
  } finally {
    globalThis.fetch = original;
  }
});

test('Speech falls back from Gemini 3.1 TTS to Gemini 2.5 TTS after quota failure', async () => {
  const original = globalThis.fetch;
  const urls = [];
  try {
    globalThis.fetch = async (url) => {
      urls.push(String(url));
      if (String(url).includes('gemini-3.1-flash-tts-preview')) {
        return new Response('quota', { status: 429 });
      }
      if (String(url).includes('gemini-2.5-flash-preview-tts')) {
        return pcmAudio();
      }
      throw new Error('unexpected model');
    };

    const response = await onRequest({ request: request('বাংলায় বলুন'), env: { GEMINI_API_KEY: 'test-key' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'audio/wav');
    assert.equal(urls.length, 2);
    assert.match(urls[0], /gemini-3\.1-flash-tts-preview:generateContent$/);
    assert.match(urls[1], /gemini-2\.5-flash-preview-tts:generateContent$/);
  } finally {
    globalThis.fetch = original;
  }
});
