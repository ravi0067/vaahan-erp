"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, Settings, Maximize, Minimize,
  MessageSquare, Phone, Bike, Car, Wrench, Shield, Clock,
  Sparkles, Zap, Globe, ChevronRight
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "vaani";
  text: string;
  timestamp: Date;
}

// ── Avatar Mood based on conversation ────────────────────────────────────
type AvatarMood = "idle" | "listening" | "thinking" | "speaking" | "greeting" | "excited";

// ── Quick Prompts for Showroom ───────────────────────────────────────────
const quickPrompts = [
  { icon: Bike, label: "Bikes Dekhna Hai", query: "Kaunsi bikes available hain showroom mein?" },
  { icon: Car, label: "Price List", query: "Sabhi available vehicles ki price list dikhao" },
  { icon: Wrench, label: "Service Booking", query: "Meri bike ki service booking karni hai" },
  { icon: Shield, label: "Insurance", query: "Insurance renewal kaise hoga?" },
  { icon: Clock, label: "EMI Calculator", query: "EMI calculate karo ek bike ke liye" },
  { icon: Phone, label: "Contact", query: "Showroom ka contact number aur timing kya hai?" },
];

// ── Greeting Messages (rotate) ──────────────────────────────────────────
const greetings = [
  "Namaste! 🙏 Main hoon Vaani — aapki AI assistant. Kaise help kar sakti hoon?",
  "Welcome to our showroom! Main Vaani hoon. Bikes dekhni hain ya kuch aur help chahiye?",
  "Namaste ji! Vaani yahaan hai aapki seva mein. Bataiye kya chahiye? 😊",
];

