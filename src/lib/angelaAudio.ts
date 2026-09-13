export async function fetchAngelaSpeech(text: string, signal: AbortSignal): Promise<Blob> {
  const response = await fetch('/angela/speech', {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'voice_provider_unavailable');
  }
  if (!response.headers.get('content-type')?.includes('audio/wav')) throw new Error('invalid_audio');
  return response.blob();
}

export function voiceErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  if (code === 'voice_not_configured') return 'বাংলা কণ্ঠসেবা এখনও চালু হয়নি। আপাতত লেখা পড়ে নিতে পারেন।';
  if (code === 'voice_quota_exceeded') return 'কণ্ঠসেবার ব্যবহারের সীমা শেষ হয়েছে। আপাতত লেখা পড়ে নিতে পারেন।';
  if (error instanceof Error && error.name === 'NotAllowedError') return 'শব্দ চালাতে উত্তরের Listen বোতামটি চাপুন।';
  return 'এই মুহূর্তে বাংলা কণ্ঠ চালানো যাচ্ছে না। Listen চেপে আবার চেষ্টা করুন।';
}
