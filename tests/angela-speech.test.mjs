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
test('Speech produces current Interactions API WAV and maps quota errors without exposing secrets', async () => {
 const original = globalThis.fetch;
 try {
 const wav = new Uint8Array(pcmToWav(new Uint8Array([0,0,0,0])));
 const encoded = Buffer.from(wav).toString('base64');
 globalThis.fetch = async (url, options) => {
 assert.equal(String(url), 'https://generativelanguage.googleapis.com/v1beta/interactions');
 assert.equal(options.headers['x-goog-api-key'], 'test-key');
 const body = JSON.parse(options.body);
 assert.equal(body.model, 'gemini-3.1-flash-tts-preview');
 assert.equal(body.response_format.type, 'audio');
 assert.equal(body.response_format.mime_type, 'audio/wav');
 assert.deepEqual(body.generation_config.speech_config, [{ voice: 'Kore' }]);
 return Response.json({ steps: [{ type: 'model_output', content: [{ type: 'audio', data: encoded, mime_type: 'audio/wav' }] }] });
 };
 const response = await onRequest({ request: request('আমি অ্যাঞ্জেলা'), env: { GEMINI_API_KEY: 'test-key' } });
 assert.equal(response.status, 200);
 assert.equal(response.headers.get('content-type'), 'audio/wav');
 const buffer = await response.arrayBuffer();
 assert.equal(new TextDecoder().decode(buffer.slice(0,4)), 'RIFF');

 globalThis.fetch = async () => new Response('private upstream error', {status:429});
 const limited = await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY: 'test-key' } });
 assert.equal(limited.status,429);
 assert.deepEqual(await limited.json(), { error:'voice_quota_exceeded' });

 globalThis.fetch = async () => Response.json({ steps: [] });
 assert.equal((await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY:'test-key' } })).status,503);
 } finally { globalThis.fetch=original; }
});