// ── Avatar Visual Component ──────────────────────────────────────────────
function AvatarVisual({ mood, isSpeaking }: { mood: AvatarMood; isSpeaking: boolean }) {
  // Animated avatar face using CSS
  const moodColors = {
    idle: "from-violet-500 to-purple-600",
    listening: "from-blue-500 to-cyan-500",
    thinking: "from-amber-500 to-orange-500",
    speaking: "from-green-500 to-emerald-500",
    greeting: "from-pink-500 to-rose-500",
    excited: "from-yellow-400 to-orange-500",
  };

  const moodEmojis = {
    idle: "😊",
    listening: "👂",
    thinking: "🤔",
    speaking: "💬",
    greeting: "🙏",
    excited: "🎉",
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow ring */}
      <div className={`absolute -inset-8 rounded-full bg-gradient-to-r ${moodColors[mood]} opacity-20 blur-3xl ${
        isSpeaking ? "animate-pulse" : ""
      }`} />

      {/* Sound wave rings when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 m-auto w-72 h-72 rounded-full border-2 border-white/10 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute inset-0 m-auto w-80 h-80 rounded-full border border-white/5 animate-ping" style={{ animationDuration: "2s" }} />
        </>
      )}

      {/* Main Avatar Circle */}
      <div className={`relative w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br ${moodColors[mood]} 
        flex items-center justify-center shadow-2xl transition-all duration-500
        ${mood === "listening" ? "scale-105 ring-4 ring-blue-400/50" : ""}
        ${mood === "thinking" ? "animate-pulse" : ""}
        ${isSpeaking ? "scale-110" : ""}
      `}>
        {/* Inner face */}
        <div className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className={`text-6xl md:text-8xl transition-all duration-300 ${isSpeaking ? "animate-bounce" : ""}`}>
              {moodEmojis[mood]}
            </div>
            <p className="text-white/90 text-sm md:text-base font-bold mt-2 tracking-wide">
              VAANI AI
            </p>
          </div>
        </div>

        {/* Speaking animation bars */}
        {isSpeaking && (
          <div className="absolute bottom-4 flex gap-1 items-end">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-white/80 rounded-full animate-pulse"
                style={{
                  height: `${12 + Math.random() * 24}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: "0.4s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status label */}
      <div className={`mt-6 px-6 py-2 rounded-full text-sm font-semibold tracking-wide backdrop-blur-sm ${
        mood === "idle" ? "bg-white/10 text-white/70" :
        mood === "listening" ? "bg-blue-500/20 text-blue-300 animate-pulse" :
        mood === "thinking" ? "bg-amber-500/20 text-amber-300" :
        mood === "speaking" ? "bg-green-500/20 text-green-300" :
        "bg-white/10 text-white/70"
      }`}>
        {mood === "idle" && "💬 Mujhse baat karo..."}
        {mood === "listening" && "👂 Sun rahi hoon..."}
        {mood === "thinking" && "🤔 Soch rahi hoon..."}
        {mood === "speaking" && "🗣️ Bol rahi hoon..."}
        {mood === "greeting" && "🙏 Namaste!"}
        {mood === "excited" && "🎉 Bahut accha!"}
      </div>
    </div>
  );
}

// ── Main Vaani Avatar Page ──────────────────────────────────────────────
export default function VaaniAvatarPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mood, setMood] = useState<AvatarMood>("greeting");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dealershipName, setDealershipName] = useState("VaahanERP Showroom");
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const msg: ChatMessage = {
      id: "greeting-0",
      role: "vaani",
      text: greeting,
      timestamp: new Date(),
    };
    setMessages([msg]);
    setCurrentText(greeting);

    // Speak greeting after 1 second
    setTimeout(() => {
      speakText(greeting);
    }, 1000);

    // Return to idle after 10 seconds
    setTimeout(() => {
      if (!isListening && !isSpeaking) setMood("idle");
    }, 10000);
  }, []);

  // Reset to idle after inactivity
  const resetIdleTimer = useCallback(() => {
    if (idleTimeout) clearTimeout(idleTimeout);
    const timeout = setTimeout(() => {
      if (!isListening && !isSpeaking && !isProcessing) {
        setMood("idle");
        setCurrentText("");
      }
    }, 30000); // 30 seconds idle
    setIdleTimeout(timeout);
  }, [idleTimeout, isListening, isSpeaking, isProcessing]);

  // ── ElevenLabs TTS ────────────────────────────────────────────────────
  const speakText = async (text: string) => {
    if (!voiceEnabled) return;

    setIsSpeaking(true);
    setMood("speaking");

    try {
      const res = await fetch("/api/vaani-avatar/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          setMood("idle");
          URL.revokeObjectURL(url);
          resetIdleTimer();
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          setMood("idle");
          // Fallback to browser TTS
          fallbackSpeak(text);
        };

        await audio.play();
      } else {
        // Fallback to browser TTS
        fallbackSpeak(text);
      }
    } catch {
      fallbackSpeak(text);
    }
  };

  // Fallback browser TTS
  const fallbackSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(false);
      setMood("idle");
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").replace(/[*_~`#]/g, "").replace(/\n+/g, ". ").substring(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.15;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const femaleHindi = voices.find(v => v.lang.includes("hi") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("aditi")));
    const femaleEn = voices.find(v => v.lang.includes("en") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha")));
    utterance.voice = femaleHindi || femaleEn || voices[0] || null;
    utterance.onend = () => {
      setIsSpeaking(false);
      setMood("idle");
      resetIdleTimer();
    };
    window.speechSynthesis.speak(utterance);
  };

  // ── Voice Recognition ─────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop any current speech
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      processUserInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setMood("idle");
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setMood("listening");
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setMood("idle");
  };

  // ── Process User Input (voice or text) ─────────────────────────────────
  const processUserInput = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setCurrentText(text.trim());
    setMood("thinking");
    setIsProcessing(true);

    try {
      // Build chat history for AI
      const history = [...messages, userMsg].slice(-10).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const res = await fetch("/api/vaani-avatar/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      const responseText = data.response || "Sorry, abhi kuch problem hai. Thodi der mein try karo.";

      // Add Vaani response
      const vaaniMsg: ChatMessage = {
        id: `vaani-${Date.now()}`,
        role: "vaani",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, vaaniMsg]);
      setCurrentText(responseText);

      // Detect mood from response
      const lower = responseText.toLowerCase();
      if (lower.includes("congratul") || lower.includes("badhai") || lower.includes("🎉")) {
        setMood("excited");
      } else {
        setMood("speaking");
      }

      // Speak the response
      await speakText(responseText);
    } catch {
      const errorMsg: ChatMessage = {
        id: `vaani-err-${Date.now()}`,
        role: "vaani",
        text: "Network mein kuch problem hai. Thodi der mein phir try karo. 🙏",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setMood("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Fullscreen Toggle ─────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const formatDate = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Top Bar — Showroom name + time + controls */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg shadow-lg">
            V
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">{dealershipName}</h1>
            <p className="text-xs text-white/50">Powered by VaahanERP • Vaani AI</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-mono font-bold tracking-wider">{formatTime(currentTime)}</p>
          <p className="text-xs text-white/50">{formatDate(currentTime)}</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button onClick={() => setShowChat(!showChat)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" title="Chat">
            <MessageSquare className="h-5 w-5" />
          </button>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" title="Voice">
            {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-white/40" />}
          </button>
          <button onClick={toggleFullscreen} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" title="Fullscreen">
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Main Content — Avatar + Interaction */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 180px)" }}>
        {/* Avatar */}
        <AvatarVisual mood={mood} isSpeaking={isSpeaking} />

        {/* Current Text Display */}
        {currentText && (
          <div className="mt-8 max-w-2xl px-8">
            <p className="text-center text-lg md:text-xl text-white/90 leading-relaxed font-medium animate-fadeIn">
              {currentText.length > 200 ? currentText.substring(0, 200) + "..." : currentText}
            </p>
          </div>
        )}

        {/* Big Mic Button */}
        <div className="mt-10">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
              transition-all duration-300 shadow-2xl
              ${isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-400/50 scale-110"
                : isProcessing
                ? "bg-amber-500/50 cursor-not-allowed"
                : "bg-white/15 hover:bg-white/25 hover:scale-105 active:scale-95 backdrop-blur-sm"
              }`}
          >
            {isListening ? (
              <MicOff className="h-8 w-8 md:h-10 md:w-10" />
            ) : isProcessing ? (
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Mic className="h-8 w-8 md:h-10 md:w-10" />
            )}
          </button>
          <p className="text-center text-xs text-white/40 mt-3">
            {isListening ? "Sun rahi hoon... (stop karo)" : isProcessing ? "Soch rahi hoon..." : "Mic dabao ya neeche se poochho"}
          </p>
        </div>
      </div>

      {/* Quick Prompts — Bottom Bar */}
      <div className="relative z-10 px-6 pb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => processUserInput(p.query)}
              disabled={isProcessing || isSpeaking}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/8 hover:bg-white/15 
                backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all
                disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <p.icon className="h-4 w-4 text-purple-300" />
              <span className="text-sm font-medium whitespace-nowrap">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Side Chat Panel */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-96 max-w-[85vw] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" /> Chat History
            </h3>
            <button onClick={() => setShowChat(false)} className="p-1.5 rounded-lg hover:bg-white/10">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-md"
                    : "bg-white/10 text-white/90 rounded-bl-md"
                }`}>
                  {msg.text}
                  <div className="text-[10px] text-white/30 mt-1">
                    {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {/* Text input in chat panel */}
          <form
            className="p-3 border-t border-white/10 flex gap-2"
            onSubmit={e => {
              e.preventDefault();
              const input = (e.target as any).elements.chatInput;
              if (input.value.trim()) {
                processUserInput(input.value.trim());
                input.value = "";
              }
            }}
          >
            <input
              name="chatInput"
              className="flex-1 h-10 px-4 rounded-xl bg-white/10 border border-white/10 text-white text-sm 
                placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Type karo..."
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 font-medium text-sm disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Branding footer */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <p className="text-[10px] text-white/20">
          Vaani AI Avatar • VaahanERP Enterprise • © 2026 Ravi Accounting Services
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
