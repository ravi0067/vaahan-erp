"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Phone, Mail, MapPin, Share2, Download, FileText, Wrench, Clock, User, CheckCircle2, ChevronRight } from "lucide-react";

// --- Delivery Milestones ---
const milestones = [
  { label: "Booking Confirmed", desc: "Aapki booking confirm aur record ho gayi hai", status: "done" as const, date: "20 Mar 2026" },
  { label: "Payment Received", desc: "Full payment receive ho gayi hai", status: "done" as const, date: "20 Mar 2026" },
  { label: "RTO Processing", desc: "Vehicle registration RTO mein process ho rahi hai", status: "current" as const, date: "Est. 25 Mar 2026" },
  { label: "Ready for Delivery", desc: "Vehicle inspected aur handover ke liye ready", status: "pending" as const, date: "Est. 28 Mar 2026" },
  { label: "Delivered", desc: "Vehicle customer ko handover ho gayi", status: "pending" as const, date: "Est. 30 Mar 2026" },
];

// --- RTO Steps ---
const rtoSteps = [
  { label: "Documents Submitted", status: "done" as const, date: "21 Mar 2026" },
  { label: "Verification", status: "done" as const, date: "22 Mar 2026" },
  { label: "Approved", status: "current" as const, date: "Est. 25 Mar 2026" },
  { label: "RC Ready", status: "pending" as const, date: "Est. 27 Mar 2026" },
];

// --- Service Tracking ---
const serviceItems = [
  { item: "Engine Oil Change", status: "done" as const, mechanic: "Raju Mistri" },
  { item: "Air Filter Cleaning", status: "done" as const, mechanic: "Raju Mistri" },
  { item: "Chain Lubrication", status: "current" as const, mechanic: "Sunil Kumar" },
  { item: "Brake Pad Check", status: "pending" as const, mechanic: "Sunil Kumar" },
];

// --- Documents ---
const documents = [
  { name: "Booking Receipt", available: true },
  { name: "Insurance Certificate", available: true },
  { name: "RC (Registration Certificate)", available: false },
  { name: "RTO Tax Receipt", available: false },
];

const statusIcon = (s: "done" | "current" | "pending") => {
  if (s === "done") return "✅";
  if (s === "current") return "🔄";
  return "⏳";
};

const statusColor = (s: "done" | "current" | "pending") => {
  if (s === "done") return "bg-green-500";
  if (s === "current") return "bg-blue-500 animate-pulse";
  return "bg-gray-300";
};

