import React, { useMemo, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import CornerMarks from '../common/CornerMarks';
import SafeImage from '../common/SafeImage';
import { NivoraButton } from '../common/NivoraPrimitives';

const FALLBACK_CATEGORIES = [
  {
    id: 'cat-hair',
    name: 'Hair Architecture',
    slug: 'hair',
    description:
      'Precision sculptural cutting, lived-in dimensional color, and bond-repairing gloss treatments tailored to your movement.',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    services: [
      {
        id: 'srv-1',
        name: 'Signature Editorial Cut & Blowout',
        duration_minutes: 60,
        base_price: 95,
      },
      {
        id: 'srv-2',
        name: 'Botanical Balayage & Gloss',
        duration_minutes: 150,
        base_price: 240,
      },
      {
        id: 'srv-3',
        name: 'Keratin Silk Smooth Therapy',
        duration_minutes: 120,
        base_price: 195,
      },
      {
        id: 'srv-4',
        name: 'Scalp Detox & Micro-Mist Ritual',
        duration_minutes: 45,
        base_price: 75,
      },
    ],
  },
  {
    id: 'cat-skin',
    name: 'Dermal & Skin Therapy',
    slug: 'skin',
    description:
      'Clinical botanical facials, lymphatic sculpting, and non-invasive glass-skin rituals calibrated for lasting radiance.',
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    services: [
      {
        id: 'srv-5',
        name: 'Atelier Glass-Skin Infusion',
        duration_minutes: 75,
        base_price: 165,
      },
      {
        id: 'srv-6',
        name: 'Sculpting Gua Sha & Cryo Lift',
        duration_minutes: 60,
        base_price: 135,
      },
      {
        id: 'srv-7',
        name: 'LED Barrier Restoration Facial',
        duration_minutes: 60,
        base_price: 140,
      },
      {
        id: 'srv-8',
        name: 'Enzyme Pore Refinement Peel',
        duration_minutes: 45,
        base_price: 110,
      },
    ],
  },
  {
    id: 'cat-bridal',
    name: 'Bridal & Nail Couture',
    slug: 'bridal',
    description:
      'Soft-focus bridal complexion design, structural Japanese manicure artistry, and calm private suite pampering.',
    image:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    services: [
      {
        id: 'srv-9',
        name: 'Bespoke Bridal Hair & Glow Makeup',
        duration_minutes: 180,
        base_price: 420,
      },
      {
        id: 'srv-10',
        name: 'Japanese Builder Gel & Pearl Art',
        duration_minutes: 75,
        base_price: 85,
      },
      {
        id: 'srv-11',
        name: 'Bridal Trial & Skin Prep Consult',
        duration_minutes: 90,
        base_price: 160,
      },
      {
        id: 'srv-12',
        name: 'Camellia Rose Spa Manicure & Pedi',
        duration_minutes: 90,
        base_price: 120,
      },
    ],
  },
];

const CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
];

