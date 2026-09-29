import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/gemini/chat.ts';
const nativeFetch = globalThis.fetch;
beforeEach(() => { globalThis.fetch = async () => { throw new Error('Network is disabled in unit tests'); }; });
afterEach(() => { globalThis.fetch = nativeFetch; });

const request = (body, options = {}) => new Request('https://journeyexpertbd.com/api/gemini/chat', {
  method: 'POST', body: JSON.stringify(body), ...options,
});

test('Auto mode keeps English travel questions in English and recognizes Banglish', async () => {
  globalThis.fetch = async () => { throw new Error('offline'); };
  for (const message of ['What student visa documents do I need?', 'Can you help with a flight ticket?', 'Which university should I choose?']) {
    const data = await (await onRequest({ request: request({ message, language: 'auto' }), env: {} })).json();
    assert.equal(data.language, 'en');
  }
  const data = await (await onRequest({ request: request({ message: 'ami UK te porte chai', language: 'auto' }), env: {} })).json();
  assert.equal(data.language, 'bn');
});

test('Complete Bengali answers retain a usable budget and exclude thought parts', async () => {
  const answer = 'কাউন্সেলিং শুরু করতে আপনার শিক্ষাগত যোগ্যতা ও পছন্দের দেশ জানান।';
  globalThis.fetch = async (_url, options) => {
    const config = JSON.parse(options.body).generationConfig;
    const maxTokens = config.maxOutputTokens;
    assert.equal(config.thinkingConfig.thinkingLevel, 'low');
    assert.ok(maxTokens >= 768 && maxTokens <= 1024, 'output budget should remain sufficient for concise complete answers after thinking');
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ thought: true, text: 'internal reasoning' }, { text: answer }] } }] });
  };
  for (const source of ['text', 'voice']) {
    const data = await (await onRequest({ request: request({ message: 'কাউন্সেলিং কীভাবে শুরু করব?', source }), env: { GEMINI_API_KEY: 'test-only' } })).json();
    assert.equal(data.mode, 'ai');
    assert.equal(data.reply, answer);
  }
});

test('A token-truncated provider response is not presented as a completed answer', async () => {
  globalThis.fetch = async () => Response.json({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: 'JEL-এ স্টাডি অ্যাব্রোড কাউন্সেল' }] } }] });
  const data = await (await onRequest({ request: request({ message: 'স্টাডি কাউন্সেলিং কীভাবে শুরু করব?' }), env: { GEMINI_API_KEY: 'test-only' } })).json();
  assert.equal(data.mode, 'fallback');
  assert.match(data.reply, /প্রোফাইল মূল্যায়ন/);
});

test('Pages chat validates input and provides a Bangla fallback without credentials', async () => {
  const response = await onRequest({ request: request({ message: 'আমি পড়তে চাই' }), env: {} });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.mode, 'fallback');
  assert.equal(data.language, 'bn');
  assert.match(data.reply, /[\u0980-\u09FF]/);
  assert.doesNotMatch(data.reply, /নিরাপদ সহায়তা মোড|লাইভ মডেলের বদলে/);
  assert.doesNotMatch(data.reply, /â|Ã|Â|ï¿½|�|à¦|à§/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal((await onRequest({ request: request({}), env: {} })).status, 400);
  assert.equal((await onRequest({ request: request({ message: 'a'.repeat(40000) }), env: {} })).status, 413);
  assert.equal((await onRequest({ request: request({ message: 'hello' }, { headers: { origin: 'https://example.org' } }), env: {} })).status, 403);
  assert.equal((await onRequest({ request: new Request('https://journeyexpertbd.com/api/gemini/chat'), env: {} })).status, 405);
});

