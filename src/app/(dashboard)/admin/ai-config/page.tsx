"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Bot, MessageCircle, Mail, MessageSquare, Save, Eye, EyeOff,
  Zap, ArrowLeft, CheckCircle2, AlertTriangle, Loader2, RefreshCw,
  Phone, Github, Cloud, Shield, Settings2, Activity, Brain,
  Mic, Globe, Sparkles, Bell, CreditCard, XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────
interface ServiceStatus {
  service: string;
  connected: boolean;
  configured: boolean;
  latency?: number;
  message: string;
}

// ── Masked Input ───────────────────────────────────────────────────────
function MaskedInput({
  value, onChange, placeholder, className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pr-10 ${className || ""}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: ServiceStatus }) {
  if (!status) return <Badge variant="secondary" className="gap-1 text-xs"><Settings2 className="h-3 w-3" /> Not Checked</Badge>;
  if (status.connected) return <Badge className="bg-green-100 text-green-700 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" /> Connected</Badge>;
  if (status.configured) return <Badge className="bg-yellow-100 text-yellow-700 gap-1 text-xs"><AlertTriangle className="h-3 w-3" /> Error</Badge>;
  return <Badge className="bg-red-100 text-red-700 gap-1 text-xs"><XCircle className="h-3 w-3" /> Not Configured</Badge>;
}

