"use client";

import * as React from "react";
import { X, Send, Mic, MicOff, Sparkles, Minimize2, Bot, BarChart3, Users, DollarSign, ClipboardList, Phone, FileText, Bike, Wrench, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  toolsExecuted?: number;
  executionTime?: number;
  spokenByVoice?: boolean; // Was this triggered by voice command?
}

// Quick action buttons
const quickActions = [
  { icon: BarChart3, label: "📊 Sales", query: "Aaj ki sales report dikhao" },
  { icon: Users, label: "👥 Leads", query: "Pending follow-ups dikhao" },
  { icon: DollarSign, label: "💰 Cash", query: "Aaj ka cash summary" },
  { icon: ClipboardList, label: "📋 Bookings", query: "Recent bookings list" },
  { icon: Phone, label: "📞 Follow-ups", query: "Pending followups lao" },
  { icon: FileText, label: "📄 Reports", query: "Revenue report banao" },
  { icon: Bike, label: "🏍️ Stock", query: "Inventory status check karo" },
  { icon: Wrench, label: "🔧 Service", query: "Active service jobs" },
];

const quickQueries = [
  "Aaj ka dashboard",
  "Pending follow-ups",
  "Hot leads kitne hain",
  "Cash summary",
  "Revenue report",
  "Recent bookings",
  "Available inventory",
  "Service jobs",
];

// Number shortcuts
const numberShortcuts: { [key: string]: string } = {
  "1": "Aaj ki sales report dikhao",
  "2": "Pending follow-ups dikhao",
  "3": "Aaj ka cash summary",
  "4": "Recent bookings list",
  "5": "Pending followups lao",
  "6": "Revenue report banao",
  "7": "Inventory status check karo",
  "8": "Active service jobs",
  "9": "RTO status check karo"
};

// ── Check if message is a Vaani voice trigger ────────────────────────────
function isVaaniTrigger(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    lower.startsWith("hey vaani") ||
    lower.startsWith("hello vaani") ||
    lower.startsWith("hi vaani") ||
    lower.startsWith("ok vaani") ||
    lower.startsWith("vaani") ||
    lower.startsWith("हे वाणी") ||
    lower.startsWith("हैलो वाणी") ||
    lower.startsWith("वाणी")
  );
}

