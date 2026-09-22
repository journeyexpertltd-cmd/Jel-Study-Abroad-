import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) throw new Error(`${label}: missing required contract: ${needle}`);
};
const forbidText = (text, needle, label) => {
  if (text.includes(needle)) throw new Error(`${label}: forbidden legacy contract found: ${needle}`);
};

const [audio, speech, chat, token, sitemap, redirects] = await Promise.all([
  read('src/lib/angelaAudio.ts'),
  read('functions/angela/speech.ts'),
  read('functions/api/gemini/chat.ts'),
  read('functions/api/gemini/live-token.ts'),
  read('public/sitemap.xml'),
  read('public/_redirects'),
]);

requireText(audio, "data instanceof Blob", 'Angela browser audio');
requireText(audio, "fetch('/api/gemini/live-token'", 'Angela browser audio');
requireText(audio, "voiceName: 'Aoede'", 'Angela browser audio');
requireText(audio, "gemini-3.8-live", 'Angela browser audio');
requireText(audio, "fetch('/angela/speech'", 'Angela browser audio');
requireText(audio, "window.setTimeout(() => ttsController.abort(), 9000)", 'Angela browser audio');
requireText(audio, "return await fetchAngelaLiveSpeech(speechText, signal)", 'Angela browser audio');
requireText(audio, "live_voice_timeout')), 3500", 'Angela browser audio');

requireText(speech, "env.GEMINI_TTS_API_KEY || env.GEMINI_API_KEY", 'Angela TTS endpoint');
requireText(speech, "env.ANGELA_SERVER_VOICE === 'off'", 'Angela TTS endpoint');
requireText(speech, "setTimeout(() => controller.abort(), 7000)", 'Angela TTS endpoint');
requireText(speech, "gemini-3.1-flash-tts-preview", 'Angela TTS endpoint');
requireText(speech, "voiceName: 'Kore'", 'Angela TTS endpoint');
requireText(speech, "responseModalities: ['AUDIO']", 'Angela TTS endpoint');
requireText(speech, "audio/wav", 'Angela TTS endpoint');

requireText(chat, "'gemini-3.8-flash'", 'Angela chat endpoint');
requireText(chat, "'gemini-3.5-flash'", 'Angela chat endpoint');
requireText(chat, "'gemini-flash-latest'", 'Angela chat endpoint');
requireText(chat, "'gemini-2.5-flash'", 'Angela chat endpoint');
requireText(chat, "'gemini-2.5-flash-lite'", 'Angela chat endpoint');
requireText(chat, "for (const model of candidateModels)", 'Angela chat endpoint');
requireText(chat, "maxOutputTokens: fromVoice ? 512 : 896", 'Angela chat endpoint');

requireText(token, "request.headers.get('origin') !== url.origin", 'Angela Live token');
requireText(token, "liveConnectConstraints", 'Angela Live token');
requireText(token, "responseModalities: ['AUDIO']", 'Angela Live token');
requireText(token, "gemini-3.8-live", 'Angela Live token');

const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (locs.length !== 13) throw new Error(`Sitemap contract: expected 13 URLs, found ${locs.length}`);
for (const loc of locs) {
  if (!loc.startsWith('https://journeyexpertbd.com/')) throw new Error(`Sitemap contract: wrong domain ${loc}`);
  if (loc !== 'https://journeyexpertbd.com/' && loc.endsWith('/')) {
    throw new Error(`Sitemap contract: trailing slash canonical ${loc}`);
  }
}

forbidText(redirects, '/about /about/ 301', 'Redirects');
forbidText(redirects, '/ects-calculator /ects-calculator/ 301', 'Redirects');

console.log('Production contract verified: Angela fast chat/voice fallback, domain and canonical rules are locked.');
