import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Mic, MicOff, Volume2, VolumeX, Square, Send, X, Sparkles, 
  Phone, MessageCircle, Mail, Globe, RefreshCw, Maximize2, Minimize2, 
  Copy, Check, ExternalLink, Headphones, ShieldCheck, User, MessageSquare,
  AlertCircle, Radio, Plane, Compass, Award, Building2, MapPin
} from "lucide-react";
import { ChatMessage } from "../types";
import { fetchAngelaSpeech, voiceErrorMessage } from "../lib/angelaAudio";
import { AngelaPlayback } from "../lib/angelaPlayback";

const jelBrandIcon = new URL("../assets/images/jel-study-abroad-official.webp", import.meta.url).href;

const ENGLISH_WELCOME = "Assalamu Alaikum. I am Angela, the official AI voice assistant for Journey Expert Limited. You can speak to me in Bangla or English about air tickets, visas, tours, hotels, Hajj and Umrah, Study Abroad, medical tourism, insurance, corporate travel, Meet & Greet, and other verified JEL services. How can I help you?";

const BANGLA_WELCOME = "আসসালামু আলাইকুম। আমি অ্যাঞ্জেলা, Journey Expert Limited-এর AI সহকারী। ভ্রমণ, ভিসা, হজ ও উমরাহ, Study Abroad এবং JEL-এর অন্যান্য সেবা নিয়ে কীভাবে সাহায্য করতে পারি?";

function getInstantConversationReply(text: string, selectedLanguage: "bn" | "en") {
  const q = text.toLowerCase().replace(/\s+/g, " ").trim();
  const asksBangla = /(বাংলা|বাংলায়|বাংলায়|bangla|bengali|bengla)/i.test(q)
    && /(কথা|বলতে|বুঝতে|পারো|পারেন|পারবে|পারবেন|speak|talk|understand)/i.test(q)
    && q.length < 180;
  const hasServiceQuestion = /hotline|phone|contact|whatsapp|হটলাইন|ফোন|নম্বর|নাম্বার|যোগাযোগ|visa|ভিসা|ticket|টিকিট|umrah|উমরাহ|হজ|study|পড়াশোনা|পড়াশোনা|সার্ভিস|service/i.test(q);
  if (asksBangla && !hasServiceQuestion) {
    return {
      language: "bn" as const,
      text: "হ্যাঁ, অবশ্যই। আমি বাংলায় কথা বলতে ও উত্তর দিতে পারি। আপনি বাংলা, Banglish বা English-এ প্রশ্ন করতে পারেন। কীভাবে সাহায্য করতে পারি?",
    };
  }
  const greetingOnly = /^(?:hi|hello|hey|হ্যালো|হাই|সালাম|আসসালামু আলাইকুম)(?:\s+(?:angela|অ্যাঞ্জেলা))?[!?.,\s]*$/i.test(q);
  if (greetingOnly) {
    return selectedLanguage === "bn"
      ? { language: "bn" as const, text: "ওয়ালাইকুম আসসালাম। আমি অ্যাঞ্জেলা, Journey Expert Limited-এর AI সহকারী। বলুন, কীভাবে সাহায্য করতে পারি?" }
      : { language: "en" as const, text: "Wa Alaikum Assalam. I’m Angela, Journey Expert Limited’s AI assistant. How can I help you?" };
  }
  return null;
}

function resolveAngelaLanguage(text: string, current: "bn" | "en"): "bn" | "en" {
  if (/(?:in|speak|reply|answer|respond|explain)\s+(?:in\s+)?english\b|ইংরেজিতে|ইংলিশে/i.test(text)) return "en";
  if (/(?:in|speak|reply|answer|respond|explain)\s+(?:in\s+)?(?:bangla|bengali)\b|বাংলায়|বাংলায়/i.test(text)) return "bn";
  if (/[\u0980-\u09ff]/.test(text)) return "bn";
  if (/\b(?:ami|amar|apni|apnar|apnader|tumi|tomar|kivabe|kibhabe|koto|chai|chachi|bolun|korbo|achen|ache)\b/i.test(text)) return "bn";
  if (/\b(?:what|where|when|how|please|could|would|explain|tell|your|services)\b/i.test(text)) return "en";
  return current;
}

const isBanglaText = (text: string) => /[\u0980-\u09FF]/.test(text);
const welcomeFor = (mode: "en" | "bn") => mode === "bn" ? BANGLA_WELCOME : ENGLISH_WELCOME;

const BANGLA_FEMALE_HINTS = ["nabanita", "nabanita online", "tanishaa", "lekha", "sangeeta", "heera", "female", "woman", "google bengali", "google bangla", "google বাংলা", "microsoft nabanita", "microsoft নবানিতা"];
const BANGLA_MALE_HINTS = ["pradeep", "pradip", "bhashkar", "bhaskar", "bashkar", "male", "man"];
const ENGLISH_FEMALE_HINTS = ["zira", "aria", "jenny", "sonia", "samantha", "victoria", "ava", "allison", "karen", "susan", "hazel", "libby", "natasha", "serena", "moira", "fiona", "tessa", "veena", "female", "woman", "google uk english female"];

