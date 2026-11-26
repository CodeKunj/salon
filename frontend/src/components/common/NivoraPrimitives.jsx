import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import CornerMarks from './CornerMarks';

export { CornerMarks as NivoraCornerMarks };

/**
 * Sharp rectangular slide-fill button tuned for RiTiVerse champagne & burnished copper luxury aesthetic.
 * Primary CTA = #B4563E with crisp dark espresso sweep (#1A1614) on hover.
 */
export function NivoraButton({
  children,
  onClick,
  href,
  type = 'button',
  variant = 'border',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const sizeClasses =
    size === 'sm'
      ? 'px-4 py-2 text-[12px] md:text-[13px] tracking-[0.08em]'
      : 'px-6 py-3 text-[13px] md:text-[14px] tracking-[0.08em]';

  const variantConfig = {
    border: {
      container:
        'border border-[#1A1614]/30 bg-[#FFFDF8]/90 backdrop-blur-sm text-[#1A1614] hover:border-[#B4563E] hover:text-[#FFFDF8]',
      fill: 'bg-[#B4563E]',
    },
    'border-rose': {
      container:
        'border border-[#B4563E] bg-[#F3E7DB]/90 text-[#1A1614] hover:border-[#1A1614] hover:text-[#FFFDF8]',
      fill: 'bg-[#1A1614]',
    },
    primary: {
      container:
        'border border-[#B4563E] bg-[#B4563E] text-[#FFFDF8] hover:border-[#1A1614] shadow-[0_12px_28px_-10px_rgba(180,86,62,0.45)]',
      fill: 'bg-[#1A1614]',
    },
    dark: {
      container:
        'border border-[#1A1614] bg-[#1A1614] text-[#FFFDF8] hover:border-[#B4563E]',
      fill: 'bg-[#B4563E]',
    },
  };

  const styles = variantConfig[variant] || variantConfig.border;

  const content = (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full ${styles.fill}`}
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2 font-sans font-medium uppercase">
        {children}
      </span>
    </>
  );

  const sharedClass = `group relative inline-flex items-center justify-center overflow-hidden rounded-none select-none transition-colors duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${styles.container} ${className}`;

  if (href) {
    return (
      <a href={href} onClick={onClick} className={sharedClass} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={sharedClass}
      {...props}
    >
      {content}
    </button>
  );
}

/**
 * 3D pointer tilt & drift (`maxTilt = 10deg`, `maxMove = 14px`, `hoverScale = 1.04`).
 */
export function TiltCard3D({
  children,
  className = '',
  maxTilt = 10,
  maxMove = 14,
  hoverScale = 1.04,
  perspective = 900,
  disabled = false,
}) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const canHoverRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(pointer: coarse)');
    canHoverRef.current = !mq.matches;
    const onChange = (e) => {
      canHoverRef.current = !e.matches;
    };
    mq.addEventListener?.('change', onChange);
    return () => {
      mq.removeEventListener?.('change', onChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const applyTransform = (dx, dy, rx, ry, scale, transitionCss) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = transitionCss;
    el.style.transform = `perspective(${perspective}px) translate3d(${dx.toFixed(2)}px, ${dy.toFixed(
      2
    )}px, 0px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
  };

  const handlePointerEnter = (e) => {
    if (disabled || !canHoverRef.current || e.pointerType === 'touch') return;
    if (cardRef.current) {
      cardRef.current.style.willChange = 'transform';
    }
    applyTransform(0, 0, 0, 0, hoverScale, 'transform 140ms ease-out');
  };

  const handlePointerMove = (e) => {
    if (disabled || !canHoverRef.current || e.pointerType === 'touch') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const dx = clamp((x - 0.5) * 2 * maxMove, -maxMove, maxMove);
    const dy = clamp((y - 0.5) * 2 * maxMove, -maxMove, maxMove);
    const rx = clamp(-(y - 0.5) * 2 * maxTilt, -maxTilt, maxTilt);
    const ry = clamp((x - 0.5) * 2 * maxTilt, -maxTilt, maxTilt);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      applyTransform(dx, dy, rx, ry, hoverScale, 'transform 40ms linear');
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    applyTransform(0, 0, 0, 0, 1, 'transform 180ms ease-out');
    if (cardRef.current) {
      cardRef.current.style.willChange = 'auto';
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

/**
 * Portal-rendered floating pill cursor badge (`#1A1614` ink + `#B4563E` / `#D6A984` accent dot).
 */
export function CursorScope({ label = 'Preview', children, className = '' }) {
  const [active, setActive] = useState(false);
  const [canHover, setCanHover] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(pointer: fine)').matches
      : false
  );

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const springX = useSpring(mouseX, { stiffness: 460, damping: 34, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 460, damping: 34, mass: 0.4 });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(pointer: fine)');
    const onChange = (e) => setCanHover(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const handleMouseMove = (e) => {
    if (!canHover) return;
    mouseX.set(e.clientX + 14);
    mouseY.set(e.clientY + 14);
  };

  return (
    <div
      className={className}
      onMouseEnter={(e) => {
        if (!canHover) return;
        mouseX.set(e.clientX + 14);
        mouseY.set(e.clientY + 14);
        setActive(true);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setActive(false)}
    >
      {children}
      {typeof document !== 'undefined' &&
        canHover &&
        createPortal(
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{
              opacity: active ? 1 : 0,
              scale: active ? 1 : 0.82,
            }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{
              left: 0,
              top: 0,
              x: springX,
              y: springY,
            }}
            className="pointer-events-none fixed z-[90] flex items-center gap-2 border border-[#B4563E] bg-[#1A1614]/95 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#F7F1E8] backdrop-blur-md shadow-[0_8px_24px_-6px_rgba(26,22,20,0.35)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6A984]" />
            <span>{label}</span>
          </motion.div>,
          document.body
        )}
    </div>
  );
}

/**
 * Staggered word-by-word blur-up reveal with warm #933E29 sienna-copper serif highlights.
 */
export function WordBlurReveal({ text = '', className = '' }) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  return (
    <p className={className}>
      {words.map((rawWord, idx) => {
        const isAccent =
          rawWord.startsWith('*') && rawWord.endsWith('*') && rawWord.length > 2;
        const cleanWord = isAccent ? rawWord.slice(1, -1) : rawWord;

        return (
          <React.Fragment key={`${idx}-${cleanWord}`}>
            <motion.span
              initial={{ opacity: 0.001, filter: 'blur(10px)', y: 10 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.55,
                delay: Math.min(idx * 0.025, 0.7),
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`inline-block will-change-transform ${
                isAccent ? 'text-[#933E29] italic font-serif font-normal' : ''
              }`}
            >
              {cleanWord}
            </motion.span>
            {idx < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </p>
  );
}

/**
 * Cashmere-editorial section header (`#1A1614` ink + `#933E29` badge + `#665B54` subcopy).
 */
export function NivoraSectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}) {
  const alignClasses =
    align === 'left'
      ? 'items-start text-left'
      : 'items-center text-center mx-auto max-w-[700px]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-4 ${alignClasses} ${className}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 border border-[#B4563E]/65 bg-[#FFFDF8]/90 px-3.5 py-1 font-sans text-[11px] md:text-[12px] font-medium uppercase tracking-[0.16em] text-[#933E29]">
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="max-w-full break-words font-sans text-[30px] min-[400px]:text-[36px] sm:text-[48px] lg:text-[58px] font-semibold uppercase leading-[1.03] sm:leading-[1.01] tracking-[-0.04em] text-[#1A1614]">
          {title}
        </h2>
      )}
      {description && (
        <p className="max-w-[580px] font-sans text-[12px] md:text-[14px] font-medium uppercase leading-[1.55] tracking-[0.05em] text-[#665B54]">
          {description}
        </p>
      )}
    </motion.div>
  );
}
