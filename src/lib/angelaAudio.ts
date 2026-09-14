const MAX_SPEECH_CHARS = 700;
const MAX_CACHE_ENTRIES = 12;
const speechCache = new Map<string, Blob>();

function normalizeSpeechText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_SPEECH_CHARS);
}

function rememberSpeech(key: string, blob: Blob) {
  if (speechCache.has(key)) speechCache.delete(key);
  speechCache.set(key, blob);
  while (speechCache.size > MAX_CACHE_ENTRIES) {
    const oldest = speechCache.keys().next().value as string | undefined;
    if (!oldest) break;
    speechCache.delete(oldest);
  }
}

export async function fetchAngelaSpeech(text: string, signal: AbortSignal): Promise<Blob> {
  const speechText = normalizeSpeechText(text);
  if (!speechText) throw new Error('voice_provider_unavailable');

  const cached = speechCache.get(speechText);
  if (cached) return cached;

  const response = await fetch('/angela/speech', {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: speechText }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'voice_provider_unavailable');
  }
  if (!response.headers.get('content-type')?.includes('audio/wav')) throw new Error('invalid_audio');

  const blob = await response.blob();
  rememberSpeech(speechText, blob);
  return blob;
}

export function voiceErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  if (code === 'voice_not_configured') return 'বাংলা কণ্ঠসেবা এখনও চালু হয়নি। আপাতত লেখা পড়ে নিতে পারেন।';
  if (code === 'voice_quota_exceeded') return 'কণ্ঠসেবা সাময়িকভাবে ব্যস্ত। Listen আবার চাপলে cached voice থাকলে সঙ্গে সঙ্গে শোনা যাবে।';
  if (error instanceof Error && error.name === 'NotAllowedError') return 'শব্দ চালাতে উত্তরের Listen বোতামটি চাপুন।';
  return 'এই মুহূর্তে বাংলা কণ্ঠ চালানো যাচ্ছে না। Listen চেপে আবার চেষ্টা করুন।';
}
