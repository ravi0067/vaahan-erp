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

// Mock responses for quick queries
const mockResponses: Record<string, string> = {
  "today's sales":
    "📊 **Today's Sales Summary**\n\n| Metric | Value |\n|--------|-------|\n| Vehicles Sold | 4 |\n| Total Revenue | ₹3,45,000 |\n| Top Model | Honda Activa 6G (2 units) |\n| Avg Deal Value | ₹86,250 |\n\n🟢 Today is 15% above daily average!",
  "pending deliveries":
    "🚚 **Pending Deliveries: 8**\n\n| Status | Count |\n|--------|-------|\n| Ready for Delivery | 3 |\n| Awaiting RTO | 2 |\n| Insurance Pending | 2 |\n| Finance Clearance | 1 |\n\n📍 Next: Rahul Verma (Honda SP 125) - Today 4 PM",
  "hot leads count":
    "🔥 **Hot Leads: 18**\n\n| Type | Count |\n|------|-------|\n| Follow-ups Due Today | 7 |\n| New Enquiries | 3 |\n| Test Rides Scheduled | 4 |\n| Ready to Book | 4 |\n\n⭐ Top Lead: Arjun Mehta → Honda CB350 (₹2.15L budget)",
  "cash in hand":
    "💰 **Cash Position**\n\n| Item | Amount |\n|------|--------|\n| Opening Balance | ₹5,00,890 |\n| Collections | +₹2,15,000 |\n| Payments | -₹1,48,000 |\n| **Cash in Hand** | **₹5,67,890** |\n\n✅ Daybook Status: Balanced",
  "this month revenue":
    "📈 **March 2024 Revenue**\n\n| Category | Amount |\n|----------|--------|\n| Vehicle Sales | ₹19,99,000 |\n| Service Income | ₹3,45,000 |\n| Accessories | ₹1,12,000 |\n| **Total** | **₹24,56,000** |\n\n🎯 Target: ₹30,00,000 (82% achieved)\n📊 Growth: +12.5% vs Feb",
  "pending rto applications":
    "📋 **Pending RTO Applications: 5**\n\n| Customer | Vehicle | Status | Days |\n|----------|---------|--------|------|\n| Suresh Yadav | Honda Shine | Submitted | 3 |\n| Rohit Mishra | Bajaj Pulsar | Pending Docs | 7 |\n| Kavita Rani | Honda Activa | At RTO Office | 2 |\n| Deepak Singh | TVS Jupiter | Inspection Due | 5 |\n| Amit Verma | Hero Splendor | Awaiting Slot | 1 |\n\n⚠️ 2 applications overdue (>5 days)",
  "unlocked daybooks":
    "🔓 **Unlocked Daybooks: 3**\n\n| Date | Branch | Txns | Status |\n|------|--------|------|--------|\n| 18 Mar 2024 | Main | 24 | ⚠️ Unlocked |\n| 19 Mar 2024 | Main | 18 | ⚠️ Unlocked |\n| 20 Mar 2024 | Main | 31 | ⚠️ Unlocked |\n\n💡 Reminder: Lock daybooks daily for accurate accounting!",
  "insurance expiring this month":
    "🛡️ **Insurance Expiring This Month: 12**\n\n| Customer | Vehicle | Expiry Date |\n|----------|---------|-------------|\n| Raj Kumar | Honda Activa | 25 Mar |\n| Priya Singh | TVS Jupiter | 27 Mar |\n| Neha Gupta | Suzuki Access | 28 Mar |\n| + 9 more... | | |\n\n📧 Auto-reminders scheduled for 5 customers",
  "monthly expense summary":
    "💸 **March 2024 Expenses**\n\n| Category | Amount |\n|----------|--------|\n| Staff Salary | ₹2,80,000 |\n| Rent | ₹45,000 |\n| Utilities | ₹12,000 |\n| Marketing | ₹35,000 |\n| Miscellaneous | ₹18,500 |\n| **Total** | **₹3,90,500** |\n\n📉 Down 8% from February (₹4,24,000)",
  "top selling models":
    "🏆 **Top Selling Models (March)**\n\n| # | Model | Units | Revenue |\n|---|-------|-------|---------|\n| 1 | Honda Activa 6G | 8 | ₹6,24,000 |\n| 2 | Honda SP 125 | 5 | ₹4,60,000 |\n| 3 | TVS Jupiter 125 | 4 | ₹3,12,000 |\n| 4 | Bajaj Pulsar 150 | 3 | ₹4,35,000 |\n| 5 | Hero Splendor+ | 3 | ₹2,16,000 |\n\n📊 Scooters dominate with 52% of sales!",
};

function getMockResponse(query: string): string {
  const lower = query.toLowerCase().trim();
  for (const [key, response] of Object.entries(mockResponses)) {
    if (lower.includes(key) || key.includes(lower)) {
      return response;
    }
  }
  return `🤖 I understand you're asking about "${query}". This is a demo response — in the full version, I'll connect to your dealership data to give you real-time answers!\n\nTry asking:\n• Today's sales\n• Pending deliveries\n• Hot leads count\n• Cash in hand\n• Pending RTO applications\n• Top selling models\n• Monthly expense summary`;
}

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
    setShowQueries(false);

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
      setShowQueries(true);
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
