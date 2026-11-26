// frontend/src/components/admin/AdminCustomers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Eye, Mail, Phone, Calendar,
  Clock, UserCheck, Users, Award, ShieldCheck, ShieldOff, X
} from 'lucide-react';
import { api } from '../../services/api';
import { usePublic } from '../../context/PublicContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminCustomers() {
  const { payments } = usePublic();
  const { permissions } = useAuth();
  const currencySymbol = payments?.currency_symbol || '₹';

  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Detail / Booking History Modal
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchCustomers = useCallback(async (searchQuery, filterType) => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filterType && filterType !== 'all') params.type = filterType;
      const res = await api.getCustomers(params);
      if (res?.data) {
        setCustomers(res.data.customers || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customer directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(appliedSearch, typeFilter);
  }, [fetchCustomers, appliedSearch, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchTerm.trim());
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setAppliedSearch('');
    setTypeFilter('all');
  };

  const openCustomerHistory = async (cust) => {
    try {
      setDetailLoading(true);
      setDetailData({ customer: cust, bookings: [] });
      const res = await api.getCustomerDetail({
        user_id: cust.user_id || '',
        email: cust.email || '',
        phone: cust.phone || '',
      });
      if (res?.data) {
        setDetailData(res.data);
      }
    } catch (err) {
      alert(err.message || 'Unable to load customer booking history.');
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleAccountStatus = async (cust) => {
    if (!permissions.canManageCustomerStatus || !cust.user_id) return;
    const nextStatus = cust.is_active ? 0 : 1;
    const verb = nextStatus ? 'activate' : 'disable';
    if (!window.confirm(`Are you sure you want to ${verb} portal access for ${cust.name}?`)) return;

    try {
      setStatusUpdatingId(cust.user_id);
      await api.updateCustomerStatus(cust.user_id, nextStatus);
      await fetchCustomers(appliedSearch, typeFilter);
      if (detailData?.customer?.user_id === cust.user_id) {
        setDetailData((prev) => ({
          ...prev,
          customer: { ...prev.customer, is_active: nextStatus },
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update customer account status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-salon-dark">
            Client Directory &amp; CRM
          </h1>
          <p className="text-xs sm:text-sm text-salon-muted font-light">
            View registered salon members, walk-in guests, visit counts, and full appointment history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchCustomers(appliedSearch, typeFilter)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-full bg-salon-card border border-salon-border text-salon-dark hover:bg-salon-soft text-xs font-semibold transition-colors inline-flex items-center gap-2 shadow-xs"
          title="Refresh Customer List"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-salon-muted">Total Clients</span>
            <div className="w-8 h-8 rounded-xl bg-salon-soft text-salon-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-salon-dark">
            {stats?.total_customers ?? customers.length}
          </div>
          <span className="text-[11px] text-salon-muted block">Combined members &amp; guests</span>
        </div>

        <div className="p-5 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-salon-muted">Registered Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-[#2FA66A]/15 text-[#2FA66A] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-salon-dark">
            {stats?.registered_count ?? 0}
          </div>
          <span className="text-[11px] text-[#2FA66A] font-semibold block">Active portal logins</span>
        </div>

        <div className="p-5 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-salon-muted">Guest Bookers</span>
            <div className="w-8 h-8 rounded-xl bg-[#D6A984]/25 text-[#933E29] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-salon-dark">
            {stats?.guest_count ?? 0}
          </div>
          <span className="text-[11px] text-salon-muted block">Direct &amp; walk-in visitors</span>
        </div>

        {permissions.canViewRevenue ? (
          <div className="p-5 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-salon-muted">Client LTV Total</span>
              <div className="w-8 h-8 rounded-xl bg-salon-soft text-salon-primary flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-salon-dark">
              {currencySymbol}{Number(stats?.total_lifetime_spend || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#933E29] font-semibold block">
              {stats?.repeat_count ?? 0} repeat clients (2+ visits)
            </span>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-salon-muted">Repeat Clients</span>
              <div className="w-8 h-8 rounded-xl bg-salon-soft text-salon-primary flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-salon-dark">
              {stats?.repeat_count ?? 0}
            </div>
            <span className="text-[11px] text-[#933E29] font-semibold block">2+ studio visits</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-salon-card border border-salon-border shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-salon-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-salon-border text-xs text-salon-dark focus:outline-none focus:border-salon-primary bg-salon-card"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-salon-border text-xs text-salon-dark bg-salon-card focus:outline-none focus:border-salon-primary"
          >
            <option value="all">All Clients</option>
            <option value="registered">Registered Accounts Only</option>
            <option value="guest">Guest Bookers Only</option>
            <option value="repeat">Repeat Visitors (2+ Visits)</option>
          </select>

          {(appliedSearch || typeFilter !== 'all') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-salon-primary hover:underline font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Customer Directory Table */}
      <div className="bg-salon-card rounded-3xl border border-salon-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-salon-muted">Loading customer directory...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-salon-muted">
            No customers matching your search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-salon-light text-salon-muted uppercase text-[10px] font-bold tracking-wider border-b border-salon-border">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Account Type</th>
                  <th className="px-6 py-4">Visits</th>
                  <th className="px-6 py-4">Last / Next Visit</th>
                  {permissions.canViewBookingAmount && <th className="px-6 py-4">Lifetime Spend</th>}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salon-border">
                {customers.map((c) => (
                  <tr key={c.client_key} className="hover:bg-salon-light/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            loading="lazy"
                            className="w-9 h-9 rounded-full object-cover border border-salon-border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-salon-soft text-[#933E29] font-serif font-semibold text-sm flex items-center justify-center border border-salon-border flex-shrink-0">
                            {(c.name || 'G').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-salon-dark">{c.name}</div>
                          {c.last_booking_reference && (
                            <span className="text-[10px] font-mono text-salon-muted block">
                              Latest: {c.last_booking_reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-salon-dark">
                        <Mail className="w-3 h-3 text-salon-primary flex-shrink-0" />
                        <span className="truncate max-w-[190px]">{c.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-salon-muted">
                        <Phone className="w-3 h-3 text-salon-muted flex-shrink-0" />
                        <span>{c.phone || '—'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 space-y-1">
                      {c.has_account ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-salon-soft text-[#933E29]">
                            Registered
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              c.is_active ? 'text-[#2FA66A]' : 'text-red-600'
                            }`}
                          >
                            {c.is_active ? 'Active Account' : 'Disabled'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-salon-surface text-salon-muted">
                          Guest Checkout
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-salon-dark">
                        {c.total_bookings} {c.total_bookings === 1 ? 'visit' : 'visits'}
                      </div>
                      <div className="text-[10px] text-salon-muted">
                        {c.upcoming_count} upcoming · {c.completed_count} done
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[11px]">
                      <div className="font-medium text-salon-dark">
                        Last: {c.last_visit_date || 'No visits yet'}
                      </div>
                      {c.next_visit_date ? (
                        <div className="text-[#2FA66A] font-semibold">
                          Next: {c.next_visit_date}
                        </div>
                      ) : (
                        <div className="text-salon-muted">Joined: {(c.joined_at || '').slice(0, 10) || '—'}</div>
                      )}
                    </td>

                    {permissions.canViewBookingAmount && (
                      <td className="px-6 py-4 font-bold text-salon-dark">
                        {currencySymbol}{Number(c.total_spent || 0).toFixed(2)}
                      </td>
                    )}

                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => openCustomerHistory(c)}
                        className="px-3 py-1.5 rounded-xl bg-salon-light hover:bg-salon-soft border border-salon-border text-salon-dark hover:text-[#933E29] text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>

                      {permissions.canManageCustomerStatus && c.has_account && c.user_id && (
                        <button
                          type="button"
                          disabled={statusUpdatingId === c.user_id}
                          onClick={() => handleToggleAccountStatus(c)}
                          className={`p-1.5 rounded-xl border transition-colors inline-flex items-center ${
                            c.is_active
                              ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                              : 'bg-[#2FA66A]/10 hover:bg-[#2FA66A]/20 border-[#2FA66A]/30 text-[#2FA66A]'
                          }`}
                          title={c.is_active ? 'Disable Client Portal Access' : 'Activate Client Portal Access'}
                        >
                          {c.is_active ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CLIENT HISTORY & PROFILE MODAL */}
      {detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-salon-border space-y-5 max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-salon-border pb-4">
              <div className="flex items-center gap-3.5">
                {detailData.customer?.avatar ? (
                  <img
                    src={detailData.customer.avatar}
                    alt={detailData.customer.name}
                    className="w-12 h-12 rounded-full object-cover border border-salon-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-salon-soft text-[#933E29] font-serif font-semibold text-lg flex items-center justify-center border border-salon-border">
                    {(detailData.customer?.name || 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-editorial text-2xl font-medium text-salon-dark">
                      {detailData.customer?.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-salon-soft text-[#933E29]">
                      {detailData.customer?.has_account ? 'Registered Member' : 'Guest Booker'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-salon-muted mt-1">
                    <span>{detailData.customer?.email || 'No email'}</span>
                    <span>{detailData.customer?.phone || 'No phone'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailData(null)}
                className="p-2 rounded-xl bg-salon-light hover:bg-salon-soft text-salon-dark border border-salon-border"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-salon-light border border-salon-border">
                <span className="text-[10px] uppercase font-bold text-salon-muted block">Total Visits</span>
                <strong className="text-lg text-salon-dark">{detailData.customer?.total_bookings ?? 0}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-salon-light border border-salon-border">
                <span className="text-[10px] uppercase font-bold text-salon-muted block">Upcoming</span>
                <strong className="text-lg text-[#2FA66A]">{detailData.customer?.upcoming_count ?? 0}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-salon-light border border-salon-border">
                <span className="text-[10px] uppercase font-bold text-salon-muted block">Completed</span>
                <strong className="text-lg text-[#933E29]">{detailData.customer?.completed_count ?? 0}</strong>
              </div>
              {permissions.canViewBookingAmount && (
                <div className="p-3 rounded-2xl bg-salon-light border border-salon-border">
                  <span className="text-[10px] uppercase font-bold text-salon-muted block">Total Spend</span>
                  <strong className="text-lg text-salon-dark">
                    {currencySymbol}{Number(detailData.customer?.total_spent || 0).toFixed(2)}
                  </strong>
                </div>
              )}
            </div>

            {/* Appointments History List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-salon-muted">
                Appointment &amp; Service History
              </h4>

              {detailLoading ? (
                <div className="p-8 text-center text-xs text-salon-muted">Loading booking history...</div>
              ) : !detailData.bookings?.length ? (
                <div className="p-8 text-center text-xs text-salon-muted bg-salon-light/50 rounded-2xl border border-salon-border">
                  This client has registered a portal account with zero bookings so far.
                </div>
              ) : (
                <div className="space-y-3">
                  {detailData.bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-salon-light/55 border border-salon-border space-y-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-bold text-salon-primary">{b.booking_reference}</span>
                          <span className="inline-flex items-center gap-1 text-salon-dark font-medium">
                            <Calendar className="w-3.5 h-3.5 text-salon-muted" />
                            {b.booking_date}
                          </span>
                          <span className="inline-flex items-center gap-1 text-salon-muted">
                            <Clock className="w-3.5 h-3.5" />
                            {b.start_time} ({b.total_duration} min)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                          {permissions.canViewBookingAmount && (
                            <span className="font-bold text-salon-dark">
                              {currencySymbol}{Number(b.total_amount).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-salon-muted">
                        <span>
                          Artist: <strong className="text-salon-dark">{b.stylist_name || 'Unassigned'}</strong>
                        </span>
                        <span className="uppercase font-mono text-[10px]">
                          Payment: {b.payment_status?.replace(/_/g, ' ')} ({b.payment_mode?.replace(/_/g, ' ')})
                        </span>
                      </div>

                      {b.items?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {b.items.map((item, idx) => (
                            <span
                              key={`${b.id}-${idx}`}
                              className="px-2.5 py-1 rounded-lg bg-salon-card border border-salon-border text-[11px] text-salon-dark"
                            >
                              {item.item_name}
                              {permissions.canViewBookingAmount && item.price !== undefined
                                ? ` · ${currencySymbol}${Number(item.price).toFixed(2)}`
                                : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      {b.notes && (
                        <p className="text-[11px] text-salon-muted italic border-t border-salon-border pt-2">
                          Note: {b.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
