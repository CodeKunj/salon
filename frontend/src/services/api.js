// frontend/src/services/api.js

function resolveApiBase() {
  if (typeof window === 'undefined') return '/api';
  if (typeof document !== 'undefined') {
    const modScript = document.querySelector(
      'script[type="module"][src*="assets/"], script[type="module"][src*="src/main.jsx"]'
    );
    if (modScript?.src) {
      try {
        const u = new URL(modScript.src, window.location.href);
        const mountBase = u.pathname.replace(/\/(assets|src)\/.*$/i, '').replace(/\/+$/, '');
        return `${mountBase}/api`;
      } catch {
        // fallback below
      }
    }
  }
  const cleanPath = window.location.pathname
    .replace(/\/index\.html$/i, '')
    .replace(/\/(admin|account|my-bookings|login|register|card|connect|share)(\/.*)?$/i, '')
    .replace(/\/+$/, '');
  return `${cleanPath}/api`;
}

const API_BASE = resolveApiBase();

function getAuthHeader(authScope = 'staff') {
  const storageKey = authScope === 'customer' ? 'ritiverse_customer_token' : 'aura_auth_token';
  try {
    const token = localStorage.getItem(storageKey);
    return token ? { Authorization: `Bearer ${token}`, 'X-Auth-Token': token } : {};
  } catch {
    return {};
  }
}

function getHttpStatusFallbackMessage(status) {
  switch (status) {
    case 400:
      return 'Invalid request. Please review your input and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflicting record already exists or is currently in use.';
    case 413:
      return 'Uploaded file or request is larger than the server allows.';
    case 422:
      return 'Please check the highlighted details and try again.';
    case 429:
      return 'Too many requests right now. Please wait a moment and retry.';
    case 502:
    case 503:
    case 504:
      return `The studio server is temporarily unavailable (${status}). Please try again shortly.`;
    default:
      return status >= 500
        ? 'An unexpected server error occurred. Please try again.'
        : `Request failed with status ${status}.`;
  }
}

