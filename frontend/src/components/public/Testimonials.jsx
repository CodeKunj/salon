import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import CornerMarks from '../common/CornerMarks';
import SafeImage from '../common/SafeImage';
import { CursorScope, NivoraSectionHeader } from '../common/NivoraPrimitives';

const LOGO_HOUSES = [
  'VOGUE ATELIER',
  'ORIBE PARIS',
  'BIOLOGIQUE RECHERCHE',
  'AUGUSTINUS BOTANICA',
  'HARPER’S BEAUTY',
  'SISLEY STUDIO',
  'SHISEIDO LABS',
];

const FALLBACK_REVIEWS = [
  {
    id: 'rev-1',
    client_name: 'Camille Laurent',
    client_role: 'Editorial Fashion Director',
    service_tag: 'Signature Cut & Gloss',
    review_text:
      'Every detail inside RiTiVerse feels deliberate — soothing ambient glow, zero hurry, and the most natural movement my hair has ever held.',
    avatar_url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rev-2',
    client_name: 'Noor Al-Mansoor',
    client_role: 'Bridal Client',
    service_tag: 'Bridal Atelier Suite',
    review_text:
      'From my skin prep trial two weeks ahead to ceremony morning, my complexion stayed luminous in person and on 35mm film for fourteen hours.',
    avatar_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rev-3',
    client_name: 'Hannah Lindqvist',
    client_role: 'Creative Architect',
    service_tag: 'Glass-Skin Infusion',
    review_text:
      'A serene oasis away from loud salons. My aesthetician mapped every step cleanly and left my sensitive skin genuinely glowing.',
    avatar_url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rev-4',
    client_name: 'Sofia Patel',
    client_role: 'Art Curator',
    service_tag: 'Botanical Balayage',
    review_text:
      'Six months after my session the dimension still grows out seamlessly. Clean formulations, thoughtful pacing, unmatched color restraint.',
    avatar_url:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Testimonials() {
  const { testimonials } = usePublic();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const items = useMemo(() => {
    const raw =
      testimonials && testimonials.length > 0 ? testimonials : FALLBACK_REVIEWS;
    return raw.map((rev, i) => ({
      ...rev,
      avatar_url:
        rev.avatar_url ||
        rev.image_url ||
        FALLBACK_REVIEWS[i % FALLBACK_REVIEWS.length].avatar_url,
    }));
  }, [testimonials]);

  const paginate = (dir) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + items.length) % items.length);
  };

  const active = items[index] || items[0];

  return (
    <section
      id="testimonials"
      className="relative w-full border-t border-[#1A1614]/15 bg-gradient-to-b from-[#ECE2D4] via-[#E4D7C6] to-[#ECE2D4] px-4 sm:px-10 lg:px-12 py-16 md:py-28 text-[#1A1614]"
    >
      <div className="bg-atelier-grid-deep pointer-events-none absolute inset-0 opacity-45" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <NivoraSectionHeader
          eyebrow="06 // Client Praise"
          title="What Are They Saying?"
          description="Trusted by bridal clients, creative directors, and regulars who value unhurried precision."
        />

        <div
          className="mx-auto mt-10 max-w-[1060px] overflow-hidden py-4 border-y border-[#1A1614]/15"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          }}
        >
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="flex w-max items-center gap-12 whitespace-nowrap pr-12"
          >
            {[...LOGO_HOUSES, ...LOGO_HOUSES].map((house, idx) => (
              <span
                key={`${house}-${idx}`}
                className="font-sans text-xs md:text-sm font-semibold uppercase tracking-[0.22em] text-[#1A1614]/75 transition-colors hover:text-[#933E29]"
              >
                {house}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="mx-auto mt-14 max-w-[960px]">
          <CursorScope label="Drag to explore">
            <div className="relative overflow-hidden border border-[#B4563E]/45 bg-[#FFFDF8] p-4 sm:p-6 md:p-8 shadow-[10px_10px_0px_rgba(180,86,62,0.18)]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={active.id || index}
                  custom={direction}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -50) paginate(1);
                    else if (info.offset.x > 50) paginate(-1);
                  }}
                  initial={{ opacity: 0, x: direction > 0 ? 48 : -48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -48 : 48 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="grid cursor-grab active:cursor-grabbing grid-cols-1 md:grid-cols-12 items-stretch gap-6 md:gap-8 select-none"
                >
                  <div className="md:col-span-7 flex flex-col justify-between gap-8 py-2">
                    <div className="space-y-4 sm:space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <svg
                          width="34"
                          height="26"
                          viewBox="0 0 34 26"
                          fill="none"
                          className="text-[#B4563E]"
                          aria-hidden="true"
                        >
                          <path
                            d="M14.5 0H0V14.5H7.25C7.25 18.8 4.4 21.8 0 22.8V26C8.8 25.2 14.5 19.3 14.5 10.6V0ZM34 0H19.5V14.5H26.75C26.75 18.8 23.9 21.8 19.5 22.8V26C28.3 25.2 34 19.3 34 10.6V0Z"
                            fill="currentColor"
                          />
                        </svg>
                        {active.service_tag && (
                          <span className="border border-[#B4563E]/35 bg-[#F3E7DB] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#933E29]">
                            {active.service_tag}
                          </span>
                        )}
                      </div>

                      <blockquote className="font-sans text-[17px] sm:text-[22px] lg:text-[24px] font-medium leading-[1.38] sm:leading-[1.35] tracking-[-0.02em] text-[#1A1614]">
                        “{active.review_text || active.content}”
                      </blockquote>
                    </div>

                    <div className="border-l-2 border-[#B4563E] pl-4">
                      <p className="font-sans text-sm font-semibold uppercase tracking-[0.06em] text-[#1A1614]">
                        {active.client_name}
                      </p>
                      <p className="mt-0.5 font-sans text-xs uppercase tracking-[0.08em] text-[#665B54]">
                        {active.client_role || active.service_tag || 'RiTiVerse Client'}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="relative h-[240px] sm:h-[300px] md:h-[360px] w-full border border-[#B4563E]/40 bg-[#F7F1E8] p-2.5">
                      <CornerMarks all size={12} thickness={2} color="text-[#B4563E]" />
                      <div className="h-full w-full overflow-hidden bg-[#EAE0D2]">
                        <SafeImage
                          src={active.avatar_url}
                          alt={active.client_name}
                          fallbackLabel={active.client_name}
                          draggable={false}
                          className="pointer-events-none h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </CursorScope>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {items.map((rev, i) => (
                <button
                  key={rev.id || i}
                  type="button"
                  aria-label={`View review ${i + 1}`}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`h-1.5 transition-all duration-300 ${
                    i === index ? 'w-8 bg-[#1A1614]' : 'w-3 bg-[#1A1614]/25 hover:bg-[#1A1614]/55'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="mr-2 font-mono text-xs text-[#1A1614] tabular-nums">
                0{index + 1} / 0{items.length}
              </span>
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => paginate(-1)}
                className="flex h-10 w-10 items-center justify-center border border-[#1A1614]/25 bg-[#FFFDF8] text-sm text-[#1A1614] transition-colors hover:border-[#B4563E] hover:bg-[#B4563E] hover:text-[#FFFDF8]"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => paginate(1)}
                className="flex h-10 w-10 items-center justify-center border border-[#1A1614]/25 bg-[#FFFDF8] text-sm text-[#1A1614] transition-colors hover:border-[#B4563E] hover:bg-[#B4563E] hover:text-[#FFFDF8]"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
