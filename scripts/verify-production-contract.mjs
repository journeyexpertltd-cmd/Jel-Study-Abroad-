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
requireText(audio, "const liveBlob = await fetchAngelaLiveSpeech(speechText, signal)", 'Angela browser audio');
requireText(audio, "live_voice_timeout')), 10000", 'Angela browser audio');

requireText(speech, "const voiceName = 'Aoede'", 'Angela TTS endpoint');
requireText(speech, "ANGELA_TTS_TIMEOUT_MS", 'Angela TTS endpoint');
requireText(speech, "Math.min(10000, Math.max(4500, configuredTimeout))", 'Angela TTS endpoint');
forbidText(speech, "Math.min(15000, Math.max(5000, configuredTimeout))", 'Angela TTS endpoint');
forbidText(speech, "setTimeout(() => controller.abort(), 4000)", 'Angela TTS endpoint');
requireText(speech, "gemini-2.5-flash-preview-tts", 'Angela TTS endpoint');
forbidText(speech, "gemini-2.5-pro-preview-tts", 'Angela TTS endpoint');
forbidText(speech, "gemini-3.1-flash-tts-preview", 'Angela TTS endpoint');

requireText(chat, "'gemini-flash-latest'", 'Angela chat endpoint');
requireText(chat, "'gemini-2.5-flash'", 'Angela chat endpoint');
requireText(chat, "'gemini-2.5-flash-lite'", 'Angela chat endpoint');
requireText(chat, "for (const model of candidateModels)", 'Angela chat endpoint');
requireText(chat, "maxOutputTokens: fromVoice ? 180 : 280", 'Angela chat endpoint');

requireText(token, "request.headers.get('origin') !== url.origin", 'Angela Live token');
requireText(token, "voiceName: 'Aoede'", 'Angela Live token');
requireText(token, "gemini-2.5-flash-native-audio-preview-12-2025", 'Angela Live token');

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
