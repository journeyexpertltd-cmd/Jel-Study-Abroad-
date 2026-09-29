import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { onRequest } from '../functions/api/gemini/chat.ts';

const source = fs.readFileSync('src/components/AIChatAssistant.tsx', 'utf8');
const voiceCode = source.slice(source.indexOf('const BANGLA_FEMALE_HINTS'), source.indexOf('// Voice States'));
const pick = new Function(stripTypeScriptTypes(voiceCode) + '; return pickAngelaDeviceVoice;')();
const voice = (name, lang) => ({ name, lang, default: false, localService: true });

test('female, woman and Samantha names are not rejected as male substrings', () => {
  for (const name of ['Google UK English Female', 'Samantha', 'English Woman']) {
    const item = voice(name, 'en-GB');
    assert.equal(pick([item], 'en'), item);
  }
  assert.equal(pick([voice('Bengali Female', 'bn-BD')], 'bn')?.name, 'Bengali Female');
});

test('male, unknown and wrong-language voices remain excluded', () => {
  for (const name of ['English Male', 'Man', 'David', 'Unknown']) {
    assert.equal(pick([voice(name, 'en-US')], 'en'), null);
  }
  assert.equal(pick([voice('Samantha', 'en-US')], 'bn'), null);
  assert.equal(pick([voice('Google Bengali Male', 'bn-BD')], 'bn'), null);
});

test('published hotline answers do not call an external AI provider', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('offline'); };
  try {
    for (const [message, language] of [['What is your hotline number?', 'en'], ['আপনাদের ফোন নম্বর কী?', 'bn']]) {
      const request = new Request('https://journeyexpertbd.com/api/gemini/chat', { method: 'POST', body: JSON.stringify({message, language}) });
      const result = await (await onRequest({request, env:{}})).json();
      assert.match(result.reply, /01926400400/);
      assert.equal(result.primaryIntent, 'contact');
      assert.equal(result.language, language);
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = original; }
});

test('offline multi-topic answer retains the requested contact information', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const request = new Request('https://journeyexpertbd.com/api/gemini/chat', { method: 'POST', body: JSON.stringify({message:'আপনাদের hotline নম্বর কী এবং UK-তে পড়তে চাই?', language:'bn'}) });
    const result = await (await onRequest({request, env:{}})).json();
    assert.equal(result.primaryIntent, 'study_abroad');
    assert.match(result.reply, /প্রোফাইল মূল্যায়ন/);
    assert.match(result.reply, /01926400400/);
  } finally { globalThis.fetch = original; }
});

test('Angela identity is answered locally in Bangla and English', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('offline'); };
  try {
    for (const [message, language, expected] of [
      ['What is your name?', 'en', /My name is Angela/],
      ['আপনার নাম কী?', 'bn', /আমার নাম অ্যাঞ্জেলা/],
      ['আপনানামকী?', 'bn', /আমার নাম অ্যাঞ্জেলা/],
      ['আপনর নম কী?', 'bn', /আমার নাম অ্যাঞ্জেলা/],
    ]) {
      const request = new Request('https://journeyexpertbd.com/api/gemini/chat', { method: 'POST', body: JSON.stringify({ message, language }) });
      const result = await (await onRequest({ request, env: {} })).json();
      assert.match(result.reply, expected);
      assert.equal(result.primaryIntent, 'identity');
      assert.equal(result.language, language);
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = original; }
});