// DEVICE_FIRST_ANGELA_VOICE: prefer a verified female device voice first; only then use server/Live speech fallback.
function pickAngelaDeviceVoice(voices: SpeechSynthesisVoice[], language: "bn" | "en"): SpeechSynthesisVoice | null {
  // STRICT_FEMALE_ONLY: never let a language-only match select an arbitrary
  // default voice. If an explicitly female voice cannot be identified, Angela
  // stays text-only instead of ever falling back to a male/default voice.
  const femaleHints = language === "bn" ? BANGLA_FEMALE_HINTS : ENGLISH_FEMALE_HINTS;
  const maleHints = language === "bn" ? BANGLA_MALE_HINTS : ["david", "mark", "george", "daniel", "guy", "male", "man"];
  const eligible = voices.filter((voice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    const femaleNamed = femaleHints.some((hint) => name.includes(hint));
    const maleNamed = maleHints.some((hint) =>
      hint === "male" || hint === "man"
        ? name.split(/[^a-z]+/).includes(hint)
        : name.includes(hint));
    const languageMatch = language === "bn"
      ? (lang.startsWith("bn") || /bangla|bengali/.test(name))
      : lang.startsWith("en");
    return femaleNamed && !maleNamed && languageMatch;
  });
  const score = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let value = 0;
    if (language === "bn") {
      if (lang.startsWith("bn-bd")) value += 130;
      else if (lang.startsWith("bn-in")) value += 120;
      else if (lang.startsWith("bn")) value += 110;
      else if (/bangla|bengali/.test(name)) value += 90;
    } else if (lang.startsWith("en")) {
      value += 110;
    }
    if (femaleHints.some((hint) => name.includes(hint))) value += 100;
    if (voice.default) value += 4;
    if (voice.localService) value += 3;
    return value;
  };
  return eligible
    .map((voice) => ({ voice, score: score(voice) }))
    .sort((a, b) => b.score - a.score)[0]?.voice || null;
}

function pickOpeningGreetingVoice(voices: SpeechSynthesisVoice[], language: "bn" | "en"): SpeechSynthesisVoice | null {
  // Opening greeting must follow the exact same female-only contract as every
  // other Angela utterance. Never relax to a language-only/default voice,
  // because those catalog entries can resolve to male voices on Windows,
  // Android, iOS, or vendor-specific speech engines.
  return pickAngelaDeviceVoice(voices, language);
}

// Voice States according to Phase 6 specifications
export type AngelaVoiceState = "READY" | "LISTENING" | "THINKING" | "SPEAKING" | "ERROR";

