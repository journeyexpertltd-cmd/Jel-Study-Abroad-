import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
test('Speech uses official Gemini 3.8 generateContent WAV and maps quota errors without exposing secrets', async () => {
 const original = globalThis.fetch;
 try {
 const pcm = new Uint8Array(pcmToWav(new Uint8Array([0,0,0,0])));
 const encoded = Buffer.from(pcm).toString('base64');
 globalThis.fetch = async (url, options) => {
 assert.equal(String(url), 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-lite-tts:generateContent');
 assert.equal(options.headers['x-goog-api-key'], 'test-key');
 const body = JSON.parse(options.body);
 assert.equal(body.contents[0].parts[0].text, 'আমি অ্যাঞ্জেলা');
 assert.match(body.contents[0].parts[0].speech_metadata.style, /professional adult female/i);
 assert.deepEqual(body.generationConfig.responseModalities, ['AUDIO']);
 assert.equal(body.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, 'Aoede');
 return Response.json({ candidates: [{ content: { parts: [{ inlineData: { data: encoded, mimeType: 'audio/wav' } }] } }] });
 };
 const response = await onRequest({ request: request('আমি অ্যাঞ্জেলা'), env: { GEMINI_API_KEY: 'test-key' } });
 assert.equal(response.status, 200);
 assert.equal(response.headers.get('content-type'), 'audio/wav');
 assert.equal(response.headers.get('x-angela-voice'), 'Aoede');
 const buffer = await response.arrayBuffer();
 assert.equal(new TextDecoder().decode(buffer.slice(0,4)), 'RIFF');
 assert.deepEqual(new Uint8Array(buffer), pcm, 'WAV must not receive a second header');

 globalThis.fetch = async () => new Response('private upstream error', {status:429});
 const limited = await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY: 'test-key' } });
 assert.equal(limited.status,429);
 const limitedBody = await limited.json();
 assert.equal(limitedBody.error,'voice_quota_exceeded');
 assert.equal(limitedBody.providerStatus,429);

 globalThis.fetch = async () => Response.json({ candidates: [] });
 assert.equal((await onRequest({ request: request('হ্যালো'), env: { GEMINI_API_KEY:'test-key' } })).status,503);
 } finally { globalThis.fetch=original; }
});





test('Client speech chain keeps Gemini Live fallback available during direct TTS quota cooldown', async () => {
 const source = await readFile(new URL('../src/lib/angelaAudio.ts', import.meta.url), 'utf8');
 assert.match(source, /direct TTS quota reached; using Live fallback/);
 assert.match(source, /direct TTS quota cooldown active; using Live fallback/);
 assert.doesNotMatch(source, /Date\.now\(\) < voiceQuotaCooldownUntil[\s\S]{0,120}throw new Error\('voice_quota_exceeded'\)/);
});


test('BD Angela Live female renderer keeps a bounded 12s audio window', async () => {
 const source = await readFile(new URL('../src/lib/angelaAudio.ts', import.meta.url), 'utf8');
 assert.match(source, /live_voice_timeout'\)\), 12000/);
});
