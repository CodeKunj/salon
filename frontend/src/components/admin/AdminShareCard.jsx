// frontend/src/components/admin/AdminShareCard.jsx
import React, { useMemo, useState } from 'react';
import {
  Check, Copy, Download, ExternalLink, Mail, MapPin, MessageCircle,
  Phone, Printer, QrCode, Send, Settings, Share2
} from 'lucide-react';
import { usePublic } from '../../context/PublicContext';
import { useAuth } from '../../context/AuthContext';
import CornerMarks from '../common/CornerMarks';
import QrCodeCanvas from '../common/QrCodeCanvas';
import {
  buildSalonConnectivityLinks,
  buildSalonVCard,
  buildWhatsAppShareUrl,
  buildWhatsAppUrl,
  downloadQrPng,
  downloadQrSvg,
  resolvePublicUrls,
  triggerFileDownload,
} from '../../utils/salonLinks';

export default function AdminShareCard({ onOpenCard, onNavigateSettings }) {
  const { salon } = usePublic();
  const { permissions } = useAuth();

  const [qrMode, setQrMode] = useState('card');
  const [copied, setCopied] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  const { cardUrl, homeUrl } = useMemo(() => resolvePublicUrls(), []);
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
        `Hello ${brandName}, I would like to connect with the salon.`
      ),
    [salon, brandName]
  );

  const activeQrUrl = useMemo(() => {
    if (qrMode === 'whatsapp' && whatsappDirectUrl) return whatsappDirectUrl;
    if (qrMode === 'website') return homeUrl;
    return cardUrl;
  }, [qrMode, cardUrl, homeUrl, whatsappDirectUrl]);

  const activeModeMeta = useMemo(() => {
    if (qrMode === 'whatsapp' && whatsappDirectUrl) {
      return {
        badge: 'Direct WhatsApp QR',
        caption: 'Opens WhatsApp chat directly with your salon number.',
        filename: 'RiTiVerse-WhatsApp-QR',
      };
    }
    if (qrMode === 'website') {
      return {
        badge: 'Website & Booking QR',
        caption: 'Opens the salon homepage and online reservation menu.',
        filename: 'RiTiVerse-Website-QR',
      };
    }
    return {
      badge: 'Visiting Card QR',
      caption: 'Opens the digital visiting card with all connectivity links.',
      filename: 'RiTiVerse-Visiting-Card-QR',
    };
  }, [qrMode, whatsappDirectUrl]);

  const connectivityLinks = useMemo(
    () => buildSalonConnectivityLinks(salon),
    [salon]
  );

  const customerInviteMessage = useMemo(() => {
    const waLine = whatsappDirectUrl ? `\nWhatsApp Concierge: ${whatsappDisplay}` : '';
    return `Thank you for visiting ${brandName}!\n\nSave our digital visiting card for 1-tap WhatsApp concierge, online appointment booking, directions & social links:\n${cardUrl}${waLine}`;
  }, [brandName, cardUrl, whatsappDirectUrl, whatsappDisplay]);

  const whatsappProvideUrl = useMemo(
    () => buildWhatsAppShareUrl(customerInviteMessage, customerPhone),
    [customerInviteMessage, customerPhone]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeQrUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadVCard = () => {
    const vcf = buildSalonVCard(salon, cardUrl);
    triggerFileDownload(vcf, 'RiTiVerse-Salon.vcf', 'text/vcard;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-editorial text-3xl font-light text-salon-dark">
            Share &amp; QR Visiting Card
          </h1>
          <p className="text-xs text-salon-muted">
            Provide customers instant QR access to your salon visiting card, WhatsApp concierge, directions &amp; social links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {permissions.canManageSettings && onNavigateSettings && (
            <button
              type="button"
              onClick={onNavigateSettings}
              className="px-4 py-2 rounded-full border border-salon-border bg-salon-card hover:bg-salon-light text-xs font-semibold text-salon-dark transition-colors inline-flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Salon Links</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full border border-salon-border bg-salon-card hover:bg-salon-light text-xs font-semibold text-salon-dark transition-colors inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Desk QR</span>
          </button>

          <button
            type="button"
            onClick={onOpenCard}
            className="px-5 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-soft-pink"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Live Card Page</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Controls — Admin Provisioning & Sharing */}
        <div className="xl:col-span-5 space-y-5 print:hidden">
          {/* QR Destination & Link Copy */}
          <div className="bg-salon-card rounded-3xl border border-salon-border p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-salon-primary" />
                <h2 className="text-sm font-bold text-salon-dark uppercase tracking-wider">
                  1. Visiting Card QR Link
                </h2>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-salon-soft text-salon-primary">
                Ready to Scan
              </span>
            </div>

            <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-2">
              {[
                { id: 'card', label: 'Visiting Card' },
                ...(whatsappDirectUrl ? [{ id: 'whatsapp', label: 'WhatsApp' }] : []),
                { id: 'website', label: 'Website' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setQrMode(opt.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    qrMode === opt.id
                      ? 'bg-[#1A1614] text-[#FFFDF8] border-[#1A1614]'
                      : 'bg-salon-light text-salon-muted border-salon-border hover:text-salon-dark'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-salon-muted uppercase tracking-wider">
                Shareable Customer URL
              </label>
              <div className="flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={activeQrUrl}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-salon-border bg-salon-light font-mono text-xs text-salon-dark"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-salon-muted">{activeModeMeta.caption}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => downloadQrPng(activeQrUrl, `${activeModeMeta.filename}.png`)}
                className="px-3 py-2.5 rounded-xl border border-salon-border bg-salon-light hover:border-salon-primary text-xs font-semibold text-salon-dark inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-salon-primary" />
                <span>QR PNG</span>
              </button>

              <button
                type="button"
                onClick={() => downloadQrSvg(activeQrUrl, `${activeModeMeta.filename}.svg`)}
                className="px-3 py-2.5 rounded-xl border border-salon-border bg-salon-light hover:border-salon-primary text-xs font-semibold text-salon-dark inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-salon-primary" />
                <span>QR SVG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadVCard}
                className="px-3 py-2.5 rounded-xl border border-salon-border bg-salon-light hover:border-salon-primary text-xs font-semibold text-salon-dark inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-salon-primary" />
                <span>vCard (.vcf)</span>
              </button>
            </div>
          </div>

          {/* Send Visiting Card to Customer on WhatsApp */}
          <div className="bg-salon-card rounded-3xl border border-salon-border p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <h2 className="text-sm font-bold text-salon-dark uppercase tracking-wider">
                2. Send Card via WhatsApp
              </h2>
            </div>

            <p className="text-xs text-salon-muted leading-relaxed">
              Enter a client&apos;s WhatsApp number (with country code) or leave blank to choose a contact directly inside WhatsApp.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-salon-muted uppercase tracking-wider mb-1">
                  Customer WhatsApp Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-salon-border text-xs"
                />
              </div>

              <a
                href={whatsappProvideUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-full bg-[#25D366] hover:bg-[#1FB857] text-[#1A1614] text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Visiting Card on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Configured Links Summary */}
          <div className="bg-salon-card rounded-3xl border border-salon-border p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-salon-dark">
                Active Links Included ({connectivityLinks.length})
              </span>
              <a
                href={cardUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-salon-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Open /card</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {connectivityLinks.map((c) => (
                <span
                  key={c.id}
                  className="px-2.5 py-1 rounded-full bg-salon-light border border-salon-border text-[11px] font-medium text-salon-dark"
                >
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Live Visiting Card Standee Preview (Printable) */}
        <div className="xl:col-span-7">
          <div className="relative border border-[#B4563E]/40 bg-[#FFFDF8] shadow-[10px_10px_0px_rgba(180,86,62,0.14)] print:shadow-none">
            <CornerMarks all size={12} thickness={2} color="text-[#D6A984]" />

            {/* Top Dark Visiting Card Banner */}
            <div className="bg-gradient-to-br from-[#241D19] via-[#1D1714] to-[#15110E] p-6 sm:p-8 text-[#F7F1E8] border-b border-[#D6A984]/25">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#D6A984]/60 bg-[#B4563E] text-[#FFFDF8] font-serif italic text-xl">
                    R
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D6A984]">
                      Digital Visiting Card
                    </p>
                    <h2 className="font-sans text-xl sm:text-2xl font-semibold uppercase tracking-[0.06em] text-[#FFFDF8]">
                      {brandName}
                    </h2>
                  </div>
                </div>

                <span className="self-start sm:self-auto px-3 py-1 border border-[#D6A984]/40 bg-[#FFFDF8]/10 font-mono text-[10px] uppercase tracking-[0.14em] text-[#D6A984]">
                  {activeModeMeta.badge}
                </span>
              </div>

              <p className="mt-4 font-sans text-xs sm:text-sm text-[#F7F1E8]/80 max-w-xl">
                {tagline}
              </p>

              <div className="mt-5 pt-4 border-t border-[#F7F1E8]/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#D6A984] shrink-0" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                  <span>WhatsApp: {whatsappDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#D6A984] shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D6A984] shrink-0" />
                  <span className="truncate">{address}</span>
                </div>
              </div>
            </div>

            {/* Bottom QR & Connectivity Plate */}
            <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 bg-[#FFFDF8]">
              <div className="flex flex-col items-center text-center gap-2.5 shrink-0">
                <div className="relative p-3 border border-[#1A1614]/20 bg-[#FFFDF8]">
                  <CornerMarks all size={9} thickness={2} color="text-[#B4563E]" />
                  <QrCodeCanvas
                    value={activeQrUrl}
                    size={184}
                    alt={`${brandName} ${activeModeMeta.badge}`}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#933E29] font-semibold">
                  Scan Camera to Connect
                </span>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div>
                  <h3 className="font-sans text-sm font-bold uppercase tracking-[0.06em] text-[#1A1614]">
                    Instant Salon Touchpoints
                  </h3>
                  <p className="text-xs text-[#665B54] mt-0.5">
                    Clients can chat on WhatsApp, book appointments, save your contact card, get directions &amp; follow your social handles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {connectivityLinks.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="px-3 py-2 bg-[#F7F1E8] border border-[#1A1614]/10 flex items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-[#1A1614] truncate">{item.label}</span>
                      <span className="font-mono text-[10px] text-[#933E29] shrink-0">Live</span>
                    </div>
                  ))}
                </div>

                <p className="font-mono text-[11px] text-[#665B54] break-all border-t border-[#1A1614]/10 pt-3">
                  Card URL: {cardUrl}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
