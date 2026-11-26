// frontend/src/components/admin/AdminSettings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Clock, Calendar, DollarSign, Users, Bell,
  Search, Shield, Tag, Plus, Trash2, Edit2, Save, ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { usePublic } from '../../context/PublicContext';
import { useAuth } from '../../context/AuthContext';
import { canAccessSettingsModule, getAllowedSettingsModules, getAppBasePath } from '../../utils/adminRouter';

export default function AdminSettings({ activeModule: propModule, onModuleChange }) {
  const { payments, refresh } = usePublic();
  const { user, permissions } = useAuth();

  const [localModule, setLocalModule] = useState('general');
  const allowedModuleIds = getAllowedSettingsModules(user?.role);
  const resolvedProp = propModule && canAccessSettingsModule(user?.role, propModule) ? propModule : null;
  const activeModule = resolvedProp || (canAccessSettingsModule(user?.role, localModule) ? localModule : allowedModuleIds[0] || 'general');

  const selectModule = (modId) => {
    if (!canAccessSettingsModule(user?.role, modId)) return;
    if (onModuleChange) {
      onModuleChange(modId);
    } else {
      setLocalModule(modId);
    }
  };

  const [settings, setSettings] = useState({});
  const currencySymbol = settings.general?.currency_symbol || payments?.currency_symbol || '₹';
  const [hours, setHours] = useState([]);
  const [closures, setClosures] = useState([]);
  const [promos, setPromos] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Modals
  const [closureModal, setClosureModal] = useState(null);
  const [promoModal, setPromoModal] = useState(null);
  const [userModal, setUserModal] = useState(null);

  const allModules = [
    { id: 'general', label: '1. Business Profile', icon: Settings },
    { id: 'hours', label: '2. Hours & Holidays', icon: Clock },
    { id: 'booking_rules', label: '3. Booking Rules', icon: Calendar },
    { id: 'pricing_rules', label: '4. Services & Pricing', icon: DollarSign },
    { id: 'staff_rules', label: '5. Staff & Stylists', icon: Users },
    { id: 'promos', label: '6. Promos & Vouchers', icon: Tag },
    { id: 'payments', label: '7. Payments & Taxes', icon: DollarSign },
    { id: 'notifications', label: '8. Notifications & SMTP', icon: Bell },
    { id: 'seo_analytics', label: '9. SEO & Analytics (GA4/Meta)', icon: Search },
    { id: 'security', label: '10. Users & Security', icon: Shield },
  ];

  const modules = allModules.filter((m) => canAccessSettingsModule(user?.role, m.id));

  const loadAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getSettingsBootstrap();
      const payload = res?.data || {};
      setSettings(payload.settings || {});
      setHours(payload.hours || []);
      setClosures(payload.closures || []);
      setPromos(payload.promos || []);
      setUsersList(payload.users || []);
      setAuditLogs(payload.audit_logs || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  const handleSettingChange = (group, key, value) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value
      }
    }));
  };

  const saveGroup = async (groupName) => {
    try {
      setSaving(true);
      setMessage('');
      await api.updateSettingsGroup(groupName, settings[groupName] || {});
      setMessage(`Module ${groupName} updated successfully.`);
      refresh();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update settings group.');
    } finally {
      setSaving(false);
    }
  };

  const saveHours = async () => {
    try {
      setSaving(true);
      setMessage('');
      await api.updateHours(hours);
      setMessage('Weekly hours updated successfully.');
      refresh();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update hours.');
    } finally {
      setSaving(false);
    }
  };

  const handleHourField = (dayNum, field, val) => {
    setHours(prev => prev.map(h => h.day_of_week === dayNum ? { ...h, [field]: val } : h));
  };

  // Closure actions
  const saveClosure = async (e) => {
    e.preventDefault();
    try {
      await api.saveClosure(closureModal);
      setClosureModal(null);
      const c = await api.getClosures();
      setClosures(c.data || []);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteClosure = async (id) => {
    if (!window.confirm('Delete closure?')) return;
    try {
      await api.deleteClosure(id);
      const c = await api.getClosures();
      setClosures(c.data || []);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // Promo actions
  const savePromo = async (e) => {
    e.preventDefault();
    try {
      await api.savePromo(promoModal);
      setPromoModal(null);
      const p = await api.getPromos();
      setPromos(p.data || []);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const deletePromo = async (id) => {
    if (!window.confirm('Delete promo code?')) return;
    try {
      await api.deletePromo(id);
      const p = await api.getPromos();
      setPromos(p.data || []);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // User actions
  const saveUser = async (e) => {
    e.preventDefault();
    try {
      await api.saveUser(userModal);
      setUserModal(null);
      const u = await api.getUsers();
      setUsersList(u.data || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      const u = await api.getUsers();
      setUsersList(u.data || []);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-salon-muted">Loading settings modules...</div>;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-salon-dark">
            {permissions.canManageSystemSettings ? 'Atelier Settings' : 'Operations Settings'}
          </h1>
          <p className="text-xs sm:text-sm text-salon-muted font-light">
            {permissions.canManageSystemSettings
              ? 'Configure operational rules, promos, payment gateways, SMTP, SEO tracking, and team access.'
              : 'Configure studio profile, business hours, holiday closures, booking rules, and promotions.'}
          </p>
        </div>

        {message && (
          <div className="px-4 py-2 rounded-xl bg-[#2FA66A]/15 border border-[#2FA66A]/35 text-xs font-semibold text-[#1A1614] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2FA66A]" />
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Role-Filtered Modules Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-salon-border">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => selectModule(m.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] shadow-soft-pink transition-colors'
                  : 'bg-salon-card hover:bg-salon-light text-salon-dark/80 border border-salon-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODULE 1: GENERAL & BUSINESS PROFILE */}
      {activeModule === 'general' && (
        <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-salon-border">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">General &amp; Business Profile</h3>
            <button
              onClick={() => saveGroup('general')}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-salon-muted mb-1">Salon Name</label>
              <input
                type="text"
                value={settings.general?.salon_name || ''}
                onChange={(e) => handleSettingChange('general', 'salon_name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">Tagline</label>
              <input
                type="text"
                value={settings.general?.tagline || ''}
                onChange={(e) => handleSettingChange('general', 'tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.general?.phone || ''}
                onChange={(e) => handleSettingChange('general', 'phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">WhatsApp Concierge</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={settings.general?.whatsapp || ''}
                onChange={(e) => handleSettingChange('general', 'whatsapp', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">Support Email</label>
              <input
                type="email"
                value={settings.general?.email || ''}
                onChange={(e) => handleSettingChange('general', 'email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">Currency Code &amp; Symbol</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="INR"
                  value={settings.general?.currency || 'INR'}
                  onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-salon-border"
                />
                <input
                  type="text"
                  placeholder="₹"
                  value={settings.general?.currency_symbol || '₹'}
                  onChange={(e) => handleSettingChange('general', 'currency_symbol', e.target.value)}
                  className="w-1/2 px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-salon-muted mb-1">Physical Boulevard Address</label>
              <input
                type="text"
                value={settings.general?.address || ''}
                onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-salon-muted mb-1">Google Maps Embed URL</label>
              <input
                type="text"
                value={settings.general?.maps_embed_url || ''}
                onChange={(e) => handleSettingChange('general', 'maps_embed_url', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-salon-border">
            <span className="font-bold text-salon-dark uppercase tracking-wider block mb-3">
              Social Links &amp; Tax ID
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={settings.general?.social_instagram || ''}
                  onChange={(e) => handleSettingChange('general', 'social_instagram', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={settings.general?.social_facebook || ''}
                  onChange={(e) => handleSettingChange('general', 'social_facebook', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Pinterest URL</label>
                <input
                  type="text"
                  value={settings.general?.social_pinterest || ''}
                  onChange={(e) => handleSettingChange('general', 'social_pinterest', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">TikTok URL</label>
                <input
                  type="text"
                  value={settings.general?.social_tiktok || ''}
                  onChange={(e) => handleSettingChange('general', 'social_tiktok', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">GST / Tax Registration ID</label>
                <input
                  type="text"
                  value={settings.general?.tax_id || ''}
                  onChange={(e) => handleSettingChange('general', 'tax_id', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Timezone</label>
                <input
                  type="text"
                  value={settings.general?.timezone || 'America/New_York'}
                  onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: BUSINESS HOURS & HOLIDAYS */}
      {activeModule === 'hours' && (
        <div className="space-y-6">
          <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-salon-border">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-salon-dark">Weekly Business Hours</h3>
                <p className="text-xs text-salon-muted">Set operating hours, closed days, and studio midday breaks.</p>
              </div>
              <button
                onClick={saveHours}
                disabled={saving}
                className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Hours'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const h = hours.find(x => x.day_of_week === d) || {
                  day_of_week: d,
                  open_time: '09:00:00',
                  close_time: '20:00:00',
                  break_start: '13:00:00',
                  break_end: '14:00:00',
                  is_closed: 0
                };

                return (
                  <div key={d} className="p-3 rounded-2xl bg-salon-light flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2.5 w-32">
                      <input
                        type="checkbox"
                        checked={h.is_closed === 0}
                        onChange={(e) => handleHourField(d, 'is_closed', e.target.checked ? 0 : 1)}
                        className="rounded text-salon-primary"
                      />
                      <span className="font-bold text-salon-dark">{dayNames[d]}</span>
                    </label>

                    {h.is_closed === 0 ? (
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-salon-muted">Hours:</span>
                          <input
                            type="time"
                            value={h.open_time?.slice(0, 5) || '09:00'}
                            onChange={(e) => handleHourField(d, 'open_time', e.target.value + ':00')}
                            className="px-2 py-1 rounded-lg border border-salon-border bg-salon-card text-xs"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={h.close_time?.slice(0, 5) || '20:00'}
                            onChange={(e) => handleHourField(d, 'close_time', e.target.value + ':00')}
                            className="px-2 py-1 rounded-lg border border-salon-border bg-salon-card text-xs"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:pl-3 sm:border-l sm:border-salon-border">
                          <span className="text-salon-muted">Midday Break:</span>
                          <input
                            type="time"
                            value={h.break_start?.slice(0, 5) || '13:00'}
                            onChange={(e) => handleHourField(d, 'break_start', e.target.value + ':00')}
                            className="px-2 py-1 rounded-lg border border-salon-border bg-salon-card text-xs"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={h.break_end?.slice(0, 5) || '14:00'}
                            onChange={(e) => handleHourField(d, 'break_end', e.target.value + ':00')}
                            className="px-2 py-1 rounded-lg border border-salon-border bg-salon-card text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-red-500 font-semibold italic">Closed Studio All Day</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holiday Overrides / Special Closures */}
          <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-4 shadow-xs text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-salon-border">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-salon-dark">Special Closures &amp; Holidays</h3>
                <p className="text-xs text-salon-muted">Specific dates when the salon is closed for maintenance or seasonal galas.</p>
              </div>
              <button
                onClick={() => setClosureModal({ title: '', closure_date: new Date().toISOString().split('T')[0], is_full_day: 1, reason: '' })}
                className="px-4 py-2 rounded-full bg-salon-dark hover:bg-[#2B231E] text-[#FFFDF8] border border-[#D6A984]/25 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Closure Override</span>
              </button>
            </div>

            <div className="space-y-2">
              {closures.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-salon-light flex items-center justify-between">
                  <div>
                    <span className="font-bold text-salon-dark text-xs block">{c.title}</span>
                    <span className="text-salon-muted text-[11px]">{c.closure_date} • {c.is_full_day ? 'Full Day Closure' : 'Partial'} {c.reason && `(${c.reason})`}</span>
                  </div>
                  <button onClick={() => deleteClosure(c.id)} className="p-1 rounded text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {closures.length === 0 && (
                <div className="text-xs text-salon-muted py-2">No special holiday closures active.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: APPOINTMENT & BOOKING RULES */}
      {activeModule === 'booking_rules' && (
        <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-salon-border">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Appointment &amp; Booking Rules</h3>
            <button
              onClick={() => saveGroup('booking_rules')}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Rules'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-salon-muted mb-1">Slot Duration Interval (Minutes)</label>
              <select
                value={settings.booking_rules?.slot_duration_minutes || '30'}
                onChange={(e) => handleSettingChange('booking_rules', 'slot_duration_minutes', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes (Recommended)</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-salon-muted mb-1">Slot Buffer Time Between Bookings (Minutes)</label>
              <input
                type="number"
                value={settings.booking_rules?.slot_buffer_minutes || '15'}
                onChange={(e) => handleSettingChange('booking_rules', 'slot_buffer_minutes', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>

            <div>
              <label className="block font-bold text-salon-muted mb-1">Min Advance Notice (Hours)</label>
              <input
                type="number"
                value={settings.booking_rules?.min_advance_booking_hours || '2'}
                onChange={(e) => handleSettingChange('booking_rules', 'min_advance_booking_hours', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>

            <div>
              <label className="block font-bold text-salon-muted mb-1">Max Advance Booking Window (Days)</label>
              <input
                type="number"
                value={settings.booking_rules?.max_advance_booking_days || '60'}
                onChange={(e) => handleSettingChange('booking_rules', 'max_advance_booking_days', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>

            <div>
              <label className="block font-bold text-salon-muted mb-1">Max Concurrent Bookings per Slot</label>
              <input
                type="number"
                value={settings.booking_rules?.max_concurrent_bookings_per_slot || '4'}
                onChange={(e) => handleSettingChange('booking_rules', 'max_concurrent_bookings_per_slot', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>

            <div>
              <label className="block font-bold text-salon-muted mb-1">Cancellation Cutoff Window (Hours)</label>
              <input
                type="number"
                value={settings.booking_rules?.cancellation_cutoff_hours || '24'}
                onChange={(e) => handleSettingChange('booking_rules', 'cancellation_cutoff_hours', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-salon-border space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.booking_rules?.auto_confirm_bookings === '1'}
                onChange={(e) => handleSettingChange('booking_rules', 'auto_confirm_bookings', e.target.checked ? '1' : '0')}
                className="rounded text-salon-primary focus:ring-salon-primary"
              />
              <div>
                <span className="font-bold text-salon-dark block">Auto-Confirm Online Reservations</span>
                <span className="text-[11px] text-salon-muted">Automatically set new website bookings to Confirmed status without manual review.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.booking_rules?.walkin_mode_enabled === '1'}
                onChange={(e) => handleSettingChange('booking_rules', 'walkin_mode_enabled', e.target.checked ? '1' : '0')}
                className="rounded text-salon-primary focus:ring-salon-primary"
              />
              <div>
                <span className="font-bold text-salon-dark block">Concierge Walk-In Mode</span>
                <span className="text-[11px] text-salon-muted">Enable receptionists to bypass slot constraints for immediate walk-in guests.</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* MODULE 4: SERVICES & PRICING RULES */}
      {activeModule === 'pricing_rules' && (
        <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-salon-border">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Services &amp; Pricing Policies</h3>
            <button
              onClick={() => saveGroup('pricing_rules')}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Pricing Rules'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-salon-muted mb-1">Online Deposit Requirement</label>
              <select
                value={settings.pricing_rules?.service_deposit_type || 'percentage'}
                onChange={(e) => handleSettingChange('pricing_rules', 'service_deposit_type', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
              >
                <option value="percentage">Percentage Deposit</option>
                <option value="fixed">Fixed Deposit Amount</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-salon-muted mb-1">Deposit Percentage (%)</label>
              <input
                type="number"
                value={settings.pricing_rules?.service_deposit_percentage || '25'}
                onChange={(e) => handleSettingChange('pricing_rules', 'service_deposit_percentage', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pricing_rules?.enable_tips === '1'}
                onChange={(e) => handleSettingChange('pricing_rules', 'enable_tips', e.target.checked ? '1' : '0')}
                className="rounded text-salon-primary focus:ring-salon-primary"
              />
              <div>
                <span className="font-bold text-salon-dark block">Enable Gratuity &amp; Tips Prompt</span>
                <span className="text-[11px] text-salon-muted">Prompt guests for optional stylist tip during checkout.</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* MODULE 5: STAFF & STYLIST RULES */}
      {activeModule === 'staff_rules' && (
        <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-salon-border">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Staff &amp; Stylist Management Rules</h3>
            <button
              onClick={() => saveGroup('staff_rules')}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Staff Rules'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-salon-muted mb-1">Default Artist Commission (%)</label>
              <input
                type="number"
                step="0.5"
                value={settings.staff_rules?.default_stylist_commission || '15.00'}
                onChange={(e) => handleSettingChange('staff_rules', 'default_stylist_commission', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.staff_rules?.allow_any_stylist_selection === '1'}
                onChange={(e) => handleSettingChange('staff_rules', 'allow_any_stylist_selection', e.target.checked ? '1' : '0')}
                className="rounded text-salon-primary focus:ring-salon-primary"
              />
              <div>
                <span className="font-bold text-salon-dark block">Allow "Any Available" Stylist Option</span>
                <span className="text-[11px] text-salon-muted">Permits guests to book the earliest open slot across any qualified team member.</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* MODULE 6: PROMOTIONAL COUPONS & VOUCHERS */}
      {activeModule === 'promos' && (
        <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-4 shadow-xs text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-salon-border">
            <div>
              <h3 className="font-editorial text-2xl font-medium text-salon-dark">Promotional Coupons &amp; Vouchers</h3>
              <p className="text-xs text-salon-muted">Create discount codes for client bookings.</p>
            </div>
            <button
              type="button"
              onClick={() => setPromoModal({ code: '', discount_type: 'percentage', discount_value: 20, min_order_value: 50, usage_limit: 500, is_active: 1 })}
              className="px-4 py-2 rounded-full bg-salon-dark hover:bg-[#2B231E] text-[#FFFDF8] border border-[#D6A984]/25 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Promo Code</span>
            </button>
          </div>

          <div className="space-y-2">
            {promos.map((p) => (
              <div key={p.id} className="p-3 rounded-2xl bg-salon-light flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-salon-primary text-xs block">{p.code}</span>
                  <span className="text-salon-muted text-[11px]">
                    {p.discount_type === 'percentage' ? `${p.discount_value}% OFF` : `${currencySymbol}${p.discount_value} OFF`} • Min Order: {currencySymbol}{p.min_order_value} • Used {p.times_used} / {p.usage_limit} times
                  </span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setPromoModal(p)} className="p-1 rounded text-salon-dark hover:bg-salon-card">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => deletePromo(p.id)} className="p-1 rounded text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 7: PAYMENTS & TAXES (SUPER ADMIN ONLY) */}
      {activeModule === 'payments' && permissions.canManageSystemSettings && (
        <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-salon-border">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Payment Gateways &amp; Tax Rules</h3>
            <button
              type="button"
              onClick={() => saveGroup('payments')}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Payments'}</span>
            </button>
          </div>

          {/* Payment toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="p-4 rounded-2xl bg-salon-light flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payments?.payment_pay_at_salon === '1'}
                onChange={(e) => handleSettingChange('payments', 'payment_pay_at_salon', e.target.checked ? '1' : '0')}
                className="rounded text-salon-primary"
              />
              <div>
                <strong className="text-salon-dark block">Pay at Salon</strong>
                <span className="text-[10px] text-salon-muted">Cash or card at reception</span>
              </div>
            </label>

            <label className="p-4 rounded-2xl bg-salon-light flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payments?.payment_online_deposit === '1'}
                onChange={(e) => handleSettingChange('payments', 'payment_online_deposit', e.target.checked ? '1' : '0')}
                className="rounded text-salon-primary"
              />
              <div>
                <strong className="text-salon-dark block">Partial Deposit</strong>
                <span className="text-[10px] text-salon-muted">25% deposit online</span>
              </div>
            </label>

            <label className="p-4 rounded-2xl bg-salon-light flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payments?.payment_online_full === '1'}
                onChange={(e) => handleSettingChange('payments', 'payment_online_full', e.target.checked ? '1' : '0')}
                className="rounded text-salon-primary"
              />
              <div>
                <strong className="text-salon-dark block">Full Online Pre-Pay</strong>
                <span className="text-[10px] text-salon-muted">100% advance payment</span>
              </div>
            </label>
          </div>

          {/* Gateway Credentials */}
          <div className="pt-4 border-t border-salon-border space-y-4">
            <span className="font-bold text-salon-dark uppercase tracking-wider block">
              Gateway Configuration (Stripe &amp; Razorpay)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Active Gateway</label>
                <select
                  value={settings.payments?.payment_gateway || 'stripe'}
                  onChange={(e) => handleSettingChange('payments', 'payment_gateway', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
                >
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Environment Mode</label>
                <select
                  value={settings.payments?.gateway_mode || 'test'}
                  onChange={(e) => handleSettingChange('payments', 'gateway_mode', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
                >
                  <option value="test">Test / Sandbox</option>
                  <option value="live">Live / Production</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Stripe Publishable Key (Public)</label>
                <input
                  type="text"
                  value={settings.payments?.stripe_publishable_key || ''}
                  onChange={(e) => handleSettingChange('payments', 'stripe_publishable_key', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Stripe Secret Key (Stored on PHP)</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={settings.payments?.stripe_secret_key || ''}
                  onChange={(e) => handleSettingChange('payments', 'stripe_secret_key', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.payments?.razorpay_key_id || ''}
                  onChange={(e) => handleSettingChange('payments', 'razorpay_key_id', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Razorpay Key Secret</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={settings.payments?.razorpay_key_secret || ''}
                  onChange={(e) => handleSettingChange('payments', 'razorpay_key_secret', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono text-xs"
                />
              </div>
            </div>

            {/* Tax configuration */}
            <div className="pt-4 border-t border-salon-border grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Tax / GST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.payments?.tax_rate || '8.5'}
                  onChange={(e) => handleSettingChange('payments', 'tax_rate', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Tax Label</label>
                <input
                  type="text"
                  value={settings.payments?.tax_name || 'Sales Tax / GST'}
                  onChange={(e) => handleSettingChange('payments', 'tax_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payments?.tax_inclusive === '1'}
                    onChange={(e) => handleSettingChange('payments', 'tax_inclusive', e.target.checked ? '1' : '0')}
                    className="rounded text-salon-primary"
                  />
                  <span className="font-bold text-salon-dark">Prices are Tax Inclusive</span>
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODULE 8: NOTIFICATIONS & REMINDERS (SUPER ADMIN ONLY) */}
      {activeModule === 'notifications' && permissions.canManageSystemSettings && (
        <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-salon-border">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Notifications &amp; SMTP Gateway</h3>
            <button
              onClick={() => saveGroup('notifications')}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Notifications'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-salon-muted mb-1">SMTP Host</label>
              <input
                type="text"
                value={settings.notifications?.smtp_host || 'smtp.mailtrap.io'}
                onChange={(e) => handleSettingChange('notifications', 'smtp_host', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">SMTP Port</label>
              <input
                type="number"
                value={settings.notifications?.smtp_port || '587'}
                onChange={(e) => handleSettingChange('notifications', 'smtp_port', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">Encryption</label>
              <select
                value={settings.notifications?.smtp_encryption || 'tls'}
                onChange={(e) => handleSettingChange('notifications', 'smtp_encryption', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">SMTP Username</label>
              <input
                type="text"
                value={settings.notifications?.smtp_user || ''}
                onChange={(e) => handleSettingChange('notifications', 'smtp_user', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">SMTP Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={settings.notifications?.smtp_pass || ''}
                onChange={(e) => handleSettingChange('notifications', 'smtp_pass', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">Admin Notification Email</label>
              <input
                type="email"
                value={settings.notifications?.admin_notification_email || 'concierge@ritiverse.com'}
                onChange={(e) => handleSettingChange('notifications', 'admin_notification_email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-salon-border space-y-3">
            <span className="font-bold text-salon-dark uppercase tracking-wider block">
              Automated Reminder Triggers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications?.reminder_24h_enabled === '1'}
                  onChange={(e) => handleSettingChange('notifications', 'reminder_24h_enabled', e.target.checked ? '1' : '0')}
                  className="rounded text-salon-primary"
                />
                <span>Send 24-Hour Email / WhatsApp Reminder</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications?.reminder_2h_enabled === '1'}
                  onChange={(e) => handleSettingChange('notifications', 'reminder_2h_enabled', e.target.checked ? '1' : '0')}
                  className="rounded text-salon-primary"
                />
                <span>Send 2-Hour Quick Arrival SMS</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications?.feedback_request_enabled === '1'}
                  onChange={(e) => handleSettingChange('notifications', 'feedback_request_enabled', e.target.checked ? '1' : '0')}
                  className="rounded text-salon-primary"
                />
                <span>Automated Post-Treatment Review Request</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications?.notify_admin_on_booking === '1'}
                  onChange={(e) => handleSettingChange('notifications', 'notify_admin_on_booking', e.target.checked ? '1' : '0')}
                  className="rounded text-salon-primary"
                />
                <span>Instant Admin Notification on Every New Booking</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 9: CMS, SEO & ANALYTICS INTEGRATIONS (SUPER ADMIN ONLY) */}
      {activeModule === 'seo_analytics' && permissions.canManageSystemSettings && (
        <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-8 shadow-xs text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-salon-border">
            <div>
              <h3 className="font-editorial text-2xl font-medium text-salon-dark">CMS, SEO &amp; Analytics Integrations</h3>
              <p className="text-xs text-salon-muted">Manage site-wide maintenance, Google Analytics 4, Clarity, Meta Pixel &amp; CAPI.</p>
            </div>
            <button
              onClick={() => saveGroup('seo_analytics')}
              disabled={saving}
              className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Integrations'}</span>
            </button>
          </div>

          {/* Maintenance Mode */}
          <div className="p-4 rounded-2xl bg-salon-soft/50 border border-salon-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-salon-dark block text-sm">Site-Wide Maintenance Mode</strong>
                <span className="text-[11px] text-salon-muted">When enabled, public storefront displays a luxury maintenance notice.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.seo_analytics?.maintenance_mode === '1'}
                onChange={(e) => handleSettingChange('seo_analytics', 'maintenance_mode', e.target.checked ? '1' : '0')}
                className="w-5 h-5 rounded text-salon-primary"
              />
            </div>
            {settings.seo_analytics?.maintenance_mode === '1' && (
              <input
                type="text"
                placeholder="Custom maintenance banner message..."
                value={settings.seo_analytics?.maintenance_message || ''}
                onChange={(e) => handleSettingChange('seo_analytics', 'maintenance_message', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
              />
            )}
          </div>

          {/* Technical & On-Page SEO */}
          <div className="space-y-4">
            <span className="font-bold text-salon-dark uppercase tracking-wider block text-xs">
              On-Page &amp; Technical SEO
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Default Meta Title</label>
                <input
                  type="text"
                  value={settings.seo_analytics?.seo_meta_title || ''}
                  onChange={(e) => handleSettingChange('seo_analytics', 'seo_meta_title', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Canonical Base URL</label>
                <input
                  type="text"
                  value={settings.seo_analytics?.seo_canonical_url || (typeof window !== 'undefined' ? window.location.origin : 'https://ritiverse.com')}
                  onChange={(e) => handleSettingChange('seo_analytics', 'seo_canonical_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-salon-muted mb-1">Meta Description</label>
                <textarea
                  rows="2"
                  value={settings.seo_analytics?.seo_meta_description || ''}
                  onChange={(e) => handleSettingChange('seo_analytics', 'seo_meta_description', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Keywords</label>
                <input
                  type="text"
                  value={settings.seo_analytics?.seo_keywords || ''}
                  onChange={(e) => handleSettingChange('seo_analytics', 'seo_keywords', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Robots Directive</label>
                <input
                  type="text"
                  value={settings.seo_analytics?.seo_robots_directive || 'index, follow'}
                  onChange={(e) => handleSettingChange('seo_analytics', 'seo_robots_directive', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-salon-muted mb-1">Open Graph Social Image URL (og:image)</label>
                <input
                  type="text"
                  value={settings.seo_analytics?.seo_og_image || ''}
                  onChange={(e) => handleSettingChange('seo_analytics', 'seo_og_image', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-salon-muted mb-1">Dynamic robots.txt Editor</label>
                <textarea
                  rows="4"
                  value={settings.seo_analytics?.seo_robots_txt || ''}
                  onChange={(e) => handleSettingChange('seo_analytics', 'seo_robots_txt', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <a
                href={`${getAppBasePath()}/sitemap.xml`}
                target="_blank"
                rel="noreferrer"
                className="text-salon-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>Preview Dynamic XML Sitemap (/sitemap.xml)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`${getAppBasePath()}/robots.txt`}
                target="_blank"
                rel="noreferrer"
                className="text-salon-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>Preview Dynamic robots.txt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Google Analytics 4 (GA4) */}
          <div className="pt-4 border-t border-salon-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-salon-dark uppercase tracking-wider block text-xs">
                  Google Analytics 4 (GA4)
                </span>
                <span className="text-[11px] text-salon-muted">Automatically track visits and bespoke booking conversions.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.seo_analytics?.ga4_enabled === '1'}
                onChange={(e) => handleSettingChange('seo_analytics', 'ga4_enabled', e.target.checked ? '1' : '0')}
                className="w-5 h-5 rounded text-salon-primary"
              />
            </div>

            {settings.seo_analytics?.ga4_enabled === '1' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Measurement ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={settings.seo_analytics?.ga4_measurement_id || ''}
                    onChange={(e) => handleSettingChange('seo_analytics', 'ga4_measurement_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  <span className="font-bold text-salon-dark block text-[11px]">Conversion Events:</span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.seo_analytics?.ga4_event_view_service === '1'}
                      onChange={(e) => handleSettingChange('seo_analytics', 'ga4_event_view_service', e.target.checked ? '1' : '0')}
                    />
                    <span>view_service</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.seo_analytics?.ga4_event_begin_booking === '1'}
                      onChange={(e) => handleSettingChange('seo_analytics', 'ga4_event_begin_booking', e.target.checked ? '1' : '0')}
                    />
                    <span>begin_booking</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.seo_analytics?.ga4_event_booking_confirmed === '1'}
                      onChange={(e) => handleSettingChange('seo_analytics', 'ga4_event_booking_confirmed', e.target.checked ? '1' : '0')}
                    />
                    <span>booking_confirmed</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Microsoft Clarity */}
          <div className="pt-4 border-t border-salon-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-salon-dark uppercase tracking-wider block text-xs">
                  Microsoft Clarity (Session Replay &amp; Heatmaps)
                </span>
                <span className="text-[11px] text-salon-muted">Behavioral heatmaps with privacy-masking.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.seo_analytics?.clarity_enabled === '1'}
                onChange={(e) => handleSettingChange('seo_analytics', 'clarity_enabled', e.target.checked ? '1' : '0')}
                className="w-5 h-5 rounded text-salon-primary"
              />
            </div>

            {settings.seo_analytics?.clarity_enabled === '1' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Project ID</label>
                  <input
                    type="text"
                    placeholder="e.g. aura_cl_9901"
                    value={settings.seo_analytics?.clarity_project_id || ''}
                    onChange={(e) => handleSettingChange('seo_analytics', 'clarity_project_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.seo_analytics?.clarity_mask_sensitive === '1'}
                      onChange={(e) => handleSettingChange('seo_analytics', 'clarity_mask_sensitive', e.target.checked ? '1' : '0')}
                    />
                    <span>Mask Sensitive Guest Input Fields</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Google Search Console */}
          <div className="pt-4 border-t border-salon-border space-y-4">
            <span className="font-bold text-salon-dark uppercase tracking-wider block text-xs">
              Google Search Console Verification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Verification Method</label>
                <select
                  value={settings.seo_analytics?.gsc_method || 'meta_tag'}
                  onChange={(e) => handleSettingChange('seo_analytics', 'gsc_method', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
                >
                  <option value="meta_tag">HTML Meta Tag</option>
                  <option value="html_file">HTML File Served at Root</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Meta Tag Content / Verification Code</label>
                <input
                  type="text"
                  placeholder="google-site-verification=..."
                  value={settings.seo_analytics?.gsc_meta_tag || ''}
                  onChange={(e) => handleSettingChange('seo_analytics', 'gsc_meta_tag', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
            </div>
          </div>

          {/* Meta Pixel & Conversions API (CAPI) */}
          <div className="pt-4 border-t border-salon-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-salon-dark uppercase tracking-wider block text-xs">
                  Meta Pixel &amp; Server-Side Conversions API (CAPI)
                </span>
                <span className="text-[11px] text-salon-muted">Track Instagram &amp; Facebook salon booking campaigns.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.seo_analytics?.meta_pixel_enabled === '1'}
                onChange={(e) => handleSettingChange('seo_analytics', 'meta_pixel_enabled', e.target.checked ? '1' : '0')}
                className="w-5 h-5 rounded text-salon-primary"
              />
            </div>

            {settings.seo_analytics?.meta_pixel_enabled === '1' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Pixel ID (Public to Browser)</label>
                  <input
                    type="text"
                    placeholder="e.g. 982736154092817"
                    value={settings.seo_analytics?.meta_pixel_id || ''}
                    onChange={(e) => handleSettingChange('seo_analytics', 'meta_pixel_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-salon-muted mb-1">Server-Side CAPI Token (Secret, Never Exposed)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={settings.seo_analytics?.meta_capi_token || ''}
                    onChange={(e) => handleSettingChange('seo_analytics', 'meta_capi_token', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODULE 10: USERS, ROLES & SECURITY (SUPER ADMIN ONLY) */}
      {activeModule === 'security' && permissions.canManageUsersAndSecurity && (
        <div className="space-y-6">
          <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-salon-border">
              <h3 className="font-editorial text-2xl font-medium text-salon-dark">Security &amp; Session Policies</h3>
              <button
                onClick={() => saveGroup('security')}
                disabled={saving}
                className="px-6 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Policies'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.security?.session_timeout_minutes || '120'}
                  onChange={(e) => handleSettingChange('security', 'session_timeout_minutes', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Min Password Length</label>
                <input
                  type="number"
                  value={settings.security?.password_min_length || '8'}
                  onChange={(e) => handleSettingChange('security', 'password_min_length', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Max Login Attempts Lockout</label>
                <input
                  type="number"
                  value={settings.security?.max_login_attempts || '5'}
                  onChange={(e) => handleSettingChange('security', 'max_login_attempts', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
            </div>
          </div>

          {/* User Accounts Management */}
          <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-4 shadow-xs text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-salon-border">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-salon-dark">Staff &amp; Admin Accounts</h3>
                <p className="text-xs text-salon-muted">Roles: Super Admin, Branch Manager, Receptionist, Stylist.</p>
              </div>
              <button
                onClick={() => setUserModal({ name: '', email: '', role: 'receptionist', phone: '', password: '', is_active: 1 })}
                className="px-4 py-2 rounded-full bg-salon-dark hover:bg-[#2B231E] text-[#FFFDF8] border border-[#D6A984]/25 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Staff Account</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-salon-light text-salon-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-salon-border">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-salon-light/50">
                      <td className="p-3 font-semibold text-salon-dark">{u.name}</td>
                      <td className="p-3 text-salon-muted">{u.email}</td>
                      <td className="p-3 font-mono uppercase text-[11px] font-bold text-salon-primary">{u.role}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => setUserModal(u)} className="p-1 rounded text-salon-dark hover:bg-salon-light">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-1 rounded text-red-600 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Audit Logs */}
          <div className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-4 shadow-xs text-xs">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Activity Audit Trail</h3>
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-salon-light text-salon-muted uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Entity</th>
                    <th className="p-2.5">Details</th>
                    <th className="p-2.5">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-salon-border">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-salon-light/40">
                      <td className="p-2.5 text-salon-muted whitespace-nowrap">{log.created_at}</td>
                      <td className="p-2.5 font-mono font-bold text-salon-primary">{log.action}</td>
                      <td className="p-2.5 text-salon-dark font-medium">{log.entity}</td>
                      <td className="p-2.5 text-salon-muted">{log.details}</td>
                      <td className="p-2.5 text-salon-dark">{log.user_name || 'System / Guest'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* CLOSURE MODAL */}
      {closureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-4 text-xs">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Holiday / Closure Override</h3>
            <form onSubmit={saveClosure} className="space-y-3">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Title</label>
                <input
                  type="text"
                  value={closureModal.title}
                  onChange={(e) => setClosureModal({ ...closureModal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Date</label>
                <input
                  type="date"
                  value={closureModal.closure_date}
                  onChange={(e) => setClosureModal({ ...closureModal, closure_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Reason</label>
                <input
                  type="text"
                  value={closureModal.reason || ''}
                  onChange={(e) => setClosureModal({ ...closureModal, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setClosureModal(null)} className="flex-1 py-2 rounded-full border border-salon-border">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] font-semibold shadow-soft-pink transition-colors">Save Closure</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO MODAL */}
      {promoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-4 text-xs">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Promo Code Details</h3>
            <form onSubmit={savePromo} className="space-y-3">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Code (Uppercase)</label>
                <input
                  type="text"
                  value={promoModal.code}
                  onChange={(e) => setPromoModal({ ...promoModal, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Type</label>
                  <select
                    value={promoModal.discount_type}
                    onChange={(e) => setPromoModal({ ...promoModal, discount_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ({currencySymbol})</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={promoModal.discount_value}
                    onChange={(e) => setPromoModal({ ...promoModal, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Min Order ({currencySymbol})</label>
                  <input
                    type="number"
                    value={promoModal.min_order_value || 0}
                    onChange={(e) => setPromoModal({ ...promoModal, min_order_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border"
                  />
                </div>
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={promoModal.usage_limit || 500}
                    onChange={(e) => setPromoModal({ ...promoModal, usage_limit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border"
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setPromoModal(null)} className="flex-1 py-2 rounded-full border border-salon-border">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] font-semibold shadow-soft-pink transition-colors">Save Code</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {userModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-4 text-xs">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Staff Account</h3>
            <form onSubmit={saveUser} className="space-y-3">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Full Name</label>
                <input
                  type="text"
                  value={userModal.name}
                  onChange={(e) => setUserModal({ ...userModal, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Email</label>
                <input
                  type="email"
                  value={userModal.email}
                  onChange={(e) => setUserModal({ ...userModal, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Role</label>
                <select
                  value={userModal.role}
                  onChange={(e) => setUserModal({ ...userModal, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border bg-salon-card"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="branch_manager">Branch Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="stylist">Stylist</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">
                  Password {userModal.id ? '(Leave blank to keep unchanged)' : ''}
                </label>
                <input
                  type="password"
                  value={userModal.password || ''}
                  onChange={(e) => setUserModal({ ...userModal, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border"
                  placeholder="••••••••"
                  required={!userModal.id}
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setUserModal(null)} className="flex-1 py-2 rounded-full border border-salon-border">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] font-semibold shadow-soft-pink transition-colors">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
