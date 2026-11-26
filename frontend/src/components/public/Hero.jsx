import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import CornerMarks from '../common/CornerMarks';
import SafeImage from '../common/SafeImage';
import { CursorScope, NivoraButton, TiltCard3D } from '../common/NivoraPrimitives';

const DEFAULT_HERO_IMG =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1800&q=85';

const FLANK_LEFT = {
  title: 'Sculpted Bob',
  tag: 'Hair Architecture · ₹95',
  image:
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=640&q=80',
};

const FLANK_RIGHT = {
  title: 'Glass-Skin Veil',
  tag: 'Dermal Ritual · ₹165',
  image:
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=640&q=80',
};

export default function Hero() {
  const { hero, gallery, salon } = usePublic();
  const { openBooking } = useBooking();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 190]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.55]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const leftCardY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const rightCardY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const rawHeadline = (hero?.headline || 'SCULPTED IN SILK').trim();
  const words = rawHeadline.split(/\s+/);
  const accentWord = words.length > 1 ? words[words.length - 1] : '';
  const leadWords = words.length > 1 ? words.slice(0, -1).join(' ') : rawHeadline;

  const eyebrowText =
    hero?.badge_text || 'RITIVERSE • HAIR, DERMAL & BRIDAL SANCTUARY';
  const leadingLine =
    salon?.tagline ||
    'WHERE HAUTE COUTURE HAIRCRAFT, BOTANICAL SKINCARE, AND LUMINOUS ATELIER CALM CONVERGE.';
  const trailingLine =
    hero?.subheadline ||
    'ARCHITECTURAL CUTS, GLASS-SKIN INFUSIONS, AND BESPOKE BRIDAL RITUALS CRAFTED IN SERENE POISE.';

  const leftPlate = gallery?.[0]
    ? {
        title: gallery[0].title,
        tag: gallery[0].tag || gallery[0].category || 'Signature Hair',
        image: gallery[0].image_url,
      }
    : FLANK_LEFT;

  const rightPlate = gallery?.[1]
    ? {
        title: gallery[1].title,
        tag: gallery[1].tag || gallery[1].category || 'Dermal Atelier',
        image: gallery[1].image_url,
      }
    : FLANK_RIGHT;

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#EFE5D8] via-[#F7F1E8] to-[#EDE2D3] pt-24 pb-20 sm:pb-24 text-[#1A1614]"
    >
      {/* Warm Champagne Silk Atmospheric Backdrops + Copper Hairline Grid */}
      <motion.div
        style={{ scale: bgScale }}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <SafeImage
          src={hero?.hero_image || DEFAULT_HERO_IMG}
          fallbackSrc={DEFAULT_HERO_IMG}
          alt=""
          className="h-full w-full object-cover object-center opacity-25 mix-blend-multiply saturate-110"
        />
        <div className="bg-atelier-grid-deep absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#EFE5D8]/75 via-[#F7F1E8]/65 to-[#EDE2D3]/90" />
        <motion.div
          animate={{ scale: [1, 1.14, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 left-1/4 h-[280px] w-[280px] sm:h-[460px] sm:w-[460px] lg:h-[520px] lg:w-[520px] -translate-x-1/2 rounded-full bg-[#D6A984]/40 blur-[130px]"
        />
        <motion.div
          animate={{ scale: [1.08, 0.96, 1.08], opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-1/4 h-[260px] w-[260px] sm:h-[420px] sm:w-[420px] lg:h-[460px] lg:w-[460px] translate-x-1/3 rounded-full bg-[#C97856]/30 blur-[120px]"
        />
      </motion.div>

      {/* Outer Framing Corner Brackets */}
      <div className="pointer-events-none absolute inset-3 sm:inset-5 md:inset-10 z-10">
        <CornerMarks all size={14} thickness={2} color="text-[#B4563E]/70" />
      </div>

      {/* Left Floating Editorial Portrait Plate (Desktop xl+) */}
      <motion.div
        style={{ y: leftCardY }}
        initial={{ opacity: 0, x: -60, rotate: -4 }}
        animate={{ opacity: 1, x: 0, rotate: -2 }}
        transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="hidden xl:block absolute left-10 bottom-20 z-20 w-[210px]"
      >
        <CursorScope label="Book look">
          <div
            onClick={() => openBooking({ name: leftPlate.title })}
            className="group relative cursor-pointer border border-[#B4563E]/45 bg-[#FFFDF8]/95 p-2.5 backdrop-blur-md shadow-[8px_8px_0px_rgba(180,86,62,0.2)]"
          >
            <CornerMarks tl br size={10} thickness={2} color="text-[#B4563E]" />
            <TiltCard3D maxTilt={10} maxMove={12} hoverScale={1.04}>
              <div className="aspect-[0.76] w-full overflow-hidden bg-[#EAE0D2]">
                <SafeImage
                  src={leftPlate.image}
                  fallbackSrc={FLANK_LEFT.image}
                  alt={leftPlate.title}
                  fallbackLabel={leftPlate.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </TiltCard3D>
            <div className="pt-2.5 text-left">
              <p className="truncate font-sans text-xs font-semibold uppercase tracking-wider text-[#1A1614] group-hover:text-[#933E29]">
                {leftPlate.title}
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-wider text-[#665B54]">
                {leftPlate.tag}
              </p>
            </div>
          </div>
        </CursorScope>
      </motion.div>

      {/* Right Floating Editorial Portrait Plate (Desktop xl+) */}
      <motion.div
        style={{ y: rightCardY }}
        initial={{ opacity: 0, x: 60, rotate: 4 }}
        animate={{ opacity: 1, x: 0, rotate: 2 }}
        transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="hidden xl:block absolute right-10 top-28 z-20 w-[210px]"
      >
        <CursorScope label="Book ritual">
          <div
            onClick={() => openBooking({ name: rightPlate.title })}
            className="group relative cursor-pointer border border-[#B4563E]/45 bg-[#FFFDF8]/95 p-2.5 backdrop-blur-md shadow-[8px_8px_0px_rgba(180,86,62,0.2)]"
          >
            <CornerMarks tr bl size={10} thickness={2} color="text-[#B4563E]" />
            <TiltCard3D maxTilt={10} maxMove={12} hoverScale={1.04}>
              <div className="aspect-[0.76] w-full overflow-hidden bg-[#EAE0D2]">
                <SafeImage
                  src={rightPlate.image}
                  fallbackSrc={FLANK_RIGHT.image}
                  alt={rightPlate.title}
                  fallbackLabel={rightPlate.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </TiltCard3D>
            <div className="pt-2.5 text-left">
              <p className="truncate font-sans text-xs font-semibold uppercase tracking-wider text-[#1A1614] group-hover:text-[#933E29]">
                {rightPlate.title}
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-wider text-[#665B54]">
                {rightPlate.tag}
              </p>
            </div>
          </div>
        </CursorScope>
      </motion.div>

      {/* Centered Hero Focal Stage */}
      <motion.div
        style={{ y: contentY, scale: contentScale, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-col items-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 text-center will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex max-w-full items-center gap-2 border border-[#B4563E]/45 bg-[#FFFDF8]/95 px-3 sm:px-4 py-1.5 backdrop-blur-md shadow-sm"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2FA66A] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2FA66A]" />
          </span>
          <span className="font-sans text-[10px] sm:text-[11px] md:text-[12px] font-medium uppercase tracking-[0.11em] sm:tracking-[0.16em] text-[#933E29]">
            {eyebrowText}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: -28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[540px] font-sans text-[11px] md:text-[13px] font-medium uppercase leading-[1.45] tracking-[0.07em] sm:tracking-[0.09em] text-[#665B54]"
        >
          {leadingLine}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0.001, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 22,
            delay: 0.1,
          }}
          className="max-w-full break-words font-sans text-[36px] min-[380px]:text-[42px] sm:text-[64px] md:text-[86px] xl:text-[116px] font-semibold uppercase leading-[0.95] sm:leading-[0.9] tracking-[-0.04em] sm:tracking-[-0.05em] text-[#1A1614]"
        >
          {leadWords}{' '}
          {accentWord && (
            <span
              style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}
              className="italic font-normal text-[#B4563E] drop-shadow-[0_6px_24px_rgba(180,86,62,0.28)]"
            >
              {accentWord}
            </span>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[580px] font-sans text-[11px] sm:text-[12px] md:text-[14px] font-medium uppercase leading-[1.5] tracking-[0.06em] sm:tracking-[0.07em] text-[#665B54]"
        >
          {trailingLine}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2"
        >
          <NivoraButton
            variant="primary"
            size="md"
            onClick={() => openBooking()}
            className="w-full sm:w-auto"
          >
            <span>{hero?.cta_text || 'Schedule a Visit'}</span>
            <span aria-hidden="true">↗</span>
          </NivoraButton>

          <NivoraButton
            variant="border-rose"
            size="md"
            href="#lookbook"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector('#lookbook')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto"
          >
            <span>Explore Lookbook</span>
          </NivoraButton>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.6 }}
        className="pointer-events-none hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#933E29]">
          Scroll to Explore
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="h-5 w-[1.5px] bg-[#B4563E]"
        />
      </motion.div>
    </section>
  );
}
