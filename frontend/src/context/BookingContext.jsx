// frontend/src/context/BookingContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { usePublic } from './PublicContext';
import { useCustomerAuth } from './CustomerAuthContext';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const { payments, services, packages, stylists, trackConversionEvent } = usePublic();
  const { customerUser } = useCustomerAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Services, 2: Stylist & Slot, 3: Details & Promo, 4: Payment/Confirm, 5: Success

  // Selections
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null); // null = Any Available
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Live Slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');
  const [slotsError, setSlotsError] = useState('');
  const [slotsReloadKey, setSlotsReloadKey] = useState(0);

  // Customer Details
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  // Payment
  const [paymentMode, setPaymentMode] = useState('pay_at_salon');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Total Duration & Pricing calculations
  const totalDuration = selectedPackage
    ? selectedPackage.duration_minutes
    : selectedServices.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  const rawSubtotal = selectedPackage
    ? Number(selectedPackage.price)
    : selectedServices.reduce((acc, s) => acc + Number(s.offer_price !== null ? s.offer_price : s.base_price), 0);

  const discountedSubtotal = Math.max(0, rawSubtotal - promoDiscount);

  const taxRate = Number(payments?.tax_rate || 0);
  const taxInclusive = !!payments?.tax_inclusive;
  const taxAmount = taxInclusive
    ? Number((discountedSubtotal - (discountedSubtotal / (1 + (taxRate / 100)))).toFixed(2))
    : Number(((discountedSubtotal * taxRate) / 100).toFixed(2));

  const totalAmount = taxInclusive
    ? discountedSubtotal
    : Number((discountedSubtotal + taxAmount).toFixed(2));

  const depositPct = Number(payments?.deposit_percentage || 25);
  const depositAmount = paymentMode === 'online_deposit'
    ? Number(((totalAmount * depositPct) / 100).toFixed(2))
    : (paymentMode === 'online_full' ? totalAmount : 0);

  // Fetch available slots whenever date, services, or stylist changes
  useEffect(() => {
    if (!isOpen || (selectedServices.length === 0 && !selectedPackage)) {
      return;
    }

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setSlotsMessage('');
        setSlotsError('');
        const srvIds = selectedPackage ? [] : selectedServices.map(s => s.id);
        const dur = selectedPackage ? selectedPackage.duration_minutes : totalDuration;
        const styId = selectedStylist ? selectedStylist.id : null;

        const res = await api.getAvailableSlots(selectedDate, srvIds, styId, dur);
        if (res?.data) {
          setAvailableSlots(res.data.slots || []);
          if (res.data.message) {
            setSlotsMessage(res.data.message);
          }
        }
      } catch (err) {
        console.error('Failed to fetch available slots:', err);
        setSlotsError(err.message || 'Could not retrieve slots for the selected date.');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [isOpen, selectedDate, selectedServices, selectedPackage, selectedStylist, slotsReloadKey]);

  const retryLoadSlots = () => setSlotsReloadKey((k) => k + 1);

  // Prefill guest details whenever a client signs in
  useEffect(() => {
    if (customerUser) {
      setCustomer((prev) => ({
        ...prev,
        name: prev.name || customerUser.name || '',
        email: prev.email || customerUser.email || '',
        phone: prev.phone || customerUser.phone || '',
      }));
    }
  }, [customerUser]);

  // Open booking modal (optionally preselect service or package)
  const openBooking = (item = null, type = 'service') => {
    if (type === 'package' && item) {
      setSelectedPackage(item);
      setSelectedServices([]);
    } else if (item) {
      setSelectedServices([item]);
      setSelectedPackage(null);
    }
    if (customerUser) {
      setCustomer((prev) => ({
        ...prev,
        name: prev.name || customerUser.name || '',
        email: prev.email || customerUser.email || '',
        phone: prev.phone || customerUser.phone || '',
      }));
    }
    setStep(1);
    setConfirmedBooking(null);
    setBookingError('');
    setIsOpen(true);
    trackConversionEvent('begin_booking', { item_name: item?.name });
  };

  const rebookFromHistory = (booking) => {
    const items = booking?.items || [];
    const pkgItem = items.find((it) => it.package_id);
    const matchedPkg = pkgItem ? packages.find((p) => Number(p.id) === Number(pkgItem.package_id)) : null;

    const matchedSrvs = matchedPkg
      ? []
      : items
          .map((it) => services.find((s) => Number(s.id) === Number(it.service_id)))
          .filter(Boolean);

    if (matchedPkg) {
      setSelectedPackage(matchedPkg);
      setSelectedServices([]);
    } else {
      setSelectedPackage(null);
      setSelectedServices(matchedSrvs);
    }

    const matchedSty = booking?.stylist_id
      ? stylists.find((st) => Number(st.id) === Number(booking.stylist_id)) || null
      : null;
    setSelectedStylist(matchedSty);
    setSelectedSlot(null);

    if (customerUser) {
      setCustomer((prev) => ({
        ...prev,
        name: prev.name || customerUser.name || '',
        email: prev.email || customerUser.email || '',
        phone: prev.phone || customerUser.phone || '',
      }));
    }

    setConfirmedBooking(null);
    setBookingError('');
    setStep(matchedPkg || matchedSrvs.length > 0 ? 2 : 1);
    setIsOpen(true);
  };

  const closeBooking = () => {
    setIsOpen(false);
  };

  const toggleService = (srv) => {
    setSelectedPackage(null);
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === srv.id);
      if (exists) {
        return prev.filter(s => s.id !== srv.id);
      } else {
        return [...prev, srv];
      }
    });
  };

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedServices([]);
  };

  // Promo code validation
  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    try {
      setPromoLoading(true);
      setPromoError('');
      const res = await api.validatePromo(promoCode.trim(), rawSubtotal);
      if (res?.data?.valid) {
        setPromoDiscount(res.data.discount_amount);
        setPromoApplied(res.data);
      }
    } catch (err) {
      setPromoError(err.message || 'Invalid promo code');
      setPromoDiscount(0);
      setPromoApplied(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoApplied(null);
    setPromoError('');
  };

  // Submit appointment booking
  const submitBooking = async () => {
    try {
      setBookingLoading(true);
      setBookingError('');

      const payload = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        date: selectedDate,
        start_time: selectedSlot?.time || '10:00',
        stylist_id: selectedStylist ? selectedStylist.id : null,
        service_ids: selectedServices.map(s => s.id),
        package_id: selectedPackage ? selectedPackage.id : null,
        payment_mode: paymentMode,
        promo_code: promoApplied?.code || null
      };

      const res = await api.bookAppointment(payload);
      if (res?.data) {
        setConfirmedBooking(res.data);
        setStep(5); // Success step
        trackConversionEvent('booking_confirmed', {
          reference: res.data.booking_reference,
          total: res.data.total_amount
        });
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to complete booking. Please try another slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        step,
        setStep,
        openBooking,
        rebookFromHistory,
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
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};
