"use client";

import * as React from "react";
import { X, Send, Mic, Sparkles, Minimize2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
];

// Mock responses for quick queries
const mockResponses: Record<string, string> = {
  "today's sales": "📊 Today's Sales Summary:\n• Vehicles sold: 4\n• Total revenue: ₹3,45,000\n• Top model: Honda Activa 6G (2 units)\n• Average deal value: ₹86,250",
  "pending deliveries": "🚚 Pending Deliveries: 8\n• Ready for delivery: 3\n• Awaiting RTO: 2\n• Insurance pending: 2\n• Finance clearance: 1\n\nNext delivery scheduled: Rahul Verma (Honda SP 125) - Today 4 PM",
  "hot leads count": "🔥 Hot Leads: 18\n• Follow-ups due today: 7\n• New enquiries: 3\n• Test rides scheduled: 4\n• Most enquired: Honda CB350\n\nTop lead: Arjun Mehta - Ready to book Honda CB350",
  "cash in hand": "💰 Cash in Hand: ₹5,67,890\n• Today's collections: ₹2,15,000\n• Today's payments: ₹1,48,000\n• Opening balance: ₹5,00,890\n• Daybook status: ✅ Balanced",
  "this month revenue": "📈 March 2024 Revenue:\n• Total: ₹24,56,000\n• Vehicles sold: 28\n• Service income: ₹3,45,000\n• Accessories: ₹1,12,000\n• Growth: +12.5% vs Feb\n\nTarget: ₹30,00,000 (82% achieved)",
};

function getMockResponse(query: string): string {
  const lower = query.toLowerCase().trim();
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lower.includes(key) || key.includes(lower)) {
      return response;
    }
  }
  return `🤖 I understand you're asking about "${query}". This is a demo response — in the full version, I'll connect to your dealership data to give you real-time answers!\n\nTry asking about:\n• Today's sales\n• Pending deliveries\n• Hot leads count\n• Cash in hand\n• This month revenue`;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! 🙏 I'm your Vaahan AI Assistant. Ask me anything about your dealership — sales, leads, deliveries, or cashflow!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = getMockResponse(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Queries */}
      <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {quickQueries.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="shrink-0 px-3 py-1 text-xs rounded-full border bg-background hover:bg-accent transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9"
          title="Voice input (coming soon)"
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
