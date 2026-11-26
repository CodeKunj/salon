// frontend/src/components/common/SafeImage.jsx
import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function SafeImage({
  src,
  fallbackSrc = '',
  alt = '',
  fallbackLabel = '',
  className = '',
  fallbackClassName = '',
  onError,
  ...rest
}) {
  const [failedPrimary, setFailedPrimary] = useState(null);
  const [failedBackup, setFailedBackup] = useState(null);

  const activeSrc =
    src && failedPrimary !== src
      ? src
      : fallbackSrc && failedBackup !== fallbackSrc
      ? fallbackSrc
      : '';

  if (!activeSrc) {
    const initial = (fallbackLabel || alt || 'R').trim().charAt(0).toUpperCase();
    return (
      <div
        role="img"
        aria-label={alt || fallbackLabel || 'Studio image unavailable'}
        className={`w-full h-full flex flex-col items-center justify-center bg-[#EFE5D8] text-[#933E29] select-none ${fallbackClassName} ${className}`}
      >
        <ImageOff className="w-5 h-5 opacity-60 mb-1" />
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-80 px-2 text-center truncate max-w-full">
          {fallbackLabel || initial}
        </span>
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        if (activeSrc === src) {
          setFailedPrimary(src);
        } else {
          setFailedBackup(fallbackSrc);
        }
        if (onError) onError(e);
      }}
      {...rest}
    />
  );
}
