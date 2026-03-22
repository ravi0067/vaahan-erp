"use client";

import { useParams } from "next/navigation";
import { Phone, Mail, MapPin } from "lucide-react";

const milestones = [
  {
    label: "Booking Confirmed",
    desc: "Your booking has been confirmed and recorded",
    status: "done" as const,
    date: "20 Mar 2026",
  },
  {
    label: "Payment Received",
    desc: "Full payment has been received",
    status: "done" as const,
    date: "20 Mar 2026",
  },
  {
    label: "RTO Processing",
    desc: "Vehicle registration is being processed with RTO",
    status: "current" as const,
    date: "Est. 25 Mar 2026",
  },
  {
    label: "Ready for Delivery",
    desc: "Vehicle is inspected and ready for handover",
    status: "pending" as const,
    date: "Est. 28 Mar 2026",
  },
  {
    label: "Delivered",
    desc: "Vehicle handed over to customer",
    status: "pending" as const,
    date: "Est. 30 Mar 2026",
  },
];

const statusIcon = (s: "done" | "current" | "pending") => {
  if (s === "done") return "✅";
  if (s === "current") return "🔄";
  return "⏳";
};

export default function TrackingPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  // Mock data - in real app, fetch from API
  const booking = {
    id: bookingId || "BK-2024-003",
    customerName: "S***sh Y***v",
    vehicle: "Honda Shine",
    bookingDate: "20 Mar 2026",
    currentStatus: "RTO Processing",
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

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Booking Info Card */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
              {booking.id}
            </span>
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
              Your vehicle registration is being processed. Estimated 3-5 working days.
            </p>
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5">
          <h2 className="font-semibold mb-4">Delivery Progress</h2>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                      m.status === "done"
                        ? "bg-green-100"
                        : m.status === "current"
                        ? "bg-blue-100 animate-pulse"
                        : "bg-gray-100"
                    }`}
                  >
                    {statusIcon(m.status)}
                  </div>
                  {i < milestones.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        m.status === "done" ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                {/* Content */}
                <div className="pb-6">
                  <p
                    className={`font-medium text-sm ${
                      m.status === "pending" ? "text-muted-foreground" : ""
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dealership Contact */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-5 space-y-3">
          <h2 className="font-semibold">Dealership Contact</h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Ravi Accounting Services</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Chinhat, Gomti Nagar, Lucknow 226028</span>
            </div>
            <a
              href="tel:+919554762008"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span>+91 9554762008</span>
            </a>
            <a
              href="mailto:raviverma0067@gmail.com"
              className="flex items-center gap-2 text-primary hover:underline"
            >
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
