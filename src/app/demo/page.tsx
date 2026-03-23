"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play, ArrowLeft, CheckCircle, Settings, UserPlus, Bike,
  Wallet, BarChart3, Wrench, Package, Shield, Bot, Megaphone,
  Phone, FileText, Users
} from "lucide-react";

const guideVideos = [
  {
    title: "🚀 System Overview & Login",
    description: "VaahanERP ka complete overview — login kaise karein, dashboard kya dikhata hai, navigation guide",
    duration: "3-5 min",
    icon: Settings,
    videoId: "YOUR_YOUTUBE_ID_1",
    steps: ["Website open karein", "Login credentials daalen", "Dashboard explore karein", "Sidebar navigation samjhein"],
  },
  {
    title: "🏢 Client Onboarding with Brands",
    description: "New dealership kaise add karein — business details, brands (KTM, Triumph), locations setup",
    duration: "5 min",
    icon: Users,
    videoId: "YOUR_YOUTUBE_ID_2",
    steps: ["Admin panel jaayein", "Add Client click karein", "Business details bharein", "Brands aur locations add karein"],
  },
  {
    title: "📞 Lead Management & Follow-ups",
    description: "Customer enquiry se booking tak — lead track karna, follow-up reminders, hot lead alerts",
    duration: "5 min",
    icon: UserPlus,
    videoId: "YOUR_YOUTUBE_ID_3",
    steps: ["New lead create karein", "Status update karein", "Follow-up date set karein", "Lead convert karein to booking"],
  },
  {
    title: "🏍️ Booking Process (6-Step)",
    description: "Complete booking wizard — customer select, vehicle choose, payment, finance, documents, delivery",
    duration: "7 min",
    icon: Bike,
    videoId: "YOUR_YOUTUBE_ID_4",
    steps: ["Customer details bharein", "Vehicle select karein", "Payment collect karein", "Finance details add karein", "Documents upload karein", "Delivery schedule karein"],
  },
  {
    title: "💰 CashFlow & Daybook",
    description: "Daily cash tracking — income/expense entry, multi-mode payments, daybook lock feature",
    duration: "5 min",
    icon: Wallet,
    videoId: "YOUR_YOUTUBE_ID_5",
    steps: ["Cash transaction add karein", "Bank/UPI/Cash mode select karein", "Daybook review karein", "Lock daybook karein"],
  },
  {
    title: "📊 Reports & Analytics",
    description: "Business insights — sales chart, revenue trends, expense analysis, lead conversion rates",
    duration: "3 min",
    icon: BarChart3,
    videoId: "YOUR_YOUTUBE_ID_6",
    steps: ["Reports page kholen", "Date range select karein", "Charts analyze karein", "Export/download karein"],
  },
  {
    title: "🤖 AI Bot Setup & Usage",
    description: "AI assistant configure karna — API keys, WhatsApp connect, voice commands enable karna",
    duration: "5 min",
    icon: Bot,
    videoId: "YOUR_YOUTUBE_ID_7",
    steps: ["Admin Settings jaayein", "AI tab me API key daalen", "WhatsApp configure karein", "Test message bhejein"],
  },
  {
    title: "📢 Promotions & Communication",
    description: "Offers create karna, customers ko WhatsApp/SMS se bhejna, calling features setup",
    duration: "5 min",
    icon: Megaphone,
    videoId: "YOUR_YOUTUBE_ID_8",
    steps: ["Promotions page kholen", "New offer create karein", "Target audience select karein", "Send via WhatsApp/Email/SMS"],
  },
  {
    title: "📄 Document Management",
    description: "Customer documents upload, verify, RTO docs manage, digital copies share karna",
    duration: "4 min",
    icon: FileText,
    videoId: "YOUR_YOUTUBE_ID_9",
    steps: ["Documents section kholen", "Customer select karein", "Upload/verify karein", "WhatsApp pe share karein"],
  },
  {
    title: "🔧 Service & Workshop",
    description: "Job cards banana, mechanic assign karna, service tracking, payment collect karna",
    duration: "5 min",
    icon: Wrench,
    videoId: "YOUR_YOUTUBE_ID_10",
    steps: ["New job card create karein", "Work items add karein", "Mechanic assign karein", "Payment collect karein"],
  },
];

export default function DemoGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Navbar */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold">VaahanERP</span>
            </Link>
          </div>
          <div className="flex gap-2">
            <Link href="/"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Button></Link>
            <Link href="/login"><Button>Login →</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">📖 Quick Guide & Demo Videos</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          VaahanERP ka complete guide — step-by-step videos se seekhein kaise apna dealership manage karein
        </p>
      </section>

      {/* Video Guide Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {guideVideos.map((video, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <video.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">⏱️ {video.duration}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Video Embed Placeholder */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4 border-2 border-dashed">
                  <div className="text-center">
                    <Play className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Video Coming Soon</p>
                    <p className="text-xs text-muted-foreground">YouTube ID: {video.videoId}</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">📋 Steps:</p>
                  {video.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Add Videos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🎬 Videos Kaise Add Karein?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <p className="text-sm"><strong>Screen recording karo</strong> — OBS Studio (free) ya Loom use karo</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <p className="text-sm"><strong>YouTube pe upload karo</strong> — Public ya Unlisted rakhlo</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <p className="text-sm"><strong>YouTube video ID copy karo</strong> — URL se (e.g., youtube.com/watch?v=<strong>THIS_PART</strong>)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <p className="text-sm"><strong>Mujhe btao</strong> — Video IDs do, main embed kar dunga</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Ready to modernize your dealership?</h2>
          <div className="flex gap-3 justify-center">
            <Link href="/login"><Button size="lg">🚀 Start Using VaahanERP</Button></Link>
            <Link href="/"><Button size="lg" variant="outline">← Back to Home</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}