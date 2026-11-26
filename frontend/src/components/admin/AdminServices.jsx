// frontend/src/components/admin/AdminServices.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { usePublic } from '../../context/PublicContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminServices({ activeSubTab, onSubTabChange }) {
  const { payments, refresh } = usePublic();
  const { permissions } = useAuth();
  const { notifyError, notifySuccess } = useToast();
  const [localSubTab, setLocalSubTab] = useState('services');
  const subTab = activeSubTab || localSubTab;

  const selectSubTab = (nextTab) => {
    if (onSubTabChange) {
      onSubTabChange(nextTab);
    } else {
      setLocalSubTab(nextTab);
    }
  };

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Edit / Create modal state
  const [serviceModal, setServiceModal] = useState(null);
  const [catModal, setCatModal] = useState(null);
  const [pkgModal, setPkgModal] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [cRes, sRes, pRes] = await Promise.all([
        api.getCategories(),
        api.getServices(),
        api.getPackages()
      ]);
      setCategories(cRes.data || []);
      setServices(sRes.data || []);
      setPackages(pRes.data || []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load services catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const currencySymbol = payments?.currency_symbol || '₹';

  // --- SERVICE ACTIONS ---
  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      await api.saveService(serviceModal);
      setServiceModal(null);
      notifySuccess('Service saved.');
      loadAll();
      refresh();
    } catch (err) {
      notifyError(err.message || 'Failed to save service.');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.deleteService(id);
      notifySuccess('Service deleted.');
      loadAll();
      refresh();
    } catch (err) {
      notifyError(err.message || 'Failed to delete service.');
    }
  };

  // --- CATEGORY ACTIONS ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await api.saveCategory(catModal);
      setCatModal(null);
      notifySuccess('Category saved.');
      loadAll();
      refresh();
    } catch (err) {
      notifyError(err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.deleteCategory(id);
      notifySuccess('Category deleted.');
      loadAll();
      refresh();
    } catch (err) {
      notifyError(err.message || 'Failed to delete category.');
    }
  };

  // --- PACKAGE ACTIONS ---
  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      await api.savePackage(pkgModal);
      setPkgModal(null);
      notifySuccess('Package saved.');
      loadAll();
      refresh();
    } catch (err) {
      notifyError(err.message || 'Failed to save package.');
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await api.deletePackage(id);
      notifySuccess('Package deleted.');
      loadAll();
      refresh();
    } catch (err) {
      notifyError(err.message || 'Failed to delete package.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-salon-dark">
            Services &amp; Pricing Menu
          </h1>
          <p className="text-xs sm:text-sm text-salon-muted font-light">
            Manage your salon categories, signature treatment prices, and bundled bridal packages.
          </p>
        </div>

        <div className="flex flex-wrap sm:inline-flex gap-1 bg-salon-card p-1 rounded-2xl sm:rounded-full border border-salon-border shadow-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => selectSubTab('services')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              subTab === 'services' ? 'bg-salon-primary text-[#FFFDF8] shadow-soft-pink' : 'text-salon-dark hover:text-salon-primary'
            }`}
          >
            Services ({services.length})
          </button>
          <button
            type="button"
            onClick={() => selectSubTab('categories')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              subTab === 'categories' ? 'bg-salon-primary text-[#FFFDF8] shadow-soft-pink' : 'text-salon-dark hover:text-salon-primary'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => selectSubTab('packages')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              subTab === 'packages' ? 'bg-salon-primary text-[#FFFDF8] shadow-soft-pink' : 'text-salon-dark hover:text-salon-primary'
            }`}
          >
            Packages ({packages.length})
          </button>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex flex-wrap items-center justify-between gap-3">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadAll}
            className="px-3.5 py-1.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="p-8 text-center text-xs text-salon-muted">Loading catalog...</div>
      )}

      {/* SUB-TAB: SERVICES */}
      {subTab === 'services' && (
        <div className="space-y-4">
          {permissions.canEditCatalog && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setServiceModal({
                  name: '',
                  category_id: categories[0]?.id || 1,
                  duration_minutes: 45,
                  base_price: 90,
                  offer_price: null,
                  description: '',
                  is_featured: 0,
                  is_taxable: 1,
                  is_active: 1
                })}
                className="px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>
          )}

          <div className="bg-salon-card rounded-3xl border border-salon-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-salon-light text-salon-muted uppercase text-[10px] font-bold tracking-wider border-b border-salon-border">
                  <tr>
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Base Price</th>
                    <th className="px-6 py-4">Offer Price</th>
                    <th className="px-6 py-4">Featured</th>
                    {(permissions.canEditCatalog || permissions.canDeleteCatalog) && (
                      <th className="px-6 py-4 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-salon-border">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-salon-light/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-salon-dark">
                        <div>{s.name}</div>
                        <div className="text-[11px] text-salon-muted font-light line-clamp-1">{s.description}</div>
                      </td>
                      <td className="px-6 py-4 text-salon-muted">{s.category_name}</td>
                      <td className="px-6 py-4 font-medium">{s.duration_minutes} min</td>
                      <td className="px-6 py-4 font-bold">{currencySymbol}{Number(s.base_price).toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-salon-primary">
                        {s.offer_price !== null ? `${currencySymbol}${Number(s.offer_price).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {s.is_featured === 1 ? (
                          <span className="px-2 py-0.5 rounded-full bg-salon-soft text-salon-primary text-[10px] font-bold">YES</span>
                        ) : (
                          <span className="text-salon-muted text-[10px]">No</span>
                        )}
                      </td>
                      {(permissions.canEditCatalog || permissions.canDeleteCatalog) && (
                        <td className="px-6 py-4 text-right space-x-2">
                          {permissions.canEditCatalog && (
                            <button
                              type="button"
                              onClick={() => setServiceModal(s)}
                              className="p-1.5 rounded-lg bg-salon-light hover:bg-salon-soft text-salon-dark inline-block"
                              title="Edit Service"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {permissions.canDeleteCatalog && (
                            <button
                              type="button"
                              onClick={() => handleDeleteService(s.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 inline-block"
                              title="Delete Service"
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
          </div>
        </div>
      )}

      {/* SUB-TAB: CATEGORIES */}
      {subTab === 'categories' && (
        <div className="space-y-4">
          {permissions.canEditCatalog && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCatModal({ name: '', slug: '', description: '', icon: 'Scissors', sort_order: 1 })}
                className="px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <div key={c.id} className="p-6 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase text-salon-primary tracking-wider font-mono">
                      /{c.slug}
                    </span>
                    <span className="text-xs text-salon-muted font-medium">Order: {c.sort_order}</span>
                  </div>
                  <h3 className="font-editorial text-2xl font-medium text-salon-dark">{c.name}</h3>
                  <p className="text-xs text-salon-muted line-clamp-2 mt-1">{c.description}</p>
                </div>

                {(permissions.canEditCatalog || permissions.canDeleteCatalog) && (
                  <div className="pt-4 border-t border-salon-border flex justify-end gap-2">
                    {permissions.canEditCatalog && (
                      <button type="button" onClick={() => setCatModal(c)} className="p-1.5 rounded-lg bg-salon-light text-salon-dark" title="Edit Category">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {permissions.canDeleteCatalog && (
                      <button type="button" onClick={() => handleDeleteCategory(c.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600" title="Delete Category">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: PACKAGES */}
      {subTab === 'packages' && (
        <div className="space-y-4">
          {permissions.canEditCatalog && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPkgModal({
                  name: '',
                  tagline: '',
                  description: '',
                  price: 250,
                  original_price: 320,
                  duration_minutes: 120,
                  is_featured: 1
                })}
                className="px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Signature Package</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((p) => (
              <div key={p.id} className="p-6 rounded-3xl bg-salon-card border border-salon-border shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-salon-primary">{p.tagline}</span>
                  <h3 className="font-editorial text-2xl font-medium text-salon-dark">{p.name}</h3>
                  <p className="text-xs text-salon-muted">{p.description}</p>
                </div>

                <div className="pt-4 border-t border-salon-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-salon-muted">{p.duration_minutes} min journey</span>
                    <div className="text-xl font-bold text-salon-dark">
                      {currencySymbol}{Number(p.price).toFixed(2)}
                    </div>
                  </div>

                  {(permissions.canEditCatalog || permissions.canDeleteCatalog) && (
                    <div className="flex gap-2">
                      {permissions.canEditCatalog && (
                        <button type="button" onClick={() => setPkgModal(p)} className="p-2 rounded-lg bg-salon-light text-salon-dark" title="Edit Package">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {permissions.canDeleteCatalog && (
                        <button type="button" onClick={() => handleDeletePackage(p.id)} className="p-2 rounded-lg bg-red-50 text-red-600" title="Delete Package">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-salon-border space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">
              {serviceModal.id ? 'Edit Service' : 'New Service'}
            </h3>
            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Service Title</label>
                <input
                  type="text"
                  value={serviceModal.name || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Category</label>
                <select
                  value={serviceModal.category_id || 1}
                  onChange={(e) => setServiceModal({ ...serviceModal, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs bg-salon-card"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={serviceModal.duration_minutes || 45}
                    onChange={(e) => setServiceModal({ ...serviceModal, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Base Price ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceModal.base_price || 0}
                    onChange={(e) => setServiceModal({ ...serviceModal, base_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Offer Price ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceModal.offer_price || ''}
                    placeholder="Optional"
                    onChange={(e) => setServiceModal({ ...serviceModal, offer_price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-salon-muted mb-1">Description</label>
                <textarea
                  rows="3"
                  value={serviceModal.description || ''}
                  onChange={(e) => setServiceModal({ ...serviceModal, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceModal.is_featured === 1}
                    onChange={(e) => setServiceModal({ ...serviceModal, is_featured: e.target.checked ? 1 : 0 })}
                    className="rounded text-salon-primary focus:ring-salon-primary"
                  />
                  <span>Featured Service</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceModal.is_taxable === 1}
                    onChange={(e) => setServiceModal({ ...serviceModal, is_taxable: e.target.checked ? 1 : 0 })}
                    className="rounded text-salon-primary focus:ring-salon-primary"
                  />
                  <span>Apply Tax</span>
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  className="flex-1 py-2.5 rounded-full border border-salon-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-4">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Category Details</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Category Title</label>
                <input
                  type="text"
                  value={catModal.name || ''}
                  onChange={(e) => setCatModal({ ...catModal, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Description</label>
                <textarea
                  rows="3"
                  value={catModal.description || ''}
                  onChange={(e) => setCatModal({ ...catModal, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCatModal(null)}
                  className="flex-1 py-2.5 rounded-full border border-salon-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACKAGE MODAL */}
      {pkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-4">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Package Details</h3>
            <form onSubmit={handleSavePackage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Package Title</label>
                <input
                  type="text"
                  value={pkgModal.name || ''}
                  onChange={(e) => setPkgModal({ ...pkgModal, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Tagline</label>
                <input
                  type="text"
                  value={pkgModal.tagline || ''}
                  placeholder="e.g. The Ultimate Bridal Suite"
                  onChange={(e) => setPkgModal({ ...pkgModal, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Price ({currencySymbol})</label>
                  <input
                    type="number"
                    value={pkgModal.price || 0}
                    onChange={(e) => setPkgModal({ ...pkgModal, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-salon-muted mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={pkgModal.duration_minutes || 120}
                    onChange={(e) => setPkgModal({ ...pkgModal, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Description</label>
                <textarea
                  rows="3"
                  value={pkgModal.description || ''}
                  onChange={(e) => setPkgModal({ ...pkgModal, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPkgModal(null)}
                  className="flex-1 py-2.5 rounded-full border border-salon-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
