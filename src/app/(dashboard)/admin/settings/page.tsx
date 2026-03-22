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
} from "lucide-react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settings-store";
import { AutoTriggerConfig } from "./components/AutoTriggerConfig";

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
  const [testing, setTesting] = React.useState(false);

  const handleSave = () => {
    setPaymentGateway({ connected: paymentGateway.keyId.length > 0 && paymentGateway.keySecret.length > 0 });
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
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Saved ✅" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── AI Assistant Tab ───────────────────────────────────────────────────
function AIAssistantTab() {
  const { aiAssistant, setAIAssistant } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState("");

  const handleSave = () => {
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
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
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
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Saved ✅" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── WhatsApp Tab ───────────────────────────────────────────────────────
function WhatsAppTab() {
  const { whatsapp, setWhatsApp } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testNumber, setTestNumber] = React.useState("");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => setTesting(false), 1500);
  };

  const updateTemplate = (key: string, value: string) => {
    setWhatsApp({ templates: { ...whatsapp.templates, [key]: value } });
  };

  const toggleClientOverride = (clientId: string) => {
    const current = whatsapp.clientOverrides[clientId] ?? true;
    setWhatsApp({ clientOverrides: { ...whatsapp.clientOverrides, [clientId]: !current } });
  };

  const templateLabels: Record<string, string> = {
    booking_confirmation: "Booking Confirmation",
    payment_receipt: "Payment Receipt",
    delivery_ready: "Delivery Ready",
    followup_reminder: "Follow-up Reminder",
    rto_update: "RTO Update",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">WhatsApp Alerts</h3>
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

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Provider</Label>
          <Select value={whatsapp.provider} onValueChange={(v) => setWhatsApp({ provider: v as "whatsapp_business" | "twilio" | "wati" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp_business">WhatsApp Business API</SelectItem>
              <SelectItem value="twilio">Twilio</SelectItem>
              <SelectItem value="wati">Wati</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>API Key / Auth Token</Label>
          <MaskedInput
            value={whatsapp.apiKey}
            onChange={(v) => setWhatsApp({ apiKey: v })}
            placeholder="Enter API key or auth token"
          />
        </div>

        <div className="grid gap-2">
          <Label>Phone Number ID / From Number</Label>
          <Input
            value={whatsapp.phoneNumberId}
            onChange={(e) => setWhatsApp({ phoneNumberId: e.target.value })}
            placeholder="+91XXXXXXXXXX"
          />
        </div>

        {/* Templates */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Message Templates</Label>
          <p className="text-xs text-muted-foreground">
            Use placeholders: {"{{customer_name}}"}, {"{{booking_id}}"}, {"{{vehicle}}"}, {"{{amount}}"}, {"{{remaining}}"}
          </p>
          {Object.entries(templateLabels).map(([key, label]) => (
            <div key={key} className="grid gap-1">
              <Label className="text-xs">{label}</Label>
              <Textarea
                value={whatsapp.templates[key] || ""}
                onChange={(e) => updateTemplate(key, e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          ))}
        </div>

        {/* Per-client overrides */}
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

        {/* Test */}
        <div className="flex items-end gap-2">
          <div className="grid gap-2 flex-1">
            <Label className="text-xs">Test Phone Number</Label>
            <Input value={testNumber} onChange={(e) => setTestNumber(e.target.value)} placeholder="+919876543210" />
          </div>
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            <MessageCircle className="h-4 w-4 mr-2" />
            {testing ? "Sending..." : "Test WhatsApp"}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Saved ✅" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── Email Tab ──────────────────────────────────────────────────────────
function EmailTab() {
  const { email, setEmail } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testEmail, setTestEmail] = React.useState("");

  const handleSave = () => {
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
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Saved ✅" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ── SMS Tab ────────────────────────────────────────────────────────────
function SMSTab() {
  const { sms, setSMS } = useSettingsStore();
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
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
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Saved ✅" : "Save"}
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
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <TabsContent value="payment"><PaymentGatewayTab /></TabsContent>
            <TabsContent value="ai"><AIAssistantTab /></TabsContent>
            <TabsContent value="whatsapp"><WhatsAppTab /></TabsContent>
            <TabsContent value="email"><EmailTab /></TabsContent>
            <TabsContent value="sms"><SMSTab /></TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Auto Trigger Config */}
      <AutoTriggerConfig />
    </div>
  );
}
