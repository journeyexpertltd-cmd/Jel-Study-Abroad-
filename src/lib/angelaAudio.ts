const MAX_SPEECH_CHARS = 700;
const MAX_CACHE_ENTRIES = 12;
const speechCache = new Map<string, Blob>();

// Angela uses the verified server voice for Bangla so the result is consistent
// across Chrome/Windows installations. Local Bengali OS voices can be absent,
// silent, or use a different speaker profile. English browser voices remain untouched.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  const w = window as typeof window & { __jelAngelaBanglaServerVoice?: boolean };
  if (!w.__jelAngelaBanglaServerVoice) {
    try {
      const synth = window.speechSynthesis;
      const originalGetVoices = synth.getVoices.bind(synth);
      synth.getVoices = () => originalGetVoices().filter((voice) =>
        !/^bn(?:[-_]|$)/i.test(voice.lang) && !/bangla|bengali/i.test(voice.name)
      );
      w.__jelAngelaBanglaServerVoice = true;
    } catch {
      // If the browser prevents method replacement, Angela's existing server
      // fallback remains available without affecting text chat.
    }
  }
}

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
  if (code === 'voice_not_configured') return 'Angela-র বাংলা female voice এখনও চালু হয়নি। আপাতত লেখা পড়ে নিতে পারেন।';
  if (code === 'voice_quota_exceeded') return 'Angela-র কণ্ঠসেবা সাময়িকভাবে ব্যস্ত। Listen আবার চাপলে cached voice থাকলে সঙ্গে সঙ্গে শোনা যাবে।';
  if (error instanceof Error && error.name === 'NotAllowedError') return 'শব্দ চালাতে উত্তরের Listen বোতামটি চাপুন।';
  return 'এই মুহূর্তে Angela-র বাংলা female voice চালানো যাচ্ছে না। Listen চেপে আবার চেষ্টা করুন।';
}
