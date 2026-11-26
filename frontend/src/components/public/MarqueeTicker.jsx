import React from 'react';
import { motion } from 'framer-motion';

const RIBBON_TAGS = [
  'RITIVERSE ATELIER',
  'HAUTE COIFFURE',
  'GLASS-SKIN THERAPY',
  'BRIDAL COUTURE',
  'JAPANESE NAIL ART',
  'PRIVATE SANCTUARY SUITES',
];

export default function MarqueeTicker() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden border-y border-[#1A1614]/20 bg-gradient-to-r from-[#211C18] via-[#1B1714] to-[#211C18] py-3.5 text-[#F7F1E8]"
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="flex w-max items-center whitespace-nowrap"
      >
        {[...RIBBON_TAGS, ...RIBBON_TAGS].map((label, idx) => (
          <div key={`${label}-${idx}`} className="flex items-center">
            <span className="px-6 font-sans text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.18em]">
              {label}
            </span>
            <span className="text-[#D6A984] text-xs">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
