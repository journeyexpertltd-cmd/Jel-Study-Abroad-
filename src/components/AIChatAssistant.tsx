import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Phone, MessageCircle, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";

const jelBrandIcon = new URL("../assets/images/jel_logo_brand_icon_1782126703149.jpg", import.meta.url).href;

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "👋 Assalamu Alaikum! I'm your JEL intelligent companion. Ask me anything about studying abroad in the UK, Canada, Australia, USA, Ireland, New Zealand, Malaysia, or Europe!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const chatHistoryForAPI = [...messages, userMsg].slice(-8); // send last few exchanges for context
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistoryForAPI })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI server");
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "assistant",
        text: data.reply || "I am currently processing your inquiry. Please reach out directly to JEL Counselors at Nabisco Mor, Tejgaon for deep support.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMsg: ChatMessage = {
        id: `m-err`,
        sender: "assistant",
        text: "I experienced a brief server synchronization issue. Please confirm your internet connection or call our support line at +8801926400400 directly!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ai-chat-assistant-widget">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#003366] to-[#00AEEF] text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative group"
          id="btn-open-chat-assistant"
          aria-label="Open AI Assistant"
        >
          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/20 bg-white flex items-center justify-center p-0.5 shadow-md">
            <img 
              src={jelBrandIcon} 
              alt="JEL Study Abroad" 
              className="h-full w-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute right-16 top-2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:inline-block border border-slate-700">
            Need Help? Ask our AI 🎓
          </span>
          {/* Active indicator dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
          </span>
        </button>
      )}

      {/* Chat Container */}
      {isOpen && (
        <div 
          className="w-[calc(100vw-32px)] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
          id="ai-chat-assistant-panel"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#003366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded-lg h-9 w-9 flex items-center justify-center shadow-sm">
                <img 
                  src={jelBrandIcon} 
                  alt="JEL Study Abroad" 
                  className="h-full w-full object-contain rounded-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm leading-tight">JEL Academic AI Companion</h3>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-slate-300">Powered by Gemini 3.5</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              id="btn-close-chat-assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between text-xs text-slate-500 font-sans">
            <span className="flex items-center">
              <MessageSquare className="h-3 w-3 text-[#003366] mr-1.5" />
              Direct Support:
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-medium text-[#003366]">
              <a href="tel:+8801926400400" className="flex items-center hover:underline">
                <Phone className="h-3 w-3 mr-0.5" /> Call
              </a>
              <a href="https://wa.me/8801926400400" target="_blank" rel="noreferrer" className="flex items-center hover:underline text-green-600">
                <MessageCircle className="h-3 w-3 mr-0.5" /> WhatsApp
              </a>
            </div>
          </div>

          {/* Messages Node */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-[#003366] to-[#004d99] text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col max-w-[85%] mr-auto items-start">
                <div className="p-3 rounded-2xl bg-white border border-slate-100 rounded-bl-none shadow-sm flex items-center space-x-1">
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts Panel */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-white border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Common Student Queries</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "📌 Requirements for UK 2026/2027?",
                  "🇨🇦 Work permit option in Canada?",
                  "🇦🇺 Average study costs in Australia?",
                  "💼 Scholarship opportunities for USA?"
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(p.substring(2))}
                    className="text-[11px] text-[#003366] bg-slate-100 hover:bg-slate-200 transition-colors py-1.5 px-2.5 rounded-lg font-medium text-left border border-slate-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage(inputValue);
              }}
              placeholder="Type your study abroad query..."
              className="flex-1 bg-slate-50 border border-slate-200 text-xs sm:text-sm py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#003366] text-slate-800"
              id="input-chat-assistant"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              className="bg-[#003366] hover:bg-[#004d99] disabled:opacity-50 text-white rounded-xl p-2.5 transition-all text-xs"
              id="btn-send-chat-assistant"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
