import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchAngelaSpeech } from '../src/lib/angelaAudio.ts';

for (const scenario of ['progress', 'stall', 'deadline', 'cancel']) {
  test(`Live voice ${scenario}: audio progress controls inactivity without unbounded waits`, async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const saved = { fetch: globalThis.fetch, WebSocket: globalThis.WebSocket, window: globalThis.window };
    let socket;
    class FakeSocket {
      constructor() { socket = this; }
      send() {}
      close() { this.closed = true; }
      async message(value) { await this.onmessage({ data: JSON.stringify(value) }); }
    }
    globalThis.window = globalThis;
    globalThis.WebSocket = FakeSocket;
    globalThis.fetch = async url => String(url).includes('live-token')
      ? Response.json({ token: 'test-only', model: 'gemini-3.8-live' })
      : Response.json({ error: 'test-primary-unavailable' }, { status: 503 });
    try {
      const controller = new AbortController();
      const result = fetchAngelaSpeech(`A complete voice reply ${scenario}`, controller.signal);
      const outcome = result.then(value => ({value}), error => ({error}));
      for (let i = 0; i < 50 && !socket; i++) await Promise.resolve();
      assert.ok(socket, 'Live fallback must open');
      socket.onopen();
      await socket.message({ setupComplete: {} });
      const chunk = { serverContent: { modelTurn: { parts: [{ inlineData: { data: Buffer.alloc(2400).toString('base64'), mimeType: 'audio/pcm;rate=24000' } }] } } };
      if (scenario === 'stall') {
        t.mock.timers.tick(5000);
        assert.equal((await outcome).error?.message, 'live_voice_timeout');
      } else if (scenario === 'cancel') {
        controller.abort();
        assert.equal((await outcome).error?.name, 'AbortError');
      } else if (scenario === 'deadline') {
        for (let i = 0; i < 4; i++) { t.mock.timers.tick(3000); await socket.message(chunk); }
        t.mock.timers.tick(2500);
        assert.equal((await outcome).error?.message, 'live_voice_timeout');
      } else {
        t.mock.timers.tick(3000); await socket.message(chunk);
        t.mock.timers.tick(3000); await socket.message(chunk);
        await socket.message({ serverContent: { turnComplete: true } });
        const { value, error } = await outcome;
        assert.equal(error, undefined);
        assert.equal(value.size, 4844, 'Both chunks must survive the old 12s total limit');
        const bytes = Buffer.from(await value.arrayBuffer());
        assert.equal(bytes.toString('ascii',0,4),'RIFF');
      }
      assert.equal(socket.closed, true, 'release socket on all completion paths');
    } finally {
      Object.assign(globalThis, saved);
      t.mock.timers.reset();
    }
  });
}