function ServiceSlideContent({ slide, index, total, currencySymbol = '₹', onSelectSlide, onBook }) {
  return (
    <div className="flex w-full shrink-0 flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12 xl:gap-16 px-4 sm:px-8 lg:px-14 xl:px-20">
      <div className="w-full lg:w-[42%] flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-sans text-[12px] md:text-[13px] font-medium uppercase tracking-[0.14em] text-[#933E29]">
            0{index + 1} // OUR SERVICE
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#665B54]">
            0{index + 1} / 0{total}
          </span>
        </div>

        <h2 className="font-sans text-[28px] sm:text-[38px] lg:text-[42px] xl:text-[48px] font-semibold uppercase leading-[1.02] tracking-[-0.04em] text-[#1A1614]">
          {slide.name}
        </h2>

        <p className="font-sans text-[14px] md:text-[15px] leading-[1.55] text-[#665B54]">
          {slide.description}
        </p>

        <ul className="divide-y divide-[#1A1614]/15 border-y border-[#1A1614]/15">
          {slide.services.slice(0, 4).map((srv, sIdx) => {
            const displayPrice = srv.offer_price || srv.base_price || 90;
            return (
              <li key={srv.id || sIdx}>
                <button
                  type="button"
                  onClick={() => onBook(srv)}
                  className="group flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-[#EAE0D2]/60 px-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-4 w-4 shrink-0 text-[#B4563E]"
                      aria-hidden="true"
                    >
                      <circle
                        cx="10"
                        cy="10"
                        r="8.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M6.5 10.2L8.9 12.6L13.8 7.6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="square"
                      />
                    </svg>
                    <span className="truncate font-sans text-[14px] font-medium text-[#1A1614] group-hover:text-[#933E29]">
                      {srv.name}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 font-mono text-[12px] text-[#665B54]">
                    <span>{srv.duration_minutes || 60}m</span>
                    <span className="font-semibold text-[#1A1614]">
                      {currencySymbol}{displayPrice}
                    </span>
                    <span className="text-[#B4563E] transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <NivoraButton
            variant="primary"
            size="md"
            onClick={() => onBook(slide.services[0] || { name: slide.name })}
          >
            Book {slide.name}
          </NivoraButton>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                aria-label={`View service slide ${dotIdx + 1}`}
                onClick={() => onSelectSlide(dotIdx)}
                className={`h-1.5 transition-all duration-300 ${
                  dotIdx === index
                    ? 'w-7 bg-[#B4563E]'
                    : 'w-3 bg-[#1A1614]/25 hover:bg-[#B4563E]/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Frame with Stacked Copper Offset Layer + BL+BR #B4563E Corner Brackets */}
      <div className="w-full lg:w-[58%]">
        <div className="relative border border-[#B4563E]/40 bg-[#FFFDF8] p-2.5 sm:p-3 shadow-[10px_10px_0px_rgba(180,86,62,0.18)]">
          <CornerMarks bl br size={12} thickness={2} color="text-[#B4563E]" />
          <div className="relative aspect-[16/11] sm:aspect-[1.426] lg:max-h-[54vh] w-full overflow-hidden bg-[#EAE0D2]">
            <SafeImage
              src={slide.image}
              alt={slide.name}
              fallbackLabel={slide.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4 border border-[#B4563E] bg-[#FFFDF8]/95 px-3 py-1.5 backdrop-blur-sm">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#933E29]">
                {slide.services.length} Rituals Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesShowcase() {
  const { categories, services, payments } = usePublic();
  const currencySymbol = payments?.currency_symbol || '₹';
  const { openBooking } = useBooking();
  const trackWrapperRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = useMemo(() => {
    if (!categories || categories.length === 0 || !services || services.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    const grouped = categories
      .map((cat, idx) => {
        const matched = services.filter(
          (s) => s.category_id === cat.id || s.category_slug === cat.slug
        );
        if (matched.length === 0) return null;
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description:
            cat.description || FALLBACK_CATEGORIES[idx % FALLBACK_CATEGORIES.length].description,
          image:
            cat.image_url ||
            CATEGORY_IMAGES[idx % CATEGORY_IMAGES.length],
          services: matched,
        };
      })
      .filter(Boolean);

    return grouped.length > 0 ? grouped : FALLBACK_CATEGORIES;
  }, [categories, services]);

  const { scrollYProgress: enterProgress } = useScroll({
    target: trackWrapperRef,
    offset: ['start end', 'start start'],
  });
  const enterScale = useTransform(enterProgress, [0, 1], [0.84, 1]);
  const enterRotateX = useTransform(enterProgress, [0, 1], [-12, 0]);
  const enterRotateY = useTransform(enterProgress, [0, 1], [-14, 0]);

  const { scrollYProgress: slideProgress } = useScroll({
    target: trackWrapperRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(slideProgress, 'change', (latest) => {
    if (slides.length <= 1) return;
    const rawIdx = Math.min(
      slides.length - 1,
      Math.max(0, Math.floor(latest * slides.length * 0.999))
    );
    setActiveSlide(rawIdx);
  });

  return (
    <section
      id="services"
      className="relative w-full border-t border-[#1A1614]/15 bg-[#F7F1E8]"
    >
      <div
        ref={trackWrapperRef}
        className="hidden lg:block relative w-full"
        style={{ height: `${Math.max(slides.length, 2) * 95}vh` }}
      >
        <div className="bg-atelier-grid sticky top-0 flex min-h-[100vh] w-full flex-col justify-center overflow-hidden bg-[#F7F1E8] py-8">
          <div className="mx-auto mb-6 flex w-full max-w-[1520px] items-center justify-between px-14 xl:px-20">
            <div className="flex flex-wrap items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`border px-3.5 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${
                    activeSlide === idx
                      ? 'border-[#B4563E] bg-[#B4563E] text-[#FFFDF8]'
                      : 'border-[#1A1614]/20 bg-[#FFFDF8] text-[#665B54] hover:border-[#B4563E] hover:text-[#1A1614]'
                  }`}
                >
                  0{idx + 1} / {s.name}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#665B54]">
              Scroll or Select Category
            </span>
          </div>

          <motion.div
            style={{
              scale: enterScale,
              rotateX: enterRotateX,
              rotateY: enterRotateY,
              transformPerspective: 1200,
            }}
            className="mx-auto w-full max-w-[1520px] overflow-hidden will-change-transform"
          >
            <motion.div
              animate={{ x: `-${activeSlide * 100}%` }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full items-center"
            >
              {slides.map((slide, idx) => (
                <ServiceSlideContent
                  key={slide.id || idx}
                  slide={slide}
                  index={idx}
                  total={slides.length}
                  currencySymbol={currencySymbol}
                  onSelectSlide={setActiveSlide}
                  onBook={(srv) => openBooking(srv)}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="bg-atelier-grid lg:hidden py-16">
        <div className="mb-8 flex flex-wrap justify-center gap-2 px-5">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`border px-3.5 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
                activeSlide === idx
                  ? 'border-[#B4563E] bg-[#B4563E] text-[#FFFDF8]'
                  : 'border-[#1A1614]/20 bg-[#FFFDF8] text-[#665B54]'
              }`}
            >
              0{idx + 1} // {s.name}
            </button>
          ))}
        </div>

        <ServiceSlideContent
          slide={slides[activeSlide] || slides[0]}
          index={activeSlide}
          total={slides.length}
          currencySymbol={currencySymbol}
          onSelectSlide={setActiveSlide}
          onBook={(srv) => openBooking(srv)}
        />
      </div>
    </section>
  );
}
