"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Mail, MessageSquare, Send, CheckCircle2, XCircle } from "lucide-react";
import { useSettingsStore } from "@/store/settings-store";

interface AlertRecipient {
  name: string;
  mobile?: string;
  email?: string;
}

interface AlertContext {
  bookingId?: string;
  vehicle?: string;
  amount?: number;
  remaining?: number;
}

interface SendAlertDialogProps {
  open: boolean;
  onClose: () => void;
  recipient: AlertRecipient;
  context?: AlertContext;
}

type SendStatus = "idle" | "sending" | "sent" | "failed";

function fillTemplate(template: string, recipient: AlertRecipient, context?: AlertContext): string {
  let result = template;
  result = result.replace(/\{\{customer_name\}\}/g, recipient.name);
  result = result.replace(/\{\{booking_id\}\}/g, context?.bookingId || "N/A");
  result = result.replace(/\{\{vehicle\}\}/g, context?.vehicle || "N/A");
  result = result.replace(/\{\{amount\}\}/g, context?.amount?.toLocaleString("en-IN") || "0");
  result = result.replace(/\{\{remaining\}\}/g, context?.remaining?.toLocaleString("en-IN") || "0");
  result = result.replace(/\{\{rto_status\}\}/g, "In Progress");
  result = result.replace(/\{\{date\}\}/g, new Date().toLocaleDateString("en-IN"));
  result = result.replace(/\{\{payment_mode\}\}/g, "Online");
  result = result.replace(/\{\{otp\}\}/g, "XXXXXX");
  return result;
}

export function SendAlertDialog({ open, onClose, recipient, context }: SendAlertDialogProps) {
  const { whatsapp, email, sms } = useSettingsStore();
  const [channel, setChannel] = React.useState("whatsapp");
  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [messagePreview, setMessagePreview] = React.useState("");
  const [sendStatus, setSendStatus] = React.useState<SendStatus>("idle");

  const getTemplates = () => {
    switch (channel) {
      case "whatsapp": return whatsapp.templates;
      case "email": return email.templates;
      case "sms": return sms.templates;
      default: return {};
    }
  };

  const templateLabels: Record<string, string> = {
    booking_confirmation: "Booking Confirmation",
    payment_receipt: "Payment Receipt",
    delivery_ready: "Delivery Ready",
    followup_reminder: "Follow-up Reminder",
    rto_update: "RTO Update",
    welcome: "Welcome",
    invoice: "Invoice",
    delivery_notification: "Delivery Notification",
    otp: "OTP",
    booking: "Booking",
    payment: "Payment",
    delivery: "Delivery",
  };

  React.useEffect(() => {
    if (selectedTemplate) {
      const templates = getTemplates();
      const template = templates[selectedTemplate] || "";
      setMessagePreview(fillTemplate(template, recipient, context));
    } else {
      setMessagePreview("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, channel]);

  const handleSend = () => {
    setSendStatus("sending");
    setTimeout(() => {
      const success = Math.random() > 0.1;
      setSendStatus(success ? "sent" : "failed");
    }, 1500);
  };

  const handleClose = () => {
    setSendStatus("idle");
    setSelectedTemplate("");
    setMessagePreview("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Alert to {recipient.name}
          </DialogTitle>
        </DialogHeader>

        {sendStatus === "sent" ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-700">Alert Sent ✅</h3>
            <p className="text-sm text-muted-foreground">
              {channel === "whatsapp" ? "WhatsApp" : channel === "email" ? "Email" : "SMS"} sent to {recipient.name}
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : sendStatus === "failed" ? (
          <div className="text-center py-6 space-y-3">
            <XCircle className="h-14 w-14 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-700">Send Failed ❌</h3>
            <p className="text-sm text-muted-foreground">Could not send alert. Please check configuration.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => setSendStatus("idle")}>Retry</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={channel} onValueChange={setChannel}>
              <TabsList className="w-full">
                <TabsTrigger value="whatsapp" className="flex-1 gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </TabsTrigger>
                <TabsTrigger value="email" className="flex-1 gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex-1 gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> SMS
                </TabsTrigger>
              </TabsList>

              {["whatsapp", "email", "sms"].map((ch) => (
                <TabsContent key={ch} value={ch} className="space-y-4">
                  {/* Recipient */}
                  <div className="grid gap-2">
                    <Label>{ch === "email" ? "Email" : "Mobile"}</Label>
                    <Input
                      readOnly
                      value={ch === "email" ? (recipient.email || "N/A") : (recipient.mobile || "N/A")}
                      className="bg-muted"
                    />
                  </div>

                  {/* Template Select */}
                  <div className="grid gap-2">
                    <Label>Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(getTemplates()).map((key) => (
                          <SelectItem key={key} value={key}>
                            {templateLabels[key] || key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview */}
                  {messagePreview && (
                    <div className="grid gap-2">
                      <Label>Preview</Label>
                      <Textarea
                        value={messagePreview}
                        onChange={(e) => setMessagePreview(e.target.value)}
                        rows={4}
                        className="text-sm"
                      />
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <Button
              className="w-full"
              onClick={handleSend}
              disabled={sendStatus === "sending" || !messagePreview}
            >
              {sendStatus === "sending" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send {channel === "whatsapp" ? "WhatsApp" : channel === "email" ? "Email" : "SMS"}
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