test('Gemini receives bounded history and quota failures return usable fallback', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.match(url, /gemini-3\.8-flash/);
      assert.equal(options.headers['x-goog-api-key'], 'test-only');
      const body = JSON.parse(options.body);
      assert.ok(body.contents.length <= 8);
      assert.equal(body.contents.at(-1).role, 'user');
      return Response.json({ candidates: [{ content: { parts: [{ text: 'Hello from Angela' }] } }] });
    };
    const response = await onRequest({ request: request({ messages: [{ sender: 'assistant', text: 'Hello' }, { sender: 'user', text: 'Study in UK' }] }), env: { GEMINI_API_KEY: 'test-only' } });
    assert.equal((await response.json()).reply, 'Hello from Angela');
    globalThis.fetch = async () => new Response(null, { status: 429 });
    assert.equal((await (await onRequest({ request: request({ message: 'hello' }), env: { GEMINI_API_KEY: 'test-only' } })).json()).mode, 'fallback');
    globalThis.fetch = async () => { throw new Error('Network unavailable'); };
    assert.equal((await (await onRequest({ request: request({ message: 'hello' }), env: { GEMINI_API_KEY: 'test-only' } })).json()).mode, 'fallback');
  } finally { globalThis.fetch = originalFetch; }
});

test('Actual Bengali input overrides stale UI language and rejects an English-only model reply', async () => {
  const originalFetch = globalThis.fetch;
  try {
    let answer = 'Hello, I am Angela';
    globalThis.fetch = async (_url, options) => {
      const payload = JSON.parse(options.body);
      assert.match(payload.systemInstruction.parts[0].text, /Respond in natural Bengali script/);
      return Response.json({ candidates: [{ content: { parts: [{ text: answer }] } }] });
    };
    const send = () => onRequest({ request: request({ language: 'bn', messages: [{ sender: 'assistant', text: 'Hello' }, { sender: 'user', text: 'Introduce yourself' }] }), env: { GEMINI_API_KEY: 'test-only' } });
    const wrongLanguage = await (await send()).json();
    assert.equal(wrongLanguage.mode, 'fallback');
    assert.match(wrongLanguage.reply, /[\u0980-\u09FF]/);
    answer = 'আমি অ্যাঞ্জেলা। আপনাকে কীভাবে সাহায্য করতে পারি?';
    const correctLanguage = await (await send()).json();
    assert.equal(correctLanguage.mode, 'ai');
    assert.equal(correctLanguage.reply, answer);

    globalThis.fetch = async () => { throw new Error('Network unavailable'); };
    const staleEnglishMode = await (await onRequest({ request: request({ language: 'en', message: 'পরিচয় দিন' }), env: {} })).json();
    assert.equal(staleEnglishMode.language, 'bn');
    const actualEnglish = await (await onRequest({ request: request({ language: 'en', message: 'Introduce yourself' }), env: {} })).json();
    assert.equal(actualEnglish.language, 'en');
  } finally { globalThis.fetch = originalFetch; }
});

test('Bangla fallback stays useful and preserves UTF-8 for common intents', async () => {
  const study = await (await onRequest({ request: request({ language: 'bn', message: 'আমি যুক্তরাজ্যে মাস্টার্স পড়তে চাই' }), env: {} })).json();
  assert.equal(study.language, 'bn');
  assert.match(study.reply, /প্রোফাইল মূল্যায়ন/);
  assert.doesNotMatch(study.reply, /â|Ã|Â|ï¿½|�|à¦|à§/);

  const contact = await (await onRequest({ request: request({ language: 'bn', message: 'অফিসের ঠিকানা ও ফোন নম্বর দিন' }), env: {} })).json();
  assert.match(contact.reply, /তেজগাঁও/);
  assert.match(contact.reply, /\+8801926400400/);
});

test('Study Abroad keeps its no-key AI fallback on the dedicated Study AI Studio with bounded conversation and Banglish detection', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://jel-study-abroad.ai.studio/api/gemini/chat');
    assert.equal(options.headers['x-goog-api-key'], undefined);
    assert.equal(options.headers.Origin, 'https://journeyexpertbd.com');
    const body = JSON.parse(options.body);
    assert.equal(body.language, 'bn');
    assert.equal(body.message, 'ami UK te porte chai');
    assert.deepEqual(body.history, [{ role: 'assistant', content: 'How can I help?' }]);
    return Response.json({ reply: 'ইউকেতে পড়াশোনার জন্য আপনার পছন্দের বিষয় কী?', mode: 'ai' });
  };
  const result = await onRequest({ request: request({ messages: [{ sender: 'assistant', text: 'How can I help?' }, { sender: 'user', text: 'ami UK te porte chai' }] }), env: {} });
  const data = await result.json();
  assert.equal(data.mode, 'ai');
  assert.equal(data.language, 'bn');
});

