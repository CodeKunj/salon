// frontend/src/components/admin/AdminStylists.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { usePublic } from '../../context/PublicContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminStylists() {
  const { refresh } = usePublic();
  const { permissions } = useAuth();
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingStylist, setEditingStylist] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadStylists = async () => {
    try {
      setLoading(true);
      const res = await api.getStaff();
      setStylists(res.data || []);
    } catch (err) {
      console.error('Failed to load stylists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStylists();
  }, []);

  const handleOpenEdit = (stylist = null) => {
    if (stylist) {
      setEditingStylist({ ...stylist });
    } else {
      // New stylist template
      const defaultSchedules = [];
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (let d = 0; d <= 6; d++) {
        defaultSchedules.push({
          day_of_week: d,
          day_name: days[d],
          start_time: '09:00:00',
          end_time: '19:00:00',
          break_start: '13:00:00',
          break_end: '14:00:00',
          is_working: d === 0 ? 0 : 1
        });
      }
      setEditingStylist({
        name: '',
        role_title: 'Senior Artist',
        bio: '',
        avatar_url: '',
        commission_pct: 15.00,
        is_active: 1,
        sort_order: 1,
        schedules: defaultSchedules
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingStylist) return;
    try {
      setSaving(true);
      await api.saveStaff(editingStylist);
      setEditingStylist(null);
      loadStylists();
      refresh();
    } catch (err) {
      alert(err.message || 'Failed to save stylist.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this stylist profile?')) return;
    try {
      await api.deleteStaff(id);
      loadStylists();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScheduleChange = (dayIndex, field, value) => {
    const updated = [...(editingStylist.schedules || [])];
    const itemIndex = updated.findIndex(s => Number(s.day_of_week) === dayIndex);
    if (itemIndex > -1) {
      updated[itemIndex] = { ...updated[itemIndex], [field]: value };
    }
    setEditingStylist({ ...editingStylist, schedules: updated });
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-salon-dark">
            {permissions.canEditStylists ? 'Artists & Stylist Schedules' : 'Artist Roster & Availability'}
          </h1>
          <p className="text-xs sm:text-sm text-salon-muted font-light">
            {permissions.canEditStylists
              ? 'Manage your team profiles, bios, commission rates, and individual working day/break hours.'
              : 'View artist specialties, active availability, and daily shift schedules for desk coordination.'}
          </p>
        </div>

        {permissions.canEditStylists && (
          <button
            type="button"
            onClick={() => handleOpenEdit()}
            className="px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stylist Profile</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="p-8 text-center text-xs text-salon-muted">Loading artist schedules...</div>
      )}

      {/* Stylist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stylists.map((st) => (
          <div key={st.id} className="bg-salon-card rounded-3xl border border-salon-border shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 flex items-start gap-4 pb-4">
                <img
                  src={st.avatar_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'}
                  alt={st.name}
                  loading="lazy"
                  className="w-16 h-16 rounded-2xl object-cover border border-salon-border shadow-xs flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{st.rating || '4.9'}</span>
                    <span className="text-[10px] text-salon-muted font-normal">({st.review_count || 120})</span>
                  </div>
                  <h3 className="font-editorial text-2xl font-medium text-salon-dark truncate">{st.name}</h3>
                  <span className="text-xs text-salon-primary font-semibold block truncate">{st.role_title}</span>
                </div>
              </div>

              <div className="px-6 pb-4 space-y-2">
                <p className="text-xs text-salon-muted font-light line-clamp-3 leading-relaxed">{st.bio}</p>
                <div className="pt-2 flex items-center gap-4 text-xs font-medium text-salon-dark">
                  {permissions.canViewCommissions && st.commission_pct !== undefined && (
                    <span>Commission: <strong className="text-salon-primary">{st.commission_pct}%</strong></span>
                  )}
                  <span>Status: <strong className={st.is_active ? 'text-emerald-600' : 'text-red-500'}>{st.is_active ? 'Active' : 'Off'}</strong></span>
                </div>
                {!permissions.canEditStylists && st.schedules?.length > 0 && (
                  <div className="pt-2 border-t border-salon-border flex flex-wrap gap-1.5">
                    {st.schedules.filter((s) => Number(s.is_working) === 1).map((s) => (
                      <span
                        key={s.day_of_week}
                        className="px-2 py-0.5 rounded-full bg-salon-light text-[10px] font-medium text-salon-dark inline-flex items-center gap-1"
                      >
                        <Clock className="w-2.5 h-2.5 text-salon-primary" />
                        {dayNames[Number(s.day_of_week)]?.slice(0, 3)} {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Schedule Indicator & Edit */}
            <div className="p-4 bg-salon-light/60 border-t border-salon-border flex items-center justify-between">
              <span className="text-[11px] text-salon-muted">
                {st.schedules?.filter(s => s.is_working)?.length || 6} days on schedule
              </span>
              {(permissions.canEditStylists || permissions.canDeleteStylists) && (
                <div className="flex gap-2">
                  {permissions.canEditStylists && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(st)}
                      className="p-1.5 rounded-lg bg-salon-card text-salon-dark hover:text-salon-primary shadow-xs"
                      title="Edit Stylist & Schedule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {permissions.canDeleteStylists && (
                    <button
                      type="button"
                      onClick={() => handleDelete(st.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 shadow-xs"
                      title="Delete Stylist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / CREATE STYLIST & SCHEDULE MODAL */}
      {editingStylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-salon-border space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">
              {editingStylist.id ? `Edit ${editingStylist.name}` : 'New Stylist Profile'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Profile Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Artist Name</label>
                  <input
                    type="text"
                    value={editingStylist.name || ''}
                    onChange={(e) => setEditingStylist({ ...editingStylist, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Role / Specialty Title</label>
                  <input
                    type="text"
                    value={editingStylist.role_title || ''}
                    placeholder="e.g. Master Balayage Director"
                    onChange={(e) => setEditingStylist({ ...editingStylist, role_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={editingStylist.avatar_url || ''}
                    placeholder="https://..."
                    onChange={(e) => setEditingStylist({ ...editingStylist, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Commission %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingStylist.commission_pct || 15}
                    onChange={(e) => setEditingStylist({ ...editingStylist, commission_pct: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Bio / Editorial Background</label>
                <textarea
                  rows="2"
                  value={editingStylist.bio || ''}
                  onChange={(e) => setEditingStylist({ ...editingStylist, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>

              {/* Weekly Working Hours & Breaks Grid */}
              <div className="pt-2 border-t border-salon-border">
                <span className="font-bold text-salon-dark uppercase tracking-wider block mb-2">
                  Individual Working Schedule &amp; Breaks
                </span>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayNum) => {
                    const sch = editingStylist.schedules?.find(s => Number(s.day_of_week) === dayNum) || {
                      day_of_week: dayNum,
                      start_time: '09:00:00',
                      end_time: '19:00:00',
                      break_start: '13:00:00',
                      break_end: '14:00:00',
                      is_working: dayNum === 0 ? 0 : 1
                    };

                    return (
                      <div key={dayNum} className="p-2.5 rounded-xl bg-salon-light flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 w-28">
                          <input
                            type="checkbox"
                            checked={sch.is_working === 1}
                            onChange={(e) => handleScheduleChange(dayNum, 'is_working', e.target.checked ? 1 : 0)}
                            className="rounded text-salon-primary"
                          />
                          <span className="font-semibold text-salon-dark">{dayNames[dayNum]}</span>
                        </label>

                        {sch.is_working === 1 ? (
                          <div className="flex items-center gap-2 text-[11px]">
                            <div className="flex items-center gap-1">
                              <span className="text-salon-muted">Shift:</span>
                              <input
                                type="time"
                                value={sch.start_time?.slice(0, 5) || '09:00'}
                                onChange={(e) => handleScheduleChange(dayNum, 'start_time', e.target.value + ':00')}
                                className="px-1.5 py-0.5 rounded border border-salon-border bg-salon-card text-xs"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={sch.end_time?.slice(0, 5) || '19:00'}
                                onChange={(e) => handleScheduleChange(dayNum, 'end_time', e.target.value + ':00')}
                                className="px-1.5 py-0.5 rounded border border-salon-border bg-salon-card text-xs"
                              />
                            </div>

                            <div className="flex items-center gap-1 pl-2 border-l border-salon-border">
                              <span className="text-salon-muted">Break:</span>
                              <input
                                type="time"
                                value={sch.break_start?.slice(0, 5) || '13:00'}
                                onChange={(e) => handleScheduleChange(dayNum, 'break_start', e.target.value + ':00')}
                                className="px-1.5 py-0.5 rounded border border-salon-border bg-salon-card text-xs"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={sch.break_end?.slice(0, 5) || '14:00'}
                                onChange={(e) => handleScheduleChange(dayNum, 'break_end', e.target.value + ':00')}
                                className="px-1.5 py-0.5 rounded border border-salon-border bg-salon-card text-xs"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-salon-muted italic">Day Off Duty</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStylist(null)}
                  className="flex-1 py-2.5 rounded-full border border-salon-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Stylist & Schedule'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
