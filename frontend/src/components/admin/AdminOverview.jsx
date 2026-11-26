// frontend/src/components/admin/AdminOverview.jsx
import React, { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle2, Clock, DollarSign,
  Plus, ArrowUpRight
} from 'lucide-react';
import { api } from '../../services/api';
import { usePublic } from '../../context/PublicContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminOverview({ onNavigate }) {
  const { payments } = usePublic();
  const { user, permissions } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getBookings({ limit: 6 });
      if (res?.data) {
        setRecentBookings(res.data.bookings || []);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currencySymbol = payments?.currency_symbol || '₹';
  const isReceptionist = user?.role === 'receptionist';

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-salon-dark">
            {isReceptionist ? 'Front Desk Queue' : permissions.canViewRevenue ? 'Atelier Executive Overview' : 'Daily Studio Schedule'}
          </h1>
          <p className="text-xs sm:text-sm text-salon-muted font-light">
            {isReceptionist
              ? 'Today’s guest arrivals, pending check-ins, and walk-in registrations.'
              : permissions.canViewRevenue
              ? 'Real-time reservations, revenue projections, and stylist operations.'
              : 'Upcoming studio appointments and assigned schedule items.'}
          </p>
        </div>

        {permissions.canCreateWalkIn && (
          <button
            type="button"
            onClick={() => onNavigate('bookings')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation / Walk-In</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Bookings */}
        <div className="p-6 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-salon-muted">Total Appointments</span>
            <div className="w-9 h-9 rounded-xl bg-salon-soft text-salon-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-salon-dark">
            {stats?.total_count || recentBookings.length || 0}
          </div>
          <span className="text-[11px] text-[#2FA66A] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active studio cycle</span>
          </span>
        </div>

        {/* Confirmed */}
        <div className="p-6 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-salon-muted">Confirmed Guests</span>
            <div className="w-9 h-9 rounded-xl bg-[#2FA66A]/15 text-[#2FA66A] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#2FA66A]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-salon-dark">
            {stats?.confirmed_count || 0}
          </div>
          <span className="text-[11px] text-salon-muted font-light">
            Ready for atelier arrival
          </span>
        </div>

        {/* Pending Requests */}
        <div className="p-6 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-salon-muted">Pending Approval</span>
            <div className="w-9 h-9 rounded-xl bg-[#D6A984]/25 text-[#933E29] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-salon-dark">
            {stats?.pending_count || 0}
          </div>
          <span className="text-[11px] text-[#933E29] font-semibold">
            Requires front-desk review
          </span>
        </div>

        {/* Revenue (Super Admin & Manager) OR Today's Schedule (Receptionist & Stylist) */}
        {permissions.canViewRevenue ? (
          <div className="p-6 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-salon-muted">Projected Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-salon-soft text-salon-primary flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-salon-dark">
              {currencySymbol}{Number(stats?.total_revenue || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-salon-muted font-light">
              Confirmed &amp; completed bookings
            </span>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-salon-muted">Today&apos;s Queue</span>
              <div className="w-9 h-9 rounded-xl bg-salon-soft text-salon-primary flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-salon-dark">
              {stats?.today_count || 0}
            </div>
            <span className="text-[11px] text-salon-muted font-light">
              {stats?.completed_count || 0} completed overall
            </span>
          </div>
        )}

      </div>

      {/* Recent Bookings Table */}
      <div className="bg-salon-card rounded-3xl border border-salon-border shadow-xs overflow-hidden">
        <div className="p-6 border-b border-salon-border flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">
              Recent Atelier Reservations
            </h3>
            <p className="text-xs text-salon-muted">Latest bookings submitted by website guests or reception.</p>
          </div>

          <button
            onClick={() => onNavigate('bookings')}
            className="text-xs font-semibold text-salon-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-salon-muted">Loading appointments...</div>
        ) : recentBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-salon-muted">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-light text-salon-muted uppercase text-[10px] font-bold tracking-wider border-b border-salon-border">
                <tr>
                  <th className="px-6 py-3.5">Ref / Client</th>
                  <th className="px-6 py-3.5">Date &amp; Slot</th>
                  <th className="px-6 py-3.5">Artist</th>
                  {permissions.canViewBookingAmount && <th className="px-6 py-3.5">Amount</th>}
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-border">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-salon-light/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-salon-primary block">{b.booking_reference}</span>
                      <span className="font-medium text-salon-dark block">{b.customer_name}</span>
                      <span className="text-[11px] text-salon-muted block">{b.customer_phone}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-salon-dark">
                      <div>{b.booking_date}</div>
                      <div className="text-[11px] text-salon-muted">{b.start_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-salon-dark">{b.stylist_name || 'Unassigned'}</span>
                    </td>
                    {permissions.canViewBookingAmount && (
                      <td className="px-6 py-4 font-bold text-salon-dark">
                        {currencySymbol}{Number(b.total_amount).toFixed(2)}
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onNavigate('bookings')}
                        className="text-xs text-salon-primary font-semibold hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
