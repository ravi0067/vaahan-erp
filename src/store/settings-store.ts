import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Payment Gateway ────────────────────────────────────────────────────
export interface PaymentGatewayConfig {
  provider: "razorpay" | "stripe" | "payu";
  keyId: string;
  keySecret: string;
  testMode: boolean;
  webhookUrl: string;
  connected: boolean;
}

// ── AI Assistant ───────────────────────────────────────────────────────
export interface AIAssistantConfig {
  provider: "openai" | "gemini" | "custom";
  apiKey: string;
  model: string;
  maxTokens: number;
  enabledGlobal: boolean;
  clientOverrides: Record<string, boolean>; // clientId → enabled
}

// ── WhatsApp ───────────────────────────────────────────────────────────
export interface WhatsAppConfig {
  provider: "whatsapp_business" | "twilio" | "wati";
  apiKey: string;
  phoneNumberId: string;
  enabled: boolean;
  clientOverrides: Record<string, boolean>;
  templates: Record<string, string>;
}

// ── Email SMTP ─────────────────────────────────────────────────────────
export interface EmailConfig {
  provider: "gmail" | "sendgrid" | "custom";
  host: string;
  port: string;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  enabled: boolean;
  templates: Record<string, string>;
}

// ── SMS ────────────────────────────────────────────────────────────────
export interface SMSConfig {
  provider: "msg91" | "twilio" | "textlocal";
  apiKey: string;
  senderId: string;
  enabled: boolean;
  templates: Record<string, string>;
}

// ── Auto Triggers ──────────────────────────────────────────────────────
export interface AutoTriggerRule {
  event: string;
  whatsapp: boolean;
  email: boolean;
  sms: boolean;
}

// ── Client Feature Config ──────────────────────────────────────────────
export interface ClientFeatureConfig {
  onlinePayment: boolean;
  aiAssistant: boolean;
  whatsappAlerts: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  customerTrackingLinks: boolean;
  invoiceGeneration: boolean;
  maxUsers: number;
  maxVehicles: number;
  maxBookingsPerMonth: number;
}

// ── Store ──────────────────────────────────────────────────────────────
interface SettingsState {
  paymentGateway: PaymentGatewayConfig;
  aiAssistant: AIAssistantConfig;
  whatsapp: WhatsAppConfig;
  email: EmailConfig;
  sms: SMSConfig;
  autoTriggers: AutoTriggerRule[];
  clientFeatures: Record<string, ClientFeatureConfig>; // clientId → config

  setPaymentGateway: (config: Partial<PaymentGatewayConfig>) => void;
  setAIAssistant: (config: Partial<AIAssistantConfig>) => void;
  setWhatsApp: (config: Partial<WhatsAppConfig>) => void;
  setEmail: (config: Partial<EmailConfig>) => void;
  setSMS: (config: Partial<SMSConfig>) => void;
  setAutoTriggers: (triggers: AutoTriggerRule[]) => void;
  setClientFeatures: (clientId: string, config: Partial<ClientFeatureConfig>) => void;
}

const defaultAutoTriggers: AutoTriggerRule[] = [
  { event: "New Booking Created", whatsapp: true, email: true, sms: false },
  { event: "Payment Received", whatsapp: true, email: true, sms: true },
  { event: "RTO Status Updated", whatsapp: true, email: false, sms: false },
  { event: "Delivery Ready", whatsapp: true, email: true, sms: true },
  { event: "Follow-up Reminder", whatsapp: true, email: false, sms: false },
  { event: "Insurance Expiry Warning", whatsapp: false, email: true, sms: false },
  { event: "Daybook Not Locked", whatsapp: false, email: true, sms: false },
];

const defaultWhatsAppTemplates: Record<string, string> = {
  booking_confirmation:
    "Hello {{customer_name}}! Your booking {{booking_id}} for {{vehicle}} is confirmed. Thank you for choosing us! 🏍️",
  payment_receipt:
    "Hi {{customer_name}}, we received ₹{{amount}} for booking {{booking_id}}. Remaining: ₹{{remaining}}. Thank you! 💰",
  delivery_ready:
    "Great news {{customer_name}}! Your {{vehicle}} (Booking: {{booking_id}}) is ready for delivery. Visit us to take it home! 🎉",
  followup_reminder:
    "Hi {{customer_name}}, just checking in about the {{vehicle}} you were interested in. Any questions? We're here to help! 😊",
  rto_update:
    "Hi {{customer_name}}, RTO update for {{vehicle}} ({{booking_id}}): {{rto_status}}. We'll keep you posted! 📋",
};

