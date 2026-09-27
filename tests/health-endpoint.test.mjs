import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/api/health.ts';

const json = async (env = {}) => {
  const response = await onRequestGet({ env });
  return { response, body: await response.json() };
};

test('health treats Gemini plus the public Supabase path as core configured', async () => {
  const { response, body } = await json({ GEMINI_API_KEY: 'test-key' });
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.service, 'jel-study-abroad-api');
  assert.equal(body.configured, true);
  assert.equal(body.checks.gemini, true);
  assert.equal(body.checks.supabase, true);
  assert.equal(body.checks.sslcommerz, false);
  assert.equal(body.optional.supabaseElevated, false);
  assert.equal(body.optional.sslcommerz, false);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('health keeps core unconfigured when Gemini is unavailable', async () => {
  const { body } = await json({});
  assert.equal(body.configured, false);
  assert.equal(body.checks.gemini, false);
  assert.equal(body.checks.supabase, true);
});

test('optional payment and elevated Supabase credentials do not define core readiness', async () => {
  const { body } = await json({
    GEMINI_TTS_API_KEY: 'tts-key',
    SUPABASE_SECRET_KEY: 'server-secret-placeholder',
    SSLCOMMERZ_STORE_ID: 'merchant',
    SSLCOMMERZ_STORE_PASSWORD: 'password',
  });
  assert.equal(body.configured, true);
  assert.equal(body.optional.supabaseElevated, true);
  assert.equal(body.optional.sslcommerz, true);
  assert.equal(body.checks.sslcommerz, true);
});
