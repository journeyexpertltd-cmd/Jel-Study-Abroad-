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

test('Speech produces a playable PCM WAV using one fast primary model and frozen Aoede voice', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async (url, options) => {
      calls += 1;
      assert.match(url, /gemini-2\.5-flash-preview-tts:generateContent$/);
      assert.equal(options.headers['x-goog-api-key'], 'test-key');
      const body = JSON.parse(options.body);
      assert.deepEqual(body.generationConfig.responseModalities, ['AUDIO']);
      assert.equal(body.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, 'Aoede');
      return pcmAudio();
    };

    const response = await onRequest({ request: request('আমি অ্যাঞ্জেলা'), env: { GEMINI_API_KEY: 'test-key', ANGELA_TTS_VOICE: 'OtherVoice' } });
    assert.equal(calls, 1);
    assert.equal(response.headers.get('content-type'), 'audio/wav');
    assert.equal(response.headers.get('x-angela-tts-model'), 'gemini-2.5-flash-preview-tts');
    assert.equal(response.headers.get('x-angela-tts-voice'), 'Aoede');
    assert.equal(response.headers.get('x-angela-tts-language'), 'bn-auto');
    const buffer = await response.arrayBuffer();
    assert.equal(new TextDecoder().decode(buffer.slice(0, 4)), 'RIFF');
    const view = new DataView(buffer);
    assert.equal(view.getUint32(24, true), 24000);
    assert.equal(view.getUint32(40, true), 4);
    assert.equal(buffer.byteLength, 48);
  } finally {
    globalThis.fetch = original;
  }
});

test('Speech returns quickly to the browser fallback contract on quota or invalid provider audio', async () => {
  const original = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response('private upstream error', { status: 429 });
    };
    const limited = await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY: 'test-key' } });
    assert.equal(calls, 1);
    assert.equal(limited.status, 429);
    assert.deepEqual(await limited.json(), { error: 'voice_quota_exceeded' });

    calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return Response.json({ candidates: [] });
    };
    const invalid = await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY: 'test-key' } });
    assert.equal(calls, 1);
    assert.equal(invalid.status, 503);
    assert.deepEqual(await invalid.json(), { error: 'voice_provider_unavailable' });
  } finally {
    globalThis.fetch = original;
  }
});

test('Speech permits an explicit TTS model override without changing the frozen Angela voice', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.match(String(url), /gemini-custom-tts:generateContent$/);
      const body = JSON.parse(options.body);
      assert.equal(body.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, 'Aoede');
      return pcmAudio();
    };

    const response = await onRequest({
      request: request('Hello Angela'),
      env: { GEMINI_API_KEY: 'test-key', GEMINI_TTS_MODEL: 'gemini-custom-tts' },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-angela-tts-model'), 'gemini-custom-tts');
    assert.equal(response.headers.get('x-angela-tts-voice'), 'Aoede');
    assert.equal(response.headers.get('x-angela-tts-language'), 'en-auto');
  } finally {
    globalThis.fetch = original;
  }
});
