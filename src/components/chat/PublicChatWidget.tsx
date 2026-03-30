"use client";

import * as React from "react";
import { X, Send, MessageCircle, Minimize2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

type CaptureStep = "greeting" | "name" | "business" | "mobile" | "email" | "address" | "done";

const stepQuestions: Record<CaptureStep, string> = {
  greeting:
    "Namaste! 🙏 Main hoon Vaani — VaahanERP ki AI Assistant! 💁‍♀️\n\nMain aapko bataungi kaise VaahanERP aapki dealership ko transform kar sakta hai.\n\nAapka shubh naam kya hai?",
  name: "",
  business: "Nice to meet you, {name}! 🤝\n\nWhat type of dealership do you run? (Bike / Car / EV / Other)",
  mobile: "Great! 👍\n\nCan I have your mobile number? We'll send you a personalized demo link.",
  email: "Perfect! 📱\n\nAnd your email ID? (for sending you the demo access details)",
  address: "Almost done! 🏢\n\nWhich city/area is your dealership located in?",
  done: "Dhanyavaad, {name} ji! 🎉\n\nHumari team jaldi hi aapko personalized demo ke saath contact karegi.\n\nTab tak upar Bike ya Car demo cards pe click karke pura system explore kar sakte ho! 👆\n\nMujhse kuch bhi poochho VaahanERP ke baare mein — Main Vaani, hamesha ready! 💁‍♀️",
};

export function PublicChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [step, setStep] = React.useState<CaptureStep>("greeting");
  const [captured, setCaptured] = React.useState({
    name: "",
    business: "",
    mobile: "",
    email: "",
    address: "",
  });
  const [submitted, setSubmitted] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with greeting
  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: stepQuestions.greeting,
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `bot-${Date.now()}`, role: "assistant", text },
    ]);
  };

  const sendLeadToEmail = async (data: typeof captured) => {
    if (submitted) return;
    setSubmitted(true);
    try {
      await fetch("/api/public-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Silent fail — don't break chat experience
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text },
    ]);
    setInput("");

    // Process based on current step
    switch (step) {
      case "greeting": {
        const newCaptured = { ...captured, name: text };
        setCaptured(newCaptured);
        setStep("business");
        setTimeout(() => {
          addBotMessage(stepQuestions.business.replace("{name}", text));
        }, 500);
        break;
      }
      case "business": {
        const newCaptured = { ...captured, business: text };
        setCaptured(newCaptured);
        setStep("mobile");
        setTimeout(() => addBotMessage(stepQuestions.mobile), 500);
        break;
      }
      case "mobile": {
        const newCaptured = { ...captured, mobile: text };
        setCaptured(newCaptured);
        setStep("email");
        setTimeout(() => addBotMessage(stepQuestions.email), 500);
        break;
      }
      case "email": {
        const newCaptured = { ...captured, email: text };
        setCaptured(newCaptured);
        setStep("address");
        setTimeout(() => addBotMessage(stepQuestions.address), 500);
        break;
      }
      case "address": {
        const finalData = { ...captured, address: text };
        setCaptured(finalData);
        setStep("done");
        // Send lead data to backend
        sendLeadToEmail(finalData);
        setTimeout(() => {
          addBotMessage(stepQuestions.done.replace("{name}", captured.name));
        }, 500);
        break;
      }
      case "done": {
        // Free chat after capture
        setTimeout(() => {
          addBotMessage(
            getSmartResponse(text, captured.name)
          );
        }, 600);
        break;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-green-600 text-white shadow-lg hover:shadow-xl hover:bg-green-700 transition-all group"
      >
        <MessageCircle className="h-5 w-5 group-hover:animate-bounce" />
        <span className="text-sm font-medium">Chat with us</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-medium">Vaani AI 💁‍♀️</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] max-h-[calc(100vh-6rem)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-green-600 text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <p className="font-semibold text-sm">Vaani AI 💁‍♀️</p>
            <p className="text-[10px] opacity-80">VaahanERP Smart Assistant</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg hover:bg-white/20">
            <Minimize2 className="h-4 w-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-green-600 text-white rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            step === "greeting" ? "Enter your name..."
            : step === "business" ? "e.g., Bike dealership"
            : step === "mobile" ? "e.g., 9876543210"
            : step === "email" ? "e.g., you@email.com"
            : step === "address" ? "e.g., Lucknow, UP"
            : "Type a message..."
          }
          className="h-9 text-sm"
          autoFocus
        />
        <Button type="submit" size="icon" className="shrink-0 h-9 w-9 bg-green-600 hover:bg-green-700" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

// Smart responses for post-capture free chat
function getSmartResponse(query: string, name: string): string {
  const q = query.toLowerCase();

  if (q.includes("price") || q.includes("cost") || q.includes("kitna")) {
    return `${name} ji, VaahanERP ke plans:\n\n🆓 Free — ₹0/month (1 user, basic features)\n💼 Pro — ₹2,999/month (5 users, all modules)\n🏢 Enterprise — ₹9,999/month (unlimited users, priority support)\n\nHumare team se baat karein — 📞 +91 9554762008`;
  }

  if (q.includes("feature") || q.includes("kya kya") || q.includes("module")) {
    return "VaahanERP mein ye sab milta hai:\n\n📋 Lead CRM & Follow-up\n🎫 Smart Booking Wizard\n📦 Inventory Management\n💰 CashFlow & Daybook\n🔧 Service & Workshop\n📊 Reports & Analytics\n🤖 AI Assistant\n📱 Mobile Responsive\n\nSab demo mein dekh sakte ho! ☝️";
  }

  if (q.includes("demo") || q.includes("try") || q.includes("test")) {
    return `${name} ji, upar Bike aur Car demo cards dikhe honge — click karke pura system explore kar sakte ho! 🎯\n\nYa phir humare team se call schedule karein: 📞 +91 9554762008`;
  }

  if (q.includes("bike") || q.includes("two wheeler")) {
    return "Haan! VaahanERP bilkul two-wheeler dealerships ke liye bana hai — Hero, Honda, Bajaj, TVS, Royal Enfield — sab support karta hai.\n\nDemo mein dekhiye: Shri Bajrang Motors 🏍️";
  }

  if (q.includes("car") || q.includes("four wheeler")) {
    return "Yes! Car dealerships bhi fully supported hain — Maruti, Hyundai, Tata, Kia, Mahindra sab ke liye.\n\nDemo mein dekhiye: Sharma Cars 🚗";
  }

  if (q.includes("ev") || q.includes("electric")) {
    return "⚡ EV dealerships bhi support karte hain! Battery tracking, range info, charging details — sab managed.\n\nDemo ke liye contact karein: 📞 +91 9554762008";
  }

  return `${name} ji, aapka question humare team tak pahunch jayega! 😊\n\nAap humse directly baat kar sakte hain:\n📞 +91 9554762008\n📧 raviverma0067@gmail.com\n\nYa phir upar demo explore karein! 🎯`;
}