// ── Toggle Switch ──────────────────────────────────────────────────────
function Toggle({ enabled, onChange, label, desc }: { enabled: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function AIConfigPage() {
  const [settings, setSettings] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testingService, setTestingService] = React.useState<string | null>(null);
  const [statuses, setStatuses] = React.useState<Record<string, ServiceStatus>>({});
  const [testingAll, setTestingAll] = React.useState(false);

  // Load settings on mount
  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai-config");
      const data = await res.json();
      if (data.success && data.settings) {
        const flat: Record<string, string> = {};
        for (const [, categorySettings] of Object.entries(data.settings)) {
          for (const [key, info] of Object.entries(categorySettings as Record<string, any>)) {
            flat[key] = info.value || "";
          }
        }
        setSettings(flat);
      }
    } catch (e) {
      toast.error("Settings load failed");
    } finally {
      setLoading(false);
    }
  };

  const get = (key: string, defaultVal = ""): string => settings[key] || defaultVal;
  const set = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));
  const getBool = (key: string, defaultVal = false): boolean => {
    const v = settings[key];
    if (v === undefined) return defaultVal;
    return v === "true" || v === "1";
  };
  const setBool = (key: string, value: boolean) => set(key, value ? "true" : "false");

  const saveSettings = async (keys?: string[]) => {
    try {
      setSaving(true);
      const toSave: Record<string, string> = {};
      if (keys) {
        for (const k of keys) {
          if (settings[k] !== undefined) toSave[k] = settings[k];
        }
      } else {
        Object.assign(toSave, settings);
      }

      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: toSave }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`✅ ${data.saved} settings saved!`);
      } else {
        toast.error(data.error || "Save failed");
      }
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const testService = async (service: string) => {
    try {
      setTestingService(service);
      const res = await fetch("/api/admin/ai-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      const data = await res.json();
      if (data.result) {
        setStatuses((prev) => ({ ...prev, [service]: data.result }));
        if (data.result.connected) {
          toast.success(`✅ ${service}: ${data.result.message}`);
        } else {
          toast.error(`❌ ${service}: ${data.result.message}`);
        }
      }
    } catch (e) {
      toast.error(`Test failed for ${service}`);
    } finally {
      setTestingService(null);
    }
  };

  const testAll = async () => {
    try {
      setTestingAll(true);
      const res = await fetch("/api/admin/ai-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: "all" }),
      });
      const data = await res.json();
      if (data.results) {
        const newStatuses: Record<string, ServiceStatus> = {};
        for (const r of data.results) {
          newStatuses[r.service] = r;
        }
        setStatuses(newStatuses);
        const connected = data.results.filter((r: ServiceStatus) => r.connected).length;
        toast.success(`✅ ${connected}/${data.results.length} services connected`);
      }
    } catch (e) {
      toast.error("Test all failed");
    } finally {
      setTestingAll(false);
    }
  };

  const SaveButton = ({ keys, label }: { keys?: string[]; label?: string }) => (
    <Button onClick={() => saveSettings(keys)} disabled={saving} size="sm">
      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
      {label || "Save"}
    </Button>
  );

  const TestButton = ({ service }: { service: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => testService(service)}
      disabled={testingService === service}
    >
      {testingService === service ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
      Test
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading AI Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              AI Configuration Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">Super Owner — Sab AI settings ek jagah se control karo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testAll} disabled={testingAll}>
            {testingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Test All
          </Button>
          <Button onClick={() => saveSettings()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="ai" className="gap-1.5 text-xs sm:text-sm"><Brain className="h-3.5 w-3.5" /> AI Brain</TabsTrigger>
          <TabsTrigger value="communication" className="gap-1.5 text-xs sm:text-sm"><MessageCircle className="h-3.5 w-3.5" /> Communication</TabsTrigger>
          <TabsTrigger value="vaani" className="gap-1.5 text-xs sm:text-sm"><Mic className="h-3.5 w-3.5" /> Vaani AI</TabsTrigger>
          <TabsTrigger value="automation" className="gap-1.5 text-xs sm:text-sm"><Bell className="h-3.5 w-3.5" /> Automation</TabsTrigger>
          <TabsTrigger value="devops" className="gap-1.5 text-xs sm:text-sm"><Github className="h-3.5 w-3.5" /> DevOps</TabsTrigger>
          <TabsTrigger value="payment" className="gap-1.5 text-xs sm:text-sm"><CreditCard className="h-3.5 w-3.5" /> Payment</TabsTrigger>
          <TabsTrigger value="status" className="gap-1.5 text-xs sm:text-sm"><Activity className="h-3.5 w-3.5" /> Status</TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 1: AI Brain */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-purple-600" /> AI Brain Configuration</CardTitle>
                <StatusBadge status={statuses.gemini || statuses.openai} />
              </div>
              <p className="text-sm text-muted-foreground">AI provider, model aur API keys configure karo</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                enabled={getBool("ai.enabled", true)}
                onChange={(v) => setBool("ai.enabled", v)}
                label="AI Enabled (Global)"
                desc="Master toggle — sab AI features on/off"
              />

              <div className="grid gap-2">
                <Label>AI Provider</Label>
                <Select value={get("ai.provider", "gemini")} onValueChange={(v) => set("ai.provider", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini (Recommended ⭐)</SelectItem>
                    <SelectItem value="openai">OpenAI GPT</SelectItem>
                    <SelectItem value="claude">Anthropic Claude</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Model</Label>
                <Select value={get("ai.model", "gemini-2.5-flash")} onValueChange={(v) => set("ai.model", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {get("ai.provider", "gemini") === "gemini" && (
                      <>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Cheap ⚡)</SelectItem>
                        <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Powerful 💪)</SelectItem>
                      </>
                    )}
                    {get("ai.provider") === "openai" && (
                      <>
                        <SelectItem value="gpt-4o">GPT-4o (Best)</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Budget)</SelectItem>
                      </>
                    )}
                    {get("ai.provider") === "claude" && (
                      <>
                        <SelectItem value="claude-sonnet-4">Claude Sonnet 4 (Fast)</SelectItem>
                        <SelectItem value="claude-opus-4">Claude Opus 4 (Powerful)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 border rounded-lg p-4">
                <p className="font-semibold text-sm">🔑 API Keys</p>
                <div className="grid gap-2">
                  <Label className="text-xs">Gemini API Key</Label>
                  <MaskedInput value={get("ai.apiKey.gemini")} onChange={(v) => set("ai.apiKey.gemini", v)} placeholder="AIza..." />
                  <p className="text-xs text-muted-foreground">Get from: aistudio.google.dev</p>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">OpenAI API Key (Optional)</Label>
                  <MaskedInput value={get("ai.apiKey.openai")} onChange={(v) => set("ai.apiKey.openai", v)} placeholder="sk-..." />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Claude API Key (Optional)</Label>
                  <MaskedInput value={get("ai.apiKey.claude")} onChange={(v) => set("ai.apiKey.claude", v)} placeholder="sk-ant-..." />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Max Tokens: {get("ai.maxTokens", "2048")}</Label>
                <input
                  type="range" min={256} max={8192} step={256}
                  value={parseInt(get("ai.maxTokens", "2048"))}
                  onChange={(e) => set("ai.maxTokens", e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground"><span>256</span><span>8192</span></div>
              </div>

              <div className="grid gap-2">
                <Label>Temperature: {get("ai.temperature", "0.7")}</Label>
                <input
                  type="range" min={0} max={1} step={0.1}
                  value={parseFloat(get("ai.temperature", "0.7"))}
                  onChange={(e) => set("ai.temperature", e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground"><span>0 (Precise)</span><span>1 (Creative)</span></div>
              </div>

              <div className="flex gap-2">
                <TestButton service="gemini" />
                <SaveButton keys={["ai.provider", "ai.model", "ai.apiKey.gemini", "ai.apiKey.openai", "ai.apiKey.claude", "ai.maxTokens", "ai.temperature", "ai.enabled"]} label="Save AI Config" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 2: Communication */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="communication">
          <div className="space-y-4">
            {/* Exotel (WhatsApp + Calling) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-green-600" /> Exotel — Calling + WhatsApp</CardTitle>
                  <StatusBadge status={statuses.exotel} />
                </div>
                <p className="text-sm text-muted-foreground">WhatsApp messages aur voice calls ke liye Exotel credentials</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>API Key</Label>
                    <MaskedInput value={get("exotel.apiKey")} onChange={(v) => set("exotel.apiKey", v)} placeholder="Exotel API Key" />
                  </div>
                  <div className="grid gap-2">
                    <Label>API Token</Label>
                    <MaskedInput value={get("exotel.apiToken")} onChange={(v) => set("exotel.apiToken", v)} placeholder="Exotel API Token" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Account SID</Label>
                    <Input value={get("exotel.accountSid")} onChange={(e) => set("exotel.accountSid", e.target.value)} placeholder="raviaccountingservices1" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Caller ID</Label>
                    <Input value={get("exotel.callerId")} onChange={(e) => set("exotel.callerId", e.target.value)} placeholder="09513886363" />
                  </div>
                  <div className="grid gap-2">
                    <Label>WhatsApp Number</Label>
                    <Input value={get("exotel.whatsappNumber")} onChange={(e) => set("exotel.whatsappNumber", e.target.value)} placeholder="+15559549647" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Toggle enabled={getBool("exotel.callingEnabled", true)} onChange={(v) => setBool("exotel.callingEnabled", v)} label="📞 Calling Enabled" />
                  <Toggle enabled={getBool("exotel.whatsappEnabled", true)} onChange={(v) => setBool("exotel.whatsappEnabled", v)} label="📱 WhatsApp Enabled" />
                </div>
                <div className="flex gap-2">
                  <TestButton service="exotel" />
                  <SaveButton keys={["exotel.apiKey", "exotel.apiToken", "exotel.accountSid", "exotel.callerId", "exotel.whatsappNumber", "exotel.callingEnabled", "exotel.whatsappEnabled"]} label="Save Exotel" />
                </div>
              </CardContent>
            </Card>

            {/* SMTP Email */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-600" /> Email (SMTP)</CardTitle>
                  <StatusBadge status={statuses.smtp} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle enabled={getBool("smtp.enabled")} onChange={(v) => setBool("smtp.enabled", v)} label="Email Enabled" desc="Invoice, reports, alerts email se bhejo" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>SMTP Host</Label>
                    <Input value={get("smtp.host", "smtp.gmail.com")} onChange={(e) => set("smtp.host", e.target.value)} placeholder="smtp.gmail.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Port</Label>
                    <Input value={get("smtp.port", "587")} onChange={(e) => set("smtp.port", e.target.value)} placeholder="587" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Username</Label>
                    <Input value={get("smtp.username")} onChange={(e) => set("smtp.username", e.target.value)} placeholder="support@vaahanerp.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Password / App Password</Label>
                    <MaskedInput value={get("smtp.password")} onChange={(v) => set("smtp.password", v)} placeholder="App password" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>From Name</Label>
                    <Input value={get("smtp.fromName", "VaahanERP")} onChange={(e) => set("smtp.fromName", e.target.value)} placeholder="VaahanERP" />
                  </div>
                  <div className="grid gap-2">
                    <Label>From Email</Label>
                    <Input value={get("smtp.fromEmail", "support@vaahanerp.com")} onChange={(e) => set("smtp.fromEmail", e.target.value)} placeholder="support@vaahanerp.com" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <TestButton service="smtp" />
                  <SaveButton keys={["smtp.host", "smtp.port", "smtp.username", "smtp.password", "smtp.fromName", "smtp.fromEmail", "smtp.enabled"]} label="Save Email" />
                </div>
              </CardContent>
            </Card>

            {/* SMS */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-orange-600" /> SMS</CardTitle>
                  <StatusBadge status={statuses.sms} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Toggle enabled={getBool("sms.enabled")} onChange={(v) => setBool("sms.enabled", v)} label="SMS Enabled" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Provider</Label>
                    <Select value={get("sms.provider", "msg91")} onValueChange={(v) => set("sms.provider", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="msg91">MSG91</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="textlocal">TextLocal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>API Key</Label>
                    <MaskedInput value={get("sms.apiKey")} onChange={(v) => set("sms.apiKey", v)} placeholder="SMS API Key" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Sender ID</Label>
                    <Input value={get("sms.senderId", "VAAHAN")} onChange={(e) => set("sms.senderId", e.target.value)} placeholder="VAAHAN" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <TestButton service="sms" />
                  <SaveButton keys={["sms.provider", "sms.apiKey", "sms.senderId", "sms.enabled"]} label="Save SMS" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 3: Vaani AI */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="vaani">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-pink-600" /> Vaani AI Settings — वाणी</CardTitle>
              <p className="text-sm text-muted-foreground">Vaani AI assistant ki voice, language, personality configure karo</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle enabled={getBool("vaani.voiceEnabled", true)} onChange={(v) => setBool("vaani.voiceEnabled", v)} label="🔊 Voice Enabled" desc="Vaani bolegi ya sirf text" />
              <Toggle enabled={getBool("vaani.autoGreet", true)} onChange={(v) => setBool("vaani.autoGreet", v)} label="👋 Auto Greet" desc="Login pe automatically welcome bolegi" />

              <div className="grid gap-2">
                <Label>Default Language</Label>
                <Select value={get("vaani.language", "hindi")} onValueChange={(v) => set("vaani.language", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hindi">Hindi (हिंदी) 🇮🇳</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hinglish">Hinglish (Mix)</SelectItem>
                    <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
                    <SelectItem value="marathi">Marathi (मराठी)</SelectItem>
                    <SelectItem value="gujarati">Gujarati (ગુજરાતી)</SelectItem>
                    <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
                    <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                    <SelectItem value="punjabi">Punjabi (ਪੰਜਾਬੀ)</SelectItem>
                    <SelectItem value="kannada">Kannada (ಕನ್ನಡ)</SelectItem>
                    <SelectItem value="malayalam">Malayalam (മലയാളം)</SelectItem>
                    <SelectItem value="odia">Odia (ଓଡ଼ିଆ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Personality</Label>
                <Select value={get("vaani.personality", "friendly")} onValueChange={(v) => set("vaani.personality", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional — Formal, business tone</SelectItem>
                    <SelectItem value="friendly">Friendly — Warm, approachable (Recommended ⭐)</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic — Energetic, sales-focused</SelectItem>
                    <SelectItem value="calm">Calm — Gentle, patient tone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Welcome Message</Label>
                <Textarea
                  value={get("vaani.welcomeMessage", "Namaste! Main hoon Vaani, aapki AI assistant. Kaise madad kar sakti hoon?")}
                  onChange={(e) => set("vaani.welcomeMessage", e.target.value)}
                  rows={2}
                  placeholder="Welcome message jo login pe bolegi"
                />
              </div>

              <div className="grid gap-2">
                <Label>TTS Provider</Label>
                <Select value={get("vaani.ttsProvider", "browser")} onValueChange={(v) => set("vaani.ttsProvider", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browser">Browser Speech (Free)</SelectItem>
                    <SelectItem value="elevenlabs">ElevenLabs (Premium Quality 💎)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {get("vaani.ttsProvider") === "elevenlabs" && (
                <div className="grid gap-2">
                  <Label>ElevenLabs API Key</Label>
                  <MaskedInput value={get("vaani.elevenLabsKey")} onChange={(v) => set("vaani.elevenLabsKey", v)} placeholder="ElevenLabs API key" />
                  <p className="text-xs text-muted-foreground">Get from: elevenlabs.io → Profile → API Keys</p>
                </div>
              )}

              <SaveButton keys={["vaani.voiceEnabled", "vaani.autoGreet", "vaani.language", "vaani.personality", "vaani.welcomeMessage", "vaani.ttsProvider", "vaani.elevenLabsKey"]} label="Save Vaani Settings" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 4: Automation */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-amber-600" /> Automation & Cron Jobs</CardTitle>
              <p className="text-sm text-muted-foreground">Automatic reports, reminders aur alerts configure karo</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">⚠️ Vercel Hobby Plan: Sirf 1 cron job supported. Pro plan lene pe sab crons chalenge.</p>
              </div>

              <Toggle enabled={getBool("automation.dailyReport", true)} onChange={(v) => setBool("automation.dailyReport", v)} label="📊 Daily Report" desc="Raat 9 PM IST ko owner ko WhatsApp/Email pe full report" />
              <Toggle enabled={getBool("automation.followupReminder", true)} onChange={(v) => setBool("automation.followupReminder", v)} label="📞 Follow-up Reminders" desc="Subah 9 AM sales execs ko pending follow-ups" />
              <Toggle enabled={getBool("automation.insuranceCheck", true)} onChange={(v) => setBool("automation.insuranceCheck", v)} label="🛡️ Insurance Expiry Check" desc="Insurance expire hone se pehle customer ko alert" />
              <Toggle enabled={getBool("automation.daybookCheck", true)} onChange={(v) => setBool("automation.daybookCheck", v)} label="📒 Daybook Lock Reminder" desc="Raat 10 PM daybook lock nahi hua toh alert" />
              <Toggle enabled={getBool("automation.weeklyReport")} onChange={(v) => setBool("automation.weeklyReport", v)} label="📈 Weekly Report" desc="Monday 10 AM weekly summary" />
              <Toggle enabled={getBool("automation.monthlyReport")} onChange={(v) => setBool("automation.monthlyReport", v)} label="📅 Monthly Report" desc="1st tarikh monthly P&L report" />

              <div className="grid gap-2">
                <Label>Report Delivery Channel</Label>
                <Select value={get("automation.reportChannel", "whatsapp")} onValueChange={(v) => set("automation.reportChannel", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="both">Both (WhatsApp + Email)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Daily Report Time (IST)</Label>
                <Input
                  type="time"
                  value={get("automation.dailyReportTime", "21:00")}
                  onChange={(e) => set("automation.dailyReportTime", e.target.value)}
                />
              </div>

              <SaveButton keys={["automation.dailyReport", "automation.dailyReportTime", "automation.followupReminder", "automation.insuranceCheck", "automation.daybookCheck", "automation.weeklyReport", "automation.monthlyReport", "automation.reportChannel"]} label="Save Automation" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 5: DevOps */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="devops">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Github className="h-5 w-5" /> GitHub</CardTitle>
                  <StatusBadge status={statuses.github} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Personal Access Token</Label>
                  <MaskedInput value={get("github.token")} onChange={(v) => set("github.token", v)} placeholder="ghp_..." />
                  <p className="text-xs text-muted-foreground">GitHub → Settings → Developer Settings → Personal Access Tokens</p>
                </div>
                <div className="grid gap-2">
                  <Label>Repository</Label>
                  <Input value={get("github.repo", "ravi0067/vaahan-erp")} onChange={(e) => set("github.repo", e.target.value)} placeholder="username/repo" />
                </div>
                <div className="flex gap-2">
                  <TestButton service="github" />
                  <SaveButton keys={["github.token", "github.repo"]} label="Save GitHub" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Cloud className="h-5 w-5 text-blue-500" /> Vercel</CardTitle>
                  <StatusBadge status={statuses.vercel} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Deploy Token</Label>
                  <MaskedInput value={get("vercel.token")} onChange={(v) => set("vercel.token", v)} placeholder="vcp_..." />
                </div>
                <div className="grid gap-2">
                  <Label>Project ID</Label>
                  <Input value={get("vercel.projectId")} onChange={(e) => set("vercel.projectId", e.target.value)} placeholder="prj_XXXXXXXXX" />
                </div>
                <div className="flex gap-2">
                  <TestButton service="vercel" />
                  <SaveButton keys={["vercel.token", "vercel.projectId"]} label="Save Vercel" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 6: Payment */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-indigo-600" /> Payment Gateway</CardTitle>
              <p className="text-sm text-muted-foreground">Online payment accept karne ke liye gateway configure karo</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Payment Provider</Label>
                <Select value={get("payment.provider", "razorpay")} onValueChange={(v) => set("payment.provider", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="razorpay">Razorpay 🇮🇳 (Recommended)</SelectItem>
                    <SelectItem value="paypal">PayPal 🌍 (International)</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="payu">PayU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Key ID</Label>
                <Input value={get("payment.keyId")} onChange={(e) => set("payment.keyId", e.target.value)} placeholder="Enter Razorpay Key ID" />
              </div>

              <div className="grid gap-2">
                <Label>Key Secret</Label>
                <MaskedInput value={get("payment.keySecret")} onChange={(v) => set("payment.keySecret", v)} placeholder="Enter Razorpay Secret Key" />
              </div>

              {/* PayPal-specific fields */}
              {get("payment.provider") === "paypal" && (
                <>
                  <div className="grid gap-2">
                    <Label>PayPal Client ID</Label>
                    <Input value={get("payment.paypal.clientId")} onChange={(e) => set("payment.paypal.clientId", e.target.value)} placeholder="Enter PayPal Client ID" />
                  </div>
                  <div className="grid gap-2">
                    <Label>PayPal Secret Key</Label>
                    <MaskedInput value={get("payment.paypal.secret")} onChange={(v) => set("payment.paypal.secret", v)} placeholder="Enter PayPal Secret Key" />
                  </div>
                </>
              )}

              <Toggle enabled={getBool("payment.testMode", true)} onChange={(v) => setBool("payment.testMode", v)} label="🧪 Test Mode" desc="Sandbox environment for testing payments" />

              <div className="grid gap-2">
                <Label>Webhook URL (Auto-generated)</Label>
                <Input value={`https://www.vaahanerp.com/api/webhooks/${get("payment.provider", "razorpay")}`} readOnly className="bg-muted" />
              </div>

              <SaveButton keys={["payment.provider", "payment.keyId", "payment.keySecret", "payment.testMode", "payment.paypal.clientId", "payment.paypal.secret"]} label="Save Payment Config" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 7: System Status */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-green-600" /> System Status</CardTitle>
                <Button variant="outline" onClick={testAll} disabled={testingAll} size="sm">
                  {testingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Refresh All
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Sab services ka live connection status</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { key: "gemini", label: "🧠 Gemini AI (Brain)", icon: Brain },
                  { key: "exotel", label: "📞 Exotel (Call + WhatsApp)", icon: Phone },
                  { key: "smtp", label: "📧 Email SMTP", icon: Mail },
                  { key: "sms", label: "💬 SMS (MSG91)", icon: MessageSquare },
                  { key: "github", label: "🔧 GitHub (DevOps)", icon: Github },
                  { key: "vercel", label: "☁️ Vercel (Hosting)", icon: Cloud },
                ].map(({ key, label }) => {
                  const status = statuses[key];
                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {status?.latency && (
                          <span className="text-xs text-muted-foreground">{status.latency}ms</span>
                        )}
                        <StatusBadge status={status} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testService(key)}
                          disabled={testingService === key}
                          className="h-7 w-7 p-0"
                        >
                          {testingService === key ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {Object.keys(statuses).length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Summary:</span>
                    <span>
                      ✅ {Object.values(statuses).filter(s => s.connected).length} connected
                      {" / "}
                      ⚠️ {Object.values(statuses).filter(s => s.configured && !s.connected).length} errors
                      {" / "}
                      ❌ {Object.values(statuses).filter(s => !s.configured).length} not configured
                    </span>
                  </div>
                </div>
              )}

              {/* AI Tools Info */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold text-sm mb-3">🛠️ AI Tools Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: "Data Tools", count: 18, color: "text-blue-600" },
                    { label: "Action Tools", count: 13, color: "text-green-600" },
                    { label: "Communication Tools", count: 11, color: "text-purple-600" },
                    { label: "DevOps Tools", count: 10, color: "text-orange-600" },
                    { label: "Register Tool", count: 1, color: "text-pink-600" },
                    { label: "Total Tools", count: 53, color: "text-red-600 font-bold" },
                  ].map((item) => (
                    <div key={item.label} className="p-2 border rounded text-center">
                      <p className={`text-lg font-bold ${item.color}`}>{item.count}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
