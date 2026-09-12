# Angela Bengali speech deployment

The widget first uses a Bengali browser voice when available. Otherwise it POSTs reply text to the same site's /angela/speech Pages Function. That function uses Gemini TTS and returns a 24 kHz mono PCM WAV file. English browser voice and existing chat endpoints are retained.

## Required environment
Configure encrypted GEMINI_API_KEY (or a separate GEMINI_TTS_API_KEY) in the Pages project, separately for Preview and Production. No VITE_ prefix. GEMINI_TTS_MODEL is optional; default gemini-2.5-flash-preview-tts. ANGELA_SERVER_VOICE=off disables server audio.

Use a project with the intended billing and quota settings. A free tier exists but is limited; an API key does not prove free-tier eligibility. This change does not enable billing or buy credits. Public deployment needs provider quotas and appropriate abuse controls; same-origin validation is not authentication or a global rate limit.

## Verification before production
1. Deploy Preview with the runtime secret.
2. Select Bangla and ask for a short introduction.
3. Confirm Bengali text, then listen on a device without a Bengali browser voice.
4. Confirm audio starts and that mute, close, new question and language switch stop it.
5. If autoplay is blocked, tap Listen. Quota or missing configuration must show a readable error.
6. Verify the live domain routes /angela/speech to this Pages project; other Worker route patterns can intercept traffic.
7. Only promote after this test; keep the prior successful production deployment available.

## Validation scope
Mock tests cover request validation, missing secrets, provider failure, quota handling and WAV framing. Real provider output and device playback require Preview verification. No credentials, user text or generated audio are stored by this implementation. Google processes text sent for speech. No DNS, database, payment or external Worker deployment is changed.
