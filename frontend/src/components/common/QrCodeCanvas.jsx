// frontend/src/components/common/QrCodeCanvas.jsx
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * High-contrast, print-ready QR code renderer backed by ISO-18004 QR generation.
 */
export default function QrCodeCanvas({
  value,
  size = 220,
  darkColor = '#1A1614',
  lightColor = '#FFFDF8',
  alt = 'QR Code',
  className = '',
}) {
  const [dataUrl, setDataUrl] = useState('');
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    if (!value) return undefined;
    let cancelled = false;

    (async () => {
      try {
        setQrError(false);
        const url = await QRCode.toDataURL(value, {
          width: Math.max(size * 2, 440),
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: darkColor,
            light: lightColor,
          },
        });
        if (!cancelled) {
          setDataUrl(url);
        }
      } catch (err) {
        console.error('Failed to render QR code:', err);
        if (!cancelled) {
          setQrError(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value, size, darkColor, lightColor]);

  if (qrError) {
    return (
      <div
        style={{ width: size, height: size, backgroundColor: lightColor }}
        className={`flex items-center justify-center p-4 text-center border border-red-200 text-red-700 font-mono text-[11px] ${className}`}
      >
        Unable to generate QR code.
      </div>
    );
  }

  if (!value || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size, backgroundColor: lightColor }}
        className={`flex items-center justify-center border border-[#1A1614]/15 ${className}`}
      >
        <div className="w-6 h-6 rounded-full border-2 border-[#B4563E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt={alt}
      className={`block select-none ${className}`}
    />
  );
}