test('Cloudflare dispatch includes the Bengali speech function', async () => {
  const { readFile } = await import('node:fs/promises');
  const routes = JSON.parse(await readFile(new URL('../public/_routes.json', import.meta.url), 'utf8'));
  assert.ok(
    routes.include.includes('/angela/speech') || routes.include.includes('/angela/*'),
    'Cloudflare routing must dispatch /angela/speech either explicitly or through /angela/*'
  );
});


test('Study Abroad production brain is Gemini 3.8 and supports opt-in search grounding', async () => {
  let observed;
  globalThis.fetch = async (url, options) => {
    observed = { url: String(url), body: JSON.parse(options.body) };
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'Study guidance response' }] } }] });
  };
  await onRequest({ request: request({ message: 'Study options in the UK', language: 'en' }), env: { GEMINI_API_KEY: 'test-only', GOOGLE_SEARCH_GROUNDING: 'true' } });
  assert.match(observed.url, /gemini-3\.8-flash/);
  assert.deepEqual(observed.body.tools, [{ google_search: {} }]);
});


test('Study Abroad Angela retries with the secondary Gemini credential', async () => {
  const seen = [];
  globalThis.fetch = async (_url, options) => {
    const key = options.headers['x-goog-api-key'];
    seen.push(key);
    if (key === 'primary-key') return new Response(null, { status: 429 });
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'ইউকেতে মাস্টার্সের জন্য আপনার একাডেমিক প্রোফাইল ও ডকুমেন্ট দিয়ে শুরু করুন।' }] } }] });
  };
  const response = await onRequest({
    request: request({ message: 'ami UK te masters korte chai', language: 'bn' }),
    env: { GEMINI_API_KEY: 'primary-key', GEMINI_TTS_API_KEY: 'secondary-key' },
  });
  const data = await response.json();
  assert.equal(data.mode, 'ai');
  assert.equal(data.language, 'bn');
  assert.equal(seen[0], 'primary-key');
  assert.ok(seen.includes('secondary-key'));
});


test('Study Abroad reuses the shared corporate Angela brain only after local AI paths degrade', async () => {
  globalThis.fetch = async (url) => {
    const target = String(url);
    if (target.includes('generativelanguage.googleapis.com')) return new Response(null, { status: 429 });
    if (target.includes('jel-study-abroad.ai.studio')) {
      return Response.json({ reply: 'যাচাইকৃত স্থানীয় fallback', mode: 'fallback' });
    }
    if (target === 'https://journeyexpertltd.com/angela/chat') {
      return Response.json({
        reply: 'ইউকেতে মাস্টার্সের জন্য একাডেমিক ট্রান্সক্রিপ্ট, সার্টিফিকেট, ইংরেজি দক্ষতার প্রমাণ এবং বিশ্ববিদ্যালয়ভেদে প্রয়োজনীয় অতিরিক্ত কাগজপত্র প্রস্তুত করুন।',
        language: 'bn',
        mode: 'ai',
        providerModel: 'gemini-3.8-flash',
      });
    }
    throw new Error('unexpected URL: ' + target);
  };
  const response = await onRequest({
    request: request({ message: 'ami UK te masters korte chai, ki documents lagbe?', language: 'bn' }),
    env: { GEMINI_API_KEY: 'quota-key' },
  });
  const data = await response.json();
  assert.equal(data.mode, 'ai');
  assert.equal(data.language, 'bn');
  assert.match(data.providerModel, /^jel-corporate-/);
  assert.match(data.reply, /[\u0980-\u09FF]/);
});


