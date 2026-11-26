import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import { NivoraButton } from './NivoraPrimitives';
import { buildCardUrl, buildPrivacyUrl } from '../../utils/adminRouter';
import { buildGoogleMapsUrl, buildWhatsAppUrl, normalizeExternalUrl } from '../../utils/salonLinks';

const MENU_ITEMS = [
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Lookbook', href: '#lookbook' },
  { label: 'Services', href: '#services' },
  { label: 'Studio Ritual', href: '#how-it-works' },
  { label: 'Packages', href: '#packages' },
  { label: 'Creative Minds', href: '#team' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

const TAPER_LINES = [8, 6, 4, 2, 2, 1, 1, 1];
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ onOpenCustomerPortal, onOpenCard, onOpenPrivacy }) {
  const { salon, booking_rules } = usePublic();
  const { openBooking } = useBooking();
  const footerRef = useRef(null);
  const [legalModal, setLegalModal] = useState(null);
  const whatsappUrl = buildWhatsAppUrl(
    salon,
    `Hello ${salon?.salon_name || 'RiTiVerse Salon'}, I would like to connect with the salon concierge.`
  );
  const instagramUrl = normalizeExternalUrl(salon?.social_instagram || salon?.instagram_url);
  const facebookUrl = normalizeExternalUrl(salon?.social_facebook || salon?.facebook_url);
  const pinterestUrl = normalizeExternalUrl(salon?.social_pinterest || salon?.pinterest_url);
  const mapsUrl = buildGoogleMapsUrl(salon);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'end end'],
  });
  const radius = useTransform(scrollYProgress, [0, 1], ['72px', '320px']);

  const brandName = (salon?.salon_name || 'RiTiVerse').toUpperCase();
  const phone = salon?.phone || '+1 (555) 234-5678';
  const email = salon?.email || salon?.support_email || 'concierge@ritiverse.com';
  const address =
    salon?.address || '452 Boulevard Saint-Honoré, Suite 400, Fashion District';

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative w-full border-t border-[#1A1614]/15 bg-[#F7F1E8] overflow-hidden"
    >
      {/* Expanding Rounded-Bottom Velvet Obsidian Luxury Sheet */}
      <motion.div
        style={{
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
        }}
        className="relative z-10 w-full bg-gradient-to-b from-[#2A221D] via-[#1F1915] to-[#15110E] px-4 sm:px-10 lg:px-14 pt-12 pb-12 md:pt-20 md:pb-20 text-[#F7F1E8] shadow-[0_24px_60px_-20px_rgba(26,22,20,0.45)]"
      >
        <div className="mx-auto max-w-[1520px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10">
            <div className="lg:col-span-5 flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2.5 border border-[#2FA66A]/55 bg-[#FFFDF8]/10 px-3.5 py-1.5 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-[#2FA66A]" />
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#F7F1E8]">
                    {salon?.hours_summary || 'Open Daily · 09:00 AM – 08:00 PM'}
                  </span>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#D6A984]">
                    Telephone
                  </p>
                  <a
                    href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                    className="mt-1 inline-block font-sans text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#FFFDF8] hover:text-[#D6A984] transition-colors"
                  >
                    {phone}
                  </a>
                </div>

                <div className="max-w-[340px]">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#D6A984]">
                    RiTiVerse Atelier
                  </p>
                  <p className="mt-1.5 font-sans text-sm md:text-base font-medium leading-relaxed text-[#F7F1E8]/85">
                    {address}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <NivoraButton
                  variant="primary"
                  size="md"
                  onClick={() => openBooking()}
                >
                  Book Your Visit ↗
                </NivoraButton>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-[#25D366]/65 bg-[#25D366]/15 hover:bg-[#25D366] text-[#F7F1E8] hover:text-[#1A1614] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] transition-colors"
                  >
                    <span>WhatsApp Direct ↗</span>
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 min-[440px]:grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#D6A984]">
                  Directory
                </h3>
                <ul className="mt-5 space-y-2.5">
                  {MENU_ITEMS.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollTo(item.href);
                        }}
                        className="font-sans text-sm font-medium uppercase tracking-[0.04em] text-[#F7F1E8] hover:text-[#D6A984] hover:underline underline-offset-4 transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#D6A984]">
                  Concierge
                </h3>
                <ul className="mt-5 space-y-2.5 text-sm font-medium">
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="font-sans text-[#F7F1E8] hover:text-[#D6A984] hover:underline underline-offset-4 break-all"
                    >
                      {email}
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openBooking()}
                      className="font-sans uppercase tracking-[0.04em] text-[#F7F1E8] hover:text-[#D6A984] hover:underline underline-offset-4"
                    >
                      Online Reservation
                    </button>
                  </li>
                  {onOpenCustomerPortal && (
                    <li className="pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenCustomerPortal('upcoming', { authMode: 'login' })}
                        className="border border-[#D6A984]/45 bg-[#FFFDF8]/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-[#FFFDF8] transition-colors hover:border-[#B4563E] hover:bg-[#B4563E]"
                      >
                        My Bookings / Sign In ↗
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#D6A984]">
                  Connect
                </h3>
                <ul className="mt-5 space-y-2.5">
                  {whatsappUrl && (
                    <li>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-sm font-medium uppercase tracking-[0.04em] text-[#25D366] hover:text-[#FFFDF8] hover:underline underline-offset-4"
                      >
                        WhatsApp Chat ↗
                      </a>
                    </li>
                  )}
                  <li>
                    <a
                      href={buildCardUrl()}
                      onClick={(e) => {
                        if (onOpenCard) {
                          e.preventDefault();
                          onOpenCard();
                        }
                      }}
                      className="font-sans text-sm font-medium uppercase tracking-[0.04em] text-[#D6A984] hover:text-[#FFFDF8] hover:underline underline-offset-4"
                    >
                      Digital Visiting Card &amp; QR ↗
                    </a>
                  </li>
                  {instagramUrl && (
                    <li>
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-sm font-medium uppercase tracking-[0.04em] text-[#F7F1E8] hover:text-[#D6A984] hover:underline underline-offset-4"
                      >
                        Instagram ↗
                      </a>
                    </li>
                  )}
                  {facebookUrl && (
                    <li>
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-sm font-medium uppercase tracking-[0.04em] text-[#F7F1E8] hover:text-[#D6A984] hover:underline underline-offset-4"
                      >
                        Facebook ↗
                      </a>
                    </li>
                  )}
                  {pinterestUrl && (
                    <li>
                      <a
                        href={pinterestUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-sm font-medium uppercase tracking-[0.04em] text-[#F7F1E8] hover:text-[#D6A984] hover:underline underline-offset-4"
                      >
                        Pinterest ↗
                      </a>
                    </li>
                  )}
                  <li>
                    <a
                      href={mapsUrl || '#hero'}
                      target={mapsUrl ? '_blank' : undefined}
                      rel="noreferrer"
                      className="font-sans text-sm font-medium uppercase tracking-[0.04em] text-[#F7F1E8] hover:text-[#D6A984] hover:underline underline-offset-4"
                    >
                      Studio Directions ↗
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#F7F1E8]/15 pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-[#F7F1E8]/75 text-center sm:text-left">
            <span>© {CURRENT_YEAR} {brandName}. All Rights Reserved.</span>
            <div className="flex items-center gap-6">
              <a
                href={buildPrivacyUrl()}
                onClick={(e) => {
                  if (onOpenPrivacy) {
                    e.preventDefault();
                    onOpenPrivacy();
                  }
                }}
                className="hover:text-[#D6A984] transition-colors"
              >
                Privacy Policy (DPDP)
              </a>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:text-[#D6A984] transition-colors"
              >
                Studio Terms
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {legalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1614]/65 backdrop-blur-sm"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="w-full max-w-lg max-h-[85dvh] overflow-y-auto bg-[#FFFDF8] border border-[#B4563E]/40 p-6 sm:p-8 shadow-2xl space-y-4 text-[#1A1614]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#1A1614]/15 pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#933E29] font-semibold">
                  {brandName}
                </span>
                <h3 className="font-sans text-xl font-semibold uppercase tracking-tight">
                  {legalModal === 'privacy' ? 'Privacy Policy' : 'Studio Terms & Policy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                aria-label="Close policy dialog"
                className="w-8 h-8 border border-[#1A1614]/20 bg-[#F7F1E8] hover:bg-[#EAE0D2] text-sm font-medium flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {legalModal === 'privacy' ? (
              <div className="space-y-3 text-sm leading-relaxed text-[#4A403A]">
                <p>
                  We collect only the contact and appointment details needed to confirm your salon reservations, personalize your rituals, and coordinate studio updates via email, phone, or WhatsApp.
                </p>
                <p>
                  Your account credentials are encrypted and never sold or shared with external marketers. To update or delete your guest record, reach out to{' '}
                  <a href={`mailto:${email}`} className="text-[#933E29] underline">
                    {email}
                  </a>.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm leading-relaxed text-[#4A403A]">
                <p>
                  Reservations may be rescheduled at least {booking_rules?.rescheduling_cutoff_hours || 12} hours ahead or cancelled at least{' '}
                  {booking_rules?.cancellation_cutoff_hours || 24} hours prior to your scheduled slot without fee.
                </p>
                <p>
                  Please arrive 10 minutes before your session. Late arrivals beyond 15 minutes may be adjusted to preserve studio timing for upcoming guests.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <a
                href={buildPrivacyUrl()}
                onClick={(e) => {
                  if (onOpenPrivacy) {
                    e.preventDefault();
                    setLegalModal(null);
                    onOpenPrivacy();
                  }
                }}
                className="font-mono text-[11px] uppercase tracking-wider text-[#933E29] hover:underline font-semibold"
              >
                Read DPDP Privacy Policy &rarr;
              </a>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-5 py-2 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-xs uppercase tracking-wider font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lower Giant Wordmark Marquee + 8 Tapering Lines */}
      <div className="w-full bg-[#F7F1E8] pt-10 pb-3">
        <div className="w-full overflow-hidden py-4">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="flex w-max items-baseline whitespace-nowrap"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className={`px-5 sm:px-8 md:px-14 font-sans text-[52px] sm:text-[88px] md:text-[120px] lg:text-[152px] font-semibold uppercase leading-[0.86] tracking-[-0.055em] ${
                  i % 2 === 0 ? 'text-[#1A1614]' : 'text-[#B4563E]/40'
                }`}
              >
                {brandName}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="mt-4 flex w-full flex-col gap-2" aria-hidden="true">
          {TAPER_LINES.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}px` }}
              className={`w-full ${
                i < 3 ? 'bg-[#B4563E]' : i < 5 ? 'bg-[#D6A984]' : 'bg-[#1A1614]/85'
              }`}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
