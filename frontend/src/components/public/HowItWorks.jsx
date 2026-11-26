import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import CornerMarks from '../common/CornerMarks';
import { NivoraSectionHeader } from '../common/NivoraPrimitives';

const STEPS = [
  {
    num: '01',
    title: 'Choose Ritual',
    description:
      'Select your architectural haircut, dermal infusion, or bridal ensemble with transparent timing.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
        <rect x="8" y="8" width="32" height="32" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 24H32M24 16V32" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Pick Specialist',
    description:
      'Reserve your dedicated artistic director or pair automatically with the first open suite specialist.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
        <circle cx="24" cy="17" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M11 39C11 31.82 16.82 26 24 26C31.18 26 37 31.82 37 39"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Lock Time Slot',
    description:
      'Browse real-time calendar openings calculated around sanctuary buffer intervals and studio hours.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M24 14V24L31 28" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Relax & Glow',
    description:
      'Step into serene sanctuary calm with clean formulations, private comfort, and unhurried finishing.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
        <path
          d="M24 6L28.5 19.5L42 24L28.5 28.5L24 42L19.5 28.5L6 24L19.5 19.5L24 6Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

function DesktopStepCard({ step, index, scrollYProgress, isHighlighted, onSelect }) {
  const start = index * 0.17;
  const end = Math.min(start + 0.3, 0.92);
  const y = useTransform(scrollYProgress, [start, end], [240, 0]);
  const opacity = useTransform(scrollYProgress, [start, end], [0.08, 1]);

  return (
    <motion.div
      style={{ y, opacity }}
      onClick={onSelect}
      className={`group relative flex h-[380px] xl:h-[460px] cursor-pointer flex-col items-center justify-center border p-6 xl:p-8 text-center transition-all duration-300 will-change-transform ${
        isHighlighted
          ? 'border-[#B4563E] bg-gradient-to-br from-[#B4563E] via-[#A34933] to-[#873824] shadow-[0_24px_56px_-14px_rgba(180,86,62,0.45)]'
          : 'border-[#B4563E]/35 bg-[#FFFDF8] shadow-[8px_8px_0px_rgba(180,86,62,0.16)] hover:border-[#B4563E] hover:shadow-[8px_8px_0px_rgba(26,22,20,0.18)]'
      }`}
    >
      <CornerMarks
        all
        size={12}
        thickness={2}
        color={
          isHighlighted
            ? 'text-[#F3E7DB]'
            : 'text-[#B4563E]'
        }
      />

      <span
        className={`absolute top-5 left-5 font-mono text-[11px] uppercase tracking-[0.14em] ${
          isHighlighted ? 'text-[#F3E7DB]' : 'text-[#933E29]'
        }`}
      >
        {step.num}
      </span>

      <div
        className={`mb-6 xl:mb-10 transition-colors duration-300 ${
          isHighlighted
            ? 'text-[#FFFDF8]'
            : 'text-[#1A1614] group-hover:text-[#B4563E]'
        }`}
      >
        {step.icon}
      </div>

      <h3
        className={`font-sans text-[22px] xl:text-[30px] font-semibold uppercase leading-[1.08] tracking-[-0.03em] transition-colors duration-300 ${
          isHighlighted ? 'text-[#FFFDF8]' : 'text-[#1A1614]'
        }`}
      >
        {step.title}
      </h3>

      <p
        className={`mt-4 max-w-[260px] font-sans text-[14px] leading-[1.55] ${
          isHighlighted ? 'text-[#F3E7DB]' : 'text-[#665B54]'
        }`}
      >
        {step.description}
      </p>
    </motion.div>
  );
}

export default function HowItWorks() {
  const { openBooking } = useBooking();
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(3);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (v < 0.25) setActiveStep(0);
    else if (v < 0.5) setActiveStep(1);
    else if (v < 0.75) setActiveStep(2);
    else setActiveStep(3);
  });

  return (
    <section
      id="how-it-works"
      className="relative w-full border-t border-[#1A1614]/15 bg-gradient-to-b from-[#EFE6D8] via-[#E7DBCB] to-[#EFE6D8] text-[#1A1614]"
    >
      <div className="bg-atelier-grid-deep pointer-events-none absolute inset-0 opacity-45" aria-hidden="true" />

      <div ref={sectionRef} className="hidden lg:block relative h-[240vh] w-full">
        <div className="sticky top-0 flex min-h-[100vh] w-full flex-col justify-center px-8 xl:px-14 py-10">
          <div className="mx-auto w-full max-w-[1520px]">
            <NivoraSectionHeader
              eyebrow="03 // How It Works"
              title="Seamless Studio Ritual"
              description="Four deliberate steps designed around unhurried studio precision."
            />

            <div className="mt-12 grid grid-cols-4 gap-4 xl:gap-5">
              {STEPS.map((step, idx) => (
                <DesktopStepCard
                  key={step.num}
                  step={step}
                  index={idx}
                  scrollYProgress={scrollYProgress}
                  isHighlighted={activeStep === idx}
                  onSelect={() => {
                    setActiveStep(idx);
                    if (idx === 3) openBooking();
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tablet & Mobile Grid */}
      <div className="lg:hidden relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-8 py-14 sm:py-20">
        <NivoraSectionHeader
          eyebrow="03 // How It Works"
          title="Seamless Studio Ritual"
          description="Four deliberate steps designed around unhurried studio precision."
        />

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS.map((step, idx) => {
            const isFinal = idx === STEPS.length - 1;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => openBooking()}
                className={`relative flex flex-col items-center border p-7 text-center ${
                  isFinal
                    ? 'border-[#B4563E] bg-gradient-to-br from-[#B4563E] to-[#873824]'
                    : 'border-[#B4563E]/35 bg-[#FFFDF8]'
                }`}
              >
                <CornerMarks
                  all
                  size={12}
                  thickness={2}
                  color={isFinal ? 'text-[#F3E7DB]' : 'text-[#B4563E]'}
                />
                <span
                  className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                    isFinal ? 'text-[#F3E7DB]' : 'text-[#933E29]'
                  }`}
                >
                  {step.num}
                </span>
                <div
                  className={`mt-4 mb-5 ${
                    isFinal ? 'text-[#FFFDF8]' : 'text-[#1A1614]'
                  }`}
                >
                  {step.icon}
                </div>
                <h3
                  className={`font-sans text-[22px] font-semibold uppercase tracking-[-0.02em] ${
                    isFinal ? 'text-[#FFFDF8]' : 'text-[#1A1614]'
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-2.5 font-sans text-sm ${
                    isFinal ? 'text-[#F3E7DB]' : 'text-[#665B54]'
                  }`}
                >
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
