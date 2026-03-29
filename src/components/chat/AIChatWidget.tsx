"use client";

import * as React from "react";
import { X, Send, Mic, Sparkles, Minimize2, Bot, Settings, AlertTriangle, BarChart3, Users, DollarSign, ClipboardList, Phone, FileText, Bike, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/store/settings-store";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  toolsExecuted?: number;
  executionTime?: number;
}

// Quick action buttons for easy access
const quickActions = [
  { icon: BarChart3, label: "📊 Sales", query: "Show me today's sales report" },
  { icon: Users, label: "👥 Leads", query: "Show pending follow-ups" },
  { icon: DollarSign, label: "💰 Cash", query: "Today's cash summary" },
  { icon: ClipboardList, label: "📋 Bookings", query: "Recent bookings list" },
  { icon: Phone, label: "📞 Follow-ups", query: "Get pending followups" },
  { icon: FileText, label: "📄 Reports", query: "Generate revenue report" },
  { icon: Bike, label: "🏍️ Stock", query: "Check inventory status" },
  { icon: Wrench, label: "🔧 Service", query: "Active service jobs" },
];

const quickQueries = [
  "Today's dashboard stats",
  "Pending follow-ups",
  "Hot leads count", 
  "Cash summary",
  "Revenue report",
  "Recent bookings",
  "Available inventory",
  "Service jobs",
  "RTO status",
  "Insurance expiring",
];

// Number shortcuts
const numberShortcuts: { [key: string]: string } = {
  "1": "Show me today's sales report",
  "2": "Show pending follow-ups", 
  "3": "Today's cash summary",
  "4": "Recent bookings list",
  "5": "Get pending followups",
  "6": "Generate revenue report",
  "7": "Check inventory status",
  "8": "Active service jobs",
  "9": "RTO status check"
};



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

    // Check for number shortcuts
    const trimmedText = text.trim();
    const shortcutQuery = numberShortcuts[trimmedText];
    const messageText = shortcutQuery || trimmedText;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user", 
      text: messageText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setShowQueries(false);

    try {
      // Format history for new AI Engine API: { role: 'user' | 'model', parts: [{ text: string }] }
      const chatHistory = updatedMessages.slice(1).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      // Call new AI Engine API (server-side API key)
      const res = await fetch('/api/ai-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatHistory
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
        toolsExecuted: data.toolsExecuted || 0,
        executionTime: data.executionTime
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: "Error connecting to AI Engine. Please try again.",
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle number shortcuts (1-9)
    if (e.key >= '1' && e.key <= '9' && input === '' && !isTyping) {
      e.preventDefault();
      const shortcut = numberShortcuts[e.key];
      if (shortcut) {
        sendMessage(e.key); // Send the number, will be converted to query
      }
    }
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

      {/* Quick Action Buttons */}
      <div className="px-4 py-3 bg-accent/30 border-b">
        <div className="text-xs font-medium text-muted-foreground mb-2">Quick Actions:</div>
        <div className="grid grid-cols-4 gap-1">
          {quickActions.slice(0, 8).map((action, i) => (
            <button
              key={i}
              onClick={() => sendMessage(action.query)}
              disabled={isTyping}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-xs text-center flex flex-col items-center gap-0.5 disabled:opacity-50"
              title={action.label}
            >
              <action.icon className="h-3 w-3" />
              <span className="text-[9px] leading-none">{action.label.split(' ')[1]}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          💡 Press 1-9 for quick shortcuts
        </div>
      </div>

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
              {msg.role === "assistant" && (msg.toolsExecuted || msg.executionTime) && (
                <div className="mt-2 text-xs opacity-60 border-t pt-2">
                  {msg.toolsExecuted ? `🔧 ${msg.toolsExecuted} tools` : ''}
                  {msg.executionTime ? ` • ⚡ ${msg.executionTime}ms` : ''}
                </div>
              )}
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
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything... (1-9 for shortcuts)"
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
