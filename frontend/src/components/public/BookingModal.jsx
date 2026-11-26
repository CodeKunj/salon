// frontend/src/components/public/BookingModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Clock, Calendar as CalendarIcon, User,
  ArrowRight, ArrowLeft, Tag, ShieldCheck, AlertCircle, CheckCircle2,
  Phone, Mail, MessageSquare, CreditCard, ChevronRight
} from 'lucide-react';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import CornerMarks from '../common/CornerMarks';
import SafeImage from '../common/SafeImage';
import { buildPrivacyUrl } from '../../utils/adminRouter';
import { buildWhatsAppUrl } from '../../utils/salonLinks';

export default function BookingModal({ onOpenCustomerPortal }) {
  const { categories, services, packages, stylists, payments, salon } = usePublic();
  const { isCustomerAuthenticated, customerUser } = useCustomerAuth();
  const [step3Error, setStep3Error] = useState('');
  const {
    isOpen,
    step,
    setStep,
    closeBooking,
    selectedServices,
    toggleService,
    selectedPackage,
    selectPackage,
    selectedStylist,
    setSelectedStylist,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    availableSlots,
    slotsLoading,
    slotsMessage,
    slotsError,
    retryLoadSlots,
    customer,
    setCustomer,
    promoCode,
    setPromoCode,
    promoDiscount,
    promoApplied,
    promoError,
    promoLoading,
    applyPromoCode,
    removePromoCode,
    paymentMode,
    setPaymentMode,
    totalDuration,
    rawSubtotal,
    discountedSubtotal,
    taxAmount,
    totalAmount,
    depositAmount,
    bookingLoading,
    bookingError,
    confirmedBooking,
    submitBooking
  } = useBooking();

  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'packages'
  const [selectedCatId, setSelectedCatId] = useState(1);

  if (!isOpen) return null;

  const currencySymbol = payments?.currency_symbol || '₹';
  const filteredServices = services.filter(s => s.category_id === selectedCatId);

  const steps = [
    { num: 1, label: 'Services' },
    { num: 2, label: 'Stylist & Slot' },
    { num: 3, label: 'Guest Details' },
    { num: 4, label: 'Payment' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        
        {/* Nivora Light Frosted Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeBooking}
          className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window with Nivora Light Hairline Border & CornerMarks */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative bg-white text-[#111827] border border-black/10 max-w-4xl w-full sm:my-4 overflow-hidden z-10 flex flex-col max-h-[94dvh] sm:max-h-[90vh] shadow-2xl"
        >
          <CornerMarks className="bg-black/20 group-hover:bg-[#B4563E]" />

          {/* Modal Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-black/[0.08] flex items-center justify-between gap-3 bg-[#FAFAFA]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B4563E] shadow-[0_0_10px_#B4563E] shrink-0"></span>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[#111827] leading-none truncate">
                  Atelier Reservation Suite
                </h3>
                <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-widest block mt-0.5 truncate">
                  NIVORA PRIVATE BOOTHS
                </span>
              </div>
            </div>

            <button
              onClick={closeBooking}
              className="w-8 h-8 rounded-full border border-black/10 bg-white hover:bg-black/5 text-[#111827] flex items-center justify-center transition-colors shadow-2xs shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar (Steps 1-4) */}
          {step <= 4 && (
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FAFAFA]/70 border-b border-black/[0.08]">
              <div className="flex items-center justify-between max-w-xl mx-auto gap-2">
                {steps.map((st) => (
                  <div key={st.num} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                        step === st.num
                          ? 'bg-[#B4563E] text-[#FFFDF8] shadow-glow-pink'
                          : step > st.num
                          ? 'bg-[#2FA66A] text-[#FFFDF8] font-semibold'
                          : 'bg-white text-[#64748B] border border-black/10'
                      }`}
                    >
                      {step > st.num ? <Check className="w-3 h-3" /> : `0${st.num}`}
                    </div>
                    <span
                      className={`hidden sm:inline text-xs font-mono uppercase tracking-wider ${
                        step === st.num ? 'text-[#111827] font-semibold' : 'text-[#64748B]'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body Content by Step */}
          <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 bg-white">

            {/* STEP 1: SELECT SERVICES OR PACKAGES */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xl sm:text-2xl font-normal tracking-tight text-[#111827]">Choose Experience</h4>
                    <p className="text-xs font-mono text-[#64748B]">Select individual treatments or curated signature combo packages.</p>
                  </div>

                  {/* Toggle between Services and Packages */}
                  <div className="flex bg-[#FAFAFA] p-1 rounded-full border border-black/10 self-start sm:self-auto">
                    <button
                      onClick={() => setActiveTab('services')}
                      className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all ${
                        activeTab === 'services' ? 'bg-white text-[#111827] font-bold shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
                      }`}
                    >
                      Services
                    </button>
                    <button
                      onClick={() => setActiveTab('packages')}
                      className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all ${
                        activeTab === 'packages' ? 'bg-white text-[#111827] font-bold shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
                      }`}
                    >
                      Packages
                    </button>
                  </div>
                </div>

                {/* Sub Tab: Individual Services */}
                {activeTab === 'services' && (
                  <div className="space-y-4">
                    {/* Category tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCatId(cat.id)}
                          className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all ${
                            selectedCatId === cat.id
                              ? 'bg-[#111827] text-white font-semibold'
                              : 'bg-white text-[#64748B] hover:text-[#111827] border border-black/10'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                      {filteredServices.map((srv) => {
                        const isSelected = selectedServices.some(s => s.id === srv.id);
                        const price = srv.offer_price !== null ? srv.offer_price : srv.base_price;

                        return (
                          <div
                            key={srv.id}
                            onClick={() => toggleService(srv)}
                            className={`p-4 border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-[#F3E7DB]/70 border-[#B4563E] shadow-2xs'
                                : 'bg-white hover:bg-[#FAFAFA] border-black/[0.08]'
                            }`}
                          >
                            <div className="space-y-1">
                              <h5 className="text-sm font-semibold text-[#111827] tracking-tight leading-snug">
                                {srv.name}
                              </h5>
                              <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B]">
                                <Clock className="w-3 h-3 text-[#B4563E]" />
                                <span>{srv.duration_minutes} MIN</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className="text-sm font-mono font-bold text-[#111827]">
                                {currencySymbol}{Number(price).toFixed(2)}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                                  isSelected ? 'bg-[#B4563E] text-[#FFFDF8]' : 'border border-[#1A1614]/20 bg-[#FFFDF8]'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub Tab: Signature Packages */}
                {activeTab === 'packages' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => selectPackage(pkg)}
                          className={`p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#F3E7DB]/70 border-[#B4563E] shadow-2xs'
                              : 'bg-white hover:bg-[#FAFAFA] border-black/[0.08]'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#933E29] font-semibold">
                              {pkg.tagline || 'SIGNATURE COMBO'}
                            </span>
                            <h5 className="text-base font-semibold text-[#111827] tracking-tight">
                              {pkg.name}
                            </h5>
                            <p className="text-xs text-[#64748B] font-light line-clamp-2">{pkg.description}</p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-black/[0.08] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-mono text-[#64748B]">
                              <Clock className="w-3.5 h-3.5 text-[#B4563E]" />
                              <span>{pkg.duration_minutes} MIN</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-base font-mono font-bold text-[#111827]">
                                {currencySymbol}{Number(pkg.price).toFixed(2)}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                  isSelected ? 'bg-[#B4563E] text-[#FFFDF8]' : 'border border-[#1A1614]/20 bg-[#FFFDF8]'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: PICK STYLIST & DATE & LIVE AVAILABLE SLOT */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl sm:text-2xl font-normal tracking-tight text-[#111827]">Select Artist &amp; Time Slot</h4>
                  <p className="text-xs font-mono text-[#64748B]">
                    Real-time slot engine based on studio operating hours, breaks, and stylist shift rules.
                  </p>
                </div>

                {/* Stylist Selector */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#64748B] mb-2 font-semibold">
                    Preferred Artisan
                  </label>
                  <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <button
                      onClick={() => setSelectedStylist(null)}
                      className={`p-3 border text-left transition-all ${
                        selectedStylist === null
                          ? 'bg-[#F3E7DB]/70 border-[#B4563E]'
                          : 'bg-white hover:bg-[#FAFAFA] border-black/[0.08]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F3E7DB] text-[#933E29] flex items-center justify-center mb-1.5 font-mono text-xs font-bold">
                        ANY
                      </div>
                      <div className="text-xs font-semibold text-[#111827]">Any Available</div>
                      <div className="text-[10px] font-mono text-[#64748B]">Earliest open slot</div>
                    </button>

                    {stylists.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStylist(st)}
                        className={`p-3 border text-left transition-all ${
                          selectedStylist?.id === st.id
                            ? 'bg-[#F3E7DB]/70 border-[#B4563E]'
                            : 'bg-white hover:bg-[#FAFAFA] border-black/[0.08]'
                        }`}
                      >
                        <SafeImage
                          src={st.avatar_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80'}
                          alt={st.name}
                          fallbackLabel={st.name}
                          className="w-8 h-8 rounded-full object-cover mb-1.5"
                        />
                        <div className="text-xs font-semibold text-[#111827] truncate">{st.name}</div>
                        <div className="text-[10px] font-mono text-[#64748B] truncate">{st.role_title}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#64748B] mb-2 font-semibold">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2.5 border border-[#1A1614]/20 bg-[#FFFDF8] text-sm font-mono text-[#1A1614] focus:outline-none focus:border-[#B4563E] w-full sm:w-auto"
                  />
                </div>

                {/* Live Available Slots */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-[#64748B] font-semibold">
                      Available Time Slots ({totalDuration} min required)
                    </label>
                    {selectedSlot && (
                      <span className="text-xs font-mono text-[#933E29] font-semibold">
                        Selected: {selectedSlot.formatted}
                      </span>
                    )}
                  </div>

                  {slotsLoading ? (
                    <div className="py-8 text-center text-xs font-mono text-[#64748B] flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#B4563E] border-t-transparent rounded-full animate-spin" />
                      <span>Calculating real-time atelier slots...</span>
                    </div>
                  ) : slotsError ? (
                    <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 font-mono flex flex-wrap items-center justify-between gap-2">
                      <span>{slotsError}</span>
                      <button
                        type="button"
                        onClick={retryLoadSlots}
                        className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700"
                      >
                        Retry Slots
                      </button>
                    </div>
                  ) : slotsMessage ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-800 font-mono">
                      {slotsMessage}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 bg-[#FAFAFA] border border-black/[0.08] text-xs font-mono text-[#64748B] text-center">
                      No open slots available for this date. Please choose another date or artist.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 min-[390px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5 max-h-[220px] overflow-y-auto p-1">
                      {availableSlots.map((slot) => {
                        const isChosen = selectedSlot?.time === slot.time;

                        return (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-2 border text-xs font-mono transition-all text-center flex flex-col items-center justify-center ${
                              isChosen
                                ? 'bg-[#B4563E] text-[#FFFDF8] border-[#B4563E] font-bold shadow-glow-pink'
                                : slot.available
                                ? 'bg-[#FFFDF8] hover:bg-[#F3E7DB]/70 text-[#1A1614] border-[#1A1614]/15'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent line-through'
                            }`}
                            title={!slot.available ? slot.reason : 'Available'}
                          >
                            <span>{slot.formatted}</span>
                            {slot.available && (
                              <span className="text-[9px] text-[#2FA66A] font-semibold">Open</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* STEP 3: CUSTOMER DETAILS & PROMO CODE */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl sm:text-2xl font-normal tracking-tight text-[#111827]">Guest Information</h4>
                  <p className="text-xs font-mono text-[#64748B]">
                    We will send your confirmed reservation voucher and calendar invite here.
                  </p>
                </div>

                {isCustomerAuthenticated && (
                  <div className="p-3 bg-[#F3E7DB]/70 border border-[#B4563E]/35 text-xs font-mono text-[#1A1614] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#B4563E] shrink-0" />
                    <span>
                      Signed in as <strong>{customerUser?.name}</strong> — this visit will appear automatically in <strong>My Bookings</strong>.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#64748B] mb-1.5 font-semibold">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Camilla Davenport"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#1A1614]/20 bg-[#FFFDF8] text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#64748B] mb-1.5 font-semibold">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. you@example.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#1A1614]/20 bg-[#FFFDF8] text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#64748B] mb-1.5 font-semibold">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 234-5678"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#1A1614]/20 bg-[#FFFDF8] text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#64748B] mb-1.5 font-semibold">
                      Special Requests / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Quiet session, herbal tea preference"
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#1A1614]/20 bg-[#FFFDF8] text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                    />
                  </div>
                </div>

                {step3Error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{step3Error}</span>
                  </div>
                )}

                {/* Promo Code Box */}
                <div className="p-4 border border-black/[0.08] bg-[#FAFAFA] space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#111827] block font-semibold">
                    Have a Promotion or Gift Code?
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="TRY WELCOME20 OR GLOW10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="px-4 py-2 border border-[#1A1614]/20 text-sm uppercase font-mono tracking-wider text-[#1A1614] focus:outline-none focus:border-[#B4563E] bg-[#FFFDF8] flex-1 min-w-0"
                    />
                    {promoApplied ? (
                      <button
                        onClick={removePromoCode}
                        className="px-4 py-2 bg-red-100 text-red-600 border border-red-200 text-xs font-mono font-bold"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={applyPromoCode}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-5 py-2 bg-[#111827] text-white hover:bg-black text-xs font-mono uppercase tracking-wider font-semibold disabled:opacity-50"
                      >
                        {promoLoading ? 'Validating...' : 'Apply Code'}
                      </button>
                    )}
                  </div>

                  {promoApplied && (
                    <div className="text-xs font-mono text-[#2FA66A] font-semibold flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Code {promoApplied.code} applied! Saved {currencySymbol}{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {promoError && (
                    <div className="text-xs font-mono text-red-600 flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{promoError}</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* STEP 4: REVIEW & PAYMENT SELECTION */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl sm:text-2xl font-normal tracking-tight text-[#111827]">Review &amp; Payment Method</h4>
                  <p className="text-xs font-mono text-[#64748B]">
                    Confirm your atelier itinerary and select your preferred payment mode.
                  </p>
                </div>

                {/* Itinerary Summary Card */}
                <div className="p-5 border border-black/[0.08] bg-[#FAFAFA] space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-black/[0.08]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#933E29] tracking-widest font-semibold">Scheduled Appointment</span>
                      <h5 className="text-base sm:text-lg font-semibold text-[#111827]">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} at {selectedSlot?.formatted}
                      </h5>
                      <span className="text-xs font-mono text-[#64748B]">
                        Artisan: {selectedStylist ? selectedStylist.name : 'Master Team Artist (Any Available)'}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-white border border-black/10 text-xs font-mono text-[#111827] shadow-2xs">
                      {totalDuration} Mins
                    </span>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-1.5 text-xs font-mono text-[#64748B]">
                    {selectedPackage ? (
                      <div className="flex justify-between font-medium text-[#111827]">
                        <span>{selectedPackage.name} (Package)</span>
                        <span>{currencySymbol}{Number(selectedPackage.price).toFixed(2)}</span>
                      </div>
                    ) : (
                      selectedServices.map(s => (
                        <div key={s.id} className="flex justify-between font-medium text-[#111827]">
                          <span>{s.name}</span>
                          <span>{currencySymbol}{Number(s.offer_price !== null ? s.offer_price : s.base_price).toFixed(2)}</span>
                        </div>
                      ))
                    )}

                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-[#2FA66A] font-semibold pt-1">
                        <span>Promo Discount ({promoApplied?.code})</span>
                        <span>-{currencySymbol}{promoDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {taxAmount > 0 && (
                      <div className="flex justify-between pt-1">
                        <span>Estimated Tax &amp; GST</span>
                        <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-bold text-[#111827] pt-3 border-t border-black/[0.08]">
                      <span>Total Amount</span>
                      <span className="text-[#933E29]">{currencySymbol}{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#64748B] block font-semibold">
                    Select Payment Option
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Pay at Salon */}
                    {payments.pay_at_salon && (
                      <button
                        type="button"
                        onClick={() => setPaymentMode('pay_at_salon')}
                        className={`p-4 border text-left transition-all ${
                          paymentMode === 'pay_at_salon'
                            ? 'bg-[#F3E7DB]/70 border-[#B4563E]'
                            : 'bg-white hover:bg-[#FAFAFA] border-black/[0.08]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-[#111827]">Pay at Salon</span>
                          {paymentMode === 'pay_at_salon' && <Check className="w-4 h-4 text-[#B4563E]" />}
                        </div>
                        <p className="text-[11px] text-[#64748B]">Pay by cash or card upon arrival at the concierge.</p>
                      </button>
                    )}

                    {/* Online Deposit */}
                    {payments.online_deposit && (
                      <button
                        type="button"
                        onClick={() => setPaymentMode('online_deposit')}
                        className={`p-4 border text-left transition-all ${
                          paymentMode === 'online_deposit'
                            ? 'bg-[#F3E7DB]/70 border-[#B4563E]'
                            : 'bg-white hover:bg-[#FAFAFA] border-black/[0.08]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-[#111827]">25% Deposit</span>
                          {paymentMode === 'online_deposit' && <Check className="w-4 h-4 text-[#B4563E]" />}
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          Pay {currencySymbol}{depositAmount.toFixed(2)} now, remainder at salon.
                        </p>
                      </button>
                    )}

                    {/* Full Online */}
                    {payments.online_full && (
                      <button
                        type="button"
                        onClick={() => setPaymentMode('online_full')}
                        className={`p-4 border text-left transition-all ${
                          paymentMode === 'online_full'
                            ? 'bg-[#F3E7DB]/70 border-[#B4563E]'
                            : 'bg-white hover:bg-[#FAFAFA] border-black/[0.08]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-[#111827]">Full Prepayment</span>
                          {paymentMode === 'online_full' && <Check className="w-4 h-4 text-[#B4563E]" />}
                        </div>
                        <p className="text-[11px] text-[#64748B]">Complete prepayment with secure credit card/Stripe.</p>
                      </button>
                    )}
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-xs font-mono text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <p className="text-[11px] font-mono text-[#64748B] leading-relaxed">
                  By confirming your reservation, you provide consent to process your contact and appointment information as described in our{' '}
                  <a
                    href={buildPrivacyUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#933E29] font-semibold underline hover:text-[#1A1614]"
                  >
                    DPDP Act, 2023 Privacy Policy
                  </a>.
                </p>
              </div>
            )}

            {/* STEP 5: SUCCESS & CONFIRMATION SCREEN */}
            {step === 5 && confirmedBooking && (
              <div className="py-6 px-4 text-center space-y-6">
                <div className="w-14 h-14 rounded-full bg-[#2FA66A]/15 text-[#2FA66A] border border-[#2FA66A]/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#933E29] font-semibold">Reservation Confirmed</span>
                  <h4 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#111827]">
                    We Look Forward to Welcoming You
                  </h4>
                  <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
                    A confirmed voucher has been registered for <strong className="text-[#111827]">{confirmedBooking.customer_name}</strong>.
                  </p>
                </div>

                {/* Voucher Box with Nivora Light Hairline & CornerMarks */}
                <div className="max-w-md mx-auto p-6 border border-black/10 bg-[#FAFAFA] text-left space-y-3 relative shadow-xs">
                  <CornerMarks className="bg-black/20" />
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                    <span className="text-xs font-mono text-[#64748B] uppercase tracking-widest font-semibold">Booking Reference</span>
                    <span className="text-base font-mono font-bold text-[#933E29] tracking-wider">
                      {confirmedBooking.booking_reference}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-[#64748B] block">Date</span>
                      <strong className="text-[#111827]">{confirmedBooking.date}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Time Slot</span>
                      <strong className="text-[#111827]">{confirmedBooking.start_time}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Assigned Artisan</span>
                      <strong className="text-[#111827]">{confirmedBooking.stylist_name}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Payment Mode</span>
                      <strong className="text-[#111827] uppercase">{confirmedBooking.payment_mode.replace(/_/g, ' ')}</strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeBooking}
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-glow-pink"
                  >
                    Done &amp; Return to Atelier
                  </button>
                  {onOpenCustomerPortal && isCustomerAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        closeBooking();
                        onOpenCustomerPortal('upcoming');
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-semibold transition-all"
                    >
                      View in My Bookings
                    </button>
                  )}
                  <a
                    href={
                      buildWhatsAppUrl(
                        salon,
                        `Hello ${salon?.salon_name || 'RiTiVerse Salon'}! My appointment is confirmed (Ref: ${confirmedBooking.booking_reference}, Date: ${confirmedBooking.date}, Time: ${confirmedBooking.start_time}).`
                      ) ||
                      `https://wa.me/?text=${encodeURIComponent(`My RiTiVerse Appointment is confirmed! Ref: ${confirmedBooking.booking_reference}`)}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1FB857] text-[#1A1614] text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Connect on WhatsApp</span>
                  </a>
                </div>

                {onOpenCustomerPortal && !isCustomerAuthenticated && (
                  <div className="max-w-md mx-auto p-4 bg-[#F3E7DB]/70 border border-[#B4563E]/35 text-xs font-mono text-[#1A1614] space-y-2">
                    <p>Create an account with <strong>{confirmedBooking.customer_email}</strong> to track this visit &amp; full past history anytime.</p>
                    <button
                      type="button"
                      onClick={() => {
                        closeBooking();
                        onOpenCustomerPortal('upcoming', {
                          authMode: 'register',
                          prefillGuest: {
                            name: confirmedBooking.customer_name,
                            email: confirmedBooking.customer_email,
                            phone: confirmedBooking.customer_phone,
                          },
                        });
                      }}
                      className="inline-flex items-center gap-1 text-[#933E29] font-bold hover:underline uppercase tracking-wider"
                    >
                      <span>Create Client Account &amp; Track History →</span>
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Footer Controls (Steps 1 to 4) */}
          {step <= 4 && (
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-black/[0.08] bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-3">
              <div>
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-[#64748B] hover:text-[#111827] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div className="text-xs font-mono text-[#64748B]">
                    {selectedServices.length > 0
                      ? `${selectedServices.length} Selected (${totalDuration}m)`
                      : selectedPackage
                      ? `1 Package (${totalDuration}m)`
                      : 'Select a treatment'}
                  </div>
                )}
              </div>

              <div>
                {step === 1 && (
                  <button
                    disabled={selectedServices.length === 0 && !selectedPackage}
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] text-xs font-mono uppercase tracking-wider font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-glow-pink"
                  >
                    <span>Continue to Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {step === 2 && (
                  <button
                    disabled={!selectedSlot}
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] text-xs font-mono uppercase tracking-wider font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-glow-pink"
                  >
                    <span>Continue to Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      const cleanName = customer.name.trim();
                      const cleanEmail = customer.email.trim();
                      const phoneDigits = customer.phone.replace(/\D/g, '');
                      if (cleanName.length < 2) {
                        setStep3Error('Please enter your full name (at least 2 characters).');
                        return;
                      }
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                        setStep3Error('Please enter a valid email address.');
                        return;
                      }
                      if (phoneDigits.length < 7) {
                        setStep3Error('Please enter a valid phone or WhatsApp number.');
                        return;
                      }
                      setStep3Error('');
                      setStep(4);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] text-xs font-mono uppercase tracking-wider font-semibold transition-all inline-flex items-center gap-2 shadow-glow-pink"
                  >
                    <span>Review &amp; Pay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {step === 4 && (
                  <button
                    disabled={bookingLoading}
                    onClick={submitBooking}
                    className="px-7 py-3 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] text-xs font-mono uppercase tracking-wider font-bold transition-all disabled:opacity-50 inline-flex items-center gap-2 shadow-glow-pink"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming Reservation...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm &amp; Reserve ↳</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
