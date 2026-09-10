# ANGELA AI VOICE ASSISTANT — ARCHITECTURE & PRODUCTION AUDIT REPORT
**Journey Expert Limited (JEL) — https://journeyexpertbd.com**
*Date: September 2026 | Environment: Google AI Studio / Cloud Run / Vite + React 19 + Express Full-Stack*

---

## 1. Executive Summary

This audit examines the existing Journey Expert Limited (JEL) web application codebase to assess the current implementation of **Angela**, the official AI Customer & Voice Assistant. The goal is to consolidate all assistant touchpoints into **ONE authoritative Angela system**, establish the appropriate production voice architecture, enforce strict security, eliminate duplicates, and prepare for a production-ready bilingual conversational experience.

**Critical Directive Compliance**: No code modifications were made during this audit phase.

---

## 2. Current Architecture Inventory

| Architectural Layer | Current Specification | Notes |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`react@^19.0.1`, `react-dom@^19.0.1`) | Functional components, modern hooks |
| **Build & Bundler** | Vite 6 (`vite@^6.2.3`), TypeScript 5.8.2 (`tsc --noEmit`) | ESM dev server, dual build (client + server) |
| **Styling & UI** | Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`), `motion@^12.23.24`, Lucide icons (`lucide-react@^0.546.0`) | Dark/Light mode support, mobile-first utilities |
| **Backend Server** | Express 4.21.2 (`server.ts`), compiled via `esbuild` to CommonJS (`dist/server.cjs`) | Handles SSR/Vite dev middleware & REST endpoints on port 3000 |
| **Database & CRM** | Supabase (`@supabase/supabase-js@^2.108.2`) + Firestore (`src/lib/firebase.ts`) | Hybrid storage for leads, student transactions, bookings |
| **Payment Gateway** | SSLCOMMERZ (Bangladesh national gateway) | Initiates transactions, IPN/callback handling |
| **AI SDK** | `@google/genai@^2.4.0` | Official Google GenAI TypeScript SDK |
| **Deployment Target** | Cloud Run container / Docker / Netlify / Cloudflare Pages compatible | Static pre-rendering (`scripts/prerender-seo.mjs`), `public/_headers` |

---

## 3. File-by-File Angela & Assistant Components

### A. Primary Component: `src/components/AIChatAssistant.tsx`
- **Current Role**: Hosts the floating button and expanded conversation window for Angela.
- **Exports**: `export function AIChatAssistant()` and alias `export { AIChatAssistant as AngelaVoiceAssistant }`.
- **Rendered In**: `src/App.tsx` (Line 739: `<AIChatAssistant />`).
- **Features Implemented**:
  - Two-way voice loop (Microphone Speech Recognition via Web Speech API → Server AI request → Text-to-Speech playback via `window.speechSynthesis`).
  - Bilingual mode toggle (`Auto`, `EN`, `বাংলা`).
  - Voice mute toggle (`localStorage` persistence).
  - Basic barge-in/conversational interruption (`stopSpeaking()` invoked when user taps microphone or clicks "Stop").
  - Direct human counselor handoff buttons (WhatsApp `+8801926400400`, Phone, Booking).
  - Anti-hallucination compliance badge.

### B. Secondary / Duplicate AI Modal: `src/components/HomeView.tsx` (Lines 552-678)
- **Current Role**: Renders 6 "AI-Powered Student Services" cards.
  - Card 5 ("AI SOP Assistant") and Card 6 ("AI Career Path Advisor") have `interactive: true`.
  - When clicked, invokes `handleAIModalLaunch(...)`.
- **Defect Identified**: `handleAIModalLaunch` makes a POST request to `/api/chat` (Line 244).
  - **Fatal Issue**: `/api/chat` does NOT exist in `server.ts`! The request fails, triggering a catch-block fallback simulation.
  - **Assessment**: This is a competing/duplicate assistant modal that creates confusion and fragments the customer experience.

### C. Server-Side Assistant Engine: `server.ts` (Lines 617-665)
- **Current Role**: Implements `handleAngelaChat` bound to `POST /api/gemini/chat` and `POST /api/gemini/angela`.
- **System Prompt**: `ANGELA_SYSTEM_PROMPT` contains:
  - Non-human declaration.
  - Anti-fabrication rules (no visa guarantees, no fabricated ticket prices or hotel reservations).
  - Bilingual and Banglish adaptive guidance.
  - JEL office coordinates (189/A, Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka-1208).
- **Model**: Currently configured with `gemini-3.5-flash` with fallback handling.

---

## 4. Current Voice Architecture vs. Target Voice Architecture

### Current Voice Architecture (Turn-Based Hybrid):
1. **Audio Input**: Browser `webkitSpeechRecognition` / `SpeechRecognition` transcribes speech to text in real time.
2. **Transport**: JSON payload over HTTP POST to `/api/gemini/chat`.
3. **Reasoning**: Server-side Gemini model processes prompt.
4. **Audio Output**: Browser `window.speechSynthesis` speaks text response using browser's built-in Bengali or English TTS voices.
5. **Barge-in**: Manual cancellation of `window.speechSynthesis` when user initiates new input.

### Target Voice Architecture (Two Options Analyzed):

#### Option A: Gemini Live API (Direct Multimodal WebSocket Stream)
- **Mechanism**: Client establishes a bidirectional WebSocket stream directly or via server proxy using `gemini-3.1-flash-live-preview`. Audio is streamed as raw PCM chunks in both directions with server-managed ephemeral tokens.
- **Constraints & Environment Realities**:
  - Requires `gemini-3.1-flash-live-preview` (paid billing model requirement).
  - Requires WebSocket server proxy or ephemeral token issuance endpoint.
  - Complex browser audio context PCM resampling (16kHz or 24kHz 16-bit PCM input, 24kHz PCM output).
  - Mobile browser backgrounding and network latency in Bangladesh can cause audio packet jitter.

#### Option B: Low-Latency Bidirectional Streaming + Native Web Speech Voice Pipeline
- **Mechanism**:
  - Real-time Web Speech recognition for low-latency zero-bandwidth client speech-to-text.
  - Streaming Server-Sent Events (SSE) from server-side Gemini (`ai.models.generateContentStream`).
  - Sentence-level chunked Text-to-Speech synthesis with instant barge-in detection and cancel event.
  - 100% responsive fallback for text, mobile Safari, and low-connectivity environments.

---

## 5. Current API Architecture

| Endpoint | Method | Function | Status |
| :--- | :--- | :--- | :--- |
| `/api/health` | GET | Status check, verifies AI and DB connectivity | Healthy |
| `/api/gemini/chat` | POST | Primary conversation endpoint for Angela | Active |
| `/api/gemini/angela` | POST | Dedicated alias for Angela | Active |
| `/api/gemini/sop-generator`| POST | Academic Statement of Purpose generator | Active |
| `/api/gemini/course-finder` | POST | Program recommendation engine | Active |
| `/api/gemini/eligibility` | POST | Visa & admission eligibility score engine | Active |
| `/api/chat` | POST | Referenced in `HomeView.tsx` | **BROKEN (404 - Missing)** |
| `/api/supabase/*` | GET/POST | Leads & bookings persistence | Active |
| `/api/sslcommerz/*` | GET/POST | Payment initiation, transactions & callbacks | Active |

---

## 6. Security Audit Findings

1. **API Key Safety (PASSED)**:
   - `GEMINI_API_KEY` is strictly accessed in `server.ts` via `process.env.GEMINI_API_KEY`.
   - No `VITE_GEMINI_API_KEY` exists in any client-side file.
   - Client never receives or transmits the raw Gemini API key.
2. **Permissions Policy Conflict (CRITICAL VULNERABILITY)**:
   - In `public/_headers` (Line 10):
     `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - **Impact**: This header explicitly **FORBIDS microphone access** in compliant production browsers (e.g. Cloudflare Pages or Netlify).
   - **Correction Required**: Update to `Permissions-Policy: camera=(), microphone=(self), geolocation=()`.
3. **Prompt Injection & Persona Protection**:
   - `ANGELA_SYSTEM_PROMPT` enforces non-human identity and anti-fabrication rules.
   - Needs reinforcement to prevent prompt leakage and strict boundaries regarding unconfirmed ticket prices or visa outcomes.

---

## 7. Responsive & UI Audit Findings

1. **Floating Action Button Collision (Desktop & Mobile)**:
   - `src/App.tsx` has a floating conversion bar (`#floating-conversion-widget`) at `bottom-6 right-6` with WhatsApp, Messenger, Helpline, and "Get Free Guide" buttons.
   - `AIChatAssistant.tsx` is also placed at `bottom-6 right-6`.
   - **Visual Defect**: On certain screen widths, the Angela floating avatar overlaps or stacks awkwardly against the WhatsApp/Messenger buttons.
   - **Correction Required**: Coordinate positioning so Angela has a dedicated, non-overlapping floating presence with high-contrast accessibility.
2. **Mobile Screen Testing (320px - 430px)**:
   - At 320px, `w-[calc(100vw-32px)]` fits within the viewport, but inner padding needs strict calculation so input fields and buttons do not cause horizontal scrolling.
   - Touch targets must meet the minimum 44x44px standard for mobile usability.
3. **Landscape Mobile**:
   - Max height must be constrained (`max-h-[85vh]`) so keyboard popup on iOS/Android does not occlude the conversation thread.

---

## 8. Duplicate / Obsolete Components

| Component | Location | Issue | Recommendation |
| :--- | :--- | :--- | :--- |
| `handleAIModalLaunch` Modal | `src/components/HomeView.tsx` (Lines 552-678) | Redundant secondary AI modal making broken calls to `/api/chat` | **CONSOLIDATE**: Route all AI interactions directly to Angela or connect `/api/chat` to `handleAngelaChat`. When user clicks "Launch SOP Draftsman" or "AI Career Path Advisor", launch Angela with that preset inquiry. |
| Multiple floating widgets | `src/App.tsx` vs `src/components/AIChatAssistant.tsx` | Overlapping floating controls at `bottom-6 right-6` | **ALIGN**: Adjust z-index, margin offsets, or integrate WhatsApp/Call triggers cleanly inside or beside Angela's dock. |

---

## 9. Comprehensive Knowledge Base Verification

Angela must represent both **Journey Expert Limited (Travel & Aviation)** and **JEL Study Abroad**:
- **Organization**: Journey Expert Limited (JEL)
- **Websites**: `https://journeyexpertbd.com`, `https://journeyexpertltd.com`
- **Slogan**: *"Your Journey, Our Expertise"*
- **Mission**: *"Building Bangladesh’s Next-Generation AI-Driven Travel Ecosystem"*
- **Head Office**: 189/A (2nd Floor), Abdul Motin Complex, Hazi Moron Ali Road, Nabisco Mor, Tejgaon, Dhaka-1215, Bangladesh
- **Direct Contacts**: WhatsApp: +8801926400400 | Tel: +88029830404 | Email: journeyexpertbd@gmail.com
- **Services Coverage**:
  1. *Air Ticketing & Flight Assistance* (domestic & international airlines)
  2. *Visa Assistance* (Tourist, Visit, Business, Medical, Student, Work visas)
  3. *Tours & Packages* (Domestic, International, Hajj & Umrah, Halal Tourism, Medical Tourism)
  4. *Travel Logistics* (Hotel Booking, Travel Insurance, Corporate Travel Management, Meet & Greet)
  5. *Study Abroad* (UK, Canada, Australia, USA, Ireland, New Zealand, Malaysia, Europe admissions, SOP review, scholarship filing)
- **Truth In Advertising Guardrails**:
  - Never guarantee visa issuance or specific processing dates.
  - Never fabricate ticket prices or flight seats without live agent verification.

---

## 10. Decisions: KEEP / FIX / REMOVE / ADD

| Decision | Target Item | Action Plan |
| :--- | :--- | :--- |
| **KEEP** | `src/components/AIChatAssistant.tsx` as the core assistant container | Preserve component path and aliases for zero-regression backward compatibility. |
| **KEEP** | Server-side `@google/genai` architecture in `server.ts` | Maintains 100% secret safety with zero browser key exposure. |
| **FIX** | `public/_headers` Permissions-Policy | Change `microphone=()` to `microphone=(self)` to unblock production microphone usage. |
| **FIX** | `HomeView.tsx` broken `/api/chat` call | Route query to Angela or open the unified Angela assistant with prompt context pre-filled. |
| **FIX** | Floating layout conflict in `src/App.tsx` | Ensure Angela floating launcher and floating conversion bar coexist harmoniously without overlapping. |
| **FIX** | Model selection in `server.ts` | Upgrade `gemini-3.5-flash` to official `gemini-3.8-flash` for text reasoning, in full alignment with `@google/genai` standards. |
| **ADD** | Real-time voice states | Explicitly reflect `READY`, `LISTENING`, `THINKING`, `SPEAKING`, and `ERROR` in the Angela UI. |
| **ADD** | Conversational Interruption (Barge-in) | Audio playback instantly halts when user speaks or activates microphone. |
| **ADD** | Unified JEL Travel & Study Abroad System Prompt | Full knowledge base covering air tickets, visas, tours, and study abroad. |
| **ADD** | Production Readiness Verification Report | Generate `ANGELA_PRODUCTION_READINESS_REPORT.md` following implementation and testing. |

---
*End of Phase 1 Audit Report.*
