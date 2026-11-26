import React, { useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import CornerMarks from '../common/CornerMarks';
import { NivoraButton } from '../common/NivoraPrimitives';

const FALLBACK_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'Bridal Atelier Suite',
    duration_minutes: 210,
    price: 495,
    description:
      'Complete ceremony-ready hair architecture, luminizing skin prep, and couture soft-focus bridal artistry.',
    image_url:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'pkg-2',
    name: 'Silk Gloss Rebirth',
    duration_minutes: 135,
    price: 225,
    description:
      'Structural haircut paired with cold-pressed keratin mirror gloss and aromatic scalp drainage.',
    image_url:
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'pkg-3',
    name: 'Glass-Skin Sanctuary',
    duration_minutes: 90,
    price: 185,
    description:
      'Ultrasonic micro-refinement, peptide ampoule infusion, and mineral quartz sculpting therapy.',
    image_url:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'pkg-4',
    name: 'Minimalist Nail Duo',
    duration_minutes: 110,
    price: 145,
    description:
      'Clean Russian cuticle detailing, translucent Japanese builder gel, and camellia hand veil.',
    image_url:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'pkg-5',
    name: 'Pre-Gala Radiance',
    duration_minutes: 120,
    price: 260,
    description:
      'Cryo-contour facial flash prep finished with camera-soft satin skin and editorial blowout.',
    image_url:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80',
  },
];