export default function TrackingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [activeSection, setActiveSection] = useState<"delivery" | "rto" | "service">("delivery");
  const showService = false; // Toggle based on actual data

  const booking = {
    id: bookingId || "BK-2024-003",
    customerName: "S***sh Y***v",
    vehicle: "Honda Shine",
    bookingDate: "20 Mar 2026",
    currentStatus: "RTO Processing",
  };

  // Progress calculation
  const doneCount = milestones.filter((m) => m.status === "done").length;
  const currentIdx = milestones.findIndex((m) => m.status === "current");
  const progressPercent = Math.round(((doneCount + (currentIdx >= 0 ? 0.5 : 0)) / milestones.length) * 100);

  // RTO progress
  const rtoDone = rtoSteps.filter((s) => s.status === "done").length;
  const rtoCurrentIdx = rtoSteps.findIndex((s) => s.status === "current");
  const rtoProgress = Math.round(((rtoDone + (rtoCurrentIdx >= 0 ? 0.5 : 0)) / rtoSteps.length) * 100);

  const handleWhatsAppShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `🏍️ Meri ${booking.vehicle} ki delivery track karein!\n\nBooking ID: ${booking.id}\nStatus: ${booking.currentStatus}\n\nTrack here: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-lg mx-auto px-4 py-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <span className="font-bold text-xl">V</span>
          </div>
          <h1 className="text-xl font-bold">VaahanERP</h1>
          <p className="text-sm opacity-80">Booking Tracker</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Booking Info Card */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">{booking.id}</span>
            <span className="text-xs text-muted-foreground">{booking.bookingDate}</span>
          </div>
          <div>
            <p className="text-lg font-bold">{booking.vehicle}</p>
            <p className="text-sm text-muted-foreground">Customer: {booking.customerName}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Current Status: {booking.currentStatus}
            </p>
            <p className="text-xs text-amber-500 mt-0.5">
              Vehicle registration RTO mein process ho rahi hai. Est. 3-5 working days.
            </p>
          </div>

          {/* Overall Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Overall Progress</span>
              <span className="text-xs font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            <Share2 className="h-4 w-4" /> WhatsApp par Share Karein
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2">
          {[
            { key: "delivery" as const, label: "Delivery", icon: "🚚" },
            { key: "rto" as const, label: "RTO Status", icon: "📋" },
            { key: "service" as const, label: "Service", icon: "🔧" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                activeSection === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-white dark:bg-card text-muted-foreground shadow-sm"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Delivery Milestones */}
        {activeSection === "delivery" && (
          <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5">
            <h2 className="font-semibold mb-4">🚚 Delivery Progress</h2>
            <div className="space-y-0">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                      m.status === "done" ? "bg-green-100" : m.status === "current" ? "bg-blue-100 animate-pulse" : "bg-gray-100"
                    }`}>
                      {statusIcon(m.status)}
                    </div>
                    {i < milestones.length - 1 && (
                      <div className={`w-0.5 h-12 ${m.status === "done" ? "bg-green-300" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium text-sm ${m.status === "pending" ? "text-muted-foreground" : ""}`}>{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RTO Status Tracking */}
        {activeSection === "rto" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5">
              <h2 className="font-semibold mb-3">📋 RTO Registration Status</h2>

              {/* RTO Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">RTO Progress</span>
                  <span className="text-xs font-bold text-primary">{rtoProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500" style={{ width: `${rtoProgress}%` }} />
                </div>
              </div>

              {/* RTO Steps */}
              <div className="space-y-3">
                {rtoSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      step.status === "done" ? "bg-green-100" : step.status === "current" ? "bg-blue-100 animate-pulse" : "bg-gray-100"
                    }`}>
                      <span className="text-sm">{statusIcon(step.status)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${step.status === "pending" ? "text-muted-foreground" : ""}`}>{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.date}</p>
                    </div>
                    {step.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                    {step.status === "current" && <Clock className="h-4 w-4 text-blue-500 shrink-0 animate-pulse" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Document Downloads */}
            <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5">
              <h2 className="font-semibold mb-3">📄 Documents Download</h2>
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${doc.available ? "bg-green-50 dark:bg-green-950 border-green-200" : "bg-gray-50 dark:bg-gray-900 border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <FileText className={`h-4 w-4 ${doc.available ? "text-green-600" : "text-gray-400"}`} />
                      <span className={`text-sm ${doc.available ? "font-medium" : "text-muted-foreground"}`}>{doc.name}</span>
                    </div>
                    {doc.available ? (
                      <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                        <Download className="h-3 w-3" /> Download
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Processing...</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">💡 RTO approval ke baad digital RC copy yahan available hogi</p>
            </div>
          </div>
        )}

        {/* Service Tracking */}
        {activeSection === "service" && (
          <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5">
            <h2 className="font-semibold mb-3">🔧 Service Tracking</h2>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 mb-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 font-medium">Estimated Time</span>
                <span className="text-xs font-bold text-blue-700">~2 hours remaining</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 font-medium">Assigned Mechanic</span>
                <span className="text-xs font-bold text-blue-700 flex items-center gap-1"><User className="h-3 w-3" /> Raju Mistri, Sunil Kumar</span>
              </div>
            </div>

            {/* Service Progress */}
            <div className="space-y-3">
              {serviceItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${statusColor(item.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.status === "done" ? "line-through text-muted-foreground" : item.status === "current" ? "font-medium" : "text-muted-foreground"}`}>
                      {item.item}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> {item.mechanic}
                    </p>
                  </div>
                  <span className="text-xs">{statusIcon(item.status)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                🔔 Service complete hone par aapko WhatsApp notification milega
              </p>
            </div>
          </div>
        )}

        {/* Dealership Contact */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5 space-y-3">
          <h2 className="font-semibold">Dealership Contact</h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Ravi Accounting Services</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Chinhat, Gomti Nagar, Lucknow 226028</span>
            </div>
            <a href="tel:+919554762008" className="flex items-center gap-2 text-primary hover:underline">
              <Phone className="h-4 w-4 shrink-0" />
              <span>+91 9554762008</span>
            </a>
            <a href="mailto:raviverma0067@gmail.com" className="flex items-center gap-2 text-primary hover:underline">
              <Mail className="h-4 w-4 shrink-0" />
              <span>raviverma0067@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-4">
          Powered by Ravi Accounting Services · VaahanERP v1.0
        </p>
      </div>
    </div>
  );
}