// Web Speech API interface declarations
interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionLike, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => any) | null;
  onerror: ((this: SpeechRecognitionLike, ev: any) => any) | null;
  onend: ((this: SpeechRecognitionLike, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const playbackRef = useRef<AngelaPlayback | null>(null);
  if (!playbackRef.current) playbackRef.current = new AngelaPlayback();
  const inputGenerationRef = useRef(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [languageMode, setLanguageMode] = useState<"en" | "bn">("bn");
  const languageModeRef = useRef<"en" | "bn">("bn");
  const [voiceState, setVoiceState] = useState<AngelaVoiceState>("READY");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-angela-jel",
      sender: "assistant",
      text: BANGLA_WELCOME,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speechAttemptRef = useRef(0);
  const serverSpeechRef = useRef<AbortController | null>(null);
  const serverAudioRef = useRef<HTMLAudioElement | null>(null);
  const reusableAudioRef = useRef<HTMLAudioElement | null>(null);
  const serverAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const voiceCatalogRef = useRef<SpeechSynthesisVoice[]>([]);
  const stopServerAudio = () => {
    serverSpeechRef.current?.abort();
    serverSpeechRef.current = null;
    const source = serverAudioSourceRef.current;
    if (source) {
      source.onended = null;
      try { source.stop(); } catch { /* already stopped */ }
      try { source.disconnect(); } catch { /* already disconnected */ }
    }
    serverAudioSourceRef.current = null;
    const audio = serverAudioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      if (audio.src.startsWith("blob:")) URL.revokeObjectURL(audio.src);
      audio.removeAttribute("src");
      try { audio.load(); } catch { /* no-op */ }
    }
    serverAudioRef.current = null;
  };
  const unlockAudio = async () => {
    playbackRef.current?.prime();
    if (typeof window === "undefined") return null;
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return null;
    try {
      let context = audioContextRef.current;
      if (!context || context.state === "closed") {
        context = new AudioContextCtor();
        audioContextRef.current = context;
      }
      if (context.state === "suspended") await context.resume();
      // A zero-volume Web Audio source started during the click/mic/send gesture
      // makes later async TTS playback reliable under Chrome autoplay policy.
      if (context.state === "running") {
        try {
          const buffer = context.createBuffer(1, 1, 22050);
          const source = context.createBufferSource();
          const gain = context.createGain();
          gain.gain.value = 0;
          source.buffer = buffer;
          source.connect(gain);
          gain.connect(context.destination);
          source.start(0);
        } catch { /* audio context is already usable */ }
      }
      return context;
    } catch {
      return null;
    }
  };
  const requestRef = useRef<AbortController | null>(null);
  const enabledRef = useRef(isVoiceEnabled);
  enabledRef.current = isVoiceEnabled;
  const cancelPending = () => {
    inputGenerationRef.current += 1;
    if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
    recordingTimeoutRef.current = null;
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (recorder) {
      recorder.onstop = recorder.ondataavailable = recorder.onerror = null;
      if (recorder.state === "recording") recorder.stop();
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    mediaChunksRef.current = [];
    requestRef.current?.abort();
    requestRef.current = null;
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition.onend = recognition.onresult = recognition.onerror = recognition.onstart = null;
      try { recognition.abort(); } catch { /* recognition already ended */ }
    }
  };

  // Auto-scroll on conversation update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, voiceState, interimTranscript]);

  useEffect(() => {
    try { localStorage.removeItem("jel_angela_voice_muted"); } catch { /* Storage may be disabled. */ }
  }, []);

  // Prefer MediaRecorder + server-side Gemini transcription for consistent
  // mobile/desktop input. Browser SpeechRecognition remains a compatibility fallback.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recorderSupported = typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
      setSpeechSupported(Boolean(recorderSupported || SpeechRec));
    }
  }, []);

  // Preload the OS/browser voice catalogue before the customer opens Angela.
  // This avoids selecting the first arbitrary Bengali voice on Windows/Android/macOS.
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const syncVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) voiceCatalogRef.current = voices;
    };
    syncVoices();
    window.speechSynthesis.addEventListener("voiceschanged", syncVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", syncVoices);
  }, []);

  // Voice toggle handler
  const toggleVoiceOutput = () => {
    const nextState = !isVoiceEnabled;
    if (nextState) void unlockAudio();
    enabledRef.current = nextState;
    if (!nextState) { playbackRef.current?.cancel(); speechAttemptRef.current += 1; stopServerAudio(); setVoiceState("READY"); setActiveSpeakingId(null); }
    setIsVoiceEnabled(nextState);
    if (!nextState && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (voiceState === "SPEAKING") {
        setVoiceState("READY");
        setActiveSpeakingId(null);
      }
    }
  };

  // Conversational interruption / Barge-in
  const stopSpeaking = useCallback(() => {
    playbackRef.current?.cancel();
    speechAttemptRef.current += 1;
    stopServerAudio();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onerror = null;
      currentUtteranceRef.current.onstart = null;
      currentUtteranceRef.current = null;
    }
    setActiveSpeakingId(null);
    setVoiceState((prev) => (prev === "SPEAKING" ? "READY" : prev));
  }, []);

  const changeLanguage = (mode: "en" | "bn") => {
    cancelPending();
    stopSpeaking();
    languageModeRef.current = mode;
    setLanguageMode(mode);
    setMessages((current) => {
      const isWelcomeOnly = current.length === 1 && current[0].sender === "assistant" && current[0].id.includes("welcome");
      return isWelcomeOnly ? [{ ...current[0], text: welcomeFor(mode) }] : current;
    });
    setVoiceState("READY");
    setErrorMessage(null);
  };

  // Text-to-speech engine with natural voice matching
  const speakText = useCallback(async (text: string, messageId?: string) => {
    if (!enabledRef.current) { setVoiceState("READY"); return; }
    setVoiceState("READY"); // The answer is complete even while its audio is loading.
    const currentVoices = window.speechSynthesis?.getVoices() || [];
    const voices = currentVoices.length ? currentVoices : voiceCatalogRef.current;
    const voice = text === BANGLA_WELCOME ? null : pickAngelaDeviceVoice(voices, isBanglaText(text) ? "bn" : "en");
    await playbackRef.current!.play(text, voice, fetchAngelaSpeech,
      speaking => {
        setVoiceState(speaking ? "SPEAKING" : "READY");
        setActiveSpeakingId(speaking ? messageId || null : null);
        if (speaking) setErrorMessage(null);
      }, error => setErrorMessage(voiceErrorMessage(error)));
  }, []);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      playbackRef.current?.cancel();
      speechAttemptRef.current += 1;
      stopServerAudio();
      cancelPending();
      if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        try { mediaRecorderRef.current.stop(); } catch { /* already stopped */ }
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Send message to server-side Angela Gemini engine
  const handleSendMessage = async (textToSend: string, triggeredByVoice: boolean = false) => {
    void unlockAudio();
    const trimmed = textToSend.trim();
    if (!trimmed) return;
    cancelPending();
    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 9000);

    // Barge-in: interrupt any current speech synthesis immediately
    stopSpeaking();
    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setInterimTranscript("");
    setVoiceState("THINKING");

    const requestedLanguage = resolveAngelaLanguage(trimmed, languageModeRef.current);
    languageModeRef.current = requestedLanguage;
    setLanguageMode(requestedLanguage);
    const instantReply = getInstantConversationReply(trimmed, requestedLanguage);
    if (instantReply) {
      clearTimeout(timer);
      if (requestRef.current === controller) requestRef.current = null;
      languageModeRef.current = instantReply.language;
      setLanguageMode(instantReply.language);
      const assistantMsgId = `m-${Date.now() + 1}`;
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        sender: "assistant",
        text: instantReply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      if (isVoiceEnabled || triggeredByVoice) void speakText(instantReply.text, assistantMsgId);
      else setVoiceState("READY");
      return;
    }

    try {
      const selectedLanguage = languageModeRef.current;
      const historyContext = [...messages, userMsg].slice(-8);
      const response = await fetch("/api/gemini/chat", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: historyContext,
          language: selectedLanguage,
          source: triggeredByVoice ? "voice" : "text"
        })
      });

      if (!response.ok) {
        throw new Error("Angela server synchronization issue");
      }

      const data = await response.json();
      if (requestRef.current !== controller) return;
      const responseLanguage = data.language === "en" ? "en" : data.language === "bn" ? "bn" : selectedLanguage;
      languageModeRef.current = responseLanguage;
      setLanguageMode(responseLanguage);
      const wantsBangla = responseLanguage === "bn";
      const replyText = data.reply || (wantsBangla
        ? "আপনার প্রশ্নটি প্রক্রিয়া করা যাচ্ছে না। দ্রুত সহায়তার জন্য JEL কাউন্সেলরের সঙ্গে +8801926400400 নম্বরে যোগাযোগ করুন।"
        : "I am processing your inquiry. Please reach out to our JEL Counselors at +8801926400400 for immediate assistance.");
      
      const assistantMsgId = `m-${Date.now() + 1}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Speak response if voice enabled
      if (isVoiceEnabled || triggeredByVoice) {
        speakText(replyText, assistantMsgId);
      } else {
        setVoiceState("READY");
      }
    } catch (error) {
      if (requestRef.current !== controller) return;
      console.error("Angela Chat Error:", error);
      // Phase 12: Never display technical stack traces to customers
      const wantsBangla = languageModeRef.current === "bn";
      const friendlyError = wantsBangla
        ? "এই মুহূর্তে উত্তর দিতে পারছি না। আবার চেষ্টা করুন অথবা JEL-এর সঙ্গে সরাসরি যোগাযোগ করুন।"
        : "I'm temporarily unable to respond. Please try again or contact JEL directly.";
      setErrorMessage(friendlyError);
      // A single network/provider failure must never lock Angela in ERROR.
      // Keep the conversation immediately reusable for the next turn.
      setVoiceState("READY");

      const errorMsg: ChatMessage = {
        id: `m-err-${Date.now()}`,
        sender: "assistant",
        text: wantsBangla
          ? "আপনার অনুরোধটি এই মুহূর্তে প্রক্রিয়া করা যাচ্ছে না। WhatsApp বা ফোনে 01926400400 (+8801926400400) নম্বরে আমাদের কাউন্সেলরের সঙ্গে যোগাযোগ করুন।"
          : "I'm temporarily unable to process your request. Please contact our counselors by WhatsApp or phone at 01926400400 (+8801926400400).",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      clearTimeout(timer);
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  const blobToBase64 = async (blob: Blob): Promise<string> => {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
    }
    return btoa(binary);
  };

  const transcribeRecordedAudio = async (blob: Blob): Promise<string> => {
    if (!blob.size) throw new Error("empty_audio");
    if (blob.size > 2_500_000) throw new Error("audio_too_large");
    const audio = await blobToBase64(blob);
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      signal: AbortSignal.timeout(7000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "transcribe",
        audio,
        mimeType: (blob.type || "audio/webm").split(";")[0],
        language: languageModeRef.current,
      }),
    });
    const data = await response.json().catch(() => ({}));
    const transcript = typeof data.transcript === "string" ? data.transcript.trim() : "";
    if (!response.ok || !transcript) throw new Error(data.error || "transcription_failed");
    return transcript;
  };

  const startBrowserRecognitionFallback = (notice?: string) => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMessage(languageModeRef.current === "bn"
        ? "এই ব্রাউজারে microphone transcription চালু করা যাচ্ছে না। নিচে লিখে প্রশ্ন করুন।"
        : "Microphone transcription is unavailable in this browser. Please type your question.");
      setVoiceState("ERROR");
      return;
    }

    if (recognitionRef.current) {
      const previous = recognitionRef.current;
      recognitionRef.current = null;
      previous.onend = null;
      try { previous.abort(); } catch { /* previous recognition already ended */ }
    }

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageModeRef.current === "bn" ? "bn-BD" : "en-US";

    let finalTranscript = "";
    let latestInterim = "";
    let recognitionFailed = false;

    recognition.onstart = () => {
      setVoiceState("LISTENING");
      setInterimTranscript("");
      setErrorMessage(notice || null);
    };
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      finalTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) finalTranscript += res[0].transcript;
        else interim += res[0].transcript;
      }
      latestInterim = interim;
      setInterimTranscript(interim || finalTranscript);
    };
    recognition.onerror = (event: any) => {
      recognitionFailed = true;
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setInterimTranscript("");
      if (event.error === "no-speech") {
        setVoiceState("READY");
        return;
      }
      setErrorMessage(event.error === "not-allowed"
        ? (languageMode === "bn" ? "Microphone permission বন্ধ আছে। Browser settings থেকে Allow করুন।" : "Microphone permission is blocked. Allow it in browser settings.")
        : (languageMode === "bn" ? "আপনার কথা শোনা যায়নি। আবার চেষ্টা করুন বা লিখুন।" : "Voice input could not be heard. Please try again or type."));
      setVoiceState("ERROR");
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition || recognitionFailed) return;
      recognitionRef.current = null;
      const spoken = finalTranscript.trim() || latestInterim.trim();
      setInterimTranscript("");
      if (spoken) handleSendMessage(spoken, true);
      else setVoiceState("READY");
    };

    try { recognition.start(); }
    catch {
      setErrorMessage(languageMode === "bn" ? "Microphone চালু করা যায়নি। নিচে লিখে প্রশ্ন করুন।" : "Microphone could not be started. Please type your question.");
      setVoiceState("ERROR");
    }
  };

  // Primary cross-device microphone path: record audio, transcribe it on the
  // same-origin Gemini endpoint, then send the transcript to Angela's existing brain.
  const startListening = async () => {
    void unlockAudio();
    cancelPending();
    stopSpeaking();
    setErrorMessage(null);
    setInterimTranscript("");

    if (typeof window === "undefined") return;
    setVoiceState("LISTENING");
    const generation = inputGenerationRef.current;

    // LOW_LATENCY_VOICE_INPUT: browser speech recognition is usually much faster
    // than record-upload-transcribe and uses no Gemini transcription quota.
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      startBrowserRecognitionFallback();
      return;
    }

    const recorderSupported = typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
    if (!recorderSupported) {
      startBrowserRecognitionFallback();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== inputGenerationRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
      mediaStreamRef.current = stream;
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      mediaChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) mediaChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setVoiceState("ERROR");
        setErrorMessage(languageMode === "bn" ? "Microphone recording-এ সমস্যা হয়েছে। আবার চেষ্টা করুন।" : "Microphone recording failed. Please try again.");
      };
      recorder.onstop = async () => {
        if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
        mediaRecorderRef.current = null;
        stream.getTracks().forEach((track) => track.stop());
        if (mediaStreamRef.current === stream) mediaStreamRef.current = null;

        const blob = new Blob(mediaChunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        mediaChunksRef.current = [];
        setVoiceState("THINKING");
        try {
          const transcript = await transcribeRecordedAudio(blob);
          if (generation !== inputGenerationRef.current) return;
          setInterimTranscript(transcript);
          await handleSendMessage(transcript, true);
        } catch {
          if (generation !== inputGenerationRef.current) return;
          setInterimTranscript("");
          const notice = languageMode === "bn"
            ? "Cloud transcription ব্যস্ত। Angela browser voice recognition দিয়ে আবার শুনছে—প্রশ্নটি আরেকবার বলুন।"
            : "Cloud transcription is busy. Angela is listening again with browser voice recognition—please repeat your question.";
          if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            startBrowserRecognitionFallback(notice);
          } else {
            setErrorMessage(languageMode === "bn"
              ? "Cloud transcription এখন পাওয়া যাচ্ছে না। নিচে লিখে প্রশ্ন করুন।"
              : "Cloud transcription is unavailable right now. Please type your question.");
            setVoiceState("ERROR");
          }
        }
      };

      recorder.start(250);
      setVoiceState("LISTENING");
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 12000);
    } catch (error: any) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        setErrorMessage(languageMode === "bn"
          ? "Microphone permission বন্ধ আছে। Browser settings থেকে microphone Allow করুন, অথবা লিখে প্রশ্ন করুন।"
          : "Microphone permission is blocked. Allow microphone access in browser settings, or type your question.");
        setVoiceState("ERROR");
        return;
      }
      startBrowserRecognitionFallback();
    }
  };

  const stopListening = () => {
    if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
    recordingTimeoutRef.current = null;
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      try { recorder.stop(); } catch { /* already stopped */ }
      return;
    }
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    try { recognition?.stop(); } catch { /* recognition already ended */ }
    setVoiceState("READY");
  };

  const greetAngelaOnOpen = () => {
    playbackRef.current?.prime();
    cancelPending();
    stopSpeaking();
    enabledRef.current = true;
    setIsVoiceEnabled(true);
    languageModeRef.current = "bn";
    setLanguageMode("bn");
    setErrorMessage(null);
    setIsOpen(true);
    setMessages((current) => {
      const isWelcomeOnly = current.length === 1 && current[0].sender === "assistant" && current[0].id.includes("welcome");
      return isWelcomeOnly ? [{ ...current[0], text: BANGLA_WELCOME }] : current;
    });

    // Always use Angela's cloud-female TTS chain first for the opening greeting.
    // This avoids browser speechSynthesis implementations that accept speak()
    // but remain silent on some Windows/Android/iOS voice configurations.
    void speakText(BANGLA_WELCOME, "welcome-angela-jel");
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleResetChat = () => {
    cancelPending();
    stopSpeaking();
    setErrorMessage(null);
    setVoiceState("READY");
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: languageMode === "bn"
          ? "আসসালামু আলাইকুম! কথোপকথন নতুন করে শুরু হয়েছে। Study Abroad, বিশ্ববিদ্যালয় ও কোর্স নির্বাচন, admission, scholarship, SOP, English test এবং student visa documents নিয়ে প্রশ্ন করুন।"
          : "Assalamu Alaikum! Conversation refreshed. Ask me about study destinations, universities, courses, admissions, scholarships, SOPs, English tests, and student-visa documents.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Full Journey Expert Limited quick inquiry prompts
  const quickPrompts = [
    {
      en: "Air ticket, fare, reissue and refund support",
      bn: "এয়ার টিকিট, fare, reissue ও refund support সম্পর্কে বলুন",
      icon: Plane
    },
    {
      en: "Visa, tours, hotels and travel support",
      bn: "ভিসা, ট্যুর, হোটেল ও travel support সম্পর্কে বলুন",
      icon: Compass
    },
    {
      en: "Hajj and Umrah services",
      bn: "হজ ও উমরাহ সার্ভিস সম্পর্কে বলুন",
      icon: Building2
    },
    {
      en: "Study Abroad, medical, insurance and corporate travel",
      bn: "Study Abroad, medical, insurance ও corporate travel সম্পর্কে বলুন",
      icon: Award
    }
  ];

  const isBanglaMode = languageMode === "bn";
  const stateLabel: Record<AngelaVoiceState, string> = isBanglaMode ? {
    READY: "প্রস্তুত",
    LISTENING: "শুনছি",
    THINKING: "ভাবছি",
    SPEAKING: "বলছি",
    ERROR: "সমস্যা",
  } : {
    READY: "READY",
    LISTENING: "LISTENING",
    THINKING: "THINKING",
    SPEAKING: "SPEAKING",
    ERROR: "ERROR",
  };
  const stateDescription: Record<AngelaVoiceState, string> = isBanglaMode ? {
    READY: "প্রস্তুত। মাইক্রোফোনে বলুন অথবা নিচে লিখুন।",
    LISTENING: "অ্যাঞ্জেলা শুনছে—স্বাভাবিকভাবে বলুন।",
    THINKING: "JEL-এর যাচাইকৃত তথ্য দিয়ে উত্তর তৈরি হচ্ছে...",
    SPEAKING: "অ্যাঞ্জেলা উত্তরটি পড়ে শোনাচ্ছে...",
    ERROR: errorMessage || "ভয়েসে সমস্যা হলেও বাংলায় লিখে সাহায্য নিতে পারবেন।",
  } : {
    READY: "Ready. Tap mic to talk or type below.",
    LISTENING: "Angela is listening to you (speak freely)...",
    THINKING: "Angela is reasoning with JEL verified knowledge...",
    SPEAKING: "Angela is speaking aloud (barge-in enabled)...",
    ERROR: errorMessage || "I can still help you by text.",
  };

  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 sm:right-6 z-[10001] pointer-events-auto font-sans" id="angela-ai-voice-assistant-widget" data-voice-contract="cloud female primary; device voice fallback">
      {/* Floating Action Button with Angela Avatar & Glowing Voice Wave */}
      {!isOpen && (
        <button
          onClick={greetAngelaOnOpen}
          className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#0B5D3B] via-[#0D7A4D] to-[#D4AF37] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative group cursor-pointer border-2 border-white/50"
          id="btn-open-angela-assistant"
          aria-label="Open Angela AI Voice Assistant"
        >
          {/* Animated Glowing Ring */}
          <span className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 opacity-60 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse"></span>

          {/* Assistant Face / Logo Icon */}
          <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-white/90 bg-white flex items-center justify-center p-0.5 shadow-inner">
            <img 
              src={jelBrandIcon} 
              alt="Angela AI - JEL" 
              className="h-full w-full object-contain rounded-full"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          {/* Quick Voice Icon Badge */}
          <span className="absolute bottom-0 right-0 h-4.5 w-4.5 sm:h-5 sm:w-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow">
            <Mic className="h-2 sm:h-2.5 w-2 sm:w-2.5" />
          </span>

          {/* Desktop Hover Tooltip */}
          <div className="absolute right-20 top-2 bg-slate-950/95 text-white text-xs py-2 px-3.5 rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none hidden md:flex items-center gap-2 border border-slate-700/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <p className="font-bold text-[13px] text-emerald-300">Talk with Angela 🎙️</p>
              <p className="text-[10px] text-slate-300">JEL Official Voice & Travel Assistant</p>
            </div>
          </div>
        </button>
      )}

      {/* Angela Conversation Interface Panel */}
      {isOpen && (
        <div 
          lang={isBanglaMode ? "bn-BD" : "en"}
          className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 animate-in zoom-in-95 ${
            isMaximized 
              ? "w-[calc(100vw-24px)] sm:w-[650px] max-w-[650px] h-[88dvh] max-h-[88dvh]" 
              : "w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] h-[min(640px,85dvh)] max-h-[85dvh]"
          }`}
          id="angela-ai-voice-panel"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0B5D3B] via-[#0D6D45] to-[#074028] text-white p-3 sm:p-4 flex items-center justify-between shadow-md relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center space-x-2.5 sm:space-x-3 z-10">
              <div className="relative">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-[#D4AF37] bg-white p-0.5 overflow-hidden shadow-md flex items-center justify-center">
                  <img 
                    src={jelBrandIcon} 
                    alt="Angela Assistant" 
                    className="h-full w-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                {/* Voice State Indicator Dot */}
                <span className={`absolute bottom-0 right-0 h-3 w-3 border-2 border-[#0B5D3B] rounded-full ${
                  voiceState === "LISTENING" ? "bg-rose-500 animate-ping" :
                  voiceState === "SPEAKING" ? "bg-amber-400 animate-pulse" :
                  voiceState === "THINKING" ? "bg-yellow-300 animate-spin" :
                  voiceState === "ERROR" ? "bg-red-500" :
                  "bg-emerald-400"
                }`}></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm sm:text-base leading-tight tracking-wide text-white">Angela</h3>
                  <span className="text-[9px] sm:text-[10px] bg-[#D4AF37]/30 text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-[#D4AF37]/40">AI Voice</span>
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[10px] sm:text-[11px] text-emerald-200/90 font-medium">
                    {voiceState === "LISTENING" ? (isBanglaMode ? "আপনার কথা শুনছি..." : "Listening to you...") : 
                     voiceState === "SPEAKING" ? (isBanglaMode ? "উত্তর পড়ে শোনাচ্ছি..." : "Speaking response...") : 
                     voiceState === "THINKING" ? (isBanglaMode ? "JEL তথ্য দিয়ে বিশ্লেষণ করছি..." : "Analyzing with JEL engine...") :
                     voiceState === "ERROR" ? (isBanglaMode ? "লিখে সহায়তা নিন" : "Ready by text") :
                     "Journey Expert Limited"}
                  </span>
                  {voiceState === "SPEAKING" && (
                    <span className="flex gap-0.5 items-end h-2.5">
                      <span className="w-0.5 h-full bg-amber-300 animate-pulse"></span>
                      <span className="w-0.5 h-2/3 bg-amber-300 animate-pulse delay-75"></span>
                      <span className="w-0.5 h-full bg-amber-300 animate-pulse delay-150"></span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-1 z-10">
              {/* Language Switcher */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[10px] sm:text-[11px] font-medium mr-1">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-1 sm:px-1.5 py-0.5 rounded transition-all ${languageMode === "en" ? "bg-white text-[#0B5D3B] font-bold shadow-xs" : "text-white/80 hover:text-white"}`}
                  title="English Mode"
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("bn")}
                  className={`px-1 sm:px-1.5 py-0.5 rounded transition-all ${languageMode === "bn" ? "bg-white text-[#0B5D3B] font-bold shadow-xs" : "text-white/80 hover:text-white"}`}
                  title="বাংলা মোড"
                >
                  বাংলা
                </button>
              </div>

              {/* Mute / Unmute Voice */}
              <button
                onClick={toggleVoiceOutput}
                className={`p-1.5 rounded-lg transition-colors ${isVoiceEnabled ? "text-amber-300 hover:bg-white/10" : "text-white/50 hover:bg-white/10"}`}
                title={isVoiceEnabled ? "Voice Output Active (Click to Mute)" : "Voice Muted (Click to Unmute)"}
                id="btn-toggle-voice"
              >
                {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Clear / Reset Chat */}
              <button
                onClick={handleResetChat}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                title="Restart conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* Maximize Toggle */}
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="hidden sm:block text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                title={isMaximized ? "Restore Size" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button 
                onClick={() => {
                  cancelPending();
                  stopSpeaking();
                  setVoiceState("READY");
                  setIsOpen(false);
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                id="btn-close-angela-assistant"
                aria-label="Close Assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Phase 6: Explicit Voice State Indicator Strip */}
          <div className={`px-3 py-1.5 flex items-center justify-between text-[11px] font-medium border-b transition-colors ${
            voiceState === "LISTENING" ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900" :
            voiceState === "THINKING" ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900" :
            voiceState === "SPEAKING" ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900" :
            voiceState === "ERROR" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900" :
            "bg-emerald-50/70 text-emerald-800 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50"
          }`}>
            <div className="flex items-center space-x-1.5">
              <span className={`h-2 w-2 rounded-full ${
                voiceState === "LISTENING" ? "bg-rose-500 animate-ping" :
                voiceState === "THINKING" ? "bg-amber-500 animate-pulse" :
                voiceState === "SPEAKING" ? "bg-blue-500 animate-bounce" :
                voiceState === "ERROR" ? "bg-red-500" :
                "bg-emerald-500"
              }`} />
              <span className="font-bold tracking-wider uppercase text-[10px]">
                {stateLabel[voiceState]}
              </span>
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">|</span>
              <span className="truncate max-w-[200px] sm:max-w-[280px]">
                {stateDescription[voiceState]}
              </span>
            </div>

            {/* Stop Speaking / Interruption button */}
            {voiceState === "SPEAKING" && (
              <button
                onClick={stopSpeaking}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer"
                title="Interrupt / Stop speech immediately"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
                <span>{isBanglaMode ? "থামান" : "Stop"}</span>
              </button>
            )}

            {voiceState === "LISTENING" && (
              <button
                onClick={stopListening}
                className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer"
              >
                <span>{isBanglaMode ? "শেষ" : "Done"}</span>
              </button>
            )}
          </div>

          {/* Quick Human Handoff Banner */}
          <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex flex-wrap gap-2 items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-sans">
            <span className="flex items-center font-medium text-slate-700 dark:text-slate-300 text-[11px]">
              <Headphones className="h-3.5 w-3.5 mr-1 text-[#0B5D3B]" />
              {isBanglaMode ? "মানব সহায়তা:" : "Human Specialist:"}
            </span>
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold">
              <a 
                href="https://wa.me/8801926400400?text=Hello%20Journey%20Expert,%20I%20am%20chatting%20with%20Angela%20and%20would%20like%20to%20connect%20with%20a%20human%20specialist." 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-102 transition-transform"
                title="WhatsApp: +8801926400400"
              >
                <MessageCircle className="h-3 w-3 mr-1 text-[#25D366]" /> WhatsApp
              </a>
              <a 
                href="tel:+8801926400400" 
                className="flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-102 transition-transform"
                title="Hotline: +8801926400400"
              >
                <Phone className="h-3 w-3 mr-1 text-[#0B5D3B]" /> 01926400400
              </a>
              <a 
                href="mailto:journeyexpertbd@gmail.com" 
                className="hidden sm:flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-102 transition-transform"
                title="Email: journeyexpertbd@gmail.com"
              >
                <Mail className="h-3 w-3 mr-1 text-blue-600" /> Email
              </a>
            </div>
          </div>

          <details className="shrink-0 border-b border-emerald-100 bg-white dark:bg-slate-900 dark:border-slate-700" id="angela-jel-directory">
            <summary className="cursor-pointer px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 focus-visible:outline-2 focus-visible:outline-emerald-600">
              {isBanglaMode ? "JEL-এর সব সার্ভিস, ব্র্যান্ড ও যোগাযোগ" : "JEL services, brands & contact"}
            </summary>
            <section aria-label={isBanglaMode ? "Journey Expert Limited পরিচিতি" : "Journey Expert Limited directory"} className="max-h-[35vh] overflow-y-auto px-4 pb-4 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
              <p className="font-bold text-sm">Journey Expert Limited (JEL)</p>
              <p className="mb-3 text-slate-500 dark:text-slate-400">Your Journey, Our Expertise.</p>
              <h4 className="font-semibold mb-1">{isBanglaMode ? "আমাদের সার্ভিস" : "Our services"}</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 list-disc pl-4 mb-3">
                {[
                  ["এয়ার টিকিট, ভাড়া, রিইস্যু ও রিফান্ড সহায়তা", "Air tickets, fares, reissue & refund support"],
                  ["ভিসা ও ডকুমেন্ট সহায়তা", "Visa & document assistance"],
                  ["দেশি-বিদেশি ট্যুর ও ভ্রমণ", "Domestic & international tours"],
                  ["হোটেল বুকিং সহায়তা", "Hotel booking assistance"],
                  ["হজ ও উমরাহ", "Hajj & Umrah"],
                  ["হালাল ট্যুরিজম", "Halal tourism"],
                  ["মেডিকেল ট্যুরিজম", "Medical tourism"],
                  ["ট্রাভেল ইন্স্যুরেন্স সহায়তা", "Travel insurance assistance"],
                  ["কর্পোরেট ট্রাভেল ম্যানেজমেন্ট", "Corporate travel management"],
                  ["এয়ারপোর্ট মিট অ্যান্ড গ্রিট", "Airport Meet & Greet"],
                  ["স্টাডি অ্যাব্রোড ও ভর্তি সহায়তা", "Study Abroad & admissions guidance"],
                  ["কমপ্লায়েন্স ও অ্যাডভাইজরি", "Compliance & advisory"],
                ].map(([bn, en]) => <li key={en}>{isBanglaMode ? bn : en}</li>)}
              </ul>
              <h4 className="font-semibold mb-1">{isBanglaMode ? "ব্র্যান্ড, কো-ব্র্যান্ড ও সহযোগী উদ্যোগ" : "Brands, co-brands & associated ventures"}</h4>
              <ul className="list-disc pl-4 space-y-1 mb-3">
                <li>JEL Study Abroad</li>
                <li>JEL Meet &amp; Greet</li>
                <li>JEL Compliance &amp; Advisory</li>
                <li>Craft Bangla</li>
              </ul>
              <p className="mb-2">{isBanglaMode ? "স্টাডি অ্যাব্রোড: কাউন্সেলিং, প্রোফাইল মূল্যায়ন, কোর্স ও বিশ্ববিদ্যালয় নির্বাচন, আবেদন, স্কলারশিপ গাইডেন্স, SOP, ভাষা পরীক্ষার গাইডেন্স, শিক্ষার্থী ভিসার ডকুমেন্ট এবং যাত্রার আগে ও পরে সহায়তা।" : "Study Abroad: counselling, profile assessment, course and university selection, applications, scholarship and SOP guidance, language-test guidance, student-visa documents, and pre-/post-arrival support."}</p>
              <a href="tel:+8801926400400" className="block font-bold text-emerald-800 dark:text-emerald-300">{isBanglaMode ? "হটলাইন / WhatsApp: " : "Hotline / WhatsApp: "}01926400400</a>
              <p className="mt-1">{isBanglaMode ? "১৮৯/এ (২য় তলা), আব্দুল মতিন কমপ্লেক্স, নাবিস্কো মোড়, তেজগাঁও, ঢাকা-১২১৫।" : "189/A (2nd Floor), Abdul Motin Complex, Nabisco Mor, Tejgaon, Dhaka-1215."}</p>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{isBanglaMode ? "মূল্য, প্রাপ্যতা ও শর্ত যাচাইসাপেক্ষ। ভিসা, ভর্তি বা স্কলারশিপের নিশ্চয়তা দেওয়া হয় না।" : "Prices, availability and terms require confirmation. Visa, admission and scholarship outcomes are not guaranteed."}</p>
            </section>
          </details>

          {/* Real-time Interim Listening Banner */}
          {voiceState === "LISTENING" && (
            <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-2.5 flex items-center justify-between shadow-inner animate-in slide-in-from-top duration-200">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-white/20">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-50"></span>
                  <Mic className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] text-rose-100 font-bold uppercase tracking-wider">{isBanglaMode ? "সরাসরি শুনছি..." : "Listening in real-time..."}</p>
                  <p className="text-xs font-medium truncate italic text-white">
                    {interimTranscript || (isBanglaMode ? "বাংলায় বলুন..." : "Speak in English, বাংলা, or Banglish...")}
                  </p>
                </div>
              </div>
              <button
                onClick={stopListening}
                className="bg-white text-rose-800 hover:bg-rose-50 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow transition-colors cursor-pointer"
              >
                {isBanglaMode ? "পাঠান" : "Submit"}
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-slate-50/70 dark:bg-slate-900/50">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              const isMessageSpeaking = activeSpeakingId === m.id && voiceState === "SPEAKING";

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "ml-auto items-end max-w-[85%]" : "mr-auto items-start max-w-[92%]"}`}
                >
                  <div className="flex items-end gap-1.5">
                    {!isUser && (
                      <div className="h-6 w-6 rounded-full overflow-hidden border border-emerald-600/30 bg-white shrink-0 mb-1">
                        <img 
                          src={jelBrandIcon} 
                          alt="Angela" 
                          className="h-full w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div
                      className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs transition-all ${
                        isUser
                          ? "bg-gradient-to-r from-[#0B5D3B] to-[#0D7A4D] text-white rounded-br-xs"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs"
                      }`}
                    >
                      <p lang={isBanglaText(m.text) ? "bn-BD" : "en"} className="whitespace-pre-line break-words">{m.text}</p>

                      {/* Assistant Message Action Buttons */}
                      {!isUser && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center space-x-2">
                            {/* Listen / Interrupt Button */}
                            <button
                              onClick={() => {
                                if (isMessageSpeaking) {
                                  stopSpeaking();
                                } else {
                                  speakText(m.text, m.id);
                                }
                              }}
                              className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition-colors ${
                                isMessageSpeaking 
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold" 
                                  : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                              title={isMessageSpeaking ? "Stop Speech (Barge-in)" : "Listen to Angela"}
                            >
                              {isMessageSpeaking ? (
                                <>
                                  <Square className="h-3 w-3 fill-current" />
                                  <span>{isBanglaMode ? "থামান" : "Stop"}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3 w-3 text-emerald-600" />
                                  <span>{isBanglaMode ? "শুনুন" : "Listen"}</span>
                                </>
                              )}
                            </button>

                            {/* Copy Message */}
                            <button
                              onClick={() => handleCopyMessage(m.id, m.text)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                              title="Copy response"
                            >
                              {copiedId === m.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>

                          <span className="text-[10px] font-mono text-slate-400">{m.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <span className="text-[9px] text-slate-400 mt-1 mr-1 font-mono">{m.timestamp}</span>
                  )}
                </div>
              );
            })}

            {/* Thinking / Typing Pulse */}
            {voiceState === "THINKING" && (
              <div className="flex flex-col max-w-[85%] mr-auto items-start">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-xs flex items-center space-x-2">
                  <div className="h-4 w-4 rounded-full border border-emerald-500 overflow-hidden bg-white shrink-0">
                    <img src={jelBrandIcon} alt="Angela" className="h-full w-full object-contain" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isBanglaMode ? "অ্যাঞ্জেলা উত্তর তৈরি করছে..." : "Angela is reasoning..."}</span>
                  <div className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 bg-[#0B5D3B] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-[#0B5D3B] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-[#0B5D3B] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Verified Topics */}
          {messages.length <= 2 && (
            <div className="px-3.5 py-2 bg-slate-100/70 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                {languageMode === "bn" ? "জনপ্রিয় প্রশ্নসমূহ" : "Popular Inquiries"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickPrompts.map((q, idx) => {
                  const promptText = languageMode === "bn" ? q.bn : q.en;
                  const Icon = q.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(promptText)}
                      className="text-[11px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-[#0B5D3B] transition-colors py-1.5 px-2.5 rounded-xl font-medium text-left border border-slate-200 dark:border-slate-700 truncate shadow-2xs flex items-center space-x-1.5"
                    >
                      <Icon className="h-3 w-3 text-[#0B5D3B] shrink-0" />
                      <span className="truncate">{promptText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Input Area: Microphone + Text + Send */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              {/* Voice Input Mic Button */}
              {speechSupported ? (
                <button
                  type="button"
                  onClick={voiceState === "LISTENING" ? stopListening : startListening}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 ${
                    voiceState === "LISTENING"
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-emerald-50 dark:bg-emerald-950 text-[#0B5D3B] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800"
                  }`}
                  title={voiceState === "LISTENING" ? (isBanglaMode ? "অ্যাঞ্জেলা শুনছে—পাঠাতে চাপুন" : "Angela is listening... Click to send") : (isBanglaMode ? "অ্যাঞ্জেলার সঙ্গে বাংলায় কথা বলুন" : "Tap to Speak with Angela (Voice Input)")}
                  id="btn-voice-input"
                >
                  {voiceState === "LISTENING" ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              ) : null}

              {/* Text Input Field */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage(inputValue);
                }}
                placeholder={
                  languageMode === "bn"
                    ? "এয়ার টিকিট, ভিসা বা স্টাডি নিয়ে বাংলায় লিখুন..."
                    : "Ask Angela about flights, visas, tours, or study abroad..."
                }
                className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5D3B] text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                lang={isBanglaMode ? "bn-BD" : "en"}
                id="input-angela-chat"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-[#0B5D3B] to-[#0D7A4D] hover:opacity-95 disabled:opacity-40 text-white rounded-xl h-10 w-10 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                id="btn-send-angela-message"
                aria-label={isBanglaMode ? "বার্তা পাঠান" : "Send Message"}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Compliance & Anti-Fabrication Transparency Notice */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1 pt-0.5">
              <span className="flex items-center gap-1 truncate max-w-[240px] sm:max-w-none">
                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                <span className="truncate">{isBanglaMode ? "এআই ভয়েস। বাংলা অডিও তৈরির জন্য উত্তরের লেখা Google-এ পাঠানো হতে পারে।" : "AI voice. Bangla audio may send the response text to Google for speech generation."}</span>
              </span>
              <span className="font-mono text-[9px] shrink-0">v2.5 Live Voice</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Named alias export for authoritative integration
export { AIChatAssistant as AngelaVoiceAssistant };





