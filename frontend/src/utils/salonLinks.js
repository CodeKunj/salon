// frontend/src/utils/salonLinks.js
import QRCode from 'qrcode';
import { getAppBasePath } from './adminRouter.js';

/**
 * Strip non-numeric characters from phone/WhatsApp strings for wa.me URLs.
 */
export function normalizeWhatsAppDigits(raw) {
  if (!raw) return '';
  return String(raw).replace(/\D/g, '');
}

/**
 * Normalize an external URL so links missing an explicit protocol still open cleanly.
 */
export function normalizeExternalUrl(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === '#') return '';
  if (/^(https?:|tel:|mailto:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Build a direct WhatsApp wa.me link to the salon concierge number.
 */
export function buildWhatsAppUrl(salonOrNumber, prefilledMessage = '') {
  const raw =
    typeof salonOrNumber === 'string'
      ? salonOrNumber
      : salonOrNumber?.whatsapp || salonOrNumber?.phone || '';
  const digits = normalizeWhatsAppDigits(raw);
  if (!digits) return '';
  const base = `https://wa.me/${digits}`;
  if (!prefilledMessage) return base;
  return `${base}?text=${encodeURIComponent(prefilledMessage)}`;
}

/**
 * Build a shareable WhatsApp composer link (with optional customer recipient number)
 * to send a pre-formatted message containing the digital visiting card link.
 */
export function buildWhatsAppShareUrl(message, recipientPhone = '') {
  const digits = normalizeWhatsAppDigits(recipientPhone);
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message || '')}`;
}

/**
 * Convert an embed Maps URL into a standard shareable Google Maps destination link.
 */
export function buildGoogleMapsUrl(salon) {
  const embed = normalizeExternalUrl(salon?.maps_embed_url);
  if (embed) {
    return embed.replace(/[?&]output=embed/gi, '');
  }
  const address = salon?.address?.trim();
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return '';
}

/**
 * Resolve the canonical public URL for the visiting card / QR share page and home site.
 */
export function resolvePublicUrls() {
  if (typeof window === 'undefined') {
    return {
      origin: '',
      basePath: '',
      homeUrl: '/',
      cardUrl: '/card',
      accountUrl: '/account',
    };
  }
  const origin = window.location.origin;
  const basePath = getAppBasePath();
  return {
    origin,
    basePath,
    homeUrl: `${origin}${basePath ? `${basePath}/` : '/'}`,
    cardUrl: `${origin}${basePath}/card`,
    accountUrl: `${origin}${basePath}/account`,
  };
}

/**
 * Build structured connectivity items displayed on the visiting card and admin share preview.
 */
export function buildSalonConnectivityLinks(salon = {}) {
  const { homeUrl, accountUrl } = resolvePublicUrls();
  const brandName = salon?.salon_name || 'RiTiVerse Salon';
  const phone = salon?.phone || '';
  const whatsappRaw = salon?.whatsapp || salon?.phone || '';
  const email = salon?.email || salon?.support_email || '';

  const whatsappUrl = buildWhatsAppUrl(
    whatsappRaw,
    `Hello ${brandName}, I found your visiting card and would love to inquire about an appointment.`
  );
  const phoneDigits = phone ? phone.replace(/[^+\d]/g, '') : '';
  const telUrl = phoneDigits ? `tel:${phoneDigits}` : '';
  const mailUrl = email ? `mailto:${email}` : '';
  const mapsUrl = buildGoogleMapsUrl(salon);
  const instagramUrl = normalizeExternalUrl(salon?.social_instagram || salon?.instagram_url);
  const facebookUrl = normalizeExternalUrl(salon?.social_facebook || salon?.facebook_url);
  const pinterestUrl = normalizeExternalUrl(salon?.social_pinterest || salon?.pinterest_url);
  const tiktokUrl = normalizeExternalUrl(salon?.social_tiktok || salon?.tiktok_url);

  const channels = [];

  if (whatsappUrl) {
    channels.push({
      id: 'whatsapp',
      label: 'WhatsApp Concierge',
      sublabel: whatsappRaw,
      href: whatsappUrl,
      external: true,
      priority: 'primary',
    });
  }

  if (telUrl) {
    channels.push({
      id: 'phone',
      label: 'Call Studio',
      sublabel: phone,
      href: telUrl,
      external: false,
      priority: 'secondary',
    });
  }

  if (mailUrl) {
    channels.push({
      id: 'email',
      label: 'Email Concierge',
      sublabel: email,
      href: mailUrl,
      external: false,
      priority: 'secondary',
    });
  }

  if (mapsUrl) {
    channels.push({
      id: 'maps',
      label: 'Google Maps Directions',
      sublabel: salon?.address || 'Find our studio location',
      href: mapsUrl,
      external: true,
      priority: 'secondary',
    });
  }

  channels.push({
    id: 'website',
    label: 'Official Website & Menu',
    sublabel: homeUrl.replace(/^https?:\/\//i, ''),
    href: homeUrl,
    external: false,
    priority: 'secondary',
  });

  channels.push({
    id: 'account',
    label: 'My Bookings & Client Portal',
    sublabel: 'View upcoming visits & history',
    href: accountUrl,
    external: false,
    priority: 'secondary',
  });

  if (instagramUrl) {
    channels.push({
      id: 'instagram',
      label: 'Instagram',
      sublabel: instagramUrl.replace(/^https?:\/\/(www\.)?/i, ''),
      href: instagramUrl,
      external: true,
      priority: 'social',
    });
  }

  if (facebookUrl) {
    channels.push({
      id: 'facebook',
      label: 'Facebook',
      sublabel: facebookUrl.replace(/^https?:\/\/(www\.)?/i, ''),
      href: facebookUrl,
      external: true,
      priority: 'social',
    });
  }

  if (pinterestUrl) {
    channels.push({
      id: 'pinterest',
      label: 'Pinterest',
      sublabel: pinterestUrl.replace(/^https?:\/\/(www\.)?/i, ''),
      href: pinterestUrl,
      external: true,
      priority: 'social',
    });
  }

  if (tiktokUrl) {
    channels.push({
      id: 'tiktok',
      label: 'TikTok',
      sublabel: tiktokUrl.replace(/^https?:\/\/(www\.)?/i, ''),
      href: tiktokUrl,
      external: true,
      priority: 'social',
    });
  }

  return channels;
}

/**
 * Generate a standard vCard 3.0 (.vcf) string so visitors can save salon contact details.
 */
export function buildSalonVCard(salon = {}, cardUrl = '') {
  const name = salon?.salon_name || 'RiTiVerse Salon & Aesthetics';
  const phone = salon?.phone || '';
  const whatsapp = salon?.whatsapp || '';
  const email = salon?.email || salon?.support_email || '';
  const address = salon?.address || '';
  const { homeUrl } = resolvePublicUrls();
  const site = cardUrl || homeUrl;
  const noteParts = [salon?.tagline, whatsapp ? `WhatsApp: ${whatsapp}` : ''].filter(Boolean);

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `ORG:${name}`,
  ];

  if (phone) lines.push(`TEL;TYPE=WORK,VOICE:${phone}`);
  if (whatsapp && whatsapp !== phone) lines.push(`TEL;TYPE=CELL:${whatsapp}`);
  if (email) lines.push(`EMAIL;TYPE=WORK:${email}`);
  if (address) lines.push(`ADR;TYPE=WORK:;;${address};;;;`);
  if (site) lines.push(`URL:${site}`);
  if (noteParts.length > 0) lines.push(`NOTE:${noteParts.join(' | ')}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Download text content as a client-side file cleanly.
 */
export function triggerFileDownload(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export the given URL as a downloadable high-resolution PNG QR code.
 */
export async function downloadQrPng(value, filename = 'ritiverse-qr.png', { darkColor = '#1A1614', lightColor = '#FFFDF8' } = {}) {
  if (!value) return;
  const dataUrl = await QRCode.toDataURL(value, {
    width: 1024,
    margin: 3,
    errorCorrectionLevel: 'H',
    color: { dark: darkColor, light: lightColor },
  });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  triggerFileDownload(blob, filename);
}

/**
 * Export the given URL as a downloadable vector SVG QR code.
 */
export async function downloadQrSvg(value, filename = 'ritiverse-qr.svg', { darkColor = '#1A1614', lightColor = '#FFFDF8' } = {}) {
  if (!value) return;
  const svgString = await QRCode.toString(value, {
    type: 'svg',
    margin: 3,
    errorCorrectionLevel: 'H',
    color: { dark: darkColor, light: lightColor },
  });
  triggerFileDownload(svgString, filename, 'image/svg+xml;charset=utf-8');
}
