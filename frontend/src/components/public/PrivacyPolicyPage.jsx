// frontend/src/components/public/PrivacyPolicyPage.jsx
import React from 'react';
import {
  ArrowLeft, CheckCircle2, FileText, Lock, Mail, MapPin, Phone,
  Printer, ShieldCheck, UserCheck
} from 'lucide-react';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import CornerMarks from '../common/CornerMarks';

const EFFECTIVE_DATE = '26 November 2026';

export default function PrivacyPolicyPage({ onBackToSite, onOpenCustomerPortal }) {
  const { salon, tracking, bookingRules, payments } = usePublic();
  const { openBooking } = useBooking();

  const brandName = salon?.salon_name || 'RiTiVerse Salon & Aesthetics';
  const email = salon?.email || salon?.support_email || 'concierge@ritiverse.com';
  const phone = salon?.phone || '+1 (555) 234-5678';
  const address = salon?.address || '452 Boulevard Saint-Honoré, Suite 400, Fashion District';
  const taxId = salon?.tax_id || '';
  const cancelHours = bookingRules?.cancellation_cutoff_hours || 24;
  const rescheduleHours = bookingRules?.rescheduling_cutoff_hours || 12;

  const activeAnalytics = [
    tracking?.ga4?.enabled && 'Google Analytics 4 (GA4)',
    tracking?.clarity?.enabled && 'Microsoft Clarity',
    tracking?.meta_pixel?.enabled && 'Meta Pixel',
  ].filter(Boolean);

  const mailtoPrivacySubject = encodeURIComponent(
    `[${brandName}] DPDP Act Data Request / Grievance`
  );

  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#1A1614] selection:bg-[#B4563E] selection:text-[#FFFDF8]">
      {/* Sticky Top Action Bar */}
      <header className="sticky top-0 z-30 border-b border-[#1A1614]/15 bg-[#F7F1E8]/92 backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[#1A1614] hover:text-[#933E29] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Atelier</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenCustomerPortal && (
              <button
                type="button"
                onClick={() => onOpenCustomerPortal('profile', { authMode: 'login' })}
                className="inline-flex items-center gap-1.5 border border-[#1A1614]/20 bg-[#FFFDF8] hover:border-[#B4563E] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider font-semibold text-[#1A1614]"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#B4563E]" />
                <span className="hidden sm:inline">Manage My Data</span>
                <span className="sm:hidden">My Data</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 bg-[#B4563E] hover:bg-[#933E29] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider font-semibold text-[#FFFDF8] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Legal Notice Banner */}
        <section className="relative border border-[#B4563E]/40 bg-[#FFFDF8] p-6 sm:p-10 shadow-[10px_10px_0px_rgba(180,86,62,0.16)]">
          <CornerMarks all size={14} thickness={2} color="text-[#B4563E]" />

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 border border-[#B4563E]/40 bg-[#F3E7DB]/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#933E29] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DPDP Act, 2023 Compliant Notice</span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#665B54]">
                Effective: {EFFECTIVE_DATE}
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl font-light tracking-tight text-[#1A1614] leading-[1.08]">
              Privacy Policy &amp; Data Protection Notice
            </h1>

            <p className="text-sm sm:text-base text-[#4A403A] leading-relaxed max-w-3xl">
              This Privacy Policy serves as a formal statutory Notice under the{' '}
              <strong className="text-[#1A1614]">Digital Personal Data Protection Act, 2023 (India)</strong>{' '}
              (&ldquo;DPDP Act&rdquo;) issued by <strong className="text-[#1A1614]">{brandName}</strong>{' '}
              (&ldquo;Data Fiduciary&rdquo;). It explains in clear, plain terms what personal data we collect, why we process it, how you may withdraw consent or exercise your statutory rights, and how you can reach our Grievance Officer.
            </p>
          </div>

          {/* Data Fiduciary Summary Strip */}
          <div className="mt-6 pt-6 border-t border-[#1A1614]/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#F7F1E8]/80 border border-[#1A1614]/10 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#933E29] font-semibold block">
                Data Fiduciary
              </span>
              <span className="font-semibold text-[#1A1614] block">{brandName}</span>
              {taxId && <span className="font-mono text-[10px] text-[#665B54] block">ID: {taxId}</span>}
            </div>

            <div className="p-3 bg-[#F7F1E8]/80 border border-[#1A1614]/10 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#933E29] font-semibold block">
                Grievance Officer Desk
              </span>
              <a href={`mailto:${email}`} className="font-semibold text-[#1A1614] hover:text-[#933E29] underline break-all block">
                {email}
              </a>
            </div>

            <div className="p-3 bg-[#F7F1E8]/80 border border-[#1A1614]/10 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#933E29] font-semibold block">
                Telephone Concierge
              </span>
              <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="font-semibold text-[#1A1614] hover:text-[#933E29] block">
                {phone}
              </a>
            </div>

            <div className="p-3 bg-[#F7F1E8]/80 border border-[#1A1614]/10 space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#933E29] font-semibold block">
                Registered Studio
              </span>
              <span className="text-[#1A1614] leading-snug block">{address}</span>
            </div>
          </div>
        </section>

        {/* Section 1 & 2: Itemized Notice (Section 5, DPDP Act) */}
        <section className="border border-[#1A1614]/15 bg-[#FFFDF8] p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#1A1614]/10 pb-3">
            <FileText className="w-4 h-4 text-[#B4563E]" />
            <h2 className="font-editorial text-2xl sm:text-3xl font-light text-[#1A1614]">
              1. Personal Data Collected &amp; Specific Purposes (Section 5 Notice)
            </h2>
          </div>

          <p className="text-sm text-[#4A403A] leading-relaxed">
            In accordance with Section 5 of the DPDP Act, we collect and process only personal data that is strictly necessary for delivering our salon, hair, bridal, dermal skincare, and spa reservation services:
          </p>

          <div className="overflow-x-auto border border-[#1A1614]/15">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-[#F7F1E8] font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#665B54] border-b border-[#1A1614]/15">
                <tr>
                  <th className="px-4 py-3">Data Category</th>
                  <th className="px-4 py-3">Specific Data Elements</th>
                  <th className="px-4 py-3">Lawful Purpose of Processing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1614]/10 text-[#4A403A]">
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-[#1A1614] whitespace-nowrap">
                    Guest Contact Details
                  </td>
                  <td className="px-4 py-3.5">
                    Full Name, Email Address, Phone / WhatsApp Number
                  </td>
                  <td className="px-4 py-3.5">
                    Scheduling reservations, confirming slots, coordinating rescheduling ({rescheduleHours}h cutoff) or cancellations ({cancelHours}h cutoff), and responding to studio inquiries.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-[#1A1614] whitespace-nowrap">
                    Service &amp; Ritual Preferences
                  </td>
                  <td className="px-4 py-3.5">
                    Selected services/packages, preferred artist, appointment date/time, special notes, promo code, payment mode ({payments?.currency || 'INR'}), and booking reference
                  </td>
                  <td className="px-4 py-3.5">
                    Delivering tailored treatments, preparing studio resources, issuing digital vouchers, and GST/invoice compliance.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-[#1A1614] whitespace-nowrap">
                    Client Portal Account (Optional)
                  </td>
                  <td className="px-4 py-3.5">
                    Registered email, bcrypt-hashed password (never stored in plain text), account status, and visit history
                  </td>
                  <td className="px-4 py-3.5">
                    Enabling self-service access to upcoming/past bookings, rebooking, cancellation, and profile updates at <span className="font-mono text-xs text-[#1A1614]">/account</span>.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-[#1A1614] whitespace-nowrap">
                    Session &amp; Security Telemetry
                  </td>
                  <td className="px-4 py-3.5">
                    Browser session JWT token (`localStorage`), server audit logs (action timestamps &amp; IP for administrative actions)
                  </td>
                  <td className="px-4 py-3.5">
                    Authenticating sessions securely, preventing unauthorized portal access, and maintaining accountability logs.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-semibold text-[#1A1614] whitespace-nowrap">
                    Website Analytics (Conditional)
                  </td>
                  <td className="px-4 py-3.5">
                    {activeAnalytics.length > 0
                      ? `Currently enabled tools: ${activeAnalytics.join(', ')}`
                      : 'Optional third-party analytics & pixels are currently DISABLED by studio settings.'}
                  </td>
                  <td className="px-4 py-3.5">
                    Measuring page visits and booking funnel performance only when explicitly enabled by the studio administrator.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Consent & Withdrawal */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#1A1614]/15 bg-[#FFFDF8] p-6 sm:p-7 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#933E29] font-semibold block">
              Sections 4, 6 &amp; 7 · DPDP Act
            </span>
            <h2 className="font-editorial text-2xl font-light text-[#1A1614]">
              2. Consent, Certain Legitimate Uses &amp; Withdrawal
            </h2>
            <p className="text-sm text-[#4A403A] leading-relaxed">
              We process digital personal data strictly on the basis of your{' '}
              <strong className="text-[#1A1614]">free, specific, informed, unconditional, and unambiguous consent</strong>{' '}
              when you submit a booking request, create a Client Portal account, or message our concierge, or for statutory legitimate uses permitted under Section 7 (such as tax invoicing and compliance with Indian law).
            </p>
            <p className="text-sm text-[#4A403A] leading-relaxed">
              <strong className="text-[#1A1614]">Right to Withdraw Consent (Section 6(4)):</strong> You may withdraw your consent at any time with prospective effect by emailing{' '}
              <a href={`mailto:${email}?subject=${mailtoPrivacySubject}`} className="text-[#933E29] underline">
                {email}
              </a>. Upon withdrawal, we cease processing your data for non-statutory purposes; please note active unfulfilled reservations may require alternative offline coordination.
            </p>
          </div>

          <div className="border border-[#1A1614]/15 bg-[#FFFDF8] p-6 sm:p-7 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#933E29] font-semibold block">
              Section 9 · Child Safety
            </span>
            <h2 className="font-editorial text-2xl font-light text-[#1A1614]">
              3. Protection of Children&rsquo;s Personal Data
            </h2>
            <p className="text-sm text-[#4A403A] leading-relaxed">
              Our online booking portal and Client Accounts are intended for adults aged{' '}
              <strong className="text-[#1A1614]">18 years and older</strong>. In compliance with Section 9 of the DPDP Act, we do not knowingly collect or process personal data of any child under 18 without verifiable consent from a parent or lawful guardian.
            </p>
            <p className="text-sm text-[#4A403A] leading-relaxed">
              We strictly prohibit tracking, behavioral monitoring, or targeted advertising directed at children. Any minor&rsquo;s salon appointment must be booked and supervised by a parent or lawful guardian, who may request immediate removal of any minor&rsquo;s record anytime.
            </p>
          </div>
        </section>

        {/* Section 4: Rights of Data Principals (Sections 11-14) */}
        <section className="border border-[#1A1614]/15 bg-[#FFFDF8] p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#1A1614]/10 pb-3">
            <UserCheck className="w-4 h-4 text-[#B4563E]" />
            <h2 className="font-editorial text-2xl sm:text-3xl font-light text-[#1A1614]">
              4. Your Statutory Rights as a Data Principal (Sections 11–14)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F7F1E8]/60 border border-[#1A1614]/10 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-sm text-[#1A1614]">
                <CheckCircle2 className="w-4 h-4 text-[#B4563E] shrink-0" />
                <span>Right to Access Information (Section 11)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A403A] leading-relaxed">
                Obtain a clear summary of the personal data we process, the purposes served, and any categories of authorized service providers involved. Registered clients can view their stored profile and booking history directly in the Client Portal.
              </p>
            </div>

            <div className="p-4 bg-[#F7F1E8]/60 border border-[#1A1614]/10 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-sm text-[#1A1614]">
                <CheckCircle2 className="w-4 h-4 text-[#B4563E] shrink-0" />
                <span>Right to Correction &amp; Erasure (Section 12)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A403A] leading-relaxed">
                Request correction, completion, updating, or deletion of your personal data. We erase personal data upon request or once booking/service purposes end, except where retention is mandated by tax or legal laws.
              </p>
            </div>

            <div className="p-4 bg-[#F7F1E8]/60 border border-[#1A1614]/10 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-sm text-[#1A1614]">
                <CheckCircle2 className="w-4 h-4 text-[#B4563E] shrink-0" />
                <span>Right of Grievance Redressal (Section 13)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A403A] leading-relaxed">
                Access a readily available grievance resolution channel via our designated Grievance Officer below before filing any complaint with the Data Protection Board of India (DPB).
              </p>
            </div>

            <div className="p-4 bg-[#F7F1E8]/60 border border-[#1A1614]/10 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-sm text-[#1A1614]">
                <CheckCircle2 className="w-4 h-4 text-[#B4563E] shrink-0" />
                <span>Right to Nominate (Section 14)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A403A] leading-relaxed">
                Nominate another individual to exercise your DPDP Act rights on your behalf in the event of death or physical/mental incapacity by notifying our Grievance Officer in writing.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Security Safeguards, Retention & Third-Party Links */}
        <section className="border border-[#1A1614]/15 bg-[#FFFDF8] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#1A1614]/10 pb-3">
            <Lock className="w-4 h-4 text-[#B4563E]" />
            <h2 className="font-editorial text-2xl sm:text-3xl font-light text-[#1A1614]">
              5. Security Safeguards, Data Retention &amp; Third Parties (Sections 8 &amp; 15)
            </h2>
          </div>

          <div className="space-y-3 text-sm text-[#4A403A] leading-relaxed">
            <p>
              <strong className="text-[#1A1614]">Reasonable Security Safeguards (Section 8(5)):</strong> We protect your personal data using encrypted HTTPS transport, salted <span className="font-mono text-xs">bcrypt</span> password hashing, signed JWT authentication, HTTP security headers, and strict Role-Based Access Control (restricting staff access strictly according to operational role). We do <strong className="text-[#1A1614]">not</strong> sell, rent, or trade your personal data to brokers or unrelated marketers.
            </p>
            <p>
              <strong className="text-[#1A1614]">Data Breach Intimation (Section 8(6)):</strong> In the unlikely event of a personal data breach affecting your information, we will notify the Data Protection Board of India and affected guests in the manner and timeline prescribed under the DPDP Act.
            </p>
            <p>
              <strong className="text-[#1A1614]">Retention Period (Section 8(7)):</strong> Personal data is retained only as long as your guest relationship remains active or as required by applicable Indian accounting/GST statutes, after which records are permanently deleted or anonymized.
            </p>
            <p>
              <strong className="text-[#1A1614]">External Services &amp; Data Principal Duties (Section 15):</strong> When you voluntarily tap outbound links (such as WhatsApp Concierge chat, Google Maps directions, Instagram/Facebook/Pinterest, or selected online payment gateways), those external platforms process data under their own privacy policies. Under Section 15, guests agree to provide accurate, non-impersonating booking details and refrain from false or frivolous privacy complaints.
            </p>
          </div>
        </section>

        {/* Section 6: Grievance Redressal Desk */}
        <section className="relative border border-[#B4563E]/45 bg-gradient-to-br from-[#2A221D] via-[#1F1915] to-[#15110E] text-[#F7F1E8] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6A984]/20 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D6A984] font-semibold block">
                Section 13 · Grievance Redressal Officer
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-light text-[#FFFDF8] mt-1">
                6. Exercise Your Rights or Submit a Grievance
              </h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider border border-[#D6A984]/40 px-3 py-1 text-[#D6A984] self-start sm:self-auto">
              Target Response: Prompt Statutory Review
            </span>
          </div>

          <p className="text-sm text-[#F7F1E8]/85 leading-relaxed">
            For data access, correction, consent withdrawal, nomination, or erasure requests under the DPDP Act, 2023, contact our designated Grievance Officer Desk:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <a
              href={`mailto:${email}?subject=${mailtoPrivacySubject}`}
              className="p-4 border border-[#D6A984]/30 bg-[#FFFDF8]/[0.05] hover:bg-[#FFFDF8]/[0.1] transition-colors flex items-start gap-3"
            >
              <Mail className="w-4 h-4 text-[#D6A984] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D6A984] block">
                  Email Grievance Officer
                </span>
                <span className="font-semibold text-[#FFFDF8] break-all">{email}</span>
              </div>
            </a>

            <a
              href={`tel:${phone.replace(/[^+\d]/g, '')}`}
              className="p-4 border border-[#D6A984]/30 bg-[#FFFDF8]/[0.05] hover:bg-[#FFFDF8]/[0.1] transition-colors flex items-start gap-3"
            >
              <Phone className="w-4 h-4 text-[#D6A984] shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D6A984] block">
                  Studio Helpline
                </span>
                <span className="font-semibold text-[#FFFDF8]">{phone}</span>
              </div>
            </a>

            <div className="p-4 border border-[#D6A984]/30 bg-[#FFFDF8]/[0.05] flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#D6A984] shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D6A984] block">
                  Postal Address
                </span>
                <span className="text-[#F7F1E8]/90 leading-snug block">{address}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3 print:hidden">
            <a
              href={`mailto:${email}?subject=${mailtoPrivacySubject}`}
              className="px-6 py-2.5 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-xs uppercase tracking-wider font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send DPDP Data Request</span>
            </a>
            <button
              type="button"
              onClick={() => openBooking()}
              className="px-5 py-2.5 rounded-full border border-[#D6A984]/45 text-[#FFFDF8] hover:border-[#FFFDF8] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
