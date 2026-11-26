import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import CornerMarks from '../common/CornerMarks';
import SafeImage from '../common/SafeImage';
import { NivoraButton } from '../common/NivoraPrimitives';

const FALLBACK_STYLISTS = [
  {
    id: 'st-1',
    name: 'Aria Laurent',
    role_title: 'Creative Hair Director',
    image_url:
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'st-2',
    name: 'Elena Sato',
    role_title: 'Lead Dermal Therapist',
    image_url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'st-3',
    name: 'Marcus Vance',
    role_title: 'Senior Color Architect',
    image_url:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'st-4',
    name: 'Nadia Moreau',
    role_title: 'Bridal Atelier Lead',
    image_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'st-5',
    name: 'Sora Takahashi',
    role_title: 'Nail Couture Artist',
    image_url:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'st-6',
    name: 'Claire Dubois',
    role_title: 'Holistic Spa Specialist',
    image_url:
      'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'st-7',
    name: 'Julian Reyes',
    role_title: 'Editorial Stylist',
    image_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'st-8',
    name: 'Mia Chen',
    role_title: 'Skin Luminosity Aesthetician',
    image_url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80',
  },
];

function TeamCard({ stylist, onBook }) {
  return (
    <article
      onClick={() => onBook(stylist)}
      className="group relative cursor-pointer border border-[#B4563E]/35 bg-[#FFFDF8] p-3 backdrop-blur-md shadow-[8px_8px_0px_rgba(180,86,62,0.16)] transition-all duration-300 hover:border-[#B4563E] hover:shadow-[8px_8px_0px_rgba(26,22,20,0.2)]"
    >
      <CornerMarks
        tr
        bl
        size={12}
        thickness={2}
        color="text-[#B4563E]"
      />

      <div className="relative aspect-square w-full overflow-hidden bg-[#EAE0D2]">
        <SafeImage
          src={stylist.avatar_url || stylist.image_url}
          alt={stylist.name}
          fallbackLabel={stylist.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex items-end justify-between gap-2 pt-3">
        <div className="min-w-0">
          <h3 className="truncate font-sans text-[15px] font-semibold uppercase tracking-[0.02em] text-[#1A1614] transition-colors group-hover:text-[#933E29]">
            {stylist.name}
          </h3>
          <p className="truncate font-sans text-[12px] text-[#665B54]">
            {stylist.role_title || stylist.title || stylist.specialty || 'Salon Specialist'}
          </p>
        </div>

        <button
          type="button"
          aria-label={`Book appointment with ${stylist.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onBook(stylist);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#B4563E]/35 bg-[#F7F1E8] text-xs text-[#1A1614] transition-colors group-hover:border-[#B4563E] group-hover:bg-[#B4563E] group-hover:text-[#FFFDF8]"
        >
          ↗
        </button>
      </div>
    </article>
  );
}

export default function Stylists() {
  const { stylists } = usePublic();
  const { openBooking } = useBooking();

  const teamList = useMemo(() => {
    const raw =
      stylists && stylists.length > 0 ? stylists : FALLBACK_STYLISTS;
    return raw.map((st, idx) => ({
      ...st,
      avatar_url:
        st.avatar_url ||
        st.image_url ||
        FALLBACK_STYLISTS[idx % FALLBACK_STYLISTS.length].image_url,
    }));
  }, [stylists]);

  const columns = useMemo(() => {
    const cols = [[], [], [], []];
    teamList.forEach((member, idx) => {
      cols[idx % 4].push(member);
    });
    return cols;
  }, [teamList]);

  const handleBookStylist = (st) => {
    openBooking({
      stylist_id: st.id,
      stylist_name: st.name,
    });
  };

  return (
    <section
      id="team"
      className="relative w-full border-t border-[#1A1614]/15 bg-[#F7F1E8]"
    >
      <div className="bg-atelier-grid pointer-events-none absolute inset-0 opacity-65" aria-hidden="true" />

      <div className="relative lg:sticky lg:top-0 flex flex-col items-center justify-center py-14 sm:py-20 lg:py-0 lg:min-h-[100vh] px-4 sm:px-6 text-center z-0 pointer-events-none">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 sm:h-80 sm:w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D6A984]/35 blur-[110px]"
        />
        <div className="pointer-events-none absolute inset-4 sm:inset-6 md:inset-12">
          <CornerMarks bl br size={16} thickness={2} color="text-[#B4563E]/55" />
        </div>

        <motion.div
          initial={{ opacity: 0.001, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto relative z-10 flex max-w-full flex-col items-center gap-4 sm:gap-5"
        >
          <span className="inline-flex items-center gap-2 border border-[#B4563E] bg-[#FFFDF8]/90 px-3 py-1 font-sans text-[11px] sm:text-[12px] md:text-[13px] font-medium uppercase tracking-[0.14em] text-[#933E29]">
            05 // RiTiVerse Team
          </span>

          <h2 className="max-w-full break-words font-sans text-[40px] min-[400px]:text-[48px] sm:text-[74px] md:text-[96px] lg:text-[116px] xl:text-[136px] font-semibold uppercase leading-[0.9] sm:leading-[0.88] tracking-[-0.05em] text-[#1A1614]">
            Creative Minds
          </h2>

          <p className="max-w-[460px] font-sans text-xs md:text-sm uppercase tracking-[0.06em] text-[#665B54]">
            Master hair architects, clinical aestheticians, and bridal specialists crafting individualized beauty.
          </p>

          <div className="pt-2">
            <NivoraButton
              variant="primary"
              size="md"
              onClick={() => openBooking()}
            >
              Book With Our Team
            </NivoraButton>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0.2, rotateX: 16 }}
        whileInView={{ opacity: 1, rotateX: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformPerspective: 1200 }}
        className="relative z-10 mx-auto w-full max-w-[1520px] px-4 sm:px-10 lg:px-12 pb-16 sm:pb-24 lg:-mt-[72vh]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 xl:gap-10">
          {columns.map((colMembers, colIdx) => {
            const colOffsetClass =
              colIdx === 0
                ? 'lg:pt-0'
                : colIdx === 1
                ? 'lg:pt-36'
                : colIdx === 2
                ? 'lg:pt-16'
                : 'lg:pt-48';

            return (
              <div
                key={colIdx}
                className={`flex flex-col gap-6 lg:gap-16 ${colOffsetClass}`}
              >
                {colMembers.map((member, mIdx) => (
                  <React.Fragment key={member.id || `${colIdx}-${mIdx}`}>
                    <TeamCard
                      stylist={member}
                      onBook={handleBookStylist}
                    />
                    {colIdx % 2 === 0 && mIdx === 0 && (
                      <div className="hidden lg:block h-20" aria-hidden="true" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
