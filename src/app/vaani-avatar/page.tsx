"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, Maximize, Minimize,
  MessageSquare, Phone, Bike, Wrench, Shield, Clock,
  Sparkles, Camera, CameraOff, User, Settings, X
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────
interface ChatMsg { id: string; role: "user" | "vaani"; text: string; ts: Date; }
type Mood = "idle" | "listening" | "thinking" | "speaking" | "greeting";

const quickPrompts = [
  { icon: Bike, label: "🏍️ Bikes", query: "Kaunsi bikes available hain?" },
  { icon: "💰", label: "💰 Price", query: "Sabhi vehicles ki price list dikhao" },
  { icon: Wrench, label: "🔧 Service", query: "Service booking karni hai" },
  { icon: Shield, label: "🛡️ Insurance", query: "Insurance renewal kaise hoga?" },
  { icon: Clock, label: "💳 EMI", query: "EMI calculate karo" },
  { icon: Phone, label: "📞 Contact", query: "Showroom ka timing aur number?" },
];

// ── Custom Avatar with Lip Sync, Eye Blink, Expressions & Speaking Effects ──
const DEFAULT_AVATAR_IMAGE = "/avatars/ravi-vaani.jpg";

function AvatarCharacter({ mood, isSpeaking, avatarImageUrl }: { mood: Mood; isSpeaking: boolean; avatarImageUrl?: string }) {
  const [mouthOpen, setMouthOpen] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(false);
  const frameRef = useRef<number>(0);
  const blinkTimerRef = useRef<any>(null);

  const gradients: Record<Mood, string> = {
    idle: "from-violet-600 via-purple-600 to-indigo-700",
    listening: "from-blue-500 via-cyan-500 to-blue-600",
    thinking: "from-amber-500 via-orange-500 to-amber-600",
    speaking: "from-emerald-500 via-green-500 to-teal-600",
    greeting: "from-pink-500 via-rose-500 to-pink-600",
  };

  const glowColors: Record<Mood, string> = {
    idle: "rgba(124,58,237,0.3)",
    listening: "rgba(59,130,246,0.5)",
    thinking: "rgba(245,158,11,0.4)",
    speaking: "rgba(16,185,129,0.5)",
    greeting: "rgba(236,72,153,0.4)",
  };

  const ringColors: Record<Mood, string> = {
    idle: "border-violet-500/30",
    listening: "border-blue-400/60",
    thinking: "border-amber-400/50",
    speaking: "border-emerald-400/60",
    greeting: "border-pink-400/50",
  };

  // Lip sync — fast random mouth open/close simulating speech
  useEffect(() => {
    if (!isSpeaking) { setMouthOpen(0); return; }
    let running = true;
    const animate = () => {
      if (!running) return;
      const val = Math.random() * 0.7 + Math.sin(Date.now() * 0.015) * 0.3;
      setMouthOpen(Math.max(0, Math.min(1, val)));
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, [isSpeaking]);

  // Natural eye blink every 2-6 seconds
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      blinkTimerRef.current = setTimeout(() => {
        setEyeBlink(true);
        setTimeout(() => setEyeBlink(false), 150);
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimerRef.current);
  }, []);

  // Animated speaking bars
  const speakBars = isSpeaking ? [...Array(7)].map((_, i) => (
    <div key={i} className="w-1 md:w-1.5 rounded-full bg-white/80" style={{
      height: `${8 + Math.sin(Date.now() / 200 + i) * 16}px`,
      animation: `speakBar 0.3s ease-in-out ${i * 50}ms infinite alternate`,
    }} />
  )) : null;

  // Expression filter per mood
  const overlayFilter = mood === "thinking" ? "brightness(0.85) saturate(0.8)"
    : mood === "listening" ? "brightness(1.1) saturate(1.1)"
    : mood === "speaking" ? "brightness(1.05) contrast(1.05)"
    : mood === "greeting" ? "brightness(1.15) saturate(1.2)"
    : "brightness(1) saturate(1)";

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow — mood-reactive */}
      <div className="absolute -inset-16 rounded-full blur-3xl transition-all duration-1000"
        style={{ background: `radial-gradient(circle, ${glowColors[mood]}, transparent 70%)`,
          transform: isSpeaking ? "scale(1.3)" : "scale(1)",
        }} />

      {/* Animated rings */}
      {(isSpeaking || mood === "listening") && <>
        <div className={`absolute w-72 h-72 md:w-80 md:h-80 rounded-full border-2 ${ringColors[mood]} animate-ping`} style={{ animationDuration: "2s" }} />
        <div className={`absolute w-80 h-80 md:w-96 md:h-96 rounded-full border ${ringColors[mood]} animate-ping`} style={{ animationDuration: "3s" }} />
      </>}
      {mood === "thinking" && (
        <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border-2 border-amber-400/30 animate-spin" style={{ animationDuration: "4s" }} />
      )}

      {/* Main avatar container */}
      <div className={`relative w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br ${gradients[mood]}
        flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden
        ${mood === "listening" ? "scale-105 ring-4 ring-blue-400/40" : ""}
        ${mood === "thinking" ? "scale-[1.02]" : ""}
        ${isSpeaking ? "scale-110" : ""}
        ${mood === "greeting" ? "ring-4 ring-pink-400/30" : ""}`}
        style={{ animation: isSpeaking ? "avatarBreathe 0.6s ease-in-out infinite" : mood === "idle" ? "avatarIdle 4s ease-in-out infinite" : "none" }}>

        {/* Spinning gradient border ring */}
        <div className="absolute inset-1 rounded-full overflow-hidden" style={{
          background: `conic-gradient(from 0deg, ${glowColors[mood]}, transparent 40%, ${glowColors[mood]})`,
          animation: "spinRing 3s linear infinite",
        }}>
          <div className="absolute inset-1 rounded-full bg-slate-950" />
        </div>

        {/* Avatar image with expression overlays */}
        <div className="absolute inset-3 rounded-full overflow-hidden">
          {/* Main image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarImageUrl || DEFAULT_AVATAR_IMAGE}
            alt="Vaani Avatar"
            className="w-full h-full object-cover transition-all duration-300"
            style={{
              filter: overlayFilter,
              transform: isSpeaking
                ? `scale(${1.02 + mouthOpen * 0.03}) translateY(${-mouthOpen * 1.5}px)`
                : mood === "listening" ? "scale(1.03)" : "scale(1)",
            }}
          />

          {/* Eye blink overlay — thin skin-colored bars over eye region */}
          {eyeBlink && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[28%] left-[22%] w-[20%] h-[4%] bg-[#d4a07a] rounded-full opacity-90" />
              <div className="absolute top-[28%] right-[22%] w-[20%] h-[4%] bg-[#d4a07a] rounded-full opacity-90" />
            </div>
          )}

          {/* Lip/mouth movement overlay when speaking */}
          {isSpeaking && (
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 pointer-events-none">
              <div style={{
                  width: `${20 + mouthOpen * 14}px`,
                  height: `${3 + mouthOpen * 14}px`,
                  background: `radial-gradient(ellipse, rgba(180,40,40,${0.5 + mouthOpen * 0.35}), rgba(120,20,20,${0.3 + mouthOpen * 0.25}))`,
                  borderRadius: "50%",
                  transition: "all 50ms ease-out",
                  boxShadow: `0 ${mouthOpen * 2}px ${4 + mouthOpen * 4}px rgba(0,0,0,0.3)`,
                }} />
            </div>
          )}

          {/* Mood color overlays */}
          {mood === "greeting" && (
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-transparent to-transparent pointer-events-none" />
          )}
          {mood === "thinking" && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "repeating-conic-gradient(rgba(245,158,11,0.05) 0%, transparent 5%)",
              animation: "spinRing 6s linear infinite",
            }} />
          )}
          {mood === "listening" && (
            <div className="absolute inset-0 border-4 border-blue-400/20 rounded-full animate-pulse pointer-events-none" />
          )}

          {/* Breathing shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5 pointer-events-none"
            style={{ opacity: isSpeaking ? 0.4 + mouthOpen * 0.2 : 0.3 }} />
        </div>
      </div>

      {/* Name tag */}
      <p className="text-white font-bold text-sm md:text-base tracking-[0.25em] mt-3 drop-shadow-lg">VAANI</p>

      {/* Speaking equalizer bars */}
      {isSpeaking && (
        <div className="flex gap-1 items-end mt-3 h-8">{speakBars}</div>
      )}

      {/* Mood status badge */}
      <div className={`mt-3 px-5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-all duration-500 ${
        mood === "idle" ? "bg-white/10 text-white/60" :
        mood === "listening" ? "bg-blue-500/20 text-blue-300 animate-pulse" :
        mood === "thinking" ? "bg-amber-500/20 text-amber-300" :
        mood === "speaking" ? "bg-green-500/20 text-green-300" :
        "bg-pink-500/20 text-pink-300"
      }`}>
        {mood === "idle" && "💬 Baat karein mujhse..."}
        {mood === "listening" && "👂 Sun rahi hoon..."}
        {mood === "thinking" && "🤔 Soch rahi hoon..."}
        {mood === "speaking" && "🗣️ Bol rahi hoon..."}
        {mood === "greeting" && "🙏 Swagat hai!"}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function VaaniAvatarPage() {
  // ── State ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [mood, setMood] = useState<Mood>("greeting");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── Customer tracking ──────────────────────────────────────────────────
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [visitorPhone, setVisitorPhone] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);
  const [visitCount, setVisitCount] = useState(1);
  const [previousQueries, setPreviousQueries] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [queries, setQueries] = useState<string[]>([]);

  // ── Camera ─────────────────────────────────────────────────────────────
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Branding ───────────────────────────────────────────────────────────
  const [dealershipName, setDealershipName] = useState("VaahanERP Showroom");
  const [brandColor, setBrandColor] = useState("#7c3aed");
  const [showSettings, setShowSettings] = useState(false);
  const [avatarImageUrl, setAvatarImageUrl] = useState(DEFAULT_AVATAR_IMAGE);

  // ── Inventory (real dealership stock) ─────────────────────────────────
  const [inventory, setInventory] = useState<{
    brands: string[];
    inventoryByBrand: Record<string, any[]>;
    firmName: string | null;
    city: string | null;
    totalAvailable: number;
    showroomLocations: any[];
  }>({ brands: [], inventoryByBrand: {}, firmName: null, city: null, totalAvailable: 0, showroomLocations: [] });

  // ── Voice Gender ────────────────────────────────────────────────────────
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");

  // ── Wake Word Detection (continuous listening) ─────────────────────────
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const wakeRecognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);

  // ── Refs ────────────────────────────────────────────────────────────────
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Clock ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Load branding + voice from localStorage ─────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("vaani_branding");
    if (saved) {
      try {
        const b = JSON.parse(saved);
        if (b.name) setDealershipName(b.name);
        if (b.color) setBrandColor(b.color);
      } catch {}
    }
    const savedAvatar = localStorage.getItem("vaani_avatar_image");
    if (savedAvatar) setAvatarImageUrl(savedAvatar);
    const savedVoice = localStorage.getItem("vaani_voice");
    if (savedVoice === "male" || savedVoice === "female") setVoiceGender(savedVoice);
  }, []);

  useEffect(() => {
    const loadAvatarConfig = async () => {
      try {
        const res = await fetch("/api/admin/ai-config", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const avatarUrl = data?.settings?.vaani?.["vaani.customAvatarUrl"]?.value;
        if (avatarUrl && typeof avatarUrl === "string" && !avatarUrl.includes("••••")) {
          setAvatarImageUrl(avatarUrl);
          localStorage.setItem("vaani_avatar_image", avatarUrl);
        }
      } catch {}
    };
    loadAvatarConfig();
  }, []);

  // ── Fetch real dealership inventory ──────────────────────────────────
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // Get tenantId from localStorage (set during login) or session
        const tenantId = localStorage.getItem("vaani_tenantId") ||
                         sessionStorage.getItem("tenantId") || "";
        const url = tenantId
          ? `/api/vaani-avatar/inventory?tenantId=${tenantId}`
          : `/api/vaani-avatar/inventory`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setInventory(data);
          if (data.firmName) setDealershipName(data.firmName);
        }
      } catch (err) {
        console.error("Inventory fetch error:", err);
      }
    };
    fetchInventory();
  }, []);

  // ── Initial greeting ───────────────────────────────────────────────────
  useEffect(() => {
    const greeting = `${dealershipName} mein aapka swagat hai! Main Vaani hoon, aapki AI assistant. Kaise madad kar sakti hoon? Aap apna naam bata dijiye, mujhe khushi hogi aapko better help karne mein!`;
    const msg: ChatMsg = { id: "g0", role: "vaani", text: greeting, ts: new Date() };
    setMessages([msg]);
    setCurrentText(greeting);
    setTimeout(() => speakText(greeting), 1500);
    setTimeout(() => { if (!isListening && !isSpeaking) setMood("idle"); }, 15000);
    // Start wake word detection
    startWakeWordDetection();
  }, []);

  // Keep refs in sync
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  // ── Wake Word Detection ("Hey Vaani") ─────────────────────────────────
  const startWakeWordDetection = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    // Stop existing wake listener
    if (wakeRecognitionRef.current) {
      try { wakeRecognitionRef.current.abort(); } catch {}
      wakeRecognitionRef.current = null;
    }

    const recognition = new SR();
    recognition.lang = "hi-IN";
    recognition.continuous = false; // Use short bursts — more reliable cross-browser
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      for (let i = 0; i < event.results.length; i++) {
        for (let j = 0; j < event.results[i].length; j++) {
          const transcript = event.results[i][j].transcript.toLowerCase().trim();
          // Check for wake word in any alternative
          if (transcript.includes("hey vaani") || transcript.includes("hello vaani") ||
              transcript.includes("hi vaani") || transcript.includes("vaani") ||
              transcript.includes("bani") || transcript.includes("वाणी")) {
            // Wake word detected!
            setWakeWordActive(false);
            wakeRecognitionRef.current = null;
            // Extract query after trigger
            const afterWake = transcript
              .replace(/.*?(hey vaani|hello vaani|hi vaani|vaani|bani|हे वाणी|वाणी)\s*/i, "")
              .trim();
            if (afterWake.length > 2) {
              processUserInput(afterWake);
            } else {
              // Just wake word — start active listening for query
              setTimeout(() => startListeningDirect(), 200);
            }
            return;
          }
        }
      }
    };

    recognition.onend = () => {
      // Auto-restart wake word detection in loop (short bursts)
      if (!isListeningRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (!isListeningRef.current && !isSpeakingRef.current) {
            try {
              recognition.start();
              setWakeWordActive(true);
            } catch {}
          }
        }, 300);
      }
    };

    recognition.onerror = (e: any) => {
      // Restart on non-fatal errors
      if (e.error !== "aborted" && e.error !== "not-allowed") {
        setTimeout(() => {
          if (!isListeningRef.current && !isSpeakingRef.current) {
            try { recognition.start(); setWakeWordActive(true); } catch {}
          }
        }, 1000);
      }
    };

    try {
      recognition.start();
      setWakeWordActive(true);
      wakeRecognitionRef.current = recognition;
    } catch (e) {
      console.log("Wake word failed to start:", e);
    }
  }, []);

  // ── Camera Functions ───────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
      });
      setCameraStream(stream);
      setCameraOn(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraOn(false);
  };

  const capturePhoto = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, 160, 120);
    return canvas.toDataURL("image/jpeg", 0.6);
  };

  // ── TTS (ElevenLabs + fallback) ────────────────────────────────────────
  const speakText = async (text: string) => {
    if (!voiceEnabled) { setMood("idle"); return; }
    setIsSpeaking(true);
    setMood("speaking");
    // Stop wake word while speaking
    if (wakeRecognitionRef.current) { try { wakeRecognitionRef.current.abort(); } catch {} setWakeWordActive(false); }
    try {
      const res = await fetch("/api/vaani-avatar/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voiceGender }),
      });
      if (res.ok && res.headers.get("content-type")?.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setIsSpeaking(false); setMood("idle"); URL.revokeObjectURL(url); restartWakeWord(); };
        audio.onerror = () => { fallbackSpeak(text); };
        await audio.play();
        return;
      }
    } catch {}
    fallbackSpeak(text);
  };

  const fallbackSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) { setIsSpeaking(false); setMood("idle"); return; }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[\uD800-\uDFFF]/g, "").replace(/[*_~`#]/g, "").replace(/\n+/g, ". ").substring(0, 500);
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 0.95; u.pitch = 1.15; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    u.voice = voices.find(v => v.lang.includes("hi")) || voices.find(v => v.name.toLowerCase().includes("female")) || voices[0];
    u.onend = () => { setIsSpeaking(false); setMood("idle"); restartWakeWord(); };
    window.speechSynthesis.speak(u);
  };

  const restartWakeWord = () => {
    setTimeout(() => {
      if (!isListening) startWakeWordDetection();
    }, 1000);
  };

  // ── Active Listening (after wake word or mic press) ────────────────────
  const startListeningDirect = () => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { console.log("SpeechRecognition not supported"); return; }

    // Stop wake word listener
    if (wakeRecognitionRef.current) { try { wakeRecognitionRef.current.abort(); } catch {} wakeRecognitionRef.current = null; }
    setWakeWordActive(false);

    // Stop current speech
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const r = new SR();
    r.lang = "hi-IN";
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 1;

    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setIsListening(false);
      if (transcript.trim()) processUserInput(transcript.trim());
      else restartWakeWord();
    };
    r.onerror = (e: any) => {
      console.log("Listening error:", e.error);
      setIsListening(false);
      setMood("idle");
      restartWakeWord();
    };
    r.onend = () => {
      if (isListeningRef.current) {
        setIsListening(false);
        restartWakeWord();
      }
    };

    try {
      recognitionRef.current = r;
      r.start();
      setIsListening(true);
      setMood("listening");
    } catch (e) {
      console.log("Mic start failed:", e);
      setIsListening(false);
      restartWakeWord();
    }
  };

  const startListening = startListeningDirect;

  const stopListening = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setIsListening(false);
    setMood("idle");
    restartWakeWord();
  };

  // ── Process Input ──────────────────────────────────────────────────────
  const processUserInput = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMsg = { id: `u${Date.now()}`, role: "user", text: text.trim(), ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setCurrentText(text.trim());
    setMood("thinking");
    setIsProcessing(true);
    setQueries(prev => [...prev, text.trim()]);

    // Detect name from user input
    const namePatterns = [
      /(?:mera naam|my name is|i am|mai|main)\s+(?:hai\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /(?:naam|name)\s*(?:hai|is|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    ];
    for (const pat of namePatterns) {
      const m = text.match(pat);
      if (m?.[1] && m[1].length > 2) {
        setVisitorName(m[1].trim());
        break;
      }
    }

    // Detect phone
    const phoneMatch = text.match(/\b(\d{10})\b/);
    if (phoneMatch) setVisitorPhone(phoneMatch[1]);

    try {
      const history = [...messages, userMsg].slice(-8).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const res = await fetch("/api/vaani-avatar/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: {
            dealershipName,
            firmName: inventory.firmName || dealershipName,
            city: inventory.city,
            brands: inventory.brands,
            inventoryByBrand: inventory.inventoryByBrand,
            totalAvailable: inventory.totalAvailable,
            showroomLocations: inventory.showroomLocations,
            visitorName,
            isReturning,
            visitCount,
            previousQueries,
          },
        }),
      });

      const data = await res.json();
      const responseText = data.response || "Sorry, phir se bolein?";

      // If AI detected name
      if (data.detectedName && !visitorName) setVisitorName(data.detectedName);

      const vaaniMsg: ChatMsg = { id: `v${Date.now()}`, role: "vaani", text: responseText, ts: new Date() };
      setMessages(prev => [...prev, vaaniMsg]);
      setCurrentText(responseText);
      await speakText(responseText);
    } catch {
      const errMsg: ChatMsg = { id: `e${Date.now()}`, role: "vaani", text: "Network problem hai, thodi der mein try karein!", ts: new Date() };
      setMessages(prev => [...prev, errMsg]);
      setMood("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Save visitor to CRM when we have enough info ───────────────────────
  useEffect(() => {
    if ((visitorName || visitorPhone) && !sessionId) {
      const photo = cameraOn ? capturePhoto() : null;
      fetch("/api/vaani-avatar/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: visitorName,
          phone: visitorPhone,
          photoBase64: photo,
          queries,
          sessionMessages: messages.map(m => ({ role: m.role, text: m.text, ts: m.ts })),
        }),
      }).then(r => r.json()).then(data => {
        if (data.success) {
          setSessionId(data.sessionId);
          if (data.visitor?.isReturning) {
            setIsReturning(true);
            setVisitCount(data.visitor.visitCount);
          }
          if (data.previousInfo) {
            setPreviousQueries(data.previousInfo.previousQueries || []);
          }
        }
      }).catch(() => {});
    }
  }, [visitorName, visitorPhone]);

  // ── Fullscreen ─────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const saveBranding = () => {
    localStorage.setItem("vaani_branding", JSON.stringify({ name: dealershipName, color: brandColor }));
    localStorage.setItem("vaani_avatar_image", avatarImageUrl);
    setShowSettings(false);
  };

  const fmt = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const fmtDate = (d: Date) => d.toLocaleDateString("hi-IN", { weekday: "long", day: "numeric", month: "long" });

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden relative select-none">
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {/* Hidden elements */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
            style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)` }}>V</div>
          <div>
            <h1 className="text-base md:text-lg font-bold">{dealershipName}</h1>
            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <span>Powered by Vaani AI</span>
              {wakeWordActive && <span className="text-green-400">● "Hey Vaani" active</span>}
              {visitorName && <span className="text-purple-300">👤 {visitorName}</span>}
            </div>
          </div>
        </div>

        <div className="text-right mr-3">
          <p className="text-xl md:text-2xl font-mono font-bold">{fmt(currentTime)}</p>
          <p className="text-[10px] text-white/40">{fmtDate(currentTime)}</p>
        </div>

        <div className="flex gap-1.5">
          <button onClick={() => cameraOn ? stopCamera() : startCamera()}
            className={`p-2 rounded-xl transition-colors ${cameraOn ? "bg-green-500/20 text-green-400" : "bg-white/10 hover:bg-white/20"}`}
            title="Camera">
            {cameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </button>
          <button onClick={() => setShowChat(!showChat)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-white/40" />}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
            <Settings className="h-4 w-4" />
          </button>
          <button onClick={toggleFullscreen} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Camera preview (small corner) */}
      {cameraOn && (
        <div className="absolute top-16 right-4 z-20 w-32 h-24 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center py-0.5 text-green-400">
            📷 Camera On
          </div>
        </div>
      )}

      {/* ── Main Avatar ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 200px)" }}>
        <AvatarCharacter mood={mood} isSpeaking={isSpeaking} avatarImageUrl={avatarImageUrl} />

        {/* Customer name badge */}
        {visitorName && (
          <div className="mt-3 px-4 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-sm">
            <User className="h-3 w-3 inline mr-1" />
            {visitorName} ji {isReturning && `(Visit #${visitCount})`}
          </div>
        )}

        {/* Current text */}
        {currentText && (
          <div className="mt-6 max-w-xl px-6">
            <p className="text-center text-base md:text-lg text-white/85 leading-relaxed font-medium">
              {currentText.length > 180 ? currentText.substring(0, 180) + "..." : currentText}
            </p>
          </div>
        )}

        {/* Big Mic */}
        <div className="mt-8">
          <button onClick={isListening ? stopListening : startListening} disabled={isProcessing}
            className={`relative w-18 h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl
              ${isListening ? "bg-red-500 animate-pulse ring-4 ring-red-400/50 scale-110"
                : isProcessing ? "bg-amber-500/40 cursor-not-allowed"
                : "bg-white/15 hover:bg-white/25 hover:scale-105 active:scale-95 backdrop-blur-sm"}`}>
            {isListening ? <MicOff className="h-7 w-7" />
              : isProcessing ? <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Mic className="h-7 w-7" />}
          </button>
          <p className="text-center text-[10px] text-white/35 mt-2">
            {isListening ? "Sun rahi hoon..." : isProcessing ? "Soch rahi hoon..." : "Mic dabao ya \"Hey Vaani\" bolo"}
          </p>
        </div>
      </div>

      {/* ── Quick Prompts ────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto justify-center flex-wrap">
          {quickPrompts.map((p, i) => (
            <button key={i} onClick={() => processUserInput(p.query)} disabled={isProcessing || isSpeaking}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/15 backdrop-blur-sm
                border border-white/10 hover:border-white/20 transition-all disabled:opacity-30 shrink-0 text-sm">
              <span>{typeof p.icon === "string" ? p.icon : ""}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Panel ───────────────────────────────────────────────── */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-bold text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-400" /> Chat</h3>
            <button onClick={() => setShowChat(false)} className="p-1 rounded hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user" ? "bg-purple-600 rounded-br-sm" : "bg-white/10 rounded-bl-sm"
                }`}>{m.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="p-3 border-t border-white/10 flex gap-2"
            onSubmit={e => { e.preventDefault(); const inp = (e.target as any).elements.ci;
              if (inp.value.trim()) { processUserInput(inp.value.trim()); inp.value = ""; } }}>
            <input name="ci" className="flex-1 h-9 px-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm
              placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              placeholder="Type karo..." disabled={isProcessing} />
            <button type="submit" disabled={isProcessing}
              className="px-3 h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-medium disabled:opacity-40">Send</button>
          </form>
        </div>
      )}

      {/* ── Settings Panel (Branding) ────────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <div className="bg-slate-900 rounded-2xl p-6 w-96 max-w-[90vw] border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">⚙️ Avatar Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/60 block mb-1">Dealership / Firm Name</label>
                <input value={dealershipName} onChange={e => setDealershipName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:ring-1 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Brand Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer" />
                  <input value={brandColor} onChange={e => setBrandColor(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Voice — Girl / Boy</label>
                <div className="flex gap-2">
                  <button onClick={() => { setVoiceGender("female"); localStorage.setItem("vaani_voice", "female"); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      voiceGender === "female" ? "bg-pink-500/30 text-pink-300 border border-pink-400/50" : "bg-white/10 text-white/60"}`}>
                    👩 Girl Voice
                  </button>
                  <button onClick={() => { setVoiceGender("male"); localStorage.setItem("vaani_voice", "male"); }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      voiceGender === "male" ? "bg-blue-500/30 text-blue-300 border border-blue-400/50" : "bg-white/10 text-white/60"}`}>
                    👨 Boy Voice
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Avatar Image URL</label>
                <input value={avatarImageUrl} onChange={e => setAvatarImageUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm" />
                <p className="mt-1 text-[10px] text-white/40">Custom image URL paste karke avatar ko turant replace kar sakte ho.</p>
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1">Camera</label>
                <button onClick={() => cameraOn ? stopCamera() : startCamera()}
                  className={`px-4 py-2 rounded-lg text-sm ${cameraOn ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                  {cameraOn ? "📷 Camera Off Karo" : "📷 Camera On Karo"}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={saveBranding}
                className="flex-1 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 font-medium text-sm">Save</button>
              <button onClick={() => setShowSettings(false)}
                className="flex-1 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-1 left-0 right-0 text-center">
        <p className="text-[9px] text-white/15">Vaani AI Avatar • VaahanERP Enterprise • © 2026</p>
      </div>

      <style jsx>{`
        @keyframes speakBar { from { transform: scaleY(0.5); } to { transform: scaleY(1.5); } }
        @keyframes avatarBreathe { 0%,100% { transform: scale(1.10); } 50% { transform: scale(1.13); } }
        @keyframes avatarIdle { 0%,100% { transform: scale(1); } 50% { transform: scale(1.015); } }
        @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