async function request(endpoint, options = {}) {
  const { authScope = 'staff', headers: customHeaders, timeout = 15000, ...fetchOptions } = options;
  const url = `${API_BASE}${endpoint}`;
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...getAuthHeader(authScope),
    ...customHeaders,
  };

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const offlineErr = new Error('You appear to be offline. Please check your internet connection.');
    offlineErr.isNetworkError = true;
    offlineErr.status = 0;
    throw offlineErr;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId =
    controller && timeout > 0
      ? window.setTimeout(() => controller.abort(), timeout)
      : null;

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller ? controller.signal : fetchOptions.signal,
    });

    const rawText = await res.text();
    let data = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {};
      }
    }

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        if (authScope === 'customer' && !endpoint.startsWith('/customer/login') && !endpoint.startsWith('/customer/register')) {
          window.dispatchEvent(new CustomEvent('ritiverse:customer-unauthorized'));
        } else if (authScope === 'staff' && !endpoint.startsWith('/auth/login')) {
          window.dispatchEvent(new CustomEvent('aura:unauthorized'));
        }
      }
      const fieldError = Array.isArray(data.errors) && data.errors.length > 0 ? data.errors.join(' ') : '';
      const errorMsg = data.message || fieldError || getHttpStatusFallbackMessage(res.status);
      const err = new Error(errorMsg);
      err.status = res.status;
      err.errors = data.errors || [];
      throw err;
    }

    return data;
  } catch (err) {
    if (err?.name === 'AbortError') {
      const timeoutErr = new Error('The request timed out. Please check your connection and try again.');
      timeoutErr.isTimeout = true;
      timeoutErr.status = 408;
      throw timeoutErr;
    }
    if (!err?.status && (err?.name === 'TypeError' || /Failed to fetch|NetworkError|Load failed/i.test(err?.message || ''))) {
      const netErr = new Error('Unable to reach the studio server. Please check your connection and retry.');
      netErr.isNetworkError = true;
      netErr.status = 0;
      throw netErr;
    }
    console.error(`API Error [${fetchOptions.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  } finally {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }
}

export const api = {
  // Public
  getBootstrap: () => request('/public/bootstrap'),
  getAvailableSlots: (date, services = [], stylistId = null, duration = 0) => {
    const srvParam = services.length ? `&services=${services.join(',')}` : '';
    const styParam = stylistId ? `&stylist_id=${stylistId}` : '';
    const durParam = duration ? `&duration=${duration}` : '';
    return request(`/public/slots?date=${date}${srvParam}${styParam}${durParam}`);
  },
  validatePromo: (code, subtotal) => request('/public/validate-promo', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal })
  }),
  bookAppointment: (payload) => request('/public/book', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  trackEvent: (eventName, data) => request('/public/track-event', {
    method: 'POST',
    body: JSON.stringify({ event_name: eventName, data })
  }),

  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Bookings
  getBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/bookings${q ? `?${q}` : ''}`);
  },
  getBooking: (id) => request(`/bookings/${id}`),
  updateBookingStatus: (id, payload) => request(`/bookings/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  createWalkIn: (payload) => request('/bookings/walkin', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),

  // Services & Categories & Packages
  getCategories: () => request('/services/categories'),
  saveCategory: (payload) => request('/services/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteCategory: (id) => request(`/services/categories/${id}`, { method: 'DELETE' }),

  getServices: () => request('/services'),
  saveService: (payload) => request('/services', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  getPackages: () => request('/services/packages'),
  savePackage: (payload) => request('/services/packages', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deletePackage: (id) => request(`/services/packages/${id}`, { method: 'DELETE' }),

  // Staff
  getStaff: () => request('/staff'),
  saveStaff: (payload) => request('/staff', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' }),

  // Settings
  getSettingsBootstrap: () => request('/settings/bootstrap'),
  getSettings: () => request('/settings'),
  updateSettingsGroup: (group, payload) => request(`/settings/${group}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  uploadSeoOgImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/settings/seo/og-image', {
      method: 'POST',
      body: formData,
    });
  },
  getHours: () => request('/settings/hours'),
  updateHours: (days) => request('/settings/hours', {
    method: 'POST',
    body: JSON.stringify({ days })
  }),
  getClosures: () => request('/settings/closures'),
  saveClosure: (payload) => request('/settings/closures', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteClosure: (id) => request(`/settings/closures/${id}`, { method: 'DELETE' }),
  getPromos: () => request('/settings/promos'),
  savePromo: (payload) => request('/settings/promos', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deletePromo: (id) => request(`/settings/promos/${id}`, { method: 'DELETE' }),

  // CMS
  getCMSHero: () => request('/cms/hero'),
  updateCMSHero: (payload) => request('/cms/hero', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getCMSGallery: () => request('/cms/gallery'),
  saveCMSGallery: (payload) => request('/cms/gallery', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteCMSGallery: (id) => request(`/cms/gallery/${id}`, { method: 'DELETE' }),
  getCMSTestimonials: () => request('/cms/testimonials'),
  saveCMSTestimonial: (payload) => request('/cms/testimonials', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteCMSTestimonial: (id) => request(`/cms/testimonials/${id}`, { method: 'DELETE' }),
  getCMSFAQs: () => request('/cms/faqs'),
  saveCMSFAQ: (payload) => request('/cms/faqs', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteCMSFAQ: (id) => request(`/cms/faqs/${id}`, { method: 'DELETE' }),

  // Users & Security
  getUsers: () => request('/users'),
  saveUser: (payload) => request('/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/users/audit-logs${q ? `?${q}` : ''}`);
  },

  // Admin Customer CRM Directory
  getCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/customers${q ? `?${q}` : ''}`);
  },
  getCustomerDetail: ({ user_id, email, phone } = {}) => {
    const params = new URLSearchParams();
    if (user_id) params.set('user_id', String(user_id));
    if (email) params.set('email', email);
    if (phone) params.set('phone', phone);
    return request(`/customers/detail?${params.toString()}`);
  },
  updateCustomerStatus: (id, is_active) => request(`/customers/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ is_active }),
  }),

  // Customer Auth & Account Portal
  customerRegister: (payload) => request('/customer/register', {
    method: 'POST',
    authScope: 'customer',
    body: JSON.stringify(payload),
  }),
  customerLogin: (email, password) => request('/customer/login', {
    method: 'POST',
    authScope: 'customer',
    body: JSON.stringify({ email, password }),
  }),
  customerGetMe: () => request('/customer/me', { authScope: 'customer' }),
  customerUpdateProfile: (payload) => request('/customer/profile', {
    method: 'POST',
    authScope: 'customer',
    body: JSON.stringify(payload),
  }),
  customerGetBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/customer/bookings${q ? `?${q}` : ''}`, { authScope: 'customer' });
  },
  customerGetBooking: (id) => request(`/customer/bookings/${id}`, { authScope: 'customer' }),
  customerCancelBooking: (id) => request(`/customer/bookings/${id}/cancel`, {
    method: 'POST',
    authScope: 'customer',
  }),
};
