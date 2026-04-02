"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Bug,
  Upload,
  Info,
} from "lucide-react";

const faqs = [
  {
    q: "How to add a new booking?",
    a: 'Go to the sidebar and click "Book Bike" or navigate to Bookings → New Booking. Follow the 6-step booking wizard to enter customer details, vehicle selection, payment info, finance details, documents, and review.',
  },
  {
    q: "How to lock the daybook?",
    a: 'Navigate to CashFlow & Daybook page. At the top, you\'ll see the daybook lock option. Click "Lock Daybook" to prevent further edits for the selected date. Only Owners and Managers can lock/unlock the daybook.',
  },
  {
    q: "How to add stock?",
    a: 'Click "Add Stock" in the sidebar or go to Stock List → Add Vehicle. Fill in the vehicle details including model, variant, color, engine number, chassis number, price, and optionally upload photos.',
  },
  {
    q: "How to create a lead?",
    a: 'Go to Leads CRM from the sidebar. Click the "+ Add Lead" button at the top. Fill in customer name, mobile number, interested model, and source. The lead will be automatically assigned and tracked.',
  },
  {
    q: "How to manage user permissions?",
    a: "Navigate to Users page from the sidebar (Owner/Admin only). Each user has a role (Owner, Manager, Sales Exec, Accountant, Mechanic, Viewer). The role determines which pages and actions they can access.",
  },
  {
    q: "How to generate reports?",
    a: "Go to Reports from the sidebar. Select the report type (Sales, Revenue, Expenses, etc.), choose a date range, and click Generate. Reports can be viewed on-screen or exported to CSV.",
  },
  {
    q: "How to connect a custom domain?",
    a: "Contact Ravi Accounting Services support for custom domain setup. We'll configure DNS settings and SSL certificates for your dealership's branded URL.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [bugDescription, setBugDescription] = React.useState("");
  const [bugPriority, setBugPriority] = React.useState("medium");

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Bug report submitted! Our team will review it shortly.");
    setBugDescription("");
    setBugPriority("medium");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground text-sm">
          Get help, find answers, and contact support
        </p>
      </div>

      {/* Company Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-3xl">V</span>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h2 className="text-xl font-bold">Ravi Accounting Services</h2>
                <p className="text-sm text-muted-foreground">
                  Your trusted partner for dealership management solutions
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Chinhat, Gomti Nagar, Lucknow 226028</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href="mailto:support@vaahanerp.com"
                    className="text-primary hover:underline"
                  >
                    support@vaahanerp.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href="tel:+919554762008" className="text-primary hover:underline">
                    +91 9554762008
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Mon - Sat, 10:00 AM - 7:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Contact Buttons */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <a href="tel:+919554762008" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="font-medium text-sm">Call Now</p>
                <p className="text-xs text-muted-foreground">+91 9554762008</p>
              </div>
            </CardContent>
          </Card>
        </a>
        <a href="mailto:support@vaahanerp.com" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="font-medium text-sm">Email Us</p>
                <p className="text-xs text-muted-foreground">support@vaahanerp.com</p>
              </div>
            </CardContent>
          </Card>
        </a>
        <a
          href="https://wa.me/919554762008"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-emerald-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Chat with support</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-sm">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" /> System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="bg-muted/50 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="font-medium">VaahanERP v1.0</p>
            </div>
            <div className="bg-muted/50 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="font-medium">March 2026</p>
            </div>
            <div className="bg-muted/50 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Platform</p>
              <p className="font-medium">Next.js + Vercel</p>
            </div>
            <div className="bg-muted/50 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">Developer</p>
              <p className="font-medium">Ravi Accounting Services</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report a Bug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" /> Report a Bug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBugSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue you're facing..."
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={bugPriority} onValueChange={setBugPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">Low</Badge>
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-700">High</Badge>
                      </span>
                    </SelectItem>
                    <SelectItem value="critical">
                      <span className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-700">Critical</Badge>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Screenshot (optional)</Label>
                <Button type="button" variant="outline" className="w-full gap-2">
                  <Upload className="h-4 w-4" /> Upload Screenshot
                </Button>
              </div>
            </div>
            <Button type="submit">Submit Bug Report</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
