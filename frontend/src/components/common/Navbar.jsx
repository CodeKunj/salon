import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import CornerMarks from './CornerMarks';
import { NivoraButton } from './NivoraPrimitives';
import { buildCardUrl } from '../../utils/adminRouter';
import { buildWhatsAppUrl } from '../../utils/salonLinks';

const NAV_LINKS = [
  { num: '01', label: 'Philosophy', href: '#philosophy' },
  { num: '02', label: 'Lookbook', href: '#lookbook' },
  { num: '03', label: 'Services', href: '#services' },
  { num: '04', label: 'Process', href: '#how-it-works' },
  { num: '05', label: 'Packages', href: '#packages' },
  { num: '06', label: 'Team', href: '#team' },
  { num: '07', label: 'FAQ', href: '#faq' },
];

export default function Navbar({ onOpenCustomerPortal, onOpenCard }) {
  const { salon } = usePublic();
  const whatsappUrl = buildWhatsAppUrl(
    salon,
    `Hello ${salon?.salon_name || 'RiTiVerse Salon'}, I would like to connect regarding an appointment.`
  );
  const { openBooking } = useBooking();
  const { customerUser, isCustomerAuthenticated } = useCustomerAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflowY = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflowY = '';
    };
  }, [menuOpen]);

  const brandName = 'RITIVERSE SALON';
  const brandInitial = 'R';

  const scrollToSection = (href) => {
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || menuOpen
            ? 'bg-[#EFE5D8]/95 backdrop-blur-md border-b border-[#1A1614]/15 shadow-[0_10px_32px_-12px_rgba(26,22,20,0.16)]'
            : 'bg-[#F7F1E8]/90 backdrop-blur-md border-b border-[#1A1614]/10'
        }`}
      >
        <div className="mx-auto flex h-[64px] sm:h-[70px] md:h-[76px] w-full max-w-[1560px] items-center justify-between px-3 sm:px-6 lg:px-10 gap-2 sm:gap-4">
          {/* Left: Brand Emblem + Wordmark (RiTiVerse Salon only) */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2 sm:gap-2.5 min-w-0 shrink"
          >
            <span className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center border border-[#B4563E] bg-[#B4563E] text-[#FFFDF8] font-serif italic text-base sm:text-lg transition-transform duration-300 group-hover:scale-105 shadow-[0_6px_18px_-4px_rgba(180,86,62,0.45)]">
              {brandInitial}
            </span>
            <span className="font-sans text-[13px] min-[380px]:text-[15px] sm:text-[17px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.12em] text-[#1A1614] truncate">
              RiTiVerse Salon
            </span>
          </a>

          {/* Center: Desktop Horizontal Links */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center justify-center gap-5 xl:gap-7"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="group relative py-1 font-sans text-[11.5px] xl:text-[12.5px] font-medium uppercase tracking-[0.09em] text-[#1A1614]/85 whitespace-nowrap transition-colors hover:text-[#933E29]"
              >
                <span>{item.label}</span>
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#B4563E] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right: Aligned Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onOpenCustomerPortal && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenCustomerPortal('upcoming', {
                    authMode: isCustomerAuthenticated ? null : 'login',
                  });
                }}
                className="hidden sm:inline-flex h-9 items-center gap-2 border border-[#1A1614]/20 bg-[#FFFDF8] hover:bg-[#F3E7DB] px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#1A1614] whitespace-nowrap transition-colors"
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${isCustomerAuthenticated ? 'bg-[#2FA66A]' : 'bg-[#B4563E]'}`} />
                <span>
                  {isCustomerAuthenticated
                    ? `${customerUser?.name?.split(' ')[0] || 'Client'} · Bookings`
                    : 'Sign In'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openBooking();
              }}
              className="sm:hidden inline-flex h-8 items-center justify-center bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] px-3 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap transition-colors"
            >
              Book
            </button>

            <NivoraButton
              variant="primary"
              size="sm"
              onClick={() => {
                setMenuOpen(false);
                openBooking();
              }}
              className="hidden sm:inline-flex h-9 px-4 whitespace-nowrap"
            >
              Book Visit
            </NivoraButton>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              className="group relative flex h-9 w-9 shrink-0 items-center justify-center border border-[#1A1614]/20 bg-[#FFFDF8] transition-colors duration-200 hover:border-[#B4563E]"
            >
              <span className="sr-only">Menu</span>
              <div className="relative h-3 w-4">
                <span
                  className={`absolute left-0 h-[1.5px] w-full bg-[#1A1614] transition-all duration-300 ${
                    menuOpen
                      ? 'top-[5px] rotate-45 bg-[#B4563E]'
                      : 'top-[2px] group-hover:bg-[#B4563E]'
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-full bg-[#1A1614] transition-all duration-300 ${
                    menuOpen
                      ? 'top-[5px] -rotate-45 bg-[#B4563E]'
                      : 'bottom-[2px] group-hover:bg-[#B4563E]'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Champagne Cashmere Editorial Directory Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="ritiverse-menu-overlay"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-gradient-to-b from-[#EAE0D2] via-[#F3EBE0] to-[#F7F1E8] pt-[78px] sm:pt-[92px] pb-8 sm:pb-10 px-3 sm:px-10"
          >
            <div className="relative mx-auto flex min-h-[calc(100dvh-112px)] sm:min-h-[calc(100vh-132px)] max-w-[1480px] flex-col justify-between border border-[#B4563E]/35 bg-[#FFFDF8] p-5 sm:p-8 md:p-12 shadow-2xl">
              <CornerMarks all size={14} thickness={2} color="text-[#B4563E]" />

              <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
                <nav
                  aria-label="Directory links"
                  className="lg:col-span-7 flex flex-col divide-y divide-[#1A1614]/10"
                >
                  {NAV_LINKS.map((item, idx) => (
                    <motion.button
                      key={item.href}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + idx * 0.035, duration: 0.3 }}
                      onClick={() => scrollToSection(item.href)}
                      className="group flex items-center justify-between py-3 sm:py-3.5 md:py-4 text-left transition-colors"
                    >
                      <div className="flex items-baseline gap-3 sm:gap-4 md:gap-6">
                        <span className="font-mono text-xs text-[#933E29]">
                          {item.num}
                        </span>
                        <span className="font-sans text-[22px] sm:text-[34px] md:text-[42px] font-semibold uppercase tracking-[-0.04em] leading-none text-[#1A1614] transition-all duration-200 group-hover:translate-x-2 group-hover:text-[#B4563E]">
                          {item.label}
                        </span>
                      </div>
                      <span className="font-sans text-sm uppercase tracking-widest text-[#B4563E] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        →
                      </span>
                    </motion.button>
                  ))}
                </nav>

                <div className="lg:col-span-5 flex flex-col justify-between gap-8 border-t border-[#1A1614]/15 pt-8 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2.5 border border-[#2FA66A]/45 bg-[#F7F1E8] px-3.5 py-2">
                      <span className="h-2 w-2 rounded-full bg-[#2FA66A]" />
                      <span className="font-sans text-xs font-medium uppercase tracking-[0.1em] text-[#1A1614]">
                        {salon?.hours_summary || 'Open Daily · 09:00 AM – 08:00 PM'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#933E29]">
                        {brandName}
                      </p>
                      <p className="font-sans text-lg font-medium text-[#1A1614]">
                        {salon?.tagline ||
                          'Where sculptural hair craft, botanical skincare, and effortless serene luxury converge.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-sm">
                      <div>
                        <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-[#665B54]">
                          Location
                        </p>
                        <p className="mt-1 font-sans font-medium text-[#1A1614]">
                          {salon?.address || '452 Boulevard Saint-Honoré, Suite 400'}
                        </p>
                      </div>
                      <div>
                        <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-[#665B54]">
                          Concierge
                        </p>
                        <p className="mt-1 font-sans font-medium text-[#1A1614]">
                          {salon?.phone || '+1 (555) 234-5678'}
                        </p>
                        <p className="text-xs text-[#665B54]">
                          {salon?.email || salon?.support_email || 'concierge@ritiverse.com'}
                        </p>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1.5 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-[#188C43] hover:underline font-semibold"
                          >
                            WhatsApp Direct ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4">
                    <NivoraButton
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setMenuOpen(false);
                        openBooking();
                      }}
                    >
                      Schedule a Visit
                    </NivoraButton>

                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center border border-[#25D366]/70 bg-[#25D366]/15 hover:bg-[#25D366] text-[#1A1614] px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.1em] transition-colors"
                      >
                        WhatsApp Us
                      </a>
                    )}

                    {onOpenCard && (
                      <a
                        href={buildCardUrl()}
                        onClick={(e) => {
                          e.preventDefault();
                          setMenuOpen(false);
                          onOpenCard();
                        }}
                        className="inline-flex items-center justify-center border border-[#1A1614]/25 bg-[#FFFDF8] hover:border-[#B4563E] text-[#1A1614] px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.1em] transition-colors"
                      >
                        Visiting Card &amp; QR
                      </a>
                    )}

                    {onOpenCustomerPortal && (
                      <NivoraButton
                        variant="border"
                        size="md"
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenCustomerPortal('upcoming', {
                            authMode: isCustomerAuthenticated ? null : 'login',
                          });
                        }}
                      >
                        {isCustomerAuthenticated ? 'My Bookings & History' : 'Client Sign In'}
                      </NivoraButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
