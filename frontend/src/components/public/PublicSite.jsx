import React from 'react';
import Navbar from '../common/Navbar';
import Hero from './Hero';
import MarqueeTicker from './MarqueeTicker';
import Philosophy from './Philosophy';
import Lookbook from './Lookbook';
import ServicesShowcase from './ServicesShowcase';
import HowItWorks from './HowItWorks';
import PackagesSwitcher from './PackagesSwitcher';
import Stylists from './Stylists';
import Testimonials from './Testimonials';
import FAQSection from './FAQSection';
import Footer from '../common/Footer';
import BookingModal from './BookingModal';
import WhatsAppFloat from '../common/WhatsAppFloat';

export default function PublicSite({ onOpenCustomerPortal, onOpenCard, onOpenPrivacy }) {
  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#1A1614] flex flex-col selection:bg-[#B4563E] selection:text-[#FFFDF8]">
      <Navbar
        onOpenCustomerPortal={onOpenCustomerPortal}
        onOpenCard={onOpenCard}
      />
      <main className="flex-1">
        <Hero />
        <MarqueeTicker />
        <Philosophy />
        <Lookbook />
        <ServicesShowcase />
        <HowItWorks />
        <PackagesSwitcher />
        <Stylists />
        <Testimonials />
        <FAQSection />
      </main>
      <Footer
        onOpenCustomerPortal={onOpenCustomerPortal}
        onOpenCard={onOpenCard}
        onOpenPrivacy={onOpenPrivacy}
      />
      <BookingModal onOpenCustomerPortal={onOpenCustomerPortal} />
      <WhatsAppFloat />
    </div>
  );
}
