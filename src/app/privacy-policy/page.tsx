"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "2 April 2026";
  const companyName = "VaahanERP";
  const website = "www.vaahanerp.com";
  const email = "support@vaahanerp.com";
  const address = "Lucknow, Uttar Pradesh, India";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-10 space-y-8">
          
          <div className="border-b pb-6">
            <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
            <p className="mt-2 text-gray-700">
              This Privacy Policy describes how <strong>{companyName}</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) 
              collects, uses, and protects your personal information when you use our dealership management platform 
              at <strong>{website}</strong> and related services including WhatsApp Business messaging, Vaani AI Assistant, 
              and mobile applications.
            </p>
          </div>

          <Section title="1. Information We Collect">
            <SubSection title="1.1 Personal Information">
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Name, email address, phone number</li>
                <li>Business/dealership name and address</li>
                <li>GST number and business registration details</li>
                <li>Login credentials (encrypted)</li>
              </ul>
            </SubSection>
            <SubSection title="1.2 Customer Data (Managed by Dealerships)">
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Customer names, phone numbers, and addresses</li>
                <li>Vehicle purchase and service history</li>
                <li>Lead and inquiry information</li>
                <li>Booking and payment records</li>
              </ul>
            </SubSection>
            <SubSection title="1.3 Automatically Collected Information">
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Device information (browser type, OS, screen resolution)</li>
                <li>IP address and approximate location</li>
                <li>Usage analytics (pages visited, features used)</li>
                <li>Cookies and session data</li>
              </ul>
            </SubSection>
            <SubSection title="1.4 WhatsApp & Communication Data">
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>WhatsApp phone numbers for business messaging</li>
                <li>Message templates and delivery status</li>
                <li>Communication logs between dealership and customers</li>
              </ul>
            </SubSection>
            <SubSection title="1.5 Vaani AI Avatar Data">
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Voice interactions (processed in real-time, not permanently stored)</li>
                <li>Visitor queries and conversation history</li>
                <li>Camera captures (only when explicitly enabled by showroom staff)</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Service Delivery:</strong> To provide and maintain our dealership management platform</li>
              <li><strong>Communication:</strong> To send transactional messages via WhatsApp, SMS, and email (bookings, service reminders, payment confirmations)</li>
              <li><strong>AI Services:</strong> To power Vaani AI assistant for customer interaction in showrooms</li>
              <li><strong>Analytics:</strong> To generate business insights and reports for dealership owners</li>
              <li><strong>Improvement:</strong> To improve our platform features and user experience</li>
              <li><strong>Security:</strong> To detect and prevent fraud or unauthorized access</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable Indian laws and regulations</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing & Third Parties">
            <p className="text-gray-700 mb-3">We do NOT sell your personal data. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Cloud Infrastructure:</strong> Supabase (database), Vercel (hosting) — for platform operation</li>
              <li><strong>AI Services:</strong> Google Gemini API — for AI-powered features (data processed, not stored)</li>
              <li><strong>Voice Services:</strong> ElevenLabs — for text-to-speech in Vaani AI (text only, no personal data)</li>
              <li><strong>Communication:</strong> Exotel, MSG91 — for WhatsApp, calling, and SMS services</li>
              <li><strong>Payments:</strong> Razorpay, PayPal — for subscription billing (PCI-DSS compliant)</li>
              <li><strong>Legal Requirements:</strong> Government authorities when required by Indian law</li>
            </ul>
          </Section>

          <Section title="4. Data Security">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>All data encrypted in transit (TLS/SSL) and at rest</li>
              <li>Row-Level Security (RLS) ensures multi-tenant data isolation</li>
              <li>Passwords hashed using industry-standard bcrypt</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access restricted to authorized personnel only</li>
              <li>Compliant with IT Act, 2000 and IT Rules, 2011 (India)</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Account Data:</strong> Retained while your account is active + 90 days after deletion request</li>
              <li><strong>Customer Records:</strong> Retained as per dealership&apos;s requirements and Indian tax law (minimum 8 years for financial records)</li>
              <li><strong>Communication Logs:</strong> Retained for 12 months for service quality</li>
              <li><strong>AI Conversation Data:</strong> Session data retained for 30 days, then anonymized</li>
              <li><strong>Analytics Data:</strong> Aggregated anonymized data may be retained indefinitely</li>
            </ul>
          </Section>

          <Section title="6. Your Rights">
            <p className="text-gray-700 mb-3">Under Indian data protection laws, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (see our <Link href="/data-deletion" className="text-purple-600 underline">Data Deletion page</Link>)</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
              <li><strong>Withdraw Consent:</strong> Opt out of marketing communications at any time</li>
              <li><strong>Complaint:</strong> Lodge a complaint with the appropriate data protection authority</li>
            </ul>
          </Section>

          <Section title="7. Cookies">
            <p className="text-gray-700">
              We use essential cookies for authentication and session management. Analytics cookies are used 
              to understand platform usage. You can control cookie preferences through your browser settings. 
              Disabling essential cookies may affect platform functionality.
            </p>
          </Section>

          <Section title="8. Children&apos;s Privacy">
            <p className="text-gray-700">
              Our services are intended for business use by individuals aged 18 and above. We do not knowingly 
              collect personal information from children under 18. If you believe we have collected such data, 
              please contact us immediately.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an 
              updated &quot;Last Updated&quot; date. Continued use of our services after changes constitutes acceptance 
              of the updated policy. For significant changes, we will notify you via email or in-app notification.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p className="text-gray-700 mb-4">
              For any privacy-related questions, concerns, or data requests, please contact us:
            </p>
            <div className="bg-purple-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700"><strong>Email:</strong> {email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700"><strong>Address:</strong> {address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700"><strong>Website:</strong> {website}</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              <strong>Grievance Officer:</strong> Ravi Verma — {email}<br />
              We will respond to your request within 30 days as per Indian IT Rules.
            </p>
          </Section>

        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap gap-4 justify-center mt-8 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-purple-600 underline">Terms of Service</Link>
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

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
      {children}
    </div>
  );
}
