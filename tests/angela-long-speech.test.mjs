import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { onRequest } from '../functions/angela/speech.ts';

test('a full answer survives generation beyond the former seven-second cutoff', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  const wav = new Uint8Array(1044);
  wav.set(Buffer.from('RIFF'), 0);
  wav.set(Buffer.from('WAVE'), 8);
  try {
    globalThis.fetch = async (_url, options) => {
      calls++;
      await delay(8000, undefined, { signal: options.signal });
      return Response.json({ candidates: [{ content: { parts: [{ inlineData: {
        data: Buffer.from(wav).toString('base64'), mimeType: 'audio/wav'
      } }] } }] });
    };
    const response = await onRequest({
      request: new Request('https://example.pages.dev/angela/speech', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'জার্নি এক্সপার্টের সার্ভিস সম্পর্কে বিস্তারিত বলছি। '.repeat(8) })
      }), env: { GEMINI_API_KEY: 'test-only' }
    });
    assert.equal(response.status, 200);
    assert.equal(calls, 1, 'do not restart an in-flight valid generation');
    assert.equal(response.headers.get('x-angela-voice'), 'Aoede');
  } finally { globalThis.fetch = original; }
});
