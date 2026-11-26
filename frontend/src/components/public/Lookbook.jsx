import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import CornerMarks from '../common/CornerMarks';
import SafeImage from '../common/SafeImage';
import {
  CursorScope,
  NivoraButton,
  NivoraSectionHeader,
  TiltCard3D,
} from '../common/NivoraPrimitives';

const DEFAULT_LOOKBOOK = [
  {
    id: 'look-1',
    title: 'Silk Architectural Bob',
    category: 'Hair Styling',
    description:
      'Precision geometric graduation finished with botanical keratin gloss.',
    image_url:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'look-2',
    title: 'Luminous Bridal Veil',
    category: 'Bridal Makeup',
    description:
      'Skin-first complexion luminosity with warm champagne & bronze undertones.',
    image_url:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'look-3',
    title: 'Dewy Peptide Facial',
    category: 'Skincare',
    description:
      'Ultrasonic micro-exfoliation and cryo-peptide veil for mirror-like clarity.',
    image_url:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'look-4',
    title: 'Minimal Pearl Chrome',
    category: 'Nail Art',
    description:
      'Japanese builder gel architecture topped with translucent pearl glaze.',
    image_url:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'look-5',
    title: 'Champagne Balayage',
    category: 'Hair Styling',
    description:
      'Hand-painted dimensional lightness with bond-rebuilding treatment.',
    image_url:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'look-6',
    title: 'Sculpting Gua Sha',
    category: 'Spa',
    description:
      'Lymphatic contour therapy paired with warm camellia aromatherapy.',
    image_url:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'look-7',
    title: 'Atelier Chignon',
    category: 'Bridal Makeup',
    description:
      'Weightless pinned knot engineered to hold effortlessly from ceremony to midnight.',
    image_url:
      'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'look-8',
    title: 'Hydra Calm Therapy',
    category: 'Skincare',
    description:
      'Barrier-restoring ceramide infusion under soothing warm quartz masks.',
    image_url:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
  },
];

export default function Lookbook() {
  const { gallery } = usePublic();
  const { openBooking } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePreview, setActivePreview] = useState(null);

  const items = useMemo(() => {
    return gallery && gallery.length > 0 ? gallery : DEFAULT_LOOKBOOK;
  }, [gallery]);

  const categories = useMemo(() => {
    const labels = new Set(['All']);
    items.forEach((item) => {
      const lbl = item.category_label || item.category || item.tag;
      if (lbl) labels.add(lbl);
    });
    return Array.from(labels);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(
      (item) =>
        (item.category_label || item.category || item.tag) === selectedCategory
    );
  }, [items, selectedCategory]);

  return (
    <section
      id="lookbook"
      className="relative w-full overflow-hidden border-t border-[#1A1614]/15 bg-gradient-to-b from-[#ECE2D4] via-[#E4D7C6] to-[#ECE2D4] px-4 sm:px-10 lg:px-12 py-16 md:py-28 text-[#1A1614]"
    >
      <div className="bg-atelier-grid-deep pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-24 right-1/4 h-[260px] w-[260px] sm:h-[420px] sm:w-[420px] rounded-full bg-[#D6A984]/30 blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-[1600px]">
        <NivoraSectionHeader
          eyebrow="02 // Curated Portfolio"
          title="Our Work"
          description="Hair artistry, bridal glamour, glass-skin therapy, and botanical spa rituals captured in natural studio light."
        />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 font-sans text-[12px] font-medium uppercase tracking-[0.08em] transition-all duration-200 border ${
                  active
                    ? 'border-[#B4563E] bg-[#B4563E] text-[#FFFDF8] shadow-[0_8px_22px_-6px_rgba(180,86,62,0.45)]'
                    : 'border-[#1A1614]/20 bg-[#FFFDF8]/90 text-[#1A1614] hover:border-[#B4563E] hover:text-[#933E29]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <CursorScope label="Preview lookbook">
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredItems.map((item, idx) => (
              <motion.article
                key={item.id || `${item.title}-${idx}`}
                layout
                initial={{ opacity: 0, x: 48, y: -36 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.65,
                  delay: (idx % 4) * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => setActivePreview(item)}
                className="group relative cursor-pointer border border-[#B4563E]/40 bg-[#FFFDF8] p-3 shadow-[8px_8px_0px_rgba(180,86,62,0.18)] transition-all duration-300 hover:border-[#B4563E] hover:shadow-[8px_8px_0px_rgba(26,22,20,0.22)]"
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
                      src={item.image_url}
                      alt={item.title}
                      fallbackLabel={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </TiltCard3D>

                <div className="pt-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-sans text-[18px] md:text-[20px] font-semibold uppercase leading-tight tracking-[-0.02em] text-[#1A1614] transition-colors group-hover:text-[#933E29]">
                      {item.title}
                    </h3>
                    <span className="font-sans text-xs text-[#B4563E] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#665B54]">
                    {item.category_label || item.tag || item.category}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </CursorScope>
      </div>

      {/* Editorial Lookbook Lightbox Modal */}
      <AnimatePresence>
        {activePreview && (
          <motion.div
            key="lookbook-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePreview(null)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1A1614]/55 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative grid w-full max-w-[820px] max-h-[92dvh] overflow-y-auto grid-cols-1 md:grid-cols-2 border border-[#B4563E] bg-[#F7F1E8] p-4 md:p-6 gap-5 sm:gap-6 shadow-2xl"
            >
              <CornerMarks all size={14} thickness={2} color="text-[#B4563E]" />

              <div className="aspect-[4/3] md:aspect-[0.8] max-h-[38vh] md:max-h-none w-full overflow-hidden bg-[#EAE0D2]">
                <SafeImage
                  src={activePreview.image_url}
                  alt={activePreview.title}
                  fallbackLabel={activePreview.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between gap-5 sm:gap-6 py-1 sm:py-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[#933E29]">
                      {activePreview.category_label || activePreview.tag || activePreview.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivePreview(null)}
                      aria-label="Close lookbook preview"
                      className="flex h-8 w-8 items-center justify-center border border-[#1A1614]/25 bg-[#FFFDF8] text-sm font-medium text-[#1A1614] hover:border-[#B4563E] hover:text-[#933E29]"
                    >
                      ✕
                    </button>
                  </div>

                  <h3 className="mt-4 font-sans text-3xl font-semibold uppercase tracking-[-0.03em] text-[#1A1614]">
                    {activePreview.title}
                  </h3>

                  <p className="mt-4 font-sans text-sm leading-relaxed text-[#665B54]">
                    {activePreview.description ||
                      'Tailored by our RiTiVerse specialists with botanical formulations and soft-focus editorial finish.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-[#1A1614]/15 pt-5">
                  <NivoraButton
                    variant="primary"
                    size="md"
                    onClick={() => {
                      const title = activePreview.title;
                      setActivePreview(null);
                      openBooking({ name: title });
                    }}
                  >
                    Book This Look
                  </NivoraButton>
                  <NivoraButton
                    variant="border"
                    size="md"
                    onClick={() => setActivePreview(null)}
                  >
                    Close
                  </NivoraButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
