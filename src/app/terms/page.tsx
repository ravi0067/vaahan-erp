"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, Mail, MapPin } from "lucide-react";

export default function TermsOfServicePage() {
  const lastUpdated = "2 April 2026";
  const companyName = "VaahanERP";
  const website = "www.vaahanerp.com";
  const email = "support@vaahanerp.com";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">Terms of Service</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-10 space-y-8">

          <div className="border-b pb-6">
            <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
            <p className="mt-2 text-gray-700">
              Welcome to <strong>{companyName}</strong>. These Terms of Service (&quot;Terms&quot;) govern your use of our 
              dealership management platform at <strong>{website}</strong>, including all related services, APIs, 
              WhatsApp Business messaging, Vaani AI Assistant, and mobile applications. By accessing or using 
              our services, you agree to be bound by these Terms.
            </p>
          </div>

          <Section title="1. Definitions">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>&quot;Platform&quot;</strong> — The VaahanERP web application, APIs, and all related services</li>
              <li><strong>&quot;User&quot;</strong> — Any individual or business entity that registers for and uses the Platform</li>
              <li><strong>&quot;Dealership&quot;</strong> — A registered business account (tenant) on the Platform</li>
              <li><strong>&quot;Customer Data&quot;</strong> — Data entered by Users about their customers, vehicles, bookings, etc.</li>
              <li><strong>&quot;Subscription&quot;</strong> — A paid plan (Basic, Pro, or Enterprise) for accessing premium features</li>
            </ul>
          </Section>

          <Section title="2. Account Registration">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>You must be at least 18 years old and authorized to represent your business</li>
              <li>You must provide accurate, complete, and current registration information</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>One dealership account per business entity; multiple users allowed per plan</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
            </ul>
          </Section>

          <Section title="3. Subscription Plans & Billing">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Free Tier:</strong> Limited features available at no cost</li>
              <li><strong>Basic Plan:</strong> ₹4,999/month — Core ERP features, up to 2 users</li>
              <li><strong>Pro Plan:</strong> ₹9,999/month — Full AI + WhatsApp + Calling, up to 10 users</li>
              <li><strong>Enterprise Plan:</strong> ₹14,999/month — Unlimited features including Vaani AI Avatar</li>
              <li>Annual billing available at discounted rates</li>
              <li>Payments processed securely via Razorpay and/or PayPal</li>
              <li>All prices are in Indian Rupees (₹) and exclusive of applicable GST (18%)</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
              <li>Refund requests must be submitted within 7 days of billing</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p className="text-gray-700 mb-3">You agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Send spam, unsolicited messages, or bulk messages via WhatsApp/SMS integration</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to access other users&apos; accounts or data</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code</li>
              <li>Resell, sublicense, or redistribute the Platform without written permission</li>
              <li>Overload our servers or interfere with other users&apos; access</li>
              <li>Use AI features (Vaani AI) for generating harmful, misleading, or illegal content</li>
              <li>Store or transmit customer data that violates applicable data protection laws</li>
            </ul>
          </Section>

          <Section title="5. Data Ownership & Responsibility">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Your Data:</strong> You retain ownership of all Customer Data you enter into the Platform</li>
              <li><strong>Our Platform:</strong> We retain all rights to the Platform, its design, code, and AI models</li>
              <li><strong>Data Processing:</strong> We process your data solely to provide the services you requested</li>
              <li><strong>Data Backup:</strong> While we maintain reasonable backups, you are responsible for maintaining your own copies of critical data</li>
              <li><strong>Compliance:</strong> You are responsible for ensuring your use of the Platform complies with applicable laws (including Indian IT Act, Consumer Protection Act, and Motor Vehicles Act)</li>
            </ul>
          </Section>

          <Section title="6. WhatsApp Business Messaging">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>WhatsApp messaging is available on Pro and Enterprise plans</li>
              <li>You must comply with WhatsApp Business Policy and Meta&apos;s Commerce Policy</li>
              <li>Messages must be transactional or customer-initiated; no unsolicited marketing</li>
              <li>You must obtain customer consent before sending WhatsApp messages</li>
              <li>Message delivery depends on WhatsApp/Meta infrastructure; we do not guarantee delivery</li>
              <li>WhatsApp template messages must be approved by Meta before use</li>
            </ul>
          </Section>

          <Section title="7. AI Services (Vaani AI)">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Vaani AI is an AI-powered assistant; responses are generated and may not always be accurate</li>
              <li>AI-generated vehicle pricing, EMI calculations, and comparisons are approximate</li>
              <li>You are responsible for verifying AI-generated information before acting on it</li>
              <li>Voice data is processed in real-time and not permanently stored</li>
              <li>AI features may be updated, modified, or discontinued with reasonable notice</li>
              <li>We are not liable for business decisions made based on AI recommendations</li>
            </ul>
          </Section>

          <Section title="8. Service Availability">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>We strive for 99.9% uptime but do not guarantee uninterrupted service</li>
              <li>Scheduled maintenance will be communicated in advance when possible</li>
              <li>We are not liable for downtime caused by third-party services (Supabase, Vercel, Exotel, etc.)</li>
              <li>Force majeure events (natural disasters, government actions, etc.) are excluded from liability</li>
            </ul>
          </Section>

          <Section title="9. Limitation of Liability">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>The Platform is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;</li>
              <li>Our total liability shall not exceed the amount paid by you in the last 3 months</li>
              <li>We are not liable for indirect, incidental, special, or consequential damages</li>
              <li>We are not responsible for loss of data, revenue, or business opportunities</li>
              <li>Third-party integrations (payment gateways, WhatsApp, etc.) are governed by their own terms</li>
            </ul>
          </Section>

          <Section title="10. Termination">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>You may cancel your subscription at any time from the Settings page</li>
              <li>Upon cancellation, your data will be retained for 90 days, then permanently deleted</li>
              <li>We may suspend or terminate your account for violation of these Terms</li>
              <li>Upon termination, you may request a data export within 30 days</li>
            </ul>
          </Section>

          <Section title="11. Intellectual Property">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>VaahanERP name, logo, and branding are our trademarks</li>
              <li>Vaani AI character, design, and voice are our intellectual property</li>
              <li>You may not use our branding without written permission</li>
              <li>Open-source components used in the Platform retain their respective licenses</li>
            </ul>
          </Section>

          <Section title="12. Governing Law & Disputes">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>These Terms are governed by the laws of India</li>
              <li>Any disputes shall be subject to the exclusive jurisdiction of courts in Lucknow, Uttar Pradesh</li>
              <li>We encourage resolving disputes through mutual discussion before legal action</li>
              <li>For complaints: email {email} — we will respond within 15 business days</li>
            </ul>
          </Section>

          <Section title="13. Changes to Terms">
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. Changes will be posted on this page with 
              an updated date. Continued use of the Platform after changes constitutes acceptance. For material 
              changes, we will notify you via email at least 15 days in advance.
            </p>
          </Section>

          <Section title="14. Contact">
            <div className="bg-purple-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700"><strong>Email:</strong> {email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700"><strong>Address:</strong> Lucknow, Uttar Pradesh, India</span>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-4 justify-center mt-8 text-sm text-gray-500">
          <Link href="/privacy-policy" className="hover:text-purple-600 underline">Privacy Policy</Link>
          <Link href="/data-deletion" className="hover:text-purple-600 underline">Data Deletion</Link>
          <Link href="/" className="hover:text-purple-600 underline">Home</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}
