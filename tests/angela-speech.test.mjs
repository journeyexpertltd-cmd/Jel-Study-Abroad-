import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, pcmToWav } from '../functions/angela/speech.ts';
const request = (text, extra = {}) => new Request('https://example.pages.dev/angela/speech', {
 method: 'POST', headers: { origin: 'https://example.pages.dev', 'content-type': 'application/json' },
 body: JSON.stringify({ text }), ...extra,
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
 } finally { globalThis.fetch = original; }
});
test('Speech produces a playable PCM WAV and maps quota errors without exposing secrets', async () => {
 const original = globalThis.fetch;
 try {
 globalThis.fetch = async (url, options) => {
 assert.match(url, /gemini-2.5-flash-preview-tts:generateContent$/);
 assert.equal(options.headers['x-goog-api-key'], 'test-key');
 const body = JSON.parse(options.body);
 assert.deepEqual(body.generationConfig.responseModalities, ['AUDIO']);
 return Response.json({ candidates: [{ content: { parts: [{ inlineData: { data: 'AAAAAA==', mimeType: 'audio/L16;codec=pcm;rate=24000' } }] } }] });
 };
 const response = await onRequest({ request: request('আমি অ্যাঞ্জেলা'), env: { GEMINI_API_KEY: 'test-key' } });
 assert.equal(response.headers.get('content-type'), 'audio/wav');
 const buffer = await response.arrayBuffer();
 assert.equal(new TextDecoder().decode(buffer.slice(0,4)), 'RIFF');
 const view = new DataView(buffer);
 assert.equal(view.getUint32(24,true), 24000);
 assert.equal(view.getUint32(40,true), 4);
 assert.equal(buffer.byteLength,48);
 globalThis.fetch = async () => new Response('private upstream error', {status:429});
 const limited = await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY: 'test-key' } });
 assert.equal(limited.status,429);
 assert.deepEqual(await limited.json(), { error:'voice_quota_exceeded' });
 globalThis.fetch = async () => Response.json({ candidates: [] });
 assert.equal((await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY:'test-key' } })).status,502);
 } finally { globalThis.fetch=original; }
});
