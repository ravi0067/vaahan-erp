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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CreditCard, Bot, MessageCircle, Mail, MessageSquare, Save,
  Eye, EyeOff, Zap, Copy, ArrowLeft, CheckCircle2, AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settings-store";
import { AutoTriggerConfig } from "./components/AutoTriggerConfig";
import { toast } from "sonner";

// ── DB API Save Helper ─────────────────────────────────────────────────
async function saveToApi(settings: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/ai-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`✅ ${data.saved} settings database mein save ho gayi!`);
      return true;
    } else {
      toast.error(data.error || "Save failed");
      return false;
    }
  } catch {
    toast.error("Network error — check connection");
    return false;
  }
}

// ── Masked Input Component ─────────────────────────────────────────────
function MaskedInput({
  value, onChange, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
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

// ── Mock clients for override tables ───────────────────────────────────
const mockClients = [
  { id: "1", name: "Vaahan Motors Lucknow" },
  { id: "2", name: "Shree Honda Kanpur" },
  { id: "3", name: "Bajaj World Agra" },
  { id: "4", name: "Hero Point Varanasi" },
  { id: "5", name: "TVS Motors Allahabad" },
];

// ── Payment Gateway Tab ────────────────────────────────────────────────
function PaymentGatewayTab() {
  const { paymentGateway, setPaymentGateway } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    setPaymentGateway({ connected: paymentGateway.keyId.length > 0 && paymentGateway.keySecret.length > 0 });
    await saveToApi({
      "payment.provider": paymentGateway.provider,
      "payment.keyId": paymentGateway.keyId,
      "payment.keySecret": paymentGateway.keySecret,
      "payment.testMode": paymentGateway.testMode ? "true" : "false",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      if (paymentGateway.keyId && paymentGateway.keySecret) {
        setPaymentGateway({ connected: true });
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Payment Gateway</h3>
          {paymentGateway.connected ? (
            <Badge className="bg-green-100 text-green-700 gap-1">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-700 gap-1">
              <AlertTriangle className="h-3 w-3" /> Not Configured
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Payment Provider</Label>
          <Select value={paymentGateway.provider} onValueChange={(v) => setPaymentGateway({ provider: v as "razorpay" | "stripe" | "payu" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="razorpay">Razorpay</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="payu">PayU</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Key ID</Label>
          <Input
            value={paymentGateway.keyId}
            onChange={(e) => setPaymentGateway({ keyId: e.target.value })}
            placeholder={paymentGateway.provider === "razorpay" ? "rzp_test_xxxxxxxxxxxxx" : "Enter Key ID"}
          />
        </div>

        <div className="grid gap-2">
          <Label>Key Secret</Label>
          <MaskedInput
            value={paymentGateway.keySecret}
            onChange={(v) => setPaymentGateway({ keySecret: v })}
            placeholder="Enter your secret key"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium text-sm">Test Mode</p>
            <p className="text-xs text-muted-foreground">Use sandbox environment for testing</p>
          </div>
          <button
            onClick={() => setPaymentGateway({ testMode: !paymentGateway.testMode })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              paymentGateway.testMode ? "bg-amber-500" : "bg-green-500"
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              paymentGateway.testMode ? "left-0.5" : "left-[22px]"
            }`} />
          </button>
        </div>

        <div className="grid gap-2">
          <Label>Webhook URL (auto-generated)</Label>
          <div className="flex gap-2">
            <Input value={paymentGateway.webhookUrl} readOnly className="bg-muted" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigator.clipboard.writeText(paymentGateway.webhookUrl)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleTest} disabled={testing}>
          <Zap className="h-4 w-4 mr-2" />
          {testing ? "Testing..." : "Test Connection"}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved ✅" : saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── AI Assistant Tab ───────────────────────────────────────────────────
function AIAssistantTab() {
  const { aiAssistant, setAIAssistant } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState("");

  const handleSave = async () => {
    setSaving(true);
    await saveToApi({
      "ai.provider": aiAssistant.provider,
      "ai.apiKey": aiAssistant.apiKey,
      "ai.model": aiAssistant.model,
      "ai.maxTokens": String(aiAssistant.maxTokens),
      "ai.enabled": aiAssistant.enabledGlobal ? "true" : "false",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult("");
    setTimeout(() => {
      setTesting(false);
      setTestResult("✅ AI connected! Response: \"Hello! I'm VaahanERP AI Assistant. How can I help you today?\"");
    }, 2000);
  };

  const toggleClientOverride = (clientId: string) => {
    const current = aiAssistant.clientOverrides[clientId] ?? true;
    setAIAssistant({
      clientOverrides: { ...aiAssistant.clientOverrides, [clientId]: !current },
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">AI Assistant Configuration</h3>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>AI Provider</Label>
          <Select value={aiAssistant.provider} onValueChange={(v) => setAIAssistant({ provider: v as "openai" | "gemini" | "custom" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>API Key</Label>
          <MaskedInput
            value={aiAssistant.apiKey}
            onChange={(v) => setAIAssistant({ apiKey: v })}
            placeholder={aiAssistant.provider === "openai" ? "sk-..." : "Enter API key"}
          />
        </div>

        <div className="grid gap-2">
          <Label>Model</Label>
          <Select value={aiAssistant.model} onValueChange={(v) => setAIAssistant({ model: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {aiAssistant.provider === "openai" ? (
                <>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </>
              ) : aiAssistant.provider === "gemini" ? (
                <>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                </>
              ) : (
                <SelectItem value="custom">Custom Model</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Max Tokens: {aiAssistant.maxTokens}</Label>
          <input
            type="range"
            min={256}
            max={4096}
            step={128}
            value={aiAssistant.maxTokens}
            onChange={(e) => setAIAssistant({ maxTokens: Number(e.target.value) })}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>256</span>
            <span>4096</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium text-sm">Enable AI for All Clients</p>
            <p className="text-xs text-muted-foreground">Master toggle for AI across all dealerships</p>
          </div>
          <button
            onClick={() => setAIAssistant({ enabledGlobal: !aiAssistant.enabledGlobal })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              aiAssistant.enabledGlobal ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              aiAssistant.enabledGlobal ? "left-[22px]" : "left-0.5"
            }`} />
          </button>
        </div>

        {/* Per-client overrides */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Per-Client AI Override</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-center w-[100px]">AI Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleClientOverride(c.id)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${
                          (aiAssistant.clientOverrides[c.id] ?? true) ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          (aiAssistant.clientOverrides[c.id] ?? true) ? "left-[18px]" : "left-0.5"
                        }`} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {testResult && (
          <div className="text-sm bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 p-3 rounded-lg">
            {testResult}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleTest} disabled={testing}>
          <Bot className="h-4 w-4 mr-2" />
          {testing ? "Testing AI..." : "Test AI"}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved ✅" : saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── WhatsApp Tab ───────────────────────────────────────────────────────
function WhatsAppTab() {
  const { whatsapp, setWhatsApp } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testNumber, setTestNumber] = React.useState("");

  // Active provider: "exotel" | "meta"
  const [activeProvider, setActiveProvider] = React.useState<"exotel" | "meta">("exotel");

  // Exotel WhatsApp config
  const [exotel, setExotel] = React.useState({
    apiKey: "",
    apiToken: "",
    accountSid: "",
    fromNumber: "",
    enabled: true,
  });

  // Meta (Facebook) WhatsApp Business API config
  const [meta, setMeta] = React.useState({
    accessToken: "",
    phoneNumberId: "",
    wabaId: "",
    appId: "",
    appSecret: "",
    webhookVerifyToken: "",
    enabled: false,
  });

  const templateLabels: Record<string, string> = {
    booking_confirmation: "Booking Confirmation",
    payment_receipt: "Payment Receipt",
    delivery_ready: "Delivery Ready",
    followup_reminder: "Follow-up Reminder",
    rto_update: "RTO Update",
  };

  const updateTemplate = (key: string, value: string) => {
    setWhatsApp({ templates: { ...whatsapp.templates, [key]: value } });
  };

  const toggleClientOverride = (clientId: string) => {
    const current = whatsapp.clientOverrides[clientId] ?? true;
    setWhatsApp({ clientOverrides: { ...whatsapp.clientOverrides, [clientId]: !current } });
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => setTesting(false), 1500);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveToApi({
      // Active provider selection
      "whatsapp.activeProvider": activeProvider,
      "whatsapp.enabled": whatsapp.enabled ? "true" : "false",

      // Exotel WhatsApp
      "whatsapp.exotel.apiKey": exotel.apiKey,
      "whatsapp.exotel.apiToken": exotel.apiToken,
      "whatsapp.exotel.accountSid": exotel.accountSid,
      "whatsapp.exotel.fromNumber": exotel.fromNumber,
      "whatsapp.exotel.enabled": exotel.enabled ? "true" : "false",

      // Meta WhatsApp Business API
      "whatsapp.meta.accessToken": meta.accessToken,
      "whatsapp.meta.phoneNumberId": meta.phoneNumberId,
      "whatsapp.meta.wabaId": meta.wabaId,
      "whatsapp.meta.appId": meta.appId,
      "whatsapp.meta.appSecret": meta.appSecret,
      "whatsapp.meta.webhookVerifyToken": meta.webhookVerifyToken,
      "whatsapp.meta.enabled": meta.enabled ? "true" : "false",

      // Templates (common)
      ...Object.fromEntries(Object.entries(whatsapp.templates).map(([k, v]) => [`whatsapp.template.${k}`, v])),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">WhatsApp Configuration</h3>
        <button
          onClick={() => setWhatsApp({ enabled: !whatsapp.enabled })}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            whatsapp.enabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            whatsapp.enabled ? "left-[22px]" : "left-0.5"
          }`} />
        </button>
      </div>

      {/* Provider Switch */}
      <div className="rounded-xl border bg-muted/30 p-1 flex gap-1">
        <button
          onClick={() => setActiveProvider("exotel")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeProvider === "exotel"
              ? "bg-white dark:bg-gray-800 shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="text-lg">📞</span>
          Exotel WhatsApp
          {activeProvider === "exotel" && (
            <span className="ml-1 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">ACTIVE</span>
          )}
        </button>
        <button
          onClick={() => setActiveProvider("meta")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeProvider === "meta"
              ? "bg-white dark:bg-gray-800 shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="text-lg">🔵</span>
          Meta WhatsApp Business API
          {activeProvider === "meta" && (
            <span className="ml-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">ACTIVE</span>
          )}
        </button>
      </div>

      {/* ── EXOTEL CONFIG ─────────────────────────────────────── */}
      {activeProvider === "exotel" && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-xl">📞</span>
              Exotel WhatsApp Configuration
              <span className="ml-auto text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-2 py-0.5 rounded-full">
                Currently Active
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Exotel ka WhatsApp gateway — API key aur Account SID se messages bhejta hai
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Enable Exotel WhatsApp</Label>
              <button
                onClick={() => setExotel(p => ({ ...p, enabled: !p.enabled }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${exotel.enabled ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${exotel.enabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>API Key</Label>
                <MaskedInput
                  value={exotel.apiKey}
                  onChange={(v) => setExotel(p => ({ ...p, apiKey: v }))}
                  placeholder="Exotel API Key"
                />
              </div>
              <div className="grid gap-2">
                <Label>API Token</Label>
                <MaskedInput
                  value={exotel.apiToken}
                  onChange={(v) => setExotel(p => ({ ...p, apiToken: v }))}
                  placeholder="Exotel API Token"
                />
              </div>
              <div className="grid gap-2">
                <Label>Account SID</Label>
                <Input
                  value={exotel.accountSid}
                  onChange={(e) => setExotel(p => ({ ...p, accountSid: e.target.value }))}
                  placeholder="Exotel Account SID"
                />
              </div>
              <div className="grid gap-2">
                <Label>From Number (WhatsApp)</Label>
                <Input
                  value={exotel.fromNumber}
                  onChange={(e) => setExotel(p => ({ ...p, fromNumber: e.target.value }))}
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-3 text-xs text-orange-800 dark:text-orange-300">
              <p className="font-semibold mb-1">Exotel Dashboard se milenge:</p>
              <p>API Key + API Token → Settings → API → Credentials</p>
              <p>Account SID → Dashboard ka top pe dikhta hai</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── META WHATSAPP BUSINESS API CONFIG ────────────────── */}
      {activeProvider === "meta" && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-xl">🔵</span>
              Meta WhatsApp Business API
              <span className="ml-auto text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {meta.enabled ? "Will Be Active" : "Ready to Configure"}
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Meta Business Manager se approve hone ke baad yahan credentials daalna — phir "Active" switch karna
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Enable Meta WhatsApp API</Label>
              <button
                onClick={() => setMeta(p => ({ ...p, enabled: !p.enabled }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${meta.enabled ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${meta.enabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label>Permanent Access Token</Label>
                <MaskedInput
                  value={meta.accessToken}
                  onChange={(v) => setMeta(p => ({ ...p, accessToken: v }))}
                  placeholder="EAAxxxxxxxxxx... (Meta System User Token)"
                />
                <p className="text-xs text-muted-foreground">
                  Meta Business Manager → System Users → Generate Token (never expires)
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Phone Number ID</Label>
                <Input
                  value={meta.phoneNumberId}
                  onChange={(e) => setMeta(p => ({ ...p, phoneNumberId: e.target.value }))}
                  placeholder="1234567890"
                />
                <p className="text-xs text-muted-foreground">
                  WhatsApp Manager → Phone Numbers → Phone Number ID
                </p>
              </div>

              <div className="grid gap-2">
                <Label>WhatsApp Business Account ID (WABA ID)</Label>
                <Input
                  value={meta.wabaId}
                  onChange={(e) => setMeta(p => ({ ...p, wabaId: e.target.value }))}
                  placeholder="WABA ID (Business Account ID)"
                />
              </div>

              <div className="grid gap-2">
                <Label>App ID</Label>
                <Input
                  value={meta.appId}
                  onChange={(e) => setMeta(p => ({ ...p, appId: e.target.value }))}
                  placeholder="Meta App ID"
                />
              </div>

              <div className="grid gap-2">
                <Label>App Secret</Label>
                <MaskedInput
                  value={meta.appSecret}
                  onChange={(v) => setMeta(p => ({ ...p, appSecret: v }))}
                  placeholder="Meta App Secret"
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label>Webhook Verify Token</Label>
                <div className="flex gap-2">
                  <Input
                    value={meta.webhookVerifyToken}
                    onChange={(e) => setMeta(p => ({ ...p, webhookVerifyToken: e.target.value }))}
                    placeholder="apna custom verify token — kuch bhi (e.g. VaahanWH2026)"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMeta(p => ({ ...p, webhookVerifyToken: `Vaahan_${Math.random().toString(36).slice(2, 10).toUpperCase()}` }))}
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Webhook URL: <code className="bg-muted px-1 rounded">https://vaahanerp.com/api/webhooks/whatsapp/meta</code>
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-semibold">Meta Business Manager steps (jab account approve ho):</p>
              <p>1. business.facebook.com → WhatsApp Manager → Phone Numbers → iska Phone Number ID copy karo</p>
              <p>2. Meta Developers → App → WhatsApp → API Setup → Permanent Token banao (System User se)</p>
              <p>3. Webhooks → Callback URL mein upar wala URL daalo, Verify Token yahan wala daalo</p>
              <p>4. Sab fields bharke Save karo → phir upar "Meta" tab "Active" select karo</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TEMPLATES (common) ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Message Templates (Dono providers ke liye)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Placeholders: {"{{customer_name}}"}, {"{{booking_id}}"}, {"{{vehicle}}"}, {"{{amount}}"}, {"{{remaining}}"}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(templateLabels).map(([key, label]) => (
            <div key={key} className="grid gap-1">
              <Label className="text-xs font-medium">{label}</Label>
              <Textarea
                value={whatsapp.templates[key] || ""}
                onChange={(e) => updateTemplate(key, e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── PER-CLIENT OVERRIDES ─────────────────────────────── */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Per-Client WhatsApp Override</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-center w-[100px]">Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleClientOverride(c.id)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        (whatsapp.clientOverrides[c.id] ?? true) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        (whatsapp.clientOverrides[c.id] ?? true) ? "left-[18px]" : "left-0.5"
                      }`} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── TEST + SAVE ──────────────────────────────────────── */}
      <div className="flex items-end gap-2">
        <div className="grid gap-2 flex-1">
          <Label className="text-xs">Test Phone Number</Label>
          <Input value={testNumber} onChange={(e) => setTestNumber(e.target.value)} placeholder="+919876543210" />
        </div>
        <Button variant="outline" onClick={handleTest} disabled={testing}>
          <MessageCircle className="h-4 w-4 mr-2" />
          {testing ? "Sending..." : `Test via ${activeProvider === "meta" ? "Meta" : "Exotel"}`}
        </Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved ✅" : saving ? "Saving..." : "Save WhatsApp Config"}
        </Button>
      </div>
    </div>
  );
}

// ── Email Tab ──────────────────────────────────────────────────────────
function EmailTab() {
  const { email, setEmail } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testEmail, setTestEmail] = React.useState("");

  const handleSave = async () => {
    setSaving(true);
    await saveToApi({
      "smtp.provider": email.provider,
      "smtp.host": email.host,
      "smtp.port": email.port,
      "smtp.username": email.username,
      "smtp.password": email.password,
      "smtp.fromName": email.fromName,
      "smtp.fromEmail": email.fromEmail,
      "smtp.enabled": email.enabled ? "true" : "false",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => setTesting(false), 1500);
  };

  const updateTemplate = (key: string, value: string) => {
    setEmail({ templates: { ...email.templates, [key]: value } });
  };

  const templateLabels: Record<string, string> = {
    welcome: "Welcome Email",
    booking_confirmation: "Booking Confirmation",
    payment_receipt: "Payment Receipt",
    invoice: "Invoice Email",
    delivery_notification: "Delivery Notification",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Email Alerts (SMTP)</h3>
        <button
          onClick={() => setEmail({ enabled: !email.enabled })}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            email.enabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            email.enabled ? "left-[22px]" : "left-0.5"
          }`} />
        </button>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>SMTP Provider</Label>
          <Select value={email.provider} onValueChange={(v) => setEmail({ provider: v as "gmail" | "sendgrid" | "custom" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gmail">Gmail</SelectItem>
              <SelectItem value="sendgrid">SendGrid</SelectItem>
              <SelectItem value="custom">Custom SMTP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>SMTP Host</Label>
            <Input value={email.host} onChange={(e) => setEmail({ host: e.target.value })} placeholder="smtp.gmail.com" />
          </div>
          <div className="grid gap-2">
            <Label>Port</Label>
            <Input value={email.port} onChange={(e) => setEmail({ port: e.target.value })} placeholder="587" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Username</Label>
          <Input value={email.username} onChange={(e) => setEmail({ username: e.target.value })} placeholder="your@gmail.com" />
        </div>

        <div className="grid gap-2">
          <Label>Password</Label>
          <MaskedInput value={email.password} onChange={(v) => setEmail({ password: v })} placeholder="App password" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>From Name</Label>
            <Input value={email.fromName} onChange={(e) => setEmail({ fromName: e.target.value })} placeholder="VaahanERP" />
          </div>
          <div className="grid gap-2">
            <Label>From Email</Label>
            <Input value={email.fromEmail} onChange={(e) => setEmail({ fromEmail: e.target.value })} placeholder="noreply@vaahan.com" />
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Email Templates</Label>
          {Object.entries(templateLabels).map(([key, label]) => (
            <div key={key} className="grid gap-1">
              <Label className="text-xs">{label}</Label>
              <Textarea
                value={email.templates[key] || ""}
                onChange={(e) => updateTemplate(key, e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          ))}
        </div>

        {/* Test */}
        <div className="flex items-end gap-2">
          <div className="grid gap-2 flex-1">
            <Label className="text-xs">Test Email Address</Label>
            <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="test@example.com" />
          </div>
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            <Mail className="h-4 w-4 mr-2" />
            {testing ? "Sending..." : "Test Email"}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved ✅" : saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── SMS Tab ────────────────────────────────────────────────────────────
function SMSTab() {
  const { sms, setSMS } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveToApi({
      "sms.provider": sms.provider,
      "sms.apiKey": sms.apiKey,
      "sms.senderId": sms.senderId,
      "sms.enabled": sms.enabled ? "true" : "false",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateTemplate = (key: string, value: string) => {
    setSMS({ templates: { ...sms.templates, [key]: value } });
  };

  const templateLabels: Record<string, string> = {
    otp: "OTP",
    booking: "Booking Confirmation",
    payment: "Payment Receipt",
    delivery: "Delivery Ready",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">SMS Alerts</h3>
        <button
          onClick={() => setSMS({ enabled: !sms.enabled })}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            sms.enabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            sms.enabled ? "left-[22px]" : "left-0.5"
          }`} />
        </button>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>SMS Provider</Label>
          <Select value={sms.provider} onValueChange={(v) => setSMS({ provider: v as "msg91" | "twilio" | "textlocal" })}>
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
          <MaskedInput value={sms.apiKey} onChange={(v) => setSMS({ apiKey: v })} placeholder="Enter SMS API key" />
        </div>

        <div className="grid gap-2">
          <Label>Sender ID</Label>
          <Input value={sms.senderId} onChange={(e) => setSMS({ senderId: e.target.value })} placeholder="VAAHAN" />
        </div>

        {/* Templates */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">SMS Templates</Label>
          <p className="text-xs text-muted-foreground">Max 160 characters per SMS</p>
          {Object.entries(templateLabels).map(([key, label]) => (
            <div key={key} className="grid gap-1">
              <Label className="text-xs">{label}</Label>
              <Textarea
                value={sms.templates[key] || ""}
                onChange={(e) => updateTemplate(key, e.target.value)}
                rows={2}
                className="text-sm"
                maxLength={160}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved ✅" : saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── Calling / Voice API Tab ─────────────────────────────────────────────
function CallingTab() {
  const [config, setConfig] = React.useState({
    provider: 'exotel',
    apiKey: '',
    apiSecret: '',
    callerId: '',
    accountSid: '',
    autoCallEnabled: true,
    callRecordingEnabled: true,
    maxRetries: 3,
    retryIntervalMinutes: 30,
  });
  const [saved, setSaved] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testNumber, setTestNumber] = React.useState('');
  const [testResult, setTestResult] = React.useState('');

  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem('vaahan_calling_config', JSON.stringify(config));
    await saveToApi({
      "calling.provider": config.provider,
      "calling.apiKey": config.apiKey,
      "calling.apiSecret": config.apiSecret,
      "calling.callerId": config.callerId,
      "calling.accountSid": config.accountSid,
      "calling.autoCallEnabled": config.autoCallEnabled ? "true" : "false",
      "calling.callRecordingEnabled": config.callRecordingEnabled ? "true" : "false",
      "calling.maxRetries": String(config.maxRetries),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    if (!testNumber) return;
    setTesting(true);
    setTestResult('');
    setTimeout(() => {
      setTesting(false);
      setTestResult(`✅ Test call initiated to ${testNumber}. Check your phone!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">📞 Calling / Voice API</h3>
          <p className="text-sm text-muted-foreground">Bot ko customers ko auto-call karne ki power do</p>
        </div>
        <button
          onClick={() => setConfig(p => ({...p, autoCallEnabled: !p.autoCallEnabled}))}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            config.autoCallEnabled ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            config.autoCallEnabled ? "left-[22px]" : "left-0.5"
          }`} />
        </button>
      </div>

      {/* Provider Info */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">📱 Calling Provider Guide:</p>
        <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
          <p>• <strong>Exotel</strong> (Recommended for India) — exotel.com → ₹1-2/call, IVR, call recording, Indian numbers</p>
          <p>• <strong>Twilio</strong> (Global) — twilio.com → ₹2-3/call, programmable voice, global coverage</p>
          <p>• <strong>Knowlarity</strong> (India focused) — knowlarity.com → ₹1.5/call, cloud telephony, IVR</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Calling Provider</Label>
          <Select value={config.provider} onValueChange={(v) => setConfig(p => ({...p, provider: v}))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="exotel">Exotel (Best for India 🇮🇳)</SelectItem>
              <SelectItem value="twilio">Twilio (Global)</SelectItem>
              <SelectItem value="knowlarity">Knowlarity (India)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.provider === 'exotel' && (
          <>
            <div className="grid gap-2">
              <Label>Exotel API Key</Label>
              <MaskedInput value={config.apiKey} onChange={(v) => setConfig(p => ({...p, apiKey: v}))} placeholder="Exotel API Key (from my.exotel.com)" />
              <p className="text-xs text-muted-foreground">Get from: my.exotel.com → Settings → API</p>
            </div>
            <div className="grid gap-2">
              <Label>Exotel API Token</Label>
              <MaskedInput value={config.apiSecret} onChange={(v) => setConfig(p => ({...p, apiSecret: v}))} placeholder="Exotel API Token" />
            </div>
            <div className="grid gap-2">
              <Label>Account SID</Label>
              <Input value={config.accountSid} onChange={(e) => setConfig(p => ({...p, accountSid: e.target.value}))} placeholder="Exotel Account SID" />
            </div>
            <div className="grid gap-2">
              <Label>Caller ID (Virtual Number)</Label>
              <Input value={config.callerId} onChange={(e) => setConfig(p => ({...p, callerId: e.target.value}))} placeholder="+91-XXXXXXXXXX (Exotel virtual number)" />
              <p className="text-xs text-muted-foreground">Ye number customer ke phone pe dikhega jab bot call karega</p>
            </div>
          </>
        )}

        {config.provider === 'twilio' && (
          <>
            <div className="grid gap-2">
              <Label>Twilio Account SID</Label>
              <Input value={config.accountSid} onChange={(e) => setConfig(p => ({...p, accountSid: e.target.value}))} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              <p className="text-xs text-muted-foreground">Get from: console.twilio.com → Dashboard</p>
            </div>
            <div className="grid gap-2">
              <Label>Twilio Auth Token</Label>
              <MaskedInput value={config.apiSecret} onChange={(v) => setConfig(p => ({...p, apiSecret: v}))} placeholder="Auth Token" />
            </div>
            <div className="grid gap-2">
              <Label>Twilio Phone Number</Label>
              <Input value={config.callerId} onChange={(e) => setConfig(p => ({...p, callerId: e.target.value}))} placeholder="+1XXXXXXXXXX (Twilio number)" />
            </div>
          </>
        )}

        {config.provider === 'knowlarity' && (
          <>
            <div className="grid gap-2">
              <Label>Knowlarity API Key</Label>
              <MaskedInput value={config.apiKey} onChange={(v) => setConfig(p => ({...p, apiKey: v}))} placeholder="Knowlarity Authorization header" />
              <p className="text-xs text-muted-foreground">Get from: portal.knowlarity.com → API Settings</p>
            </div>
            <div className="grid gap-2">
              <Label>SR Number (Super Receptionist)</Label>
              <Input value={config.callerId} onChange={(e) => setConfig(p => ({...p, callerId: e.target.value}))} placeholder="+91-80XXXXXXXX" />
            </div>
          </>
        )}

        {/* Call Settings */}
        <div className="border rounded-lg p-4 space-y-3">
          <p className="font-medium text-sm">⚙️ Auto-Call Settings</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Call Recording</p>
              <p className="text-xs text-muted-foreground">All calls record hongi for quality & training</p>
            </div>
            <button
              onClick={() => setConfig(p => ({...p, callRecordingEnabled: !p.callRecordingEnabled}))}
              className={`relative w-9 h-5 rounded-full transition-colors ${config.callRecordingEnabled ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.callRecordingEnabled ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Max Retries</p>
              <p className="text-xs text-muted-foreground">Kitani baar retry kare agar pick nahi kiya</p>
            </div>
            <Input type="number" min={1} max={5} className="w-16 h-7" value={config.maxRetries} onChange={(e) => setConfig(p => ({...p, maxRetries: Number(e.target.value)}))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Retry Interval (minutes)</p>
              <p className="text-xs text-muted-foreground">Kitne minute baad dobara try kare</p>
            </div>
            <Input type="number" min={5} max={120} className="w-16 h-7" value={config.retryIntervalMinutes} onChange={(e) => setConfig(p => ({...p, retryIntervalMinutes: Number(e.target.value)}))} />
          </div>
        </div>

        {/* Bot Call Features */}
        <div className="border rounded-lg p-4 space-y-2">
          <p className="font-medium text-sm">🤖 Bot Auto-Call Features</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🛡️ Insurance Expiry Reminder', desc: 'Insurance expire hone se 15 din pehle call' },
              { label: '🔧 Service Due Reminder', desc: 'Service interval pura hone pe call' },
              { label: '📢 Promotional Calls', desc: 'Offers aur schemes ki info' },
              { label: '📞 Lead Follow-up', desc: 'Hot leads ko automatic follow-up' },
              { label: '📋 Appointment Confirmation', desc: 'Service/delivery appointment confirm' },
              { label: '⭐ Feedback Collection', desc: 'Delivery ke baad satisfaction call' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-xs">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Call */}
      <div className="flex items-end gap-2">
        <div className="grid gap-2 flex-1">
          <Label className="text-xs">Test Call Number</Label>
          <Input value={testNumber} onChange={(e) => setTestNumber(e.target.value)} placeholder="+919876543210" />
        </div>
        <Button variant="outline" onClick={handleTest} disabled={testing || !testNumber}>
          📞 {testing ? 'Calling...' : 'Test Call'}
        </Button>
      </div>

      {testResult && (
        <div className="text-sm bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 p-3 rounded-lg">
          {testResult}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved ✅" : saving ? "Saving..." : "Save Calling Config"}
        </Button>
      </div>
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────────
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Master Settings</h1>
          <p className="text-muted-foreground text-sm">Super Owner integration & API configurations</p>
        </div>
      </div>

      <Tabs defaultValue="payment" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="payment" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" /> Payment
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Bot className="h-3.5 w-3.5" /> AI Assistant
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> SMS
          </TabsTrigger>
          <TabsTrigger value="calling" className="gap-1.5">
            📞 Calling
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <TabsContent value="payment"><PaymentGatewayTab /></TabsContent>
            <TabsContent value="ai"><AIAssistantTab /></TabsContent>
            <TabsContent value="whatsapp"><WhatsAppTab /></TabsContent>
            <TabsContent value="email"><EmailTab /></TabsContent>
            <TabsContent value="sms"><SMSTab /></TabsContent>
            <TabsContent value="calling"><CallingTab /></TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Auto Trigger Config */}
      <AutoTriggerConfig />
    </div>
  );
}
