// frontend/src/components/admin/AdminBookings.jsx
import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Edit2, RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { usePublic } from '../../context/PublicContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminBookings() {
  const { stylists, services, payments } = usePublic();
  const { permissions } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Status modal state
  const [editingBooking, setEditingBooking] = useState(null);
  const [modalStatus, setModalStatus] = useState('confirmed');
  const [modalPayment, setModalPayment] = useState('pending');
  const [modalStylistId, setModalStylistId] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Walk-in modal state
  const [walkinOpen, setWalkinOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('Walk-In Guest');
  const [walkinPhone, setWalkinPhone] = useState('+1 (555) 000-0000');
  const [walkinStylistId, setWalkinStylistId] = useState('');
  const [walkinServices, setWalkinServices] = useState([1]);
  const [walkinLoading, setWalkinLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await api.getBookings(params);
      if (res?.data) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setModalStatus(booking.booking_status);
    setModalPayment(booking.payment_status);
    setModalStylistId(booking.stylist_id || '');
    setModalNotes(booking.notes || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      setUpdating(true);
      await api.updateBookingStatus(editingBooking.id, {
        booking_status: modalStatus,
        payment_status: modalPayment,
        stylist_id: modalStylistId ? Number(modalStylistId) : null,
        notes: modalNotes
      });
      setEditingBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to update booking status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateWalkin = async (e) => {
    e.preventDefault();
    try {
      setWalkinLoading(true);
      await api.createWalkIn({
        name: walkinName,
        phone: walkinPhone,
        stylist_id: walkinStylistId ? Number(walkinStylistId) : null,
        service_ids: walkinServices
      });
      setWalkinOpen(false);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to register walk-in.');
    } finally {
      setWalkinLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await api.deleteBooking(id);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to delete booking.');
    }
  };

  const currencySymbol = payments?.currency_symbol || '₹';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-salon-dark">
            Appointments &amp; Reservations
          </h1>
          <p className="text-xs sm:text-sm text-salon-muted font-light">
            Manage salon bookings, assign master stylists, and record concierge walk-ins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBookings}
            className="p-2.5 rounded-full bg-salon-card border border-salon-border text-salon-dark hover:bg-salon-light transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {permissions.canCreateWalkIn && (
            <button
              type="button"
              onClick={() => setWalkinOpen(true)}
              className="px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record Walk-In</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-salon-card border border-salon-border shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-salon-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, phone, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-salon-border text-xs text-salon-dark focus:outline-none focus:border-salon-primary bg-salon-card"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark bg-salon-card focus:outline-none focus:border-salon-primary"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark bg-salon-card focus:outline-none focus:border-salon-primary"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {(searchTerm || statusFilter || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
              className="text-xs text-salon-primary hover:underline font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>

      </div>

      {/* Bookings Table */}
      <div className="bg-salon-card rounded-3xl border border-salon-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-salon-muted">Loading appointments...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-salon-muted">
            No appointments matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-light text-salon-muted uppercase text-[10px] font-bold tracking-wider border-b border-salon-border">
                <tr>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Client Details</th>
                  <th className="px-6 py-4">Date &amp; Slot</th>
                  <th className="px-6 py-4">Stylist</th>
                  {permissions.canViewBookingAmount && <th className="px-6 py-4">Amount / Mode</th>}
                  <th className="px-6 py-4">Booking Status</th>
                  <th className="px-6 py-4">Payment</th>
                  {(permissions.canEditBooking || permissions.canDeleteBooking) && (
                    <th className="px-6 py-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-border">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-salon-light/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-salon-primary text-xs block">
                        {b.booking_reference}
                      </span>
                      <span className="text-[10px] text-salon-muted">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-salon-dark">{b.customer_name}</div>
                      <div className="text-[11px] text-salon-muted">{b.customer_phone}</div>
                      <div className="text-[10px] text-salon-muted truncate max-w-[150px]">{b.customer_email}</div>
                    </td>

                    <td className="px-6 py-4 font-medium text-salon-dark">
                      <div>{b.booking_date}</div>
                      <div className="text-salon-primary text-[11px] font-semibold">{b.start_time}</div>
                      <span className="text-[10px] text-salon-muted">{b.total_duration} min</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-salon-dark block">
                        {b.stylist_name || 'Any Available'}
                      </span>
                    </td>

                    {permissions.canViewBookingAmount && (
                      <td className="px-6 py-4">
                        <div className="font-bold text-salon-dark">
                          {currencySymbol}{Number(b.total_amount).toFixed(2)}
                        </div>
                        <span className="text-[10px] text-salon-muted uppercase">
                          {b.payment_mode.replace(/_/g, ' ')}
                        </span>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.booking_status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.booking_status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : b.booking_status === 'completed'
                            ? 'bg-salon-soft text-[#933E29]'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {b.booking_status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          b.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.payment_status === 'partially_paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-salon-surface text-salon-muted'
                        }`}
                      >
                        {b.payment_status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {(permissions.canEditBooking || permissions.canDeleteBooking) && (
                      <td className="px-6 py-4 text-right space-x-2">
                        {permissions.canEditBooking && (
                          <button
                            type="button"
                            onClick={() => openEditModal(b)}
                            className="p-1.5 rounded-lg bg-salon-light hover:bg-salon-soft text-salon-dark hover:text-salon-primary transition-colors inline-block"
                            title="Edit Status / Notes"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {permissions.canDeleteBooking && (
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-block"
                            title="Delete Reservation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STATUS UPDATE MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-salon-border">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-salon-dark">
                  Update Appointment
                </h3>
                <span className="text-xs font-mono font-bold text-salon-primary">
                  {editingBooking.booking_reference}
                </span>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-1.5 rounded-lg text-salon-muted hover:text-salon-dark"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1.5">
                  Booking Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark bg-salon-card"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending Approval</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1.5">
                  Payment Status
                </label>
                <select
                  value={modalPayment}
                  onChange={(e) => setModalPayment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark bg-salon-card"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid in Full</option>
                  <option value="partially_paid">Partially Paid (Deposit)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1.5">
                  Assign Stylist
                </label>
                <select
                  value={modalStylistId}
                  onChange={(e) => setModalStylistId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark bg-salon-card"
                >
                  <option value="">Unassigned (Any Available)</option>
                  {stylists.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.role_title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1.5">
                  Internal Atelier Notes
                </label>
                <textarea
                  rows="3"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark bg-salon-card"
                  placeholder="Special client preference, beverage choice, etc."
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="flex-1 py-2.5 rounded-full border border-salon-border text-xs font-semibold text-salon-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WALK-IN CREATOR MODAL */}
      {walkinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-salon-border">
              <h3 className="font-editorial text-2xl font-medium text-salon-dark">
                Quick Walk-In Registration
              </h3>
              <button onClick={() => setWalkinOpen(false)} className="text-salon-muted">✕</button>
            </div>

            <form onSubmit={handleCreateWalkin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1">Guest Name</label>
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1">Phone</label>
                <input
                  type="tel"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1">Available Stylist</label>
                <select
                  value={walkinStylistId}
                  onChange={(e) => setWalkinStylistId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark"
                >
                  <option value="">Any Available Stylist</option>
                  {stylists.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.role_title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-salon-muted mb-1">Select Service</label>
                <select
                  value={walkinServices[0] || 1}
                  onChange={(e) => setWalkinServices([Number(e.target.value)])}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({currencySymbol}{Number(s.offer_price || s.base_price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setWalkinOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-salon-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walkinLoading}
                  className="flex-1 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors"
                >
                  {walkinLoading ? 'Booking...' : 'Confirm Walk-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
