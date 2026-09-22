import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/gemini/live-token.ts';

const request = (origin = 'https://example.pages.dev') => new Request(`${origin}/api/gemini/live-token`, {
  method: 'POST',
  headers: { origin },
});

test('Live token endpoint rejects invalid access and missing credentials', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('must not call upstream'); };
  try {
    assert.equal((await onRequest({ request: new Request('https://example.pages.dev/api/gemini/live-token'), env: {} })).status, 405);
    assert.equal((await onRequest({ request: new Request('https://example.pages.dev/api/gemini/live-token', { method: 'POST', headers: { origin: 'https://evil.example' } }), env: {} })).status, 403);
    assert.equal((await onRequest({ request: request(), env: {} })).status, 503);
  } finally {
    globalThis.fetch = original;
  }
});

test('Live token endpoint creates a one-use short-lived token without exposing the API key', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(String(url), 'https://generativelanguage.googleapis.com/v1beta/auth_tokens');
      assert.equal(options.headers['x-goog-api-key'], 'secret-test-key');
      const body = JSON.parse(options.body);
      assert.equal(body.uses, 1);
      assert.ok(body.expireTime);
      assert.ok(body.newSessionExpireTime);
      assert.equal(body.liveConnectConstraints, undefined);
      assert.equal(body.bidiGenerateContentSetup, undefined);
      return Response.json({ name: 'auth_tokens/test-ephemeral-token' });
    };

    const response = await onRequest({ request: request(), env: { GEMINI_API_KEY: 'secret-test-key' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const data = await response.json();
    assert.equal(data.token, 'auth_tokens/test-ephemeral-token');
    assert.equal(data.model, 'gemini-3.8-live');
    assert.ok(!JSON.stringify(data).includes('secret-test-key'));
  } finally {
    globalThis.fetch = original;
  }
});