const defaultEmailTemplates: Record<string, string> = {
  welcome:
    "Welcome to our dealership, {{customer_name}}! We're excited to help you find the perfect ride.",
  booking_confirmation:
    "Dear {{customer_name}},\n\nYour booking {{booking_id}} for {{vehicle}} has been confirmed.\n\nAmount: ₹{{amount}}\nDate: {{date}}\n\nThank you!",
  payment_receipt:
    "Dear {{customer_name}},\n\nPayment of ₹{{amount}} received for booking {{booking_id}}.\nMode: {{payment_mode}}\nRemaining: ₹{{remaining}}\n\nThank you!",
  invoice:
    "Dear {{customer_name}},\n\nPlease find attached the invoice for booking {{booking_id}}.\n\nVehicle: {{vehicle}}\nTotal: ₹{{amount}}\n\nThank you for your purchase!",
  delivery_notification:
    "Dear {{customer_name}},\n\nYour {{vehicle}} is ready for delivery!\n\nBooking: {{booking_id}}\nPickup Date: {{date}}\n\nCongratulations! 🎉",
};

const defaultSMSTemplates: Record<string, string> = {
  otp: "Your VaahanERP OTP is {{otp}}. Valid for 10 minutes. Do not share.",
  booking: "Booking {{booking_id}} confirmed for {{vehicle}}. Amount: ₹{{amount}}. -VaahanERP",
  payment: "₹{{amount}} received for {{booking_id}}. Balance: ₹{{remaining}}. -VaahanERP",
  delivery: "Your {{vehicle}} is ready! Visit us for delivery. Booking: {{booking_id}}. -VaahanERP",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      paymentGateway: {
        provider: "razorpay",
        keyId: "",
        keySecret: "",
        testMode: true,
        webhookUrl: "https://vaahan-erp.vercel.app/api/webhooks/razorpay",
        connected: false,
      },
      aiAssistant: {
        provider: "openai",
        apiKey: "",
        model: "gpt-4",
        maxTokens: 1024,
        enabledGlobal: false,
        clientOverrides: {},
      },
      whatsapp: {
        provider: "whatsapp_business",
        apiKey: "",
        phoneNumberId: "",
        enabled: false,
        clientOverrides: {},
        templates: defaultWhatsAppTemplates,
      },
      email: {
        provider: "gmail",
        host: "smtp.gmail.com",
        port: "587",
        username: "",
        password: "",
        fromName: "VaahanERP",
        fromEmail: "",
        enabled: false,
        templates: defaultEmailTemplates,
      },
      sms: {
        provider: "msg91",
        apiKey: "",
        senderId: "VAAHAN",
        enabled: false,
        templates: defaultSMSTemplates,
      },
      autoTriggers: defaultAutoTriggers,
      clientFeatures: {},

      setPaymentGateway: (config) =>
        set((s) => ({ paymentGateway: { ...s.paymentGateway, ...config } })),
      setAIAssistant: (config) =>
        set((s) => ({ aiAssistant: { ...s.aiAssistant, ...config } })),
      setWhatsApp: (config) =>
        set((s) => ({ whatsapp: { ...s.whatsapp, ...config } })),
      setEmail: (config) =>
        set((s) => ({ email: { ...s.email, ...config } })),
      setSMS: (config) =>
        set((s) => ({ sms: { ...s.sms, ...config } })),
      setAutoTriggers: (triggers) => set({ autoTriggers: triggers }),
      setClientFeatures: (clientId, config) =>
        set((s) => ({
          clientFeatures: {
            ...s.clientFeatures,
            [clientId]: { ...(s.clientFeatures[clientId] || defaultClientFeatures()), ...config },
          },
        })),
    }),
    { name: "vaahan-settings" }
  )
);

export function defaultClientFeatures(): ClientFeatureConfig {
  return {
    onlinePayment: true,
    aiAssistant: true,
    whatsappAlerts: true,
    emailAlerts: true,
    smsAlerts: false,
    customerTrackingLinks: true,
    invoiceGeneration: true,
    maxUsers: 10,
    maxVehicles: 500,
    maxBookingsPerMonth: 100,
  };
}
