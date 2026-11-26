// frontend/src/components/public/VisitingCardPage.jsx
import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Calendar, Check, Clock, Copy, Download, ExternalLink,
  Globe, Mail, MapPin, MessageCircle, Phone, Share2, UserCheck
} from 'lucide-react';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import CornerMarks from '../common/CornerMarks';
import QrCodeCanvas from '../common/QrCodeCanvas';
import {
  buildSalonConnectivityLinks,
  buildSalonVCard,
  buildWhatsAppUrl,
  downloadQrPng,
  resolvePublicUrls,
  triggerFileDownload,
} from '../../utils/salonLinks';

function formatShortTime(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = String(timeStr).split(':');
  const h = Number(hStr);
  if (Number.isNaN(h)) return timeStr;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr || '00'} ${suffix}`;
}

function getChannelIcon(id) {
  switch (id) {
    case 'whatsapp':
      return MessageCircle;
    case 'phone':
      return Phone;
    case 'email':
      return Mail;
    case 'maps':
      return MapPin;
    case 'account':
      return UserCheck;
    case 'website':
      return Globe;
    default:
      return ExternalLink;
  }
}

export default function VisitingCardPage({ onBackToSite, onOpenCustomerPortal }) {
  const { salon, hours } = usePublic();
  const { openBooking } = useBooking();
  const { notifyError } = useToast();
  const [copied, setCopied] = useState(false);
  const [sharedFeedback, setSharedFeedback] = useState('');

  const { cardUrl } = useMemo(() => resolvePublicUrls(), []);
  const brandName = salon?.salon_name || 'RiTiVerse Salon & Aesthetics';
  const tagline =
    salon?.tagline ||
    'Where Haute Couture Artistry Meets Holistic Hair & Skin Wellness';
  const phone = salon?.phone || '+1 (555) 234-5678';
  const whatsappDisplay = salon?.whatsapp || phone;
  const email = salon?.email || salon?.support_email || 'concierge@ritiverse.com';
  const address =
    salon?.address || '452 Boulevard Saint-Honoré, Suite 400, Fashion District';

  const whatsappDirectUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        salon,
        `Hello ${brandName}, I scanned your digital visiting card and would love to connect.`
      ),
    [salon, brandName]
  );

  const connectivityLinks = useMemo(
    () => buildSalonConnectivityLinks(salon),
    [salon]
  );

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(cardUrl);
      } else {
        throw new Error('Clipboard unavailable');
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      return true;
    } catch {
      setCopied(false);
      notifyError('Unable to access clipboard automatically. Please copy the page URL from your address bar.');
      return false;
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${brandName} — Digital Visiting Card`,
          text: `Connect with ${brandName} on WhatsApp, book online, and explore all social links:`,
          url: cardUrl,
        });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
        // Share cancelled/unsupported — fall back to clipboard
      }
    }
    const ok = await handleCopyLink();
    if (ok) {
      setSharedFeedback('Card link copied to clipboard.');
      window.setTimeout(() => setSharedFeedback(''), 2500);
    }
  };

  const handleDownloadVCard = () => {
    const vcf = buildSalonVCard(salon, cardUrl);
    triggerFileDownload(vcf, 'RiTiVerse-Salon.vcf', 'text/vcard;charset=utf-8');
  };

  const handleLinkClick = (e, item) => {
    if (item.id === 'website' && onBackToSite) {
      e.preventDefault();
      onBackToSite();
    } else if (item.id === 'account' && onOpenCustomerPortal) {
      e.preventDefault();
      onOpenCustomerPortal('upcoming');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#1A1614] relative overflow-x-clip flex flex-col">
      <div className="bg-atelier-grid pointer-events-none fixed inset-0 opacity-60" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-[#1A1614]/15 bg-[#F7F1E8]/90 backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[#1A1614] hover:text-[#933E29] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {brandName.split(' ')[0]}</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenCustomerPortal && (
              <button
                type="button"
                onClick={() => onOpenCustomerPortal('upcoming')}
                className="hidden sm:inline-flex px-3.5 py-2 border border-[#1A1614]/20 bg-[#FFFDF8] hover:bg-[#EAE0D2] font-mono text-[11px] uppercase tracking-[0.1em] text-[#1A1614] transition-colors"
              >
                My Bookings
              </button>
            )}
            <button
              type="button"
              onClick={() => openBooking()}
              className="px-4 py-2 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-[11px] uppercase tracking-[0.12em] font-semibold transition-colors"
            >
              Book Visit
            </button>
          </div>
        </div>
      </header>

      {/* Main Visiting Card Deck */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-5xl px-4 sm:px-8 py-8 sm:py-12 space-y-10">
        {/* Physical-Styled Double-Face Luxury Visiting Card */}
        <section
          aria-label="Digital Visiting Card"
          className="relative grid grid-cols-1 lg:grid-cols-12 border border-[#B4563E]/40 bg-[#FFFDF8] shadow-[12px_12px_0px_rgba(180,86,62,0.16)]"
        >
          <CornerMarks all size={14} thickness={2} color="text-[#D6A984]" />

          {/* Front Card Face — Velvet Obsidian Stock */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#241D19] via-[#1D1714] to-[#15110E] p-6 sm:p-10 text-[#F7F1E8] flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-[#D6A984]/25">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#D6A984]/60 bg-[#B4563E] text-[#FFFDF8] font-serif italic text-xl">
                    R
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D6A984]">
                      Atelier Visiting Card
                    </p>
                    <h1 className="font-sans text-xl sm:text-2xl font-semibold uppercase tracking-[0.06em] text-[#FFFDF8]">
                      {brandName}
                    </h1>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 border border-[#2FA66A]/55 bg-[#FFFDF8]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#F7F1E8]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2FA66A]" />
                  <span>Open Today</span>
                </span>
              </div>

              <p className="font-sans text-sm leading-relaxed text-[#F7F1E8]/80 max-w-lg border-l-2 border-[#B4563E] pl-3.5">
                {tagline}
              </p>

              {/* Printed-Card Contact Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F7F1E8]/15 text-xs">
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#D6A984] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[#D6A984]/80">
                      Telephone
                    </span>
                    <a
                      href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                      className="font-sans text-sm font-medium text-[#FFFDF8] hover:text-[#D6A984] transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[#D6A984]/80">
                      WhatsApp Direct
                    </span>
                    {whatsappDirectUrl ? (
                      <a
                        href={whatsappDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-sm font-medium text-[#FFFDF8] hover:text-[#25D366] transition-colors"
                      >
                        {whatsappDisplay}
                      </a>
                    ) : (
                      <span className="font-sans text-sm font-medium text-[#FFFDF8]">
                        {whatsappDisplay}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#D6A984] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[#D6A984]/80">
                      Concierge Email
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="font-sans text-xs font-medium text-[#FFFDF8] hover:text-[#D6A984] break-all transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D6A984] shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-[#D6A984]/80">
                      Atelier Address
                    </span>
                    <span className="font-sans text-xs text-[#F7F1E8]/85 leading-snug block">
                      {address}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Visiting Card Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 print:hidden">
              {whatsappDirectUrl && (
                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1FB857] text-[#1A1614] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Salon</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => openBooking()}
                className="inline-flex items-center gap-2 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadVCard}
                className="inline-flex items-center gap-2 border border-[#D6A984]/50 bg-[#FFFDF8]/10 hover:bg-[#D6A984] text-[#FFFDF8] hover:text-[#1A1614] px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Save Contact (.vcf)</span>
              </button>
            </div>
          </div>

          {/* Back Card Face — Scannable QR Plate */}
          <div className="lg:col-span-5 bg-[#FFFDF8] p-6 sm:p-10 flex flex-col items-center justify-center text-center gap-5">
            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#933E29] font-semibold">
                Scan With Camera
              </p>
              <h2 className="font-sans text-lg font-semibold uppercase tracking-[0.06em] text-[#1A1614]">
                Digital Contact QR
              </h2>
            </div>

            <div className="relative p-3 border border-[#1A1614]/20 bg-[#FFFDF8] shadow-xs">
              <CornerMarks all size={10} thickness={2} color="text-[#B4563E]" />
              <QrCodeCanvas
                value={cardUrl}
                size={196}
                alt={`QR Code for ${brandName} Visiting Card`}
              />
            </div>

            <div className="w-full max-w-xs space-y-3">
              <p className="font-mono text-[11px] text-[#665B54] break-all px-2 py-1.5 bg-[#F7F1E8] border border-[#1A1614]/10">
                {cardUrl}
              </p>

              <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-1.5 border border-[#1A1614]/20 bg-[#F7F1E8] hover:border-[#B4563E] px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider text-[#1A1614] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#2FA66A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="inline-flex items-center justify-center gap-1.5 border border-[#1A1614]/20 bg-[#F7F1E8] hover:border-[#B4563E] px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider text-[#1A1614] transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadQrPng(cardUrl, 'RiTiVerse-Salon-QR.png')}
                  className="inline-flex items-center justify-center gap-1.5 border border-[#1A1614]/20 bg-[#F7F1E8] hover:border-[#B4563E] px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider text-[#1A1614] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>QR PNG</span>
                </button>
              </div>

              {sharedFeedback && (
                <p className="font-mono text-[11px] text-[#2FA66A]">{sharedFeedback}</p>
              )}
            </div>
          </div>
        </section>

        {/* All Salon Connectivity Directory */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#1A1614]/15 pb-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#933E29]">
                Direct Channels &amp; Social Profiles
              </p>
              <h2 className="font-sans text-2xl sm:text-3xl font-semibold uppercase tracking-[-0.03em] text-[#1A1614]">
                All Connectivity Links
              </h2>
            </div>
            <span className="font-mono text-xs text-[#665B54]">
              {connectivityLinks.length} Verified Touchpoints
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {connectivityLinks.map((item) => {
              const Icon = getChannelIcon(item.id);
              const isWhatsApp = item.id === 'whatsapp';
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                  onClick={(e) => handleLinkClick(e, item)}
                  className={`group flex items-center justify-between gap-3 p-4 border transition-all duration-200 ${
                    isWhatsApp
                      ? 'border-[#25D366]/60 bg-[#FFFDF8] hover:bg-[#25D366]/10 hover:border-[#25D366]'
                      : 'border-[#1A1614]/15 bg-[#FFFDF8] hover:border-[#B4563E] hover:bg-[#F3E7DB]/45'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-10 w-10 shrink-0 flex items-center justify-center border ${
                        isWhatsApp
                          ? 'bg-[#25D366]/15 border-[#25D366]/45 text-[#188C43]'
                          : 'bg-[#F7F1E8] border-[#B4563E]/25 text-[#933E29]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block font-sans text-sm font-semibold text-[#1A1614] truncate">
                        {item.label}
                      </span>
                      <span className="block font-mono text-[11px] text-[#665B54] truncate">
                        {item.sublabel}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0 text-[#665B54] group-hover:text-[#933E29] transition-colors" />
                </a>
              );
            })}
          </div>
        </section>

        {/* Weekly Opening Hours Strip */}
        {Array.isArray(hours) && hours.length > 0 && (
          <section className="border border-[#1A1614]/15 bg-[#FFFDF8] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1A1614]/10 pb-3">
              <Clock className="w-4 h-4 text-[#B4563E]" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1614]">
                Weekly Studio Hours
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
              {hours.map((day) => (
                <div
                  key={day.day_of_week}
                  className="p-2.5 bg-[#F7F1E8] border border-[#1A1614]/10"
                >
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#933E29] font-semibold">
                    {day.day_name?.slice(0, 3)}
                  </span>
                  <span className="block mt-1 font-sans text-[11px] font-medium text-[#1A1614]">
                    {Number(day.is_closed) === 1
                      ? 'Closed'
                      : `${formatShortTime(day.open_time)} – ${formatShortTime(day.close_time)}`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