export default function PackagesSwitcher() {
  const { packages, payments } = usePublic();
  const currencySymbol = payments?.currency_symbol || '₹';
  const { openBooking } = useBooking();
  const wrapperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    if (packages && packages.length >= 2) {
      return packages.map((pkg, idx) => ({
        ...pkg,
        price: pkg.price || pkg.offer_price || pkg.base_price || 180,
        duration_minutes: pkg.duration_minutes || 90,
        image_url:
          pkg.image_url ||
          FALLBACK_PACKAGES[idx % FALLBACK_PACKAGES.length].image_url,
      }));
    }
    return FALLBACK_PACKAGES;
  }, [packages]);

  const { scrollYProgress: enterProgress } = useScroll({
    target: wrapperRef,
    offset: ['start end', 'start start'],
  });
  const containerScale = useTransform(enterProgress, [0, 1], [0.88, 1]);

  const { scrollYProgress: wheelProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(wheelProgress, 'change', (latest) => {
    if (items.length <= 1) return;
    const next = Math.min(
      items.length - 1,
      Math.max(0, Math.floor(latest * items.length * 0.999))
    );
    setActiveIndex(next);
  });

  const activeItem = items[activeIndex] || items[0];

  return (
    <section
      id="packages"
      className="relative w-full border-t border-[#1A1614]/20 bg-gradient-to-b from-[#241D19] via-[#1D1714] to-[#15110E] text-[#F7F1E8]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[260px] w-[260px] sm:h-[440px] sm:w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B4563E]/25 blur-[140px]"
      />

      <div
        ref={wrapperRef}
        className="relative lg:h-[260vh] w-full"
      >
        <motion.div
          style={{ scale: containerScale }}
          className="lg:sticky lg:top-0 flex min-h-[580px] lg:min-h-[100vh] w-full flex-col justify-between overflow-hidden px-4 sm:px-10 lg:px-12 py-12 sm:py-16 lg:py-10 will-change-transform"
        >
          <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between border-b border-[#F7F1E8]/15 pb-4">
            <span className="inline-flex items-center gap-2 border border-[#D6A984]/40 bg-[#FFFDF8]/10 px-3 py-1 font-sans text-[11px] md:text-[12px] font-medium uppercase tracking-[0.14em] text-[#D6A984]">
              04 // Curated Packages
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#F7F1E8]/80">
              0{activeIndex + 1} / 0{items.length}
            </span>
          </div>

          <div className="mx-auto my-auto flex w-full max-w-[1520px] flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 py-6 sm:py-8">
            <div className="hidden lg:flex w-40 flex-col items-start gap-3">
              {items.map((item, idx) => {
                const dist = Math.abs(idx - activeIndex);
                const width = dist === 0 ? 34 : dist === 1 ? 20 : 12;
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    aria-label={`Select ${item.name}`}
                    onClick={() => setActiveIndex(idx)}
                    className="group flex items-center gap-3 py-1 text-left"
                  >
                    <span
                      style={{ width: `${width}px` }}
                      className={`block h-[2px] transition-all duration-300 ${
                        dist === 0
                          ? 'bg-[#D6A984]'
                          : 'bg-[#F7F1E8]/30 group-hover:bg-[#F7F1E8]/75'
                      }`}
                    />
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider transition-opacity ${
                        dist === 0
                          ? 'opacity-100 text-[#D6A984] font-semibold'
                          : 'opacity-0 group-hover:opacity-80 text-[#F7F1E8]'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex h-[240px] sm:h-[320px] lg:h-[380px] w-full flex-1 items-center justify-center overflow-hidden">
              {items.map((item, idx) => {
                const offset = idx - activeIndex;
                const isActive = offset === 0;
                const absOffset = Math.abs(offset);
                const computedOpacity = isActive
                  ? 1
                  : Math.max(0.2, 0.5 * Math.exp(-absOffset * 0.55));

                return (
                  <motion.button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    animate={{
                      y: offset * 62,
                      scale: isActive ? 1 : 0.92,
                      opacity: absOffset > 2 ? 0 : computedOpacity,
                      filter: isActive ? 'blur(0px)' : 'blur(0.6px)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 240,
                      damping: 28,
                      mass: 0.7,
                    }}
                    style={{
                      fontFamily: 'Georgia, "Playfair Display", serif',
                    }}
                    className={`absolute w-full px-2 text-center italic transition-colors ${
                      isActive
                        ? 'z-10 text-[24px] min-[400px]:text-[28px] sm:text-[42px] lg:text-[50px] xl:text-[62px] text-[#FFFDF8] drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]'
                        : 'z-0 text-[19px] min-[400px]:text-[22px] sm:text-[34px] lg:text-[42px] text-[#F7F1E8]/40 hover:text-[#F7F1E8]/80'
                    } leading-[1.15] tracking-[-0.02em]`}
                  >
                    {item.name}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex w-full max-w-[320px] lg:w-[270px] flex-col items-center lg:items-end gap-4 sm:gap-5 text-center lg:text-right">
              <div className="relative h-[180px] w-[180px] sm:h-[210px] sm:w-[210px] border border-[#D6A984]/45 bg-[#FFFDF8] p-2.5 shadow-[10px_10px_0px_rgba(0,0,0,0.4)]">
                <CornerMarks all size={12} thickness={2} color="text-[#B4563E]" />
                <div className="relative h-full w-full overflow-hidden bg-[#EAE0D2]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeItem.id || activeIndex}
                      src={activeItem.image_url}
                      alt={activeItem.name}
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="h-full w-full object-cover"
                    />
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D6A984]">
                  {activeItem.duration_minutes} MIN · {currencySymbol}{activeItem.price}
                </p>
                {activeItem.description && (
                  <p className="font-sans text-xs leading-relaxed text-[#F7F1E8]/80">
                    {activeItem.description}
                  </p>
                )}
              </div>

              <NivoraButton
                variant="primary"
                size="sm"
                className="hover:!border-[#D6A984]"
                onClick={() =>
                  openBooking({
                    name: activeItem.name,
                    base_price: activeItem.price,
                    duration_minutes: activeItem.duration_minutes,
                  })
                }
              >
                ↳ Book Package ({currencySymbol}{activeItem.price})
              </NivoraButton>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between border-t border-[#F7F1E8]/15 pt-4 text-xs gap-3">
            <span className="hidden lg:inline font-mono uppercase tracking-[0.12em] text-[#F7F1E8]/65">
              Click any signature title or scroll to rotate
            </span>
            <div className="flex lg:hidden items-center gap-1.5">
              {items.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  aria-label={`Select package ${idx + 1}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 transition-all duration-300 ${
                    idx === activeIndex ? 'w-6 bg-[#D6A984]' : 'w-2 bg-[#F7F1E8]/30'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
                }
                className="border border-[#F7F1E8]/25 bg-[#FFFDF8]/10 px-3 py-1.5 font-mono uppercase text-[#F7F1E8] hover:border-[#B4563E] hover:bg-[#B4563E] hover:text-[#FFFDF8]"
              >
                ↑ Prev
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)}
                className="border border-[#F7F1E8]/25 bg-[#FFFDF8]/10 px-3 py-1.5 font-mono uppercase text-[#F7F1E8] hover:border-[#B4563E] hover:bg-[#B4563E] hover:text-[#FFFDF8]"
              >
                Next ↓
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
