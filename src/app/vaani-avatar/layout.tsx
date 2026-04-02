import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vaani AI Avatar — VaahanERP Showroom Assistant",
  description: "AI-powered showroom avatar for vehicle dealerships. Voice-enabled, Hinglish, powered by VaahanERP.",
  icons: { icon: "/logo-icon.png" },
};

export default function VaaniAvatarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
