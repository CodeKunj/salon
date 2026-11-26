// frontend/src/components/admin/AdminCMS.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { usePublic } from '../../context/PublicContext';

export default function AdminCMS({ activeSubTab, onSubTabChange }) {
  const { refresh } = usePublic();
  const [localTab, setLocalTab] = useState('hero');
  const activeTab = activeSubTab || localTab;

  const selectTab = (nextTab) => {
    if (onSubTabChange) {
      onSubTabChange(nextTab);
    } else {
      setLocalTab(nextTab);
    }
  };

  const [hero, setHero] = useState({});
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);

  // Modals
  const [galleryModal, setGalleryModal] = useState(null);
  const [testimonialModal, setTestimonialModal] = useState(null);
  const [faqModal, setFaqModal] = useState(null);

  const loadCMS = async () => {
    try {
      setLoading(true);
      const [hRes, gRes, tRes, fRes] = await Promise.all([
        api.getCMSHero(),
        api.getCMSGallery(),
        api.getCMSTestimonials(),
        api.getCMSFAQs()
      ]);
      setHero(hRes.data || {});
      setGallery(gRes.data || []);
      setTestimonials(tRes.data || []);
      setFaqs(fRes.data || []);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCMS();
  }, []);

  const handleSaveHero = async (e) => {
    e.preventDefault();
    try {
      setSavingHero(true);
      await api.updateCMSHero(hero);
      alert('Hero banner updated successfully.');
      refresh();
    } catch (err) {
      alert(err.message || 'Failed to update hero.');
    } finally {
      setSavingHero(false);
    }
  };

  // Gallery Handlers
  const handleSaveGallery = async (e) => {
    e.preventDefault();
    try {
      await api.saveCMSGallery(galleryModal);
      setGalleryModal(null);
      loadCMS();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this lookbook item?')) return;
    try {
      await api.deleteCMSGallery(id);
      loadCMS();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // Testimonials Handlers
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      await api.saveCMSTestimonial(testimonialModal);
      setTestimonialModal(null);
      loadCMS();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await api.deleteCMSTestimonial(id);
      loadCMS();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // FAQ Handlers
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      await api.saveCMSFAQ(faqModal);
      setFaqModal(null);
      loadCMS();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await api.deleteCMSFAQ(id);
      loadCMS();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-salon-dark">
            Lookbook &amp; Content Studio
          </h1>
          <p className="text-xs sm:text-sm text-salon-muted font-light">
            Manage your homepage hero banner, lookbook gallery albums, client reviews, and FAQ accordion.
          </p>
        </div>

        <div className="flex flex-wrap sm:inline-flex gap-1 bg-salon-card p-1 rounded-2xl sm:rounded-full border border-salon-border shadow-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => selectTab('hero')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              activeTab === 'hero' ? 'bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] shadow-soft-pink transition-colors' : 'text-salon-dark'
            }`}
          >
            Hero Banner
          </button>
          <button
            type="button"
            onClick={() => selectTab('gallery')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              activeTab === 'gallery' ? 'bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] shadow-soft-pink transition-colors' : 'text-salon-dark'
            }`}
          >
            Lookbook ({gallery.length})
          </button>
          <button
            type="button"
            onClick={() => selectTab('testimonials')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              activeTab === 'testimonials' ? 'bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] shadow-soft-pink transition-colors' : 'text-salon-dark'
            }`}
          >
            Reviews ({testimonials.length})
          </button>
          <button
            type="button"
            onClick={() => selectTab('faqs')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              activeTab === 'faqs' ? 'bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] shadow-soft-pink transition-colors' : 'text-salon-dark'
            }`}
          >
            FAQs ({faqs.length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-xs text-salon-muted">Loading editorial content...</div>
      )}

      {/* TAB: HERO BANNER */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="bg-salon-card rounded-3xl border border-salon-border p-6 sm:p-8 space-y-5 shadow-xs text-xs">
          <h3 className="font-editorial text-2xl font-medium text-salon-dark">Hero Banner Configuration</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-salon-muted mb-1">Headline</label>
              <input
                type="text"
                value={hero.headline || ''}
                onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-salon-muted mb-1">Badge Text</label>
              <input
                type="text"
                value={hero.badge_text || ''}
                onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-salon-muted mb-1">Subheadline</label>
            <textarea
              rows="3"
              value={hero.subheadline || ''}
              onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
            />
          </div>

          <div className="pt-4 border-t border-salon-border">
            <span className="font-bold text-salon-dark uppercase tracking-wider block mb-3">
              Treatment Preview Card 1 (Large Featured)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Card Title</label>
                <input
                  type="text"
                  value={hero.preview_card_1_title || ''}
                  onChange={(e) => setHero({ ...hero, preview_card_1_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Card Subtitle</label>
                <input
                  type="text"
                  value={hero.preview_card_1_sub || ''}
                  onChange={(e) => setHero({ ...hero, preview_card_1_sub: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Image URL</label>
                <input
                  type="text"
                  value={hero.preview_card_1_image || ''}
                  onChange={(e) => setHero({ ...hero, preview_card_1_image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <span className="font-bold text-salon-dark uppercase tracking-wider block mb-3">
              Treatment Preview Card 2 (Floating Badge)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Card Title</label>
                <input
                  type="text"
                  value={hero.preview_card_2_title || ''}
                  onChange={(e) => setHero({ ...hero, preview_card_2_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Card Subtitle</label>
                <input
                  type="text"
                  value={hero.preview_card_2_sub || ''}
                  onChange={(e) => setHero({ ...hero, preview_card_2_sub: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Image URL</label>
                <input
                  type="text"
                  value={hero.preview_card_2_image || ''}
                  onChange={(e) => setHero({ ...hero, preview_card_2_image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingHero}
              className="px-6 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors"
            >
              {savingHero ? 'Saving Hero...' : 'Save Hero Settings'}
            </button>
          </div>
        </form>
      )}

      {/* TAB: LOOKBOOK GALLERY */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setGalleryModal({ title: '', category: 'Hair Styling', image_url: '', tag: 'Atelier Work' })}
              className="px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lookbook Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <div key={g.id} className="rounded-2xl border border-salon-border overflow-hidden bg-salon-card shadow-xs group">
                <div className="relative aspect-[4/5] bg-salon-soft">
                  <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md bg-salon-card/95 text-[10px] font-bold text-salon-dark uppercase">
                      {g.category}
                    </span>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="overflow-hidden">
                    <h5 className="font-semibold text-xs text-salon-dark truncate">{g.title}</h5>
                    <span className="text-[10px] text-salon-muted">{g.tag}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setGalleryModal(g)} className="p-1 rounded text-salon-dark hover:bg-salon-light">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteGallery(g.id)} className="p-1 rounded text-red-500 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setTestimonialModal({ client_name: '', service_tag: 'Hair Styling', review_text: '', rating: 5, avatar_url: '' })}
              className="px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Guest Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl bg-salon-card border border-salon-border shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-salon-dark">{t.client_name}</span>
                    <span className="text-[11px] text-amber-500 font-bold">★ {t.rating} / 5</span>
                  </div>
                  <p className="text-xs text-salon-muted italic font-editorial">&ldquo;{t.review_text}&rdquo;</p>
                  <span className="text-[10px] text-salon-primary font-semibold block mt-2">{t.service_tag}</span>
                </div>

                <div className="pt-3 border-t border-salon-border flex justify-end gap-2">
                  <button onClick={() => setTestimonialModal(t)} className="p-1.5 rounded-lg bg-salon-light text-salon-dark">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteTestimonial(t.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setFaqModal({ question: '', answer: '', category: 'General', sort_order: 1 })}
              className="px-5 py-2.5 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="p-5 rounded-2xl bg-salon-card border border-salon-border shadow-xs flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-salon-soft text-salon-primary text-[10px] font-bold uppercase">
                      {f.category}
                    </span>
                    <h4 className="font-editorial text-xl font-medium text-salon-dark">{f.question}</h4>
                  </div>
                  <p className="text-xs text-salon-muted font-light leading-relaxed pl-1">{f.answer}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setFaqModal(f)} className="p-1.5 rounded-lg bg-salon-light text-salon-dark">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteFaq(f.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GALLERY MODAL */}
      {galleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-4">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Lookbook Item</h3>
            <form onSubmit={handleSaveGallery} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Title</label>
                <input
                  type="text"
                  value={galleryModal.title || ''}
                  onChange={(e) => setGalleryModal({ ...galleryModal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Category</label>
                <select
                  value={galleryModal.category || 'Hair Styling'}
                  onChange={(e) => setGalleryModal({ ...galleryModal, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs bg-salon-card"
                >
                  <option value="Hair Styling">Hair Styling</option>
                  <option value="Bridal Makeup">Bridal Makeup</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Nail Art">Nail Art</option>
                  <option value="Spa">Spa</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Image URL</label>
                <input
                  type="text"
                  value={galleryModal.image_url || ''}
                  onChange={(e) => setGalleryModal({ ...galleryModal, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Tag / Metier</label>
                <input
                  type="text"
                  value={galleryModal.tag || ''}
                  placeholder="e.g. Color Metier"
                  onChange={(e) => setGalleryModal({ ...galleryModal, tag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setGalleryModal(null)} className="flex-1 py-2 rounded-full border border-salon-border text-xs">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors">
                  Save Look
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TESTIMONIAL MODAL */}
      {testimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-4">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">Client Testimonial</h3>
            <form onSubmit={handleSaveTestimonial} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Client Name</label>
                <input
                  type="text"
                  value={testimonialModal.client_name || ''}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, client_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Service Tag</label>
                <input
                  type="text"
                  value={testimonialModal.service_tag || ''}
                  placeholder="e.g. Balayage & Blowout"
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, service_tag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Review Quote</label>
                <textarea
                  rows="3"
                  value={testimonialModal.review_text || ''}
                  onChange={(e) => setTestimonialModal({ ...testimonialModal, review_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setTestimonialModal(null)} className="flex-1 py-2 rounded-full border border-salon-border text-xs">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors">
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-salon-dark/60 backdrop-blur-xs">
          <div className="bg-salon-card rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-salon-border space-y-4">
            <h3 className="font-editorial text-2xl font-medium text-salon-dark">FAQ Item</h3>
            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-salon-muted mb-1">Question</label>
                <input
                  type="text"
                  value={faqModal.question || ''}
                  onChange={(e) => setFaqModal({ ...faqModal, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Category</label>
                <input
                  type="text"
                  value={faqModal.category || 'General'}
                  onChange={(e) => setFaqModal({ ...faqModal, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-salon-muted mb-1">Answer</label>
                <textarea
                  rows="3"
                  value={faqModal.answer || ''}
                  onChange={(e) => setFaqModal({ ...faqModal, answer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-salon-border text-xs"
                  required
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setFaqModal(null)} className="flex-1 py-2 rounded-full border border-salon-border text-xs">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 rounded-full bg-salon-primary hover:bg-[#933E29] text-[#FFFDF8] text-xs font-semibold shadow-soft-pink transition-colors">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
