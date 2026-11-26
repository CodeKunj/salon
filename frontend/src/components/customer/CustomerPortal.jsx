// frontend/src/components/customer/CustomerPortal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, CheckCircle2, Clock, CreditCard, History,
  LogOut, Mail, Lock, Phone, Plus, Receipt, RefreshCw, RotateCcw,
  Search, ShieldCheck, User, X, XCircle, AlertCircle
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { usePublic } from '../../context/PublicContext';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../services/api';
import CornerMarks from '../common/CornerMarks';

const STATUS_BADGE = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const PAYMENT_BADGE = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partially_paid: 'bg-[#F3E7DB] text-[#933E29] border-[#B4563E]/30',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  refunded: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function CustomerPortal({
  accountTab = 'upcoming',
  authMode = 'login',
  prefillGuest = null,
  onAccountTabChange,
  onAuthModeChange,
  onBackToSite,
}) {
  const { salon, payments } = usePublic();
  const { openBooking, rebookFromHistory, confirmedBooking } = useBooking();
  const {
    customerUser,
    isCustomerAuthenticated,
    customerLoading,
    customerLogin,
    customerRegister,
    customerLogout,
    customerUpdateProfile,
  } = useCustomerAuth();

  // Auth form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState(() => prefillGuest?.name || '');
  const [regEmail, setRegEmail] = useState(() => prefillGuest?.email || '');
  const [regPhone, setRegPhone] = useState(() => prefillGuest?.phone || '');
  const [regPassword, setRegPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Bookings & history state
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total_count: 0,
    upcoming_count: 0,
    past_count: 0,
    completed_count: 0,
    cancelled_count: 0,
    total_spent: 0,
  });
  const [cutoffHours, setCutoffHours] = useState(24);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (prefillGuest?.name) setRegName(prefillGuest.name);
    if (prefillGuest?.email) setRegEmail(prefillGuest.email);
    if (prefillGuest?.phone) setRegPhone(prefillGuest.phone);
  }, [prefillGuest]);

  useEffect(() => {
    if (customerUser) {
      setProfileName(customerUser.name || '');
      setProfilePhone(customerUser.phone || '');
    }
  }, [customerUser]);

  const fetchMyBookings = useCallback(async () => {
    if (!isCustomerAuthenticated) return;
    try {
      setBookingsLoading(true);
      setBookingsError('');
      const res = await api.customerGetBookings();
      if (res?.data) {
        setBookings(res.data.bookings || []);
        setStats(res.data.stats || {});
        setCutoffHours(res.data.cancellation_cutoff_hours || 24);
      }
    } catch (err) {
      setBookingsError(err.message || 'Unable to load your bookings.');
    } finally {
      setBookingsLoading(false);
    }
  }, [isCustomerAuthenticated]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings, confirmedBooking?.booking_reference]);

  const currencySymbol = payments?.currency_symbol || '₹';
  const brandName = (salon?.salon_name || 'RiTiVerse').toUpperCase();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setAuthSubmitting(true);
      setAuthError('');
      await customerLogin(loginEmail, loginPassword);
      onAccountTabChange?.('upcoming');
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setAuthSubmitting(true);
      setAuthError('');
      await customerRegister({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      onAccountTabChange?.('upcoming');
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!window.confirm(`Cancel reservation ${booking.booking_reference} for ${booking.booking_date}?`)) {
      return;
    }
    try {
      setCancellingId(booking.id);
      setActionMsg('');
      const res = await api.customerCancelBooking(booking.id);
      setActionMsg(`Reservation ${booking.booking_reference} has been cancelled.`);
      if (selectedBooking?.id === booking.id && res?.data) {
        setSelectedBooking(res.data);
      }
      await fetchMyBookings();
    } catch (err) {
      alert(err.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMsg('');
      setProfileError('');
      await customerUpdateProfile({
        name: profileName,
        phone: profilePhone,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      });
      setCurrentPassword('');
      setNewPassword('');
      setProfileMsg('Your client profile has been updated.');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (accountTab === 'upcoming') {
      if (!searchTerm.trim() && !b.is_upcoming) return false;
    } else if (accountTab === 'history') {
      if (!b.is_history) return false;
      if (['completed', 'cancelled'].includes(statusFilter) && b.booking_status !== statusFilter) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const hay = [
        b.booking_reference,
        b.stylist_name,
        b.notes,
        b.booking_date,
        ...(b.items || []).map((it) => it.item_name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });

  if (customerLoading) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#B4563E] border-t-transparent animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#665B54]">
            Loading Client Suite...
          </p>
        </div>
      </div>
    );
  }

  // AUTHENTICATION GATE: CLIENT SIGN IN / REGISTER
  if (!isCustomerAuthenticated) {
    const isRegister = authMode === 'register';

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EFE5D8] via-[#F7F1E8] to-[#EDE2D3] px-4 py-8 sm:py-12 flex flex-col justify-center">
        <div className="max-w-5xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#1A1614] hover:text-[#933E29] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to {brandName}</span>
            </button>

            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#933E29] font-semibold">
              Client Portal
            </span>
          </div>

          <div className="relative bg-[#FFFDF8] border border-[#B4563E]/35 shadow-[0_24px_60px_-18px_rgba(26,22,20,0.18)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            <CornerMarks all size={14} thickness={2} color="text-[#B4563E]" />

            {/* Left Editorial Brand Column */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#241D19] via-[#1D1714] to-[#15110E] p-8 sm:p-10 text-[#F7F1E8] flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <span className="inline-block border border-[#D6A984]/40 bg-[#FFFDF8]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#D6A984]">
                  {brandName} Client Suite
                </span>

                <h1 className="font-sans text-3xl sm:text-4xl font-semibold uppercase tracking-[-0.04em] leading-[1.02]">
                  Your Visits, Rituals &amp; History
                </h1>

                <p className="font-sans text-sm leading-relaxed text-[#F7F1E8]/80">
                  Sign in or create your personal client profile using the same email from your bookings to view upcoming reservations, treatment notes, receipts, and past appointment history.
                </p>
              </div>

              <div className="space-y-3 border-t border-[#F7F1E8]/15 pt-5 text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D6A984]" />
                  <span>Auto-syncs guest bookings made with your email</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-[#D6A984]" />
                  <span>Complete past visits, stylists &amp; itemized billing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#D6A984]" />
                  <span>One-click rebooking &amp; online cancellation control</span>
                </div>
              </div>
            </div>

            {/* Right Auth Forms */}
            <div className="lg:col-span-7 p-7 sm:p-10 bg-white space-y-6">
              <div className="flex border border-[#1A1614]/15 bg-[#F3E7DB]/70 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    onAuthModeChange?.('login');
                  }}
                  className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                    !isRegister ? 'bg-[#B4563E] text-[#FFFDF8] shadow-sm' : 'text-[#1A1614]/75 hover:text-[#1A1614]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    onAuthModeChange?.('register');
                  }}
                  className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                    isRegister ? 'bg-[#B4563E] text-[#FFFDF8] shadow-sm' : 'text-[#1A1614]/75 hover:text-[#1A1614]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-xs font-mono text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {!isRegister ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#665B54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#665B54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-3 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
                  >
                    {authSubmitting ? 'Signing In...' : 'Sign In & View My Bookings'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#665B54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                          placeholder="e.g. Seraphina Vance"
                          className="w-full pl-10 pr-4 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#665B54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          required
                          placeholder="+1 (555) 234-5678"
                          className="w-full pl-10 pr-4 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                      Email Address (Links Prior Bookings) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#665B54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                      Password (Min 6 Characters) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#665B54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        placeholder="Create a secure password"
                        className="w-full pl-10 pr-4 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-3 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
                  >
                    {authSubmitting ? 'Creating Account...' : 'Create Account & View Bookings'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED CLIENT PORTAL: MY BOOKINGS, PAST HISTORY & PROFILE
  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#1A1614] px-4 sm:px-8 lg:px-12 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar */}
        <header className="relative bg-[#FFFDF8] border border-[#B4563E]/30 p-5 sm:p-8 shadow-sm">
          <CornerMarks all size={12} thickness={2} color="text-[#B4563E]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#B4563E] text-[#FFFDF8] font-serif italic text-xl sm:text-2xl flex items-center justify-center border-2 border-[#FFFDF8] shadow-md shrink-0">
                {customerUser?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#933E29] font-semibold">
                    {brandName} Client Suite
                  </span>
                  <span className="inline-flex items-center gap-1 border border-[#2FA66A]/60 bg-[#FFFDF8] px-2 py-0.5 text-[10px] font-mono uppercase text-[#1A1614]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2FA66A]" />
                    Verified Guest
                  </span>
                </div>
                <h1 className="font-sans text-xl sm:text-3xl font-semibold tracking-tight text-[#1A1614] mt-1 break-words">
                  Welcome back, {customerUser?.name}
                </h1>
                <p className="font-mono text-xs text-[#665B54] break-all sm:break-normal">
                  {customerUser?.email} {customerUser?.phone ? `· ${customerUser.phone}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onBackToSite}
                className="px-4 py-2.5 border border-[#1A1614]/20 bg-[#FFFDF8] hover:bg-[#F3E7DB] font-mono text-xs uppercase tracking-wider text-[#1A1614] inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Studio Home</span>
              </button>

              <button
                type="button"
                onClick={() => openBooking()}
                className="px-5 py-2.5 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book New Visit</span>
              </button>

              <button
                type="button"
                onClick={customerLogout}
                className="px-4 py-2.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* 4 Summary Metrics */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#FFFDF8] border border-[#1A1614]/15 p-4 sm:p-5 space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#665B54] block">Upcoming Visits</span>
            <div className="font-sans text-2xl sm:text-3xl font-semibold text-[#1A1614]">{stats.upcoming_count || 0}</div>
            <span className="font-mono text-[11px] text-[#933E29] block">Scheduled reservations</span>
          </div>

          <div className="bg-[#FFFDF8] border border-[#1A1614]/15 p-4 sm:p-5 space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#665B54] block">Past History</span>
            <div className="font-sans text-2xl sm:text-3xl font-semibold text-[#1A1614]">{stats.past_count || 0}</div>
            <span className="font-mono text-[11px] text-[#665B54] block">Previous atelier records</span>
          </div>

          <div className="bg-[#FFFDF8] border border-[#1A1614]/15 p-4 sm:p-5 space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#665B54] block">Completed Rituals</span>
            <div className="font-sans text-2xl sm:text-3xl font-semibold text-[#1A1614]">{stats.completed_count || 0}</div>
            <span className="font-mono text-[11px] text-emerald-700 block">Fulfilled sessions</span>
          </div>

          <div className="bg-[#FFFDF8] border border-[#1A1614]/15 p-4 sm:p-5 space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#665B54] block">Total Atelier Spend</span>
            <div className="font-sans text-2xl sm:text-3xl font-semibold text-[#1A1614] break-words">
              {currencySymbol}{Number(stats.total_spent || 0).toFixed(2)}
            </div>
            <span className="font-mono text-[11px] text-[#665B54] block">Excluding cancelled bookings</span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1614]/15 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'upcoming', label: `Upcoming Bookings (${stats.upcoming_count || 0})`, icon: Calendar },
              { id: 'history', label: `Past History (${stats.past_count || 0})`, icon: History },
              { id: 'profile', label: 'Profile & Password', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = accountTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    onAccountTabChange?.(tab.id);
                  }}
                  className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 transition-all border ${
                    isActive
                      ? 'bg-[#B4563E] text-[#FFFDF8] border-[#B4563E]'
                      : 'bg-[#FFFDF8] text-[#1A1614] border-[#1A1614]/20 hover:bg-[#F3E7DB]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {accountTab !== 'profile' && (
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 min-w-[180px] sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-[#665B54] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ref, service, artist..."
                  className="pl-8 pr-3 py-2 bg-[#FFFDF8] border border-[#1A1614]/20 text-xs font-mono text-[#1A1614] focus:outline-none focus:border-[#B4563E] w-full sm:w-56"
                />
              </div>

              {accountTab === 'history' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#FFFDF8] border border-[#1A1614]/20 text-xs font-mono text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                >
                  <option value="all">All Past History</option>
                  <option value="completed">Completed Only</option>
                  <option value="cancelled">Cancelled Only</option>
                </select>
              )}

              <button
                type="button"
                onClick={fetchMyBookings}
                className="p-2 bg-[#FFFDF8] border border-[#1A1614]/20 text-[#1A1614] hover:bg-[#F3E7DB]"
                title="Refresh Bookings"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {actionMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center justify-between">
            <span>{actionMsg}</span>
            <button type="button" onClick={() => setActionMsg('')} className="font-semibold underline">
              Dismiss
            </button>
          </div>
        )}

        {bookingsError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-xs font-mono text-red-700">
            {bookingsError}
          </div>
        )}

        {/* UPCOMING OR PAST HISTORY LIST */}
        {(accountTab === 'upcoming' || accountTab === 'history') && (
          <div className="space-y-4">
            {bookingsLoading ? (
              <div className="bg-[#FFFDF8] border border-[#1A1614]/15 p-12 text-center font-mono text-xs text-[#665B54]">
                Loading your appointments...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-[#FFFDF8] border border-[#1A1614]/15 p-12 text-center space-y-4">
                <p className="font-sans text-base font-medium text-[#1A1614]">
                  {accountTab === 'upcoming'
                    ? 'You have no upcoming reservations scheduled.'
                    : 'No past appointment records match your filter.'}
                </p>
                <button
                  type="button"
                  onClick={() => openBooking()}
                  className="px-6 py-2.5 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-xs uppercase tracking-wider font-semibold"
                >
                  Schedule an Appointment
                </button>
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#FFFDF8] border border-[#1A1614]/15 p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-[#B4563E]"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1614]/10 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#933E29] tracking-wider">
                          #{b.booking_reference}
                        </span>
                        <span className={`px-2.5 py-0.5 border text-[10px] font-mono uppercase font-bold ${STATUS_BADGE[b.booking_status] || 'bg-gray-100 text-gray-700'}`}>
                          {b.booking_status}
                        </span>
                        <span className={`px-2.5 py-0.5 border text-[10px] font-mono uppercase font-semibold ${PAYMENT_BADGE[b.payment_status] || 'bg-gray-100 text-gray-700'}`}>
                          Payment: {String(b.payment_status || 'pending').replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm font-sans font-semibold text-[#1A1614]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#B4563E]" />
                          {new Date(`${b.booking_date}T00:00:00`).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#665B54]">
                          <Clock className="w-3.5 h-3.5 text-[#B4563E]" />
                          {b.start_time_formatted} – {b.end_time_formatted} ({b.total_duration} min)
                        </span>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#665B54] block">
                        Total ({String(b.payment_mode || 'pay_at_salon').replace(/_/g, ' ')})
                      </span>
                      <span className="font-sans text-2xl font-bold text-[#1A1614]">
                        {currencySymbol}{Number(b.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Services & Artist Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-7 space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#665B54] block">
                        Selected Services &amp; Rituals
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(b.items || []).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-[#F7F1E8] border border-[#B4563E]/25 text-xs font-medium text-[#1A1614] inline-flex items-center gap-2"
                          >
                            <span>{item.item_name}</span>
                            <span className="font-mono text-[11px] text-[#933E29]">
                              {currencySymbol}{Number(item.price).toFixed(2)}
                            </span>
                          </span>
                        ))}
                      </div>
                      {b.notes && (
                        <p className="text-xs font-mono text-[#665B54] pt-1">
                          Note: &ldquo;{b.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-5 flex flex-wrap lg:justify-end items-center gap-2.5">
                      {b.stylist_name && (
                        <div className="flex items-center gap-2 mr-auto lg:mr-2 bg-[#F3E7DB]/70 px-3 py-1.5 border border-[#1A1614]/15">
                          <img
                            src={b.stylist_avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80'}
                            alt={b.stylist_name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div className="text-left">
                            <span className="block text-xs font-semibold text-[#1A1614] leading-tight">{b.stylist_name}</span>
                            <span className="block font-mono text-[10px] text-[#665B54] leading-tight">{b.stylist_title || 'Atelier Artist'}</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="px-3.5 py-2 border border-[#1A1614]/25 bg-[#FFFDF8] hover:bg-[#F3E7DB] font-mono text-[11px] uppercase tracking-wider font-semibold inline-flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#B4563E]" />
                        <span>Full Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => rebookFromHistory(b)}
                        className="px-3.5 py-2 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-[11px] uppercase tracking-wider font-semibold inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Book Again</span>
                      </button>

                      {b.can_cancel && (
                        <button
                          type="button"
                          disabled={cancellingId === b.id}
                          onClick={() => handleCancelBooking(b)}
                          className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-mono text-[11px] uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{cancellingId === b.id ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE & PASSWORD */}
        {accountTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="bg-[#FFFDF8] border border-[#1A1614]/15 p-6 sm:p-8 max-w-2xl space-y-6">
            <div className="border-b border-[#1A1614]/15 pb-4">
              <h2 className="font-sans text-2xl font-semibold text-[#1A1614]">Personal Information</h2>
              <p className="font-mono text-xs text-[#665B54]">
                Update your contact details or change your client account password.
              </p>
            </div>

            {profileMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 font-mono text-xs text-emerald-800">
                {profileMsg}
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 font-mono text-xs text-red-700">
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] font-semibold mb-1.5">
                  Account Email (Linked to Your Bookings)
                </label>
                <input
                  type="email"
                  value={customerUser?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 border border-[#1A1614]/10 bg-[#EAE0D2]/40 text-sm text-[#665B54] cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#1A1614]/15 space-y-4">
              <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#1A1614] block">
                Change Password (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Leave blank if unchanged"
                    className="w-full px-3.5 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-[#665B54] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 border border-[#1A1614]/20 bg-[#F7F1E8]/45 text-sm text-[#1A1614] focus:outline-none focus:border-[#B4563E]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-xs uppercase tracking-wider font-semibold disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* BOOKING FULL DETAILS MODAL */}
        <AnimatePresence>
          {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBooking(null)}
                className="fixed inset-0 bg-black/45 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="relative z-10 max-w-xl w-full bg-[#FFFDF8] border border-[#B4563E]/40 p-5 sm:p-8 shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto space-y-5"
              >
                <CornerMarks all size={10} thickness={2} color="text-[#B4563E]" />

                <div className="flex items-start justify-between border-b border-[#1A1614]/15 pb-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#933E29] font-semibold">
                      Appointment Details &amp; Receipt
                    </span>
                    <h3 className="font-sans text-2xl font-semibold text-[#1A1614]">
                      #{selectedBooking.booking_reference}
                    </h3>
                    <span className="font-mono text-[11px] text-[#665B54]">
                      Booked on {selectedBooking.created_at}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="w-8 h-8 border border-[#1A1614]/20 bg-[#F7F1E8] flex items-center justify-center hover:bg-[#EAE0D2]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#F7F1E8] border border-[#1A1614]/15 text-xs font-mono">
                  <div>
                    <span className="text-[#665B54] block">Appointment Date</span>
                    <strong className="text-[#1A1614]">{selectedBooking.booking_date}</strong>
                  </div>
                  <div>
                    <span className="text-[#665B54] block">Time &amp; Duration</span>
                    <strong className="text-[#1A1614]">
                      {selectedBooking.start_time_formatted} – {selectedBooking.end_time_formatted} ({selectedBooking.total_duration}m)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#665B54] block">Booking Status</span>
                    <strong className="uppercase text-[#933E29]">{selectedBooking.booking_status}</strong>
                  </div>
                  <div>
                    <span className="text-[#665B54] block">Payment</span>
                    <strong className="uppercase text-[#1A1614]">
                      {String(selectedBooking.payment_status).replace(/_/g, ' ')} ({String(selectedBooking.payment_mode).replace(/_/g, ' ')})
                    </strong>
                  </div>
                </div>

                {/* Artist & Studio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 border border-black/10 space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#665B54] block">Assigned Artisan</span>
                    <strong className="text-sm text-[#1A1614] block">{selectedBooking.stylist_name || 'Master Team Artist'}</strong>
                    <span className="font-mono text-[11px] text-[#665B54]">{selectedBooking.stylist_title || 'RiTiVerse Atelier'}</span>
                  </div>

                  <div className="p-3.5 border border-black/10 space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#665B54] block">Studio Location</span>
                    <strong className="text-sm text-[#1A1614] block">{salon?.salon_name || 'RiTiVerse Salon'}</strong>
                    <span className="text-[11px] text-[#665B54] block">{salon?.address || '452 Boulevard Saint-Honoré'}</span>
                  </div>
                </div>

                {/* Line Items & Pricing */}
                <div className="border border-black/10 p-4 space-y-2.5 text-xs font-mono">
                  <span className="text-[10px] uppercase tracking-widest text-[#665B54] block font-bold">
                    Itemized Treatments
                  </span>
                  {(selectedBooking.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-black/[0.06] last:border-b-0">
                      <div>
                        <span className="font-sans font-semibold text-[#1A1614] block">{item.item_name}</span>
                        <span className="text-[10px] text-[#665B54]">{item.duration_minutes} mins</span>
                      </div>
                      <span className="font-bold text-[#1A1614]">{currencySymbol}{Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-black/10 space-y-1 text-[#665B54]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{currencySymbol}{Number(selectedBooking.subtotal || 0).toFixed(2)}</span>
                    </div>
                    {Number(selectedBooking.discount_amount || 0) > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Promo Discount {selectedBooking.promo_code ? `(${selectedBooking.promo_code})` : ''}</span>
                        <span>-{currencySymbol}{Number(selectedBooking.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(selectedBooking.tax_amount || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Tax / GST</span>
                        <span>{currencySymbol}{Number(selectedBooking.tax_amount).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(selectedBooking.deposit_amount || 0) > 0 && (
                      <div className="flex justify-between text-[#933E29]">
                        <span>Online Deposit / Prepaid</span>
                        <span>{currencySymbol}{Number(selectedBooking.deposit_amount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-[#1A1614] pt-2 border-t border-black/10">
                      <span>Grand Total</span>
                      <span>{currencySymbol}{Number(selectedBooking.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="p-3.5 bg-[#F3E7DB]/75 border border-[#B4563E]/30 text-xs font-mono text-[#1A1614]">
                    <strong className="block text-[10px] uppercase tracking-wider text-[#933E29] mb-1">Guest &amp; Atelier Notes</strong>
                    {selectedBooking.notes}
                  </div>
                )}

                {selectedBooking.is_upcoming && !selectedBooking.can_cancel && (
                  <p className="text-[11px] font-mono text-[#665B54] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#B4563E]" />
                    <span>Online cancellation closes {cutoffHours}h prior to appointment. Call {salon?.phone || 'concierge'} for changes.</span>
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedBooking;
                      setSelectedBooking(null);
                      rebookFromHistory(target);
                    }}
                    className="px-5 py-2.5 bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] font-mono text-xs uppercase tracking-wider font-semibold"
                  >
                    Book Again
                  </button>
                  {selectedBooking.can_cancel && (
                    <button
                      type="button"
                      disabled={cancellingId === selectedBooking.id}
                      onClick={() => handleCancelBooking(selectedBooking)}
                      className="px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 font-mono text-xs uppercase tracking-wider font-semibold"
                    >
                      {cancellingId === selectedBooking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
