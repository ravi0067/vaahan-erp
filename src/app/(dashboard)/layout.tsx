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
          "Welcome to Vaahan E R P. Aapki Dealership, Aapka Control."
        );
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice =
          voices.find((v) => v.lang.includes("hi")) ||
          voices.find((v) => v.lang.includes("en"));
        if (hindiVoice) utterance.voice = hindiVoice;
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
