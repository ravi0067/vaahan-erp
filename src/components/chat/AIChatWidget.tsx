"use client";

import * as React from "react";
import { X, Send, Mic, Sparkles, Minimize2, Bot, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/store/settings-store";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

const quickQueries = [
  "Today's sales",
  "Pending deliveries",
  "Hot leads count",
  "Cash in hand",
  "This month revenue",
  "Pending RTO applications",
  "Unlocked daybooks",
  "Insurance expiring this month",
  "Monthly expense summary",
  "Top selling models",
];



export function AIChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const { aiAssistant } = useSettingsStore();
  const aiConfigured = aiAssistant.apiKey.length > 0;
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! 🙏 I'm your Vaahan AI Assistant. Ask me anything about your dealership — sales, leads, deliveries, cashflow, or RTO status!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [showQueries, setShowQueries] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setShowQueries(false);

    try {
      // Check Zustand store first, then fallback to localStorage vaahan_ai_config
      let geminiKey = aiAssistant.apiKey;
      let callingConfig = null;
      
      if (typeof window !== 'undefined') {
        if (!geminiKey) {
          const savedConfig = localStorage.getItem('vaahan_ai_config');
          const aiConfig = savedConfig ? JSON.parse(savedConfig) : {};
          geminiKey = aiConfig.geminiApiKey || "";
        }

        // Read calling configuration
        const callingConfigStr = localStorage.getItem('vaahan_calling_config');
        callingConfig = callingConfigStr ? JSON.parse(callingConfigStr) : null;
      }

      // Format history for Gemini API: { role: 'user' | 'model', parts: [{ text: string }] }
      const chatHistory = updatedMessages.slice(1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatHistory,
          apiKey: geminiKey,
          callingConfig: callingConfig
        })
      });

      const data = await res.json();
      
      let botResponseText = data.response;
      if (!botResponseText) {
        botResponseText = data.error || "Sorry, I couldn't process that request right now.";
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: botResponseText,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: "Error connecting to AI Assistant Backend.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setShowQueries(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Floating button when closed
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

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-medium">Vaahan AI</span>
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
            <p className="font-semibold text-sm">Vaahan AI Assistant 🤖</p>
            <p className="text-[10px] opacity-80">Ask anything about your dealership</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Not Configured Banner */}
      {!aiConfigured && (
        <div className="bg-amber-50 dark:bg-amber-950 px-4 py-2 flex items-center gap-2 text-xs border-b border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="text-amber-700 dark:text-amber-300">
            AI not configured — showing demo responses.
          </span>
          <Link
            href="/admin/settings"
            className="ml-auto text-amber-700 dark:text-amber-300 underline hover:no-underline shrink-0 flex items-center gap-0.5"
          >
            <Settings className="h-3 w-3" /> Configure
          </Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator with bouncing dots */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.6s" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.6s" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.6s" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Queries — scrollable */}
      {showQueries && (
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {quickQueries.slice(0, 6).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="shrink-0 px-3 py-1 text-xs rounded-full border bg-background hover:bg-accent transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9"
          title="Voice input"
        >
          <Mic className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="h-9 text-sm"
          disabled={isTyping}
        />
        <Button type="submit" size="icon" className="shrink-0 h-9 w-9" disabled={!input.trim() || isTyping}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
