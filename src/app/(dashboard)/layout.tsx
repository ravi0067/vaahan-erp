"use client";

import { useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AIChatWidget } from "@/components/chat/AIChatWidget";

function WelcomeVoice() {
  useEffect(() => {
    // Play welcome voice once per session
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("vaahan_welcome_played")) return;

    const playWelcome = () => {
      try {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          "Welcome to Vaahan E R P! Main hoon Vaani, aapki AI assistant. Aapki Dealership, Aapka Control."
        );
        utterance.rate = 0.95;
        utterance.pitch = 1.15; // Female voice pitch
        utterance.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        // Prefer female voices
        const femaleHindi = voices.find((v) => v.lang.includes("hi") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("lekha") || v.name.toLowerCase().includes("aditi")));
        const femaleEn = voices.find((v) => v.lang.includes("en") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("zira")));
        const anyFemale = voices.find((v) => v.name.toLowerCase().includes("female"));
        const hindi = voices.find((v) => v.lang.includes("hi"));
        utterance.voice = femaleHindi || femaleEn || anyFemale || hindi || voices[0] || null;
        window.speechSynthesis.speak(utterance);
        sessionStorage.setItem("vaahan_welcome_played", "1");
      } catch {}
    };

    // Voices may load async
    if (window.speechSynthesis.getVoices().length > 0) {
      playWelcome();
    } else {
      window.speechSynthesis.onvoiceschanged = playWelcome;
    }
  }, []);

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <WelcomeVoice />
      {children}
      <AIChatWidget />
    </DashboardShell>
  );
}
