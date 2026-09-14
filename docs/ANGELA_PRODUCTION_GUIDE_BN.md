# Angela Production Operating Guide — journeyexpertbd.com

## Production source of truth

- Live domain: `https://journeyexpertbd.com`
- Source of truth: GitHub `main`
- Deployment target: Cloudflare Pages connected to GitHub
- AI Studio should be used for preview/testing only. Do not publish an older AI Studio snapshot over the GitHub production build.

## Working voice modes

Angela supports three user-facing modes:

1. **বাংলা** — Bangla text response + Angela voice.
2. **English** — English text response + Angela voice.
3. **Auto** — Bengali/Banglish input should route to Bangla; English input should route to English.

The production voice is intentionally locked to the `Aoede` prebuilt voice so the customer experience stays consistent.

## Voice delivery path

1. Browser receives Angela's text response.
2. `/angela/speech` gets one fast TTS attempt.
3. The primary TTS attempt has a 4-second ceiling.
4. If the provider is rate-limited, unavailable, invalid, or times out, the browser immediately uses the Gemini Live audio fallback.
5. Successful speech is cached in the browser for repeated Listen playback during the session.

This architecture avoids long serial waits across several TTS models.

## User operating instructions

- Keep the voice toggle ON.
- Select **বাংলা**, **English**, or **Auto** before speaking when you want a fixed language mode.
- Use the microphone button for speech input.
- If Chrome blocks first-time audio playback, press **Listen** once. This establishes the browser audio permission path.
- If a response is already visible but sound is temporarily unavailable, press **Listen** once before reloading the page.
- For a stale browser bundle after a production deployment, use **Ctrl + Shift + R** once.

## Do not change without explicit approval

The following production-critical files must not be edited casually:

- `src/lib/angelaAudio.ts`
- `src/components/AIChatAssistant.tsx`
- `functions/angela/speech.ts`
- `functions/api/gemini/chat.ts`
- `functions/api/gemini/live-token.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/live-monitor.yml`
- `public/sitemap.xml`
- `public/_redirects`
- `scripts/verify-production-contract.mjs`

Before changing these files, preserve the last known-good commit and run the complete CI and live production monitor after the change.

## Deployment rule

A production change is accepted only when all of the following are true:

- TypeScript check passes.
- Angela text API tests pass.
- Angela speech and Live-token tests pass.
- SEO/domain safety checks pass.
- Production contract guard passes.
- Production build succeeds.
- Live monitor confirms public routes, API health, Angela AI, Angela speech, and security checks.

## Search/SEO canonical rule

- Homepage canonical: `https://journeyexpertbd.com/`
- Other canonical routes use **no trailing slash**, for example:
  - `https://journeyexpertbd.com/about`
  - `https://journeyexpertbd.com/services`
  - `https://journeyexpertbd.com/ects-calculator`
- `sitemap.xml`, generated canonical tags, and internal SEO links must use the same convention.

## If Angela voice breaks later

Check in this order:

1. Confirm text replies still work.
2. Confirm English, Bangla, and Auto separately.
3. Check `/angela/speech` production status.
4. Check Gemini Live token endpoint and browser WebSocket fallback.
5. Check for provider 429/5xx or timeout.
6. Check Chrome audio permission / muted tab / output device.
7. Check the latest GitHub CI and live-monitor run.
8. Do not replace the full voice architecture until the exact failing layer is identified.

## Performance target

The primary speech provider is allowed only a short attempt before the system hands off to the Live fallback. This is designed to reduce the time between text appearing and Angela beginning to speak while preserving the working Bangla/English/Auto behavior.
