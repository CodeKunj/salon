import React from 'react';

/**
 * Nivora-style sharp geometric corner L-brackets (`12px x 12px`, zero radius)
 * tuned for RiTiVerse cashmere silk & burnished copper palette.
 */
export default function CornerMarks({
  all = false,
  tl = false,
  tr = false,
  bl = false,
  br = false,
  size = 12,
  thickness = 2,
  color = 'text-[#B4563E]/75',
  className = '',
}) {
  const showTL = all || tl;
  const showTR = all || tr;
  const showBL = all || bl;
  const showBR = all || br;

  const resolvedColor = color.startsWith('bg-') ? color.replace(/^bg-/, 'text-') : color;

  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 transition-colors duration-300 ${resolvedColor} ${className}`}
      aria-hidden="true"
    >
      {showTL && (
        <span
          className="absolute top-0 left-0 border-current"
          style={{
            ...baseStyle,
            borderTopWidth: `${thickness}px`,
            borderLeftWidth: `${thickness}px`,
          }}
        />
      )}
      {showTR && (
        <span
          className="absolute top-0 right-0 border-current"
          style={{
            ...baseStyle,
            borderTopWidth: `${thickness}px`,
            borderRightWidth: `${thickness}px`,
          }}
        />
      )}
      {showBL && (
        <span
          className="absolute bottom-0 left-0 border-current"
          style={{
            ...baseStyle,
            borderBottomWidth: `${thickness}px`,
            borderLeftWidth: `${thickness}px`,
          }}
        />
      )}
      {showBR && (
        <span
          className="absolute bottom-0 right-0 border-current"
          style={{
            ...baseStyle,
            borderBottomWidth: `${thickness}px`,
            borderRightWidth: `${thickness}px`,
          }}
        />
      )}
    </div>
  );
}
