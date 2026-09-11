import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Mic, MicOff, Volume2, VolumeX, Square, Send, X, Sparkles, 
  Phone, MessageCircle, Mail, Globe, RefreshCw, Maximize2, Minimize2, 
  Copy, Check, ExternalLink, Headphones, ShieldCheck, User, MessageSquare,
  AlertCircle, Radio, Plane, Compass, Award, Building2, MapPin
} from "lucide-react";
import { ChatMessage } from "../types";

const jelBrandIcon = new URL("../assets/images/jel-study-abroad-official.webp", import.meta.url).href;

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
  const [isMaximized, setIsMaximized] = useState(false);
  const [languageMode, setLanguageMode] = useState<"auto" | "en" | "bn">("auto");
  const [voiceState, setVoiceState] = useState<AngelaVoiceState>("READY");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try { return localStorage.getItem("jel_angela_voice_muted") !== "true"; } catch { return true; }
    }
    return true;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-angela-jel",
      sender: "assistant",
      text: "👋 Assalamu Alaikum! I am Angela, the official AI Voice & Customer Assistant for Journey Expert Limited (JEL).\n\nHow may I help you today? I can assist you with:\n✈️ Air Ticketing & Flight Bookings\n🛂 Visa Services (Tourist, Visit, Medical, Student & Business Visas)\n🌍 International & Domestic Tour Packages\n🕋 VIP & Economy Umrah Packages\n🎓 JEL Study Abroad (UK, USA, Canada, Australia & Europe)\n\nYou can speak using the microphone button or type below in English, বাংলা, or Banglish!",
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
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const requestRef = useRef<AbortController | null>(null);
  const enabledRef = useRef(isVoiceEnabled);
  enabledRef.current = isVoiceEnabled;
  const cancelPending = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort();
    }
  };

  // Auto-scroll on conversation update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, voiceState, interimTranscript]);

  // Check Web Speech Recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Voice toggle handler
  const toggleVoiceOutput = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    try { localStorage.setItem("jel_angela_voice_muted", nextState ? "false" : "true"); } catch { /* Storage may be disabled. */ }
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

  // Text-to-speech engine with natural voice matching
  const speakText = useCallback((text: string, messageId?: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setErrorMessage("Voice output is not supported in this browser. You can still chat by text.");
      setVoiceState("ERROR");
      return;
    }

    // Barge-in: interrupt previous speech
    window.speechSynthesis.cancel();

    if (!enabledRef.current) {
      setVoiceState("READY");
      return;
    }

    // Clean text: strip markdown syntax, links, emojis for clear auditory playback
    const cleanSpeech = text
      .replace(/[*#_~`>]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/\n+/g, ". ")
      .trim();

    if (!cleanSpeech) {
      setVoiceState("READY");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      currentUtteranceRef.current = utterance;

      const hasBangla = /[\u0980-\u09FF]/.test(cleanSpeech);
      utterance.lang = hasBangla ? "bn-BD" : "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select high quality voices
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (hasBangla) {
          const banglaVoice = voices.find(v => v.lang.startsWith("bn") || v.name.toLowerCase().includes("bangla") || v.name.toLowerCase().includes("bengali"));
          if (banglaVoice) utterance.voice = banglaVoice;
        } else {
          const preferredVoice = voices.find(v => 
            (v.lang.startsWith("en") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("google uk english female") || v.name.toLowerCase().includes("natural")))
          ) || voices.find(v => v.lang.startsWith("en"));
          if (preferredVoice) utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        if (currentUtteranceRef.current !== utterance) return;
        setVoiceState("SPEAKING");
        setErrorMessage(null);
        if (messageId) setActiveSpeakingId(messageId);
      };

      utterance.onend = () => {
        if (currentUtteranceRef.current !== utterance) return;
        setVoiceState("READY");
        setActiveSpeakingId(null);
      };

      utterance.onerror = (e) => {
        if (currentUtteranceRef.current !== utterance) return;
        // Only set error if not cancelled deliberately (interruption)
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis notice:", e.error);
          setErrorMessage("I can still help you by text.");
          setVoiceState("ERROR");
        } else {
          setVoiceState("READY");
        }
        setActiveSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Text to speech exception:", err);
      setErrorMessage("I can still help you by text.");
      setVoiceState("ERROR");
    }
  }, [isVoiceEnabled]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      cancelPending();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Send message to server-side Angela Gemini engine
  const handleSendMessage = async (textToSend: string, triggeredByVoice: boolean = false) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;
    cancelPending();
    const controller = new AbortController();
    requestRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 20000);

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

    try {
      const historyContext = [...messages, userMsg].slice(-8);
      const response = await fetch("/api/gemini/chat", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: historyContext,
          language: languageMode 
        })
      });

      if (!response.ok) {
        throw new Error("Angela server synchronization issue");
      }

      const data = await response.json();
      if (requestRef.current !== controller) return;
      const replyText = data.reply || "I am processing your inquiry. Please reach out to our JEL Counselors at +8801926400400 for immediate assistance.";
      
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
      const friendlyError = "I'm temporarily unable to respond. Please try again or contact JEL directly.";
      setErrorMessage(friendlyError);
      setVoiceState("ERROR");

      const errorMsg: ChatMessage = {
        id: `m-err-${Date.now()}`,
        sender: "assistant",
        text: "I'm temporarily unable to process your request. Your connection appears to be interrupted. Please connect with our counselors directly via WhatsApp at +8801926400400 or call +8802 9830404.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      clearTimeout(timer);
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  // Start Voice Listening (Speech-to-Text) with full Interruption logic
  const startListening = () => {
    cancelPending();
    // Interruption: halt Angela's voice immediately when user taps mic
    stopSpeaking();
    setErrorMessage(null);

    if (typeof window === "undefined") return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMessage("Voice input is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      setVoiceState("ERROR");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRec();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;

      // Language configuration
      if (languageMode === "bn") {
        recognition.lang = "bn-BD";
      } else if (languageMode === "en") {
        recognition.lang = "en-US";
      } else {
        // In auto mode, default to bn-BD which also handles English words gracefully
        recognition.lang = "bn-BD";
      }

      recognition.onstart = () => {
        setVoiceState("LISTENING");
        setInterimTranscript("");
        setErrorMessage(null);
      };

      let finalTranscript = "";
      let latestInterim = "";

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = "";
        finalTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
          } else {
            interim += res[0].transcript;
          }
        }
        latestInterim = interim;
        setInterimTranscript(interim || finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition event:", event.error);
        if (event.error === "not-allowed") {
          // Phase 12 & Phase 4: Microphone permission denied
          setErrorMessage("Microphone access is unavailable. You can type your question instead.");
        } else if (event.error === "no-speech") {
          // Silent timeout, reset to ready
          setVoiceState("READY");
          return;
        } else {
          setErrorMessage("I can still help you by text.");
        }
        setVoiceState("ERROR");
        setInterimTranscript("");
      };

      recognition.onend = () => {
        const spoken = finalTranscript.trim() || latestInterim.trim();
        if (spoken) {
          handleSendMessage(spoken, true);
        } else {
          setVoiceState("READY");
        }
        setInterimTranscript("");
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setErrorMessage("Microphone access is unavailable. You can type your question instead.");
      setVoiceState("ERROR");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState("READY");
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
        text: "Assalamu Alaikum! Conversation refreshed. Ask me anything about flight tickets, visit visas, medical visas, tour packages, Umrah, or study abroad programs!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Verified quick inquiry prompts covering all JEL core verticals
  const quickPrompts = [
    {
      en: "Need Dubai / Bangkok flight ticket",
      bn: "দুবাই বা ব্যাংককের এয়ার টিকিট ফেয়ার কেমন?",
      icon: Plane
    },
    {
      en: "Tourist visa requirements for Malaysia / Thailand",
      bn: "মালয়েশিয়া / থাইল্যান্ডের ভিজিট ভিসা রিকোয়ারমেন্ট?",
      icon: Compass
    },
    {
      en: "VIP Umrah packages for 2026/2027",
      bn: "২০২৬/২০২৭ সালের ওমরাহ প্যাকেজের বিবরণ?",
      icon: Building2
    },
    {
      en: "UK & Canada Study Abroad Intake details",
      bn: "ইউকে এবং কানাডা স্টাডি ইনটেক রিকোয়ারমেন্ট?",
      icon: Award
    }
  ];

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 font-sans" id="angela-ai-voice-assistant-widget">
      {/* Floating Action Button with Angela Avatar & Glowing Voice Wave */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (isVoiceEnabled && messages.length === 1) {
              speakText("Assalamu Alaikum! I am Angela, your official AI Voice Assistant for Journey Expert Limited. How can I assist you with travel or study abroad today?", "welcome");
            }
          }}
          className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#0B5D3B] via-[#0D7A4D] to-[#D4AF37] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative group cursor-pointer border-2 border-white/50"
          id="btn-open-angela-assistant"
          aria-label="Open Angela AI Voice Assistant"
        >
          {/* Animated Glowing Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 opacity-60 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse"></span>

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
          className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 animate-in zoom-in-95 ${
            isMaximized 
              ? "w-[calc(100vw-24px)] sm:w-[650px] max-w-[650px] h-[88vh] max-h-[88vh]" 
              : "w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] h-[640px] max-h-[85vh]"
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
                    {voiceState === "LISTENING" ? "Listening to you..." : 
                     voiceState === "SPEAKING" ? "Speaking response..." : 
                     voiceState === "THINKING" ? "Analyzing with JEL engine..." :
                     voiceState === "ERROR" ? "Ready by text" :
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
                  onClick={() => setLanguageMode("auto")}
                  className={`px-1 sm:px-1.5 py-0.5 rounded transition-all ${languageMode === "auto" ? "bg-white text-[#0B5D3B] font-bold shadow-xs" : "text-white/80 hover:text-white"}`}
                  title="Auto Detect Language"
                >
                  Auto
                </button>
                <button
                  onClick={() => setLanguageMode("en")}
                  className={`px-1 sm:px-1.5 py-0.5 rounded transition-all ${languageMode === "en" ? "bg-white text-[#0B5D3B] font-bold shadow-xs" : "text-white/80 hover:text-white"}`}
                  title="English Mode"
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguageMode("bn")}
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
                {voiceState}
              </span>
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">|</span>
              <span className="truncate max-w-[200px] sm:max-w-[280px]">
                {voiceState === "LISTENING" ? "Angela is listening to you (speak freely)..." :
                 voiceState === "THINKING" ? "Angela is reasoning with JEL verified knowledge..." :
                 voiceState === "SPEAKING" ? "Angela is speaking aloud (barge-in enabled)..." :
                 voiceState === "ERROR" ? (errorMessage || "I can still help you by text.") :
                 "Ready. Tap mic to talk or type below."}
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
                <span>Stop</span>
              </button>
            )}

            {voiceState === "LISTENING" && (
              <button
                onClick={stopListening}
                className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer"
              >
                <span>Done</span>
              </button>
            )}
          </div>

          {/* Quick Human Handoff Banner */}
          <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-sans">
            <span className="flex items-center font-medium text-slate-700 dark:text-slate-300 text-[11px]">
              <Headphones className="h-3.5 w-3.5 mr-1 text-[#0B5D3B]" />
              Human Specialist:
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
                href="tel:+88029830404" 
                className="flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-102 transition-transform"
                title="Telephone: +8802 9830404 / Hotline: +8801926400400"
              >
                <Phone className="h-3 w-3 mr-1 text-[#0B5D3B]" /> Tel
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

          {/* Real-time Interim Listening Banner */}
          {voiceState === "LISTENING" && (
            <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-2.5 flex items-center justify-between shadow-inner animate-in slide-in-from-top duration-200">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-white/20">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-50"></span>
                  <Mic className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] text-rose-100 font-bold uppercase tracking-wider">Listening in real-time...</p>
                  <p className="text-xs font-medium truncate italic text-white">
                    {interimTranscript || "Speak in English, বাংলা, or Banglish..."}
                  </p>
                </div>
              </div>
              <button
                onClick={stopListening}
                className="bg-white text-rose-800 hover:bg-rose-50 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow transition-colors cursor-pointer"
              >
                Submit
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
                      <p className="whitespace-pre-line break-words">{m.text}</p>

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
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3 w-3 text-emerald-600" />
                                  <span>Listen</span>
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
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Angela is reasoning...</span>
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
                  title={voiceState === "LISTENING" ? "Angela is listening... Click to send" : "Tap to Speak with Angela (Voice Input)"}
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
                id="input-angela-chat"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-[#0B5D3B] to-[#0D7A4D] hover:opacity-95 disabled:opacity-40 text-white rounded-xl h-10 w-10 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                id="btn-send-angela-message"
                aria-label="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Compliance & Anti-Fabrication Transparency Notice */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1 pt-0.5">
              <span className="flex items-center gap-1 truncate max-w-[240px] sm:max-w-none">
                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                <span className="truncate">Official JEL AI. Visa decisions subject to embassy authority.</span>
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

