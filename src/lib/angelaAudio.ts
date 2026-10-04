const MAX_SPEECH_CHARS = 700;
const MAX_CACHE_ENTRIES = 12;
const LIVE_FALLBACK_MODEL = 'gemini-3.8-live';
const speechCache = new Map<string, Blob>();
let voiceQuotaCooldownUntil = 0;

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

function base64ToBytes(value: string): Uint8Array {
  const raw = atob(value);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function webSocketDataToText(data: unknown): Promise<string> {
  if (typeof data === 'string') return data;
  if (data instanceof Blob) return await data.text();
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  return String(data);
}

function pcmChunksToWav(chunks: Uint8Array[]): Blob {
  const pcmLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const buffer = new ArrayBuffer(44 + pcmLength);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const label = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) bytes[offset + i] = value.charCodeAt(i);
  };

  label(0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true);
  label(8, 'WAVE');
  label(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 24000, true);
  view.setUint32(28, 48000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  label(36, 'data');
  view.setUint32(40, pcmLength, true);

  let offset = 44;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

async function fetchAngelaLiveSpeech(text: string, signal: AbortSignal): Promise<Blob> {
  const tokenResponse = await fetch('/api/gemini/live-token', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
  });
  if (!tokenResponse.ok) {
    const data = await tokenResponse.json().catch(() => ({}));
    throw new Error(data.error || 'live_voice_unavailable');
  }

  const tokenData = await tokenResponse.json();
  const token = typeof tokenData?.token === 'string' ? tokenData.token : '';
  const model = typeof tokenData?.model === 'string' ? tokenData.model : LIVE_FALLBACK_MODEL;
  if (!token) throw new Error('live_voice_unavailable');

  return await new Promise<Blob>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    let settled = false;
    let sentTranscript = false;
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);
    socket.binaryType = 'arraybuffer';

    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      try { socket.close(); } catch { /* already closed */ }
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const succeed = () => {
      if (settled) return;
      const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      if (total < 2) {
        fail(new Error('live_voice_unavailable'));
        return;
      }
      settled = true;
      const blob = pcmChunksToWav(chunks);
      cleanup();
      resolve(blob);
    };

    const onAbort = () => fail(new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', onAbort, { once: true });
    // Keep backup speech conversational. The primary TTS already had its own
    // bounded attempt, so a long second wait makes Angela feel unresponsive.
    const timer = window.setTimeout(() => fail(new Error('live_voice_timeout')), 12000);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        setup: {
          model: `models/${model}`,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Aoede' },
              },
            },
          },
          systemInstruction: {
            parts: [{
              text: 'You are Angela, a warm professional adult female voice. You are acting only as a speech renderer. When a transcript arrives, speak it verbatim in the same language, including Bangla and English proper names. Do not answer it, translate it, summarize it, add greetings, or add any extra words.',
            }],
          },
        },
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(await webSocketDataToText(event.data));
        if (message.setupComplete && !sentTranscript) {
          sentTranscript = true;
          socket.send(JSON.stringify({
            clientContent: {
              turns: [{
                role: 'user',
                parts: [{ text: `Speak this transcript exactly as written:\n${text}` }],
              }],
              turnComplete: true,
            },
          }));
          return;
        }

        const content = message.serverContent;
        const parts = content?.modelTurn?.parts;
        if (Array.isArray(parts)) {
          for (const part of parts) {
            const audio = part?.inlineData;
            if (audio?.data && (!audio.mimeType || String(audio.mimeType).includes('audio'))) {
              chunks.push(base64ToBytes(audio.data));
            }
          }
        }

        if (content?.generationComplete || content?.turnComplete) succeed();
      } catch (error) {
        fail(error instanceof Error ? error : new Error('live_voice_unavailable'));
      }
    };

    socket.onerror = () => fail(new Error('live_voice_unavailable'));
    socket.onclose = () => {
      if (!settled) {
        if (chunks.length) succeed();
        else fail(new Error('live_voice_unavailable'));
      }
    };
  });
}

export async function fetchAngelaSpeech(text: string, signal: AbortSignal): Promise<Blob> {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const speechText = normalizeSpeechText(text);
  if (!speechText) throw new Error('voice_provider_unavailable');

  const cached = speechCache.get(speechText);
  if (cached) return cached;

  // Treat direct TTS quota as a cooldown for that endpoint only. Gemini Live
  // uses a separate session/token path and should still be attempted before
  // falling back to a device voice or text-only response.
  const directTtsCoolingDown = Date.now() < voiceQuotaCooldownUntil;

  if (!directTtsCoolingDown) {
    // Low-latency path: use the same-origin Gemini TTS endpoint first.
    const ttsController = new AbortController();
    const abortTts = () => ttsController.abort();
    signal.addEventListener('abort', abortTts, { once: true });
    const ttsTimer = window.setTimeout(() => ttsController.abort(), 32000);

    try {
      const response = await fetch('/api/angela/speech', {
        method: 'POST',
        signal: ttsController.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText }),
      });

      if (response.ok && response.headers.get('content-type')?.includes('audio/wav')) {
        const blob = await response.blob();
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const riff = new TextDecoder().decode(bytes.slice(0, 4));
        const wave = new TextDecoder().decode(bytes.slice(8, 12));
        if (bytes.byteLength >= 1000 && riff === 'RIFF' && wave === 'WAVE') {
          const normalized = new Blob([bytes], { type: 'audio/wav' });
          voiceQuotaCooldownUntil = 0;
          rememberSpeech(speechText, normalized);
          return normalized;
        }
        console.warn('Angela TTS notice: invalid WAV payload; using Live fallback');
      }

      const data = await response.json().catch(() => ({}));
      if (response.status === 429) {
        const retryAfterSeconds = Number(response.headers.get('retry-after'));
        const cooldownSeconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? Math.min(300, Math.max(15, retryAfterSeconds))
          : 60;
        voiceQuotaCooldownUntil = Date.now() + cooldownSeconds * 1000;
        console.warn('Angela direct TTS quota reached; using Live fallback.', data?.error || response.status);
      } else {
        console.warn('Angela TTS notice:', data?.error || response.status);
      }
    } catch (ttsError) {
      if (signal.aborted) throw ttsError;
      console.warn('Angela TTS notice; using Live fallback:', ttsError);
    } finally {
      window.clearTimeout(ttsTimer);
      signal.removeEventListener('abort', abortTts);
    }
  } else {
    console.warn('Angela direct TTS quota cooldown active; using Live fallback.');
  }

  // Short Live fallback only when the direct TTS endpoint is unavailable.
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return await fetchAngelaLiveSpeech(speechText, signal);
}

export function voiceErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  if (code === 'voice_not_configured') return 'Angela-র বাংলা female voice এখনও চালু হয়নি। আপাতত লেখা পড়ে নিতে পারেন।';
  if (code === 'voice_quota_exceeded' || code === 'live_voice_quota_exceeded') return 'Angela-র voice quota সাময়িকভাবে ব্যস্ত। একটু পরে Listen আবার চাপুন।';
  if (code === 'live_voice_timeout' || code === 'live_voice_unavailable') return 'Angela-র backup female voice সাময়িকভাবে পাওয়া যাচ্ছে না। একটু পরে Listen আবার চাপুন।';
  if (error instanceof Error && error.name === 'NotAllowedError') return 'শব্দ চালাতে উত্তরের Listen বোতামটি চাপুন।';
  return 'এই মুহূর্তে Angela-র বাংলা female voice চালানো যাচ্ছে না। Listen চেপে আবার চেষ্টা করুন।';
}


