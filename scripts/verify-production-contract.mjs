import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) throw new Error(`${label}: missing required contract: ${needle}`);
};
const forbidText = (text, needle, label) => {
  if (text.includes(needle)) throw new Error(`${label}: forbidden legacy contract found: ${needle}`);
};

const [assistant, audio, speech, chat, token, sitemap, redirects] = await Promise.all([
  read('src/components/AIChatAssistant.tsx'),
  read('src/lib/angelaAudio.ts'),
  read('functions/angela/speech.ts'),
  read('functions/api/gemini/chat.ts'),
  read('functions/api/gemini/live-token.ts'),
  read('public/sitemap.xml'),
  read('public/_redirects'),
]);

requireText(assistant, "MediaRecorder", 'Angela customer voice input');
requireText(assistant, "startBrowserRecognitionFallback(notice)", 'Angela customer voice input');
requireText(assistant, "DEVICE_FIRST_ANGELA_VOICE", 'Angela low-latency verified female voice');
requireText(assistant, "LOW_LATENCY_VOICE_INPUT", 'Angela low-latency browser recognition');
requireText(assistant, "fetchAngelaSpeech", 'Angela robust cloud voice chain');
requireText(assistant, "greetAngelaOnOpen", 'Angela immediate opening greeting');
requireText(assistant, 'void speakText(BANGLA_WELCOME, "welcome-angela-jel")', 'Angela cloud-first opening speech');
requireText(assistant, "onClick={greetAngelaOnOpen}", 'Angela opening button voice contract');
requireText(assistant, "device voice fallback", 'Angela resilient device fallback');
requireText(assistant, 'data-voice-contract="cloud female primary; device voice fallback"', 'Angela deployed voice contract');
requireText(assistant, "BANGLA_FEMALE_HINTS", 'Angela cross-platform female voice selection');
requireText(assistant, "BANGLA_MALE_HINTS", 'Angela male voice exclusion');
requireText(assistant, "pickAngelaDeviceVoice", 'Angela cross-platform voice ranking');
forbidText(assistant, "|| voices.find", 'Angela must not choose an arbitrary or male device voice');
requireText(assistant, "playbackRef.current!.play", 'Angela unified device/cloud playback controller');
requireText(assistant, "pickAngelaDeviceVoice", 'Angela verified female device voice selection');
requireText(assistant, "voice = text === BANGLA_WELCOME ? null : pickAngelaDeviceVoice", 'Angela quota-free opening greeting and device-first replies');
requireText(chat, "You serve visitors on both journeyexpertbd.com and journeyexpertltd.com", 'Angela unified JEL knowledge');
requireText(chat, "air ticketing; fare quotation; reissue/refund support", 'Angela unified JEL services');
requireText(chat, "https://journeyexpertltd.com/angela/transcribe", 'Angela transcription failover');
requireText(audio, "data instanceof Blob", 'Angela browser audio');
requireText(audio, "fetch('/api/gemini/live-token'", 'Angela browser audio');
requireText(audio, "voiceName: 'Aoede'", 'Angela browser audio');
requireText(audio, "gemini-3.8-live", 'Angela browser audio');
requireText(audio, "fetch('/api/angela/speech'", 'Angela browser audio');
requireText(audio, "window.setTimeout(() => ttsController.abort(), 26000)", 'Angela browser audio');
requireText(audio, "const blob = await fetchAngelaLiveSpeech(speechText, signal)", 'Angela browser audio');
requireText(audio, "live_voice_timeout')), 5000", 'Angela browser audio');
requireText(audio, "CLOUD_FEMALE_PRIMARY_FAST", 'Angela cloud female primary contract');
requireText(audio, "clientContent", 'Angela browser audio');
requireText(audio, "turnComplete: true", 'Angela browser audio');
forbidText(audio, "realtimeInput: {\n              text:", 'Angela browser audio');

requireText(speech, "env.GEMINI_TTS_API_KEY?.trim()", 'Angela TTS endpoint primary key');
requireText(speech, "env.GEMINI_API_KEY?.trim()", 'Angela TTS endpoint secondary key');
requireText(speech, "for (const key of keys)", 'Angela TTS key failover');
requireText(speech, "env.ANGELA_SERVER_VOICE === 'off'", 'Angela TTS endpoint');
requireText(speech, "const deadline = Date.now() + 14500", 'Angela TTS endpoint');
requireText(speech, "gemini-3.8-flash-lite-tts", 'Angela TTS endpoint');
requireText(speech, "v1beta/interactions", 'Angela TTS endpoint');
requireText(speech, "response_format: { type: 'audio' }", 'Angela TTS endpoint');
forbidText(speech, "sample_rate", 'Angela TTS endpoint');
requireText(speech, "voice: 'Aoede'", 'Angela TTS endpoint');
requireText(speech, "audio/wav", 'Angela TTS endpoint');
requireText(speech, "gemini-3.8-flash-tts", 'Angela TTS endpoint');

requireText(chat, "const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']", 'Angela chat endpoint');
requireText(chat, "for (const model of candidateModels)", 'Angela chat endpoint');
requireText(chat, "generationConfig.thinkingConfig = { thinkingLevel: 'low' }", 'Angela chat endpoint');
requireText(chat, "maxOutputTokens: fromVoice ? 768 : 1024", 'Angela chat endpoint');
requireText(chat, "GOOGLE_SEARCH_GROUNDING === 'true'", 'Angela chat endpoint');
requireText(chat, "'gemini-3.5-flash'", 'Angela chat endpoint');
requireText(chat, "'gemini-2.5-flash'", 'Angela chat endpoint');
requireText(chat, "study-ai-studio", 'Angela chat endpoint');
requireText(chat, "https://journeyexpertltd.com/angela/chat", 'Angela corporate AI fallback');
forbidText(chat, "'gemini-flash-latest'", 'Angela chat endpoint');

requireText(token, "origin && origin !== url.origin", 'Angela Live token');
requireText(token, "liveConnectConstraints", 'Angela Live token');
forbidText(token, "bidiGenerateContentSetup", 'Angela Live token');
requireText(token, "model: 'models/gemini-3.8-live'", 'Angela Live token');
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

console.log('Production contract verified: bounded bilingual AI, cloud-to-device voice resilience, transcription failover, domain and canonical rules are locked.');

