import React from 'react';
import { motion } from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import CornerMarks from '../common/CornerMarks';
import SafeImage from '../common/SafeImage';
import {
  CursorScope,
  NivoraButton,
  TiltCard3D,
  WordBlurReveal,
} from '../common/NivoraPrimitives';

const FALLBACK_CARDS = [
  {
    id: 'phil-1',
    title: 'Sculpted Silhouette',
    tag: 'Precision Haircut & Gloss',
    image_url:
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'phil-2',
    title: 'Cellular Glass Skin',
    tag: 'Botanical Dermal Ritual',
    image_url:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
  },
];

export default function Philosophy() {
  const { gallery, salon } = usePublic();
  const { openBooking } = useBooking();

  const showcaseItems =
    gallery && gallery.length >= 2 ? gallery.slice(0, 2) : FALLBACK_CARDS;

  const editorialStatement =
    salon?.philosophy ||
    'At RiTiVerse, beauty is an *architectural* ritual — uniting precision hair sculpture, *botanical* skin radiance, and calm *warm-lit* hospitality tailored distinctly to you.';

  return (
    <section
      id="philosophy"
      className="relative w-full overflow-x-clip bg-[#F7F1E8] px-4 sm:px-10 lg:px-12 py-14 sm:py-16 md:py-28"
    >
      <div className="bg-atelier-grid pointer-events-none absolute inset-0 opacity-65" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-16 left-0 h-60 w-60 sm:h-96 sm:w-96 -translate-x-1/3 rounded-full bg-[#D6A984]/35 blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-10">
        {/* Left Sticky Column (~68% width) */}
        <div className="w-full lg:w-[68%] lg:max-w-[940px] lg:sticky lg:top-[100px]">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-[2px] w-7 bg-[#B4563E]" />
            <span className="font-sans text-[12px] md:text-[13px] font-medium uppercase tracking-[0.16em] text-[#933E29]">
              01 // The RiTiVerse Ethos
            </span>
          </div>

          <WordBlurReveal
            text={editorialStatement}
            className="font-sans text-[24px] min-[400px]:text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-medium leading-[1.18] sm:leading-[1.16] tracking-[-0.03em] text-[#1A1614]"
          />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#1A1614]/15 pt-7"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#933E29]">
                01 / Craft
              </p>
              <p className="mt-1.5 font-sans text-sm font-medium text-[#1A1614]">
                Bespoke facial & bone-structure mapping
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#933E29]">
                02 / Purity
              </p>
              <p className="mt-1.5 font-sans text-sm font-medium text-[#1A1614]">
                Hospital-grade sterilization & clean botanicals
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#933E29]">
                03 / Pace
              </p>
              <p className="mt-1.5 font-sans text-sm font-medium text-[#1A1614]">
                Zero-rush booking in serene private suites
              </p>
            </div>
          </motion.div>

          <div className="mt-8">
            <NivoraButton variant="primary" size="sm" onClick={() => openBooking()}>
              Reserve Private Suite →
            </NivoraButton>
          </div>
        </div>

        {/* Right Sculpted Offset Portrait Cards */}
        <CursorScope
          label="Preview lookbook"
          className="w-full lg:w-[25%] xl:w-[23%] flex flex-col gap-8 sm:grid sm:grid-cols-2 lg:flex lg:flex-col"
        >
          {showcaseItems.map((item, idx) => (
            <motion.article
              key={item.id || idx}
              initial={{ opacity: 0, y: 64 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: 0.7,
                delay: idx * 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => openBooking({ name: item.title })}
              className="group relative cursor-pointer border border-[#B4563E]/40 bg-[#FFFDF8] p-3 shadow-[8px_8px_0px_rgba(180,86,62,0.18)] transition-all duration-300 hover:border-[#B4563E] hover:shadow-[8px_8px_0px_rgba(26,22,20,0.2)]"
            >
              <CornerMarks
                tl
                br
                size={12}
                thickness={2}
                color="text-[#B4563E]"
              />

              <TiltCard3D maxTilt={10} maxMove={14} hoverScale={1.04}>
                <div className="relative aspect-[0.7458] w-full overflow-hidden bg-[#EAE0D2]">
                  <SafeImage
                    src={item.image_url || FALLBACK_CARDS[idx % 2].image_url}
                    fallbackSrc={FALLBACK_CARDS[idx % 2].image_url}
                    alt={item.title}
                    fallbackLabel={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </TiltCard3D>

              <div className="flex items-start justify-between gap-2 pt-3">
                <div>
                  <h3 className="font-sans text-[17px] font-semibold uppercase tracking-[-0.02em] text-[#1A1614] transition-colors group-hover:text-[#933E29]">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[#665B54]">
                    {item.category_label || item.tag || item.category || 'Signature Ritual'}
                  </p>
                </div>
                <span className="font-sans text-sm text-[#B4563E] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </div>
            </motion.article>
          ))}
        </CursorScope>
      </div>
    </section>
  );
}
