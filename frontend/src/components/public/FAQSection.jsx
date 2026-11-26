import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import { NivoraButton } from '../common/NivoraPrimitives';

const FALLBACK_FAQS = [
  {
    id: 'faq-1',
    question: 'How far ahead should I book weekend or bridal dates?',
    answer:
      'For weekend haircuts and dermal rituals we recommend booking 5–10 days ahead. Bridal suites and trial consultations are best reserved 4–12 weeks in advance so private chairs are locked exclusively for you.',
  },
  {
    id: 'faq-2',
    question: 'What is included in a complimentary consultation?',
    answer:
      'Every appointment opens with a 10-minute bone-structure, hair-density, or dermal barrier assessment so formula strength, tone, and finish are calibrated strictly to your texture and lifestyle.',
  },
  {
    id: 'faq-3',
    question: 'What is your cancellation or rescheduling policy?',
    answer:
      'Changes or cancellations made at least 24 hours before your reserved slot carry zero penalty. Inside 24 hours, deposits can be transferred smoothly to a future appointment or honored with an adjusted fee.',
  },
  {
    id: 'faq-4',
    question: 'Do you formulate with sensitive skin & clean brands?',
    answer:
      'Yes. All ammonia-free glosses, clinical serums, and Japanese nail gels are sulfate-free, paraben-free, and selected specifically for reactive scalps and delicate skin barriers.',
  },
  {
    id: 'faq-5',
    question: 'Can I reserve a stylist automatically if mine is full?',
    answer:
      'Yes — choose "Any Available Specialist" during booking to see every real-time opening across senior stylists calibrated cleanly around sanctuary buffer intervals.',
  },
];

export default function FAQSection() {
  const { faqs } = usePublic();
  const { openBooking } = useBooking();
  const [openIndex, setOpenIndex] = useState(0);

  const list = useMemo(() => {
    return faqs && faqs.length > 0 ? faqs : FALLBACK_FAQS;
  }, [faqs]);

  return (
    <section
      id="faq"
      className="relative w-full border-t border-[#1A1614]/15 bg-[#F7F1E8] px-4 sm:px-10 lg:px-12 py-16 md:py-28"
    >
      <div className="bg-atelier-grid pointer-events-none absolute inset-0 opacity-65" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16">
        <div className="w-full lg:w-[38%] lg:sticky lg:top-[104px] flex flex-col items-start gap-4 sm:gap-5">
          <span className="inline-flex items-center gap-2 border border-[#B4563E] bg-[#FFFDF8]/90 px-3 py-1 font-sans text-[12px] md:text-[13px] font-medium uppercase tracking-[0.14em] text-[#933E29]">
            07 // Information
          </span>
          <h2 className="font-sans text-[30px] sm:text-[46px] lg:text-[56px] font-semibold uppercase leading-[1.04] sm:leading-[1.02] tracking-[-0.04em] text-[#1A1614]">
            Frequently Asked Questions
          </h2>
          <p className="max-w-[400px] font-sans text-[12px] md:text-[14px] font-medium uppercase leading-[1.5] tracking-[0.04em] text-[#665B54]">
            Clarity around scheduling windows, formulations, bridal preparation, and studio comfort at RiTiVerse.
          </p>

          <div className="pt-2">
            <NivoraButton
              variant="primary"
              size="sm"
              onClick={() => openBooking()}
            >
              Book Consultation →
            </NivoraButton>
          </div>
        </div>

        <div className="w-full lg:w-[62%] max-w-[820px] border-t border-[#1A1614]/15">
          {list.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id || idx}
                className="border-b border-[#1A1614]/15"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-4 sm:gap-6 py-5 sm:py-6 text-left"
                >
                  <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
                    <span
                      className={`font-mono text-xs transition-colors ${
                        isOpen
                          ? 'text-[#933E29]'
                          : 'text-[#665B54] group-hover:text-[#B4563E]'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <span
                      className={`font-sans text-[16px] sm:text-[21px] md:text-[23px] font-semibold uppercase leading-[1.24] sm:leading-[1.2] tracking-[-0.02em] transition-colors ${
                        isOpen
                          ? 'text-[#1A1614]'
                          : 'text-[#665B54] group-hover:text-[#1A1614]'
                      }`}
                    >
                      {item.question}
                    </span>
                  </div>

                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center text-2xl font-light leading-none transition-colors ${
                      isOpen
                        ? 'text-[#B4563E]'
                        : 'text-[#665B54] group-hover:text-[#B4563E]'
                    }`}
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0, filter: 'blur(8px)' }}
                      animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                      exit={{ height: 0, opacity: 0, filter: 'blur(8px)' }}
                      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 sm:pb-6 pl-6 sm:pl-8 pr-2 sm:pr-6 font-sans text-[14px] md:text-[15px] leading-[1.65] text-[#4A403A]">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