// ── Strip Vaani trigger from message to get actual query ────────────────
function stripVaaniTrigger(text: string): string {
  const lower = text.toLowerCase().trim();
  const triggers = ["hey vaani", "hello vaani", "hi vaani", "ok vaani", "हे वाणी", "हैलो वाणी", "वाणी", "vaani"];
  for (const t of triggers) {
    if (lower.startsWith(t)) {
      const rest = text.trim().substring(t.length).trim();
      // Remove leading comma, dash etc
      return rest.replace(/^[,\-–—\s]+/, "").trim();
    }
  }
  return text.trim();
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! 🙏 Main hoon Vaani — aapki VaahanERP AI Assistant!\n\nMujhse kuch bhi poochho — sales, leads, deliveries, cashflow, ya RTO status! 💁‍♀️\n\n🎙️ Voice ke liye: Mic button dabao ya \"Hey Vaani\" bolo\n💬 Chat: Seedha type karo — text mein jawab milega",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [showQueries, setShowQueries] = React.useState(true);

  // ── Voice State ────────────────────────────────────────────────────────
  // voiceMode: Whether Vaani should SPEAK the response (only on voice triggers)
  const [voiceMode, setVoiceMode] = React.useState(false);
  // isListening: Mic is actively listening
  const [isListening, setIsListening] = React.useState(false);
  // voiceEnabled: Master toggle — can user use voice at all?
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);

  const recognitionRef = React.useRef<any>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // ── Vaani TTS — ONLY called when voiceMode is true ────────────────────
  const speakVaani = React.useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean text for speech
      const cleanText = text
        .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
        .replace(/[*_~`#]/g, "")
        .replace(/\n+/g, ". ")
        .substring(0, 500);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.15;
      utterance.volume = 1;
      // Set Hinglish voice — prefer Hindi female
      const voices = window.speechSynthesis.getVoices();
      const femaleHindi = voices.find((v) =>
        v.lang.includes("hi") &&
        (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("lekha") || v.name.toLowerCase().includes("aditi"))
      );
      const femaleEn = voices.find((v) =>
        v.lang.includes("en") &&
        (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("zira"))
      );
      const anyFemale = voices.find((v) => v.name.toLowerCase().includes("female"));
      const hindi = voices.find((v) => v.lang.includes("hi"));
      utterance.voice = femaleHindi || femaleEn || anyFemale || hindi || voices[0] || null;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, []);

  // ── Voice Input (Mic button or continuous listening) ───────────────────
  const toggleVoiceInput = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN"; // Hinglish — understands Hindi + English mix
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);

      // Voice input ALWAYS activates voice mode for response
      if (isVaaniTrigger(transcript)) {
        const actualQuery = stripVaaniTrigger(transcript);
        if (actualQuery) {
          sendMessage(actualQuery, true); // true = voice mode
        } else {
          // Just said "Hey Vaani" with no query — acknowledge
          sendMessage("Namaste!", true);
        }
      } else {
        // Mic button pressed but didn't say "Hey Vaani" — still voice mode since they used mic
        sendMessage(transcript, true);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Send Message ──────────────────────────────────────────────────────
  // isVoice: true = response should be spoken aloud
  const sendMessage = async (text: string, isVoice: boolean = false) => {
    if (!text.trim()) return;

    // Check for number shortcuts
    const trimmedText = text.trim();
    const shortcutQuery = numberShortcuts[trimmedText];
    const messageText = shortcutQuery || trimmedText;

    // Check if typed message has Vaani trigger
    const typedVoiceTrigger = !isVoice && isVaaniTrigger(messageText);
    const shouldSpeak = isVoice || typedVoiceTrigger;
    const finalMessage = typedVoiceTrigger ? stripVaaniTrigger(messageText) || messageText : messageText;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: finalMessage,
      timestamp: new Date(),
      spokenByVoice: shouldSpeak,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setShowQueries(false);
    setVoiceMode(shouldSpeak);

    try {
      const chatHistory = updatedMessages.slice(1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const res = await fetch("/api/ai-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();

      let botResponseText = data.response;
      if (!botResponseText) {
        botResponseText = data.error || "Sorry, abhi process nahi ho paya. Phir se try karo.";
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: botResponseText,
        timestamp: new Date(),
        toolsExecuted: data.toolsExecuted || 0,
        executionTime: data.executionTime,
        spokenByVoice: shouldSpeak,
      };

      setMessages((prev) => [...prev, botMsg]);

      // ✅ VOICE ONLY when triggered by voice command or "Hey Vaani" text
      if (shouldSpeak && voiceEnabled) {
        speakVaani(botResponseText);
      }
      // ❌ Normal text chat = NO voice, just text response
    } catch (e) {
      const errorMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: "AI Engine se connection error. Phir se try karo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setShowQueries(true);
      setVoiceMode(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Text submit = NO voice (unless "Hey Vaani" typed)
    sendMessage(input, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= "1" && e.key <= "9" && input === "" && !isTyping) {
      e.preventDefault();
      const shortcut = numberShortcuts[e.key];
      if (shortcut) {
        sendMessage(e.key, false); // Keyboard = text mode
      }
    }
  };

  // Stop voice
  const stopVoice = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceEnabled(false);
  };

  // ── Floating button (closed) ──────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
      >
        <Sparkles className="h-6 w-6 group-hover:animate-pulse" />
      </button>
    );
  }

  // ── Minimized ─────────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-medium">Vaani AI 💁‍♀️</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <p className="font-semibold text-sm">Vaani AI 💁‍♀️</p>
            <p className="text-[10px] opacity-80">Hinglish • Chat & Voice Assistant</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <Minimize2 className="h-4 w-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 bg-accent/30 border-b">
        <div className="text-xs font-medium text-muted-foreground mb-2">Quick Actions:</div>
        <div className="grid grid-cols-4 gap-1">
          {quickActions.slice(0, 8).map((action, i) => (
            <button
              key={i}
              onClick={() => sendMessage(action.query, false)}
              disabled={isTyping}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-xs text-center flex flex-col items-center gap-0.5 disabled:opacity-50"
              title={action.label}
            >
              <action.icon className="h-3 w-3" />
              <span className="text-[9px] leading-none">{action.label.split(" ")[1]}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          💬 Type = Text reply • 🎙️ Mic / "Hey Vaani" = Voice reply
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}
            >
              {msg.text}
              {msg.role === "assistant" && (msg.toolsExecuted || msg.executionTime) && (
                <div className="mt-2 text-xs opacity-60 border-t pt-2">
                  {msg.toolsExecuted ? `🔧 ${msg.toolsExecuted} tools` : ""}
                  {msg.executionTime ? ` • ⚡ ${msg.executionTime}ms` : ""}
                  {msg.spokenByVoice ? " • 🔊 Voice" : ""}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.6s" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.6s" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.6s" }} />
              {voiceMode && <span className="text-xs text-muted-foreground ml-2">🎙️</span>}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Queries */}
      {showQueries && (
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {quickQueries.slice(0, 6).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q, false)}
              className="shrink-0 px-3 py-1 text-xs rounded-full border bg-background hover:bg-accent transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        {/* 🎙️ Voice Button — activates voice mode */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`shrink-0 h-9 w-9 ${isListening ? "bg-red-100 text-red-600 animate-pulse" : voiceEnabled ? "" : "opacity-50"}`}
          title={isListening ? "Sun raha hai... (stop karne ke liye click karo)" : "🎙️ Voice — Mic dabao, bolo, Vaani bolegi!"}
          onClick={voiceEnabled ? toggleVoiceInput : undefined}
          disabled={!voiceEnabled}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-muted-foreground" />}
        </Button>

        {/* Text Input */}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "🎙️ Sun raha hoon..." : "Type karo ya \"Hey Vaani\" bolo..."}
          className="h-9 text-sm"
          disabled={isTyping}
        />

        {/* 🔊 Voice Toggle — master on/off */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9"
          title={voiceEnabled ? "Voice ON — Mic se bologe to Vaani bolegi" : "Voice OFF — sirf text"}
          onClick={() => {
            if (voiceEnabled) {
              stopVoice();
            } else {
              setVoiceEnabled(true);
            }
          }}
        >
          {voiceEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
        </Button>

        {/* Send Button */}
        <Button type="submit" size="icon" className="shrink-0 h-9 w-9" disabled={!input.trim() || isTyping}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