test('Hajj or Umrah context takes priority over generic visa/package fallback', async () => {
  globalThis.fetch = async () => { throw new Error('offline'); };
  const en = await (await onRequest({ request: request({ message: 'I need Hajj visa and hotel package details', language: 'en' }), env: {} })).json();
  assert.equal(en.language, 'en');
  assert.match(en.reply, /Hajj and Umrah package planning/);
  assert.match(en.reply, /Makkah\/Madinah/);
  const bn = await (await onRequest({ request: request({ message: 'হজ ভিসা ও হোটেল প্যাকেজ সম্পর্কে জানতে চাই', language: 'bn' }), env: {} })).json();
  assert.equal(bn.language, 'bn');
  assert.match(bn.reply, /মক্কা|Makkah/);
  assert.match(bn.reply, /visa\/document guidance/);
});


test('semantic router keeps adjacent JEL intents separate', async () => {
  globalThis.fetch = async () => { throw new Error('offline'); };
  const cases = [
    ['হজ ভিসা ও মক্কা হোটেল সম্পর্কে বলুন', 'bn', 'hajj_umrah', /হজ ও ওমরাহ|Makkah\/Madinah/],
    ['I need Hajj visa and hotel guidance', 'en', 'hajj_umrah', /Hajj and Umrah/],
    ['স্টুডেন্ট ভিসা ও CAS সম্পর্কে জানতে চাই', 'bn', 'study_abroad', /JEL Study Abroad/],
    ['medical visa and hospital support', 'en', 'medical_tourism', /medical-tourism/],
    ['টিকিট রিফান্ড এবং reissue কীভাবে হয়?', 'bn', 'air_ticketing', /air ticketing/],
    ['travel insurance coverage সম্পর্কে বলুন', 'bn', 'insurance', /travel-insurance/],
    ['corporate travel management কী?', 'bn', 'corporate_travel', /corporate travel/],
    ['Craft Bangla কি JEL-এর brand?', 'bn', 'brands', /Craft Bangla/],
  ];

  for (const [message, language, intent, replyPattern] of cases) {
    const data = await (await onRequest({ request: request({ message, language }), env: {} })).json();
    assert.equal(data.primaryIntent, intent, message);
    assert.ok(Array.isArray(data.groundingIds));
    assert.equal(data.groundingIds[0], intent, message);
    assert.match(data.reply, replyPattern, message);
  }
});

test('unknown JEL-specific detail is not invented by fallback', async () => {
  globalThis.fetch = async () => { throw new Error('offline'); };
  const data = await (await onRequest({
    request: request({ message: 'Who is the current chairman and what is their mobile number?', language: 'en' }),
    env: {},
  })).json();
  assert.equal(data.primaryIntent, 'unverified');
  assert.match(data.reply, /not present|verified/i);
  assert.doesNotMatch(data.reply, /chairman is/i);
});


test('Study Abroad document fallbacks stay useful when AI providers degrade', async () => {
  globalThis.fetch = async () => { throw new Error('offline'); };

  const canadaBn = await (await onRequest({
    request: request({ message: 'কানাডায় স্টাডি করতে কী কী ডকুমেন্ট লাগে?', language: 'bn' }),
    env: {},
  })).json();
  assert.equal(canadaBn.primaryIntent, 'study_documents_canada');
  assert.match(canadaBn.reply, /passport|পাসপোর্ট/i);
  assert.match(canadaBn.reply, /LOA|Letter of Acceptance/i);
  assert.match(canadaBn.reply, /proof of funds|funds/i);

  const canadaEn = await (await onRequest({
    request: request({ message: 'What documents do I need to study in Canada?', language: 'en' }),
    env: {},
  })).json();
  assert.equal(canadaEn.primaryIntent, 'study_documents_canada');
  assert.match(canadaEn.reply, /passport/i);
  assert.match(canadaEn.reply, /Letter of Acceptance|LOA/i);
  assert.match(canadaEn.reply, /proof of funds/i);

  const generic = await (await onRequest({
    request: request({ message: 'What documents do I need for studying abroad?', language: 'en' }),
    env: {},
  })).json();
  assert.equal(generic.primaryIntent, 'study_documents_general');
  assert.match(generic.reply, /transcripts/i);
  assert.match(generic.reply, /passport/i);
});
