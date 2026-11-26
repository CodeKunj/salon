// frontend/src/utils/adminRouter.js

export const ADMIN_TABS = ['overview', 'bookings', 'customers', 'share', 'services', 'stylists', 'cms', 'settings'];

export const ADMIN_SUB_TABS = {
  services: ['services', 'categories', 'packages'],
  cms: ['hero', 'gallery', 'testimonials', 'faqs'],
  settings: [
    'general',
    'hours',
    'booking_rules',
    'pricing_rules',
    'staff_rules',
    'promos',
    'payments',
    'notifications',
    'seo_analytics',
    'security',
  ],
};

export const ADMIN_TAB_TITLES = {
  overview: 'Dashboard',
  bookings: 'Appointments',
  customers: 'Customers',
  share: 'Share & QR Card',
  services: 'Services & Menu',
  stylists: 'Artists & Schedules',
  cms: 'Lookbook & CMS',
  settings: 'Settings',
};

const ROLE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    tabs: ['overview', 'bookings', 'customers', 'share', 'services', 'stylists', 'cms', 'settings'],
    settingsModules: [
      'general',
      'hours',
      'booking_rules',
      'pricing_rules',
      'staff_rules',
      'promos',
      'payments',
      'notifications',
      'seo_analytics',
      'security',
    ],
    canViewRevenue: true,
    canViewBookingAmount: true,
    canViewCustomers: true,
    canManageCustomerStatus: true,
    canCreateWalkIn: true,
    canEditBooking: true,
    canDeleteBooking: true,
    canEditCatalog: true,
    canDeleteCatalog: true,
    canEditStylists: true,
    canViewCommissions: true,
    canDeleteStylists: true,
    canManageCMS: true,
    canManageSettings: true,
    canManageSystemSettings: true,
    canManageUsersAndSecurity: true,
  },
  branch_manager: {
    label: 'Branch Manager',
    tabs: ['overview', 'bookings', 'customers', 'share', 'services', 'stylists', 'cms', 'settings'],
    settingsModules: [
      'general',
      'hours',
      'booking_rules',
      'pricing_rules',
      'staff_rules',
      'promos',
    ],
    canViewRevenue: true,
    canViewBookingAmount: true,
    canViewCustomers: true,
    canManageCustomerStatus: false,
    canCreateWalkIn: true,
    canEditBooking: true,
    canDeleteBooking: true,
    canEditCatalog: true,
    canDeleteCatalog: false,
    canEditStylists: true,
    canViewCommissions: true,
    canDeleteStylists: false,
    canManageCMS: true,
    canManageSettings: true,
    canManageSystemSettings: false,
    canManageUsersAndSecurity: false,
  },
  receptionist: {
    label: 'Receptionist',
    tabs: ['overview', 'bookings', 'customers', 'share', 'stylists'],
    settingsModules: [],
    canViewRevenue: false,
    canViewBookingAmount: true,
    canViewCustomers: true,
    canManageCustomerStatus: false,
    canCreateWalkIn: true,
    canEditBooking: true,
    canDeleteBooking: false,
    canEditCatalog: false,
    canDeleteCatalog: false,
    canEditStylists: false,
    canViewCommissions: false,
    canDeleteStylists: false,
    canManageCMS: false,
    canManageSettings: false,
    canManageSystemSettings: false,
    canManageUsersAndSecurity: false,
  },
  stylist: {
    label: 'Stylist',
    tabs: ['overview', 'bookings'],
    settingsModules: [],
    canViewRevenue: false,
    canViewBookingAmount: false,
    canViewCustomers: false,
    canManageCustomerStatus: false,
    canCreateWalkIn: false,
    canEditBooking: false,
    canDeleteBooking: false,
    canEditCatalog: false,
    canDeleteCatalog: false,
    canEditStylists: false,
    canViewCommissions: false,
    canDeleteStylists: false,
    canManageCMS: false,
    canManageSettings: false,
    canManageSystemSettings: false,
    canManageUsersAndSecurity: false,
  },
};

export function getPermissions(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.stylist;
}

export function getAllowedAdminTabs(role) {
  return getPermissions(role).tabs;
}

export function getAllowedSettingsModules(role) {
  return getPermissions(role).settingsModules;
}

export function canAccessAdminTab(role, tab) {
  return getAllowedAdminTabs(role).includes(tab);
}

export function canAccessSettingsModule(role, moduleId) {
  return getAllowedSettingsModules(role).includes(moduleId);
}

export function getDefaultAdminTab(role) {
  return getAllowedAdminTabs(role)[0] || 'overview';
}

export function getDefaultSubTab(tab, role) {
  if (tab === 'settings') {
    return getAllowedSettingsModules(role)[0] || 'general';
  }
  return ADMIN_SUB_TABS[tab]?.[0] || null;
}

export function sanitizeSubTab(tab, subTab, role) {
  const validSubs = ADMIN_SUB_TABS[tab];
  if (!validSubs) return null;

  if (tab === 'settings') {
    const allowed = role ? getAllowedSettingsModules(role) : validSubs;
    if (subTab && allowed.includes(subTab)) return subTab;
    return allowed[0] || 'general';
  }

  if (subTab && validSubs.includes(subTab)) return subTab;
  return validSubs[0];
}

export const ACCOUNT_TABS = ['upcoming', 'history', 'profile'];

export const ACCOUNT_TAB_TITLES = {
  upcoming: 'My Bookings',
  history: 'Past History',
  profile: 'Profile & Settings',
  login: 'Client Sign In',
  register: 'Create Client Account',
};

export function getAppBasePath(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  const deepMatch = pathname.match(/^(.*?)\/(admin|account|my-bookings|login|register|card|connect|share)(\/.*)?$/i);
  if (deepMatch) {
    return deepMatch[1];
  }
  return pathname
    .replace(/\/index\.html$/i, '')
    .replace(/\/+$/, '');
}

export function parseAppRoute(loc = typeof window !== 'undefined' ? window.location : { pathname: '/', hash: '' }) {
  const pathname = loc.pathname || '/';
  const hash = (loc.hash || '').replace(/^#/, '');

  const adminPathMatch = pathname.match(/^(.*?)\/admin(?:\/([^/]+))?(?:\/([^/]+))?\/?$/i);
  const adminHashMatch = !adminPathMatch ? hash.match(/^\/?admin(?:\/([^/]+))?(?:\/([^/]+))?\/?$/i) : null;

  if (adminPathMatch || adminHashMatch) {
    const rawTab = ((adminPathMatch ? adminPathMatch[2] : adminHashMatch[1]) || '').toLowerCase() || 'overview';
    const rawSubTab = ((adminPathMatch ? adminPathMatch[3] : adminHashMatch[2]) || '').toLowerCase() || null;

    const tab = ADMIN_TABS.includes(rawTab) ? rawTab : 'overview';
    const subTab = sanitizeSubTab(tab, rawSubTab);

    return {
      mode: 'admin',
      isAdmin: true,
      isCustomer: false,
      isCard: false,
      tab,
      subTab,
      accountTab: 'upcoming',
      authMode: 'login',
      explicitAuth: false,
      rawTab,
      rawSubTab,
      fromHash: Boolean(adminHashMatch),
    };
  }

  const cardPathMatch = pathname.match(/^(.*?)\/(card|connect|share)\/?$/i);
  const cardHashMatch = !cardPathMatch ? hash.match(/^\/?(card|connect|share)\/?$/i) : null;

  if (cardPathMatch || cardHashMatch) {
    return {
      mode: 'card',
      isAdmin: false,
      isCustomer: false,
      isCard: true,
      tab: 'overview',
      subTab: null,
      accountTab: 'upcoming',
      authMode: 'login',
      explicitAuth: false,
      rawTab: 'card',
      rawSubTab: null,
      fromHash: Boolean(cardHashMatch),
    };
  }

  const custPathMatch = pathname.match(/^(.*?)\/(login|register|my-bookings|account)(?:\/([^/]+))?\/?$/i);
  const custHashMatch = !custPathMatch ? hash.match(/^\/?(login|register|my-bookings|account)(?:\/([^/]+))?\/?$/i) : null;

  if (custPathMatch || custHashMatch) {
    const segment = ((custPathMatch ? custPathMatch[2] : custHashMatch[1]) || 'account').toLowerCase();
    const rawAccountSub = ((custPathMatch ? custPathMatch[3] : custHashMatch[2]) || '').toLowerCase();
    const authMode = segment === 'register' ? 'register' : 'login';
    const accountTab = ACCOUNT_TABS.includes(rawAccountSub) ? rawAccountSub : 'upcoming';

    return {
      mode: 'customer',
      isAdmin: false,
      isCustomer: true,
      isCard: false,
      tab: 'overview',
      subTab: null,
      accountTab,
      authMode,
      explicitAuth: segment === 'login' || segment === 'register',
      rawTab: segment,
      rawSubTab: rawAccountSub || null,
      fromHash: Boolean(custHashMatch),
    };
  }

  return {
    mode: 'public',
    isAdmin: false,
    isCustomer: false,
    isCard: false,
    tab: 'overview',
    subTab: null,
    accountTab: 'upcoming',
    authMode: 'login',
    explicitAuth: false,
    rawTab: null,
    rawSubTab: null,
    fromHash: false,
  };
}

export function parseAdminRoute(loc) {
  return parseAppRoute(loc);
}

export function buildAdminUrl(tab = 'overview', subTab = null) {
  const base = getAppBasePath();
  const safeTab = ADMIN_TABS.includes(tab) ? tab : 'overview';
  const safeSub = ADMIN_SUB_TABS[safeTab] ? sanitizeSubTab(safeTab, subTab) : null;
  const includeSub = safeSub && (safeTab === 'settings' || safeSub !== ADMIN_SUB_TABS[safeTab][0]);
  return `${base}/admin/${safeTab}${includeSub ? `/${safeSub}` : ''}`;
}

export function buildCustomerUrl(accountTab = 'upcoming', authMode = null) {
  const base = getAppBasePath();
  if (authMode === 'login' || authMode === 'register') {
    return `${base}/${authMode}`;
  }
  const safeTab = ACCOUNT_TABS.includes(accountTab) ? accountTab : 'upcoming';
  return `${base}/account/${safeTab}`;
}

export function buildPublicUrl() {
  const base = getAppBasePath();
  return base ? `${base}/` : '/';
}

export function buildCardUrl() {
  const base = getAppBasePath();
  return `${base}/card`;
}

export function syncAdminDocumentBase(needsBase) {
  if (typeof document === 'undefined') return;
  const existing = document.head.querySelector('base[data-admin-base="1"]');

  if (!needsBase) {
    if (existing) existing.remove();
    return;
  }

  const targetHref = `${getAppBasePath()}/`;
  if (existing) {
    if (existing.getAttribute('href') !== targetHref) {
      existing.setAttribute('href', targetHref);
    }
    return;
  }

  const baseEl = document.createElement('base');
  baseEl.setAttribute('data-admin-base', '1');
  baseEl.setAttribute('href', targetHref);
  document.head.prepend(baseEl);
}

export function navigateToAdminRoute(tab = 'overview', subTab = null, { replace = false } = {}) {
  if (typeof window === 'undefined') return;
  const targetUrl = buildAdminUrl(tab, subTab);
  syncAdminDocumentBase(true);
  if (window.location.pathname !== targetUrl || window.location.hash) {
    window.history[replace ? 'replaceState' : 'pushState']({ mode: 'admin', isAdmin: true, tab, subTab }, '', targetUrl);
  }
}

export function navigateToCustomerRoute(accountTab = 'upcoming', { authMode = null, replace = false } = {}) {
  if (typeof window === 'undefined') return;
  const targetUrl = buildCustomerUrl(accountTab, authMode);
  syncAdminDocumentBase(true);
  if (window.location.pathname !== targetUrl || window.location.hash) {
    window.history[replace ? 'replaceState' : 'pushState'](
      { mode: 'customer', isCustomer: true, accountTab, authMode },
      '',
      targetUrl
    );
  }
}

export function navigateToPublicRoute({ replace = false } = {}) {
  if (typeof window === 'undefined') return;
  syncAdminDocumentBase(false);
  const targetUrl = buildPublicUrl();
  if (window.location.pathname !== targetUrl || window.location.hash) {
    window.history[replace ? 'replaceState' : 'pushState']({ mode: 'public', isAdmin: false, isCustomer: false, isCard: false }, '', targetUrl);
  }
}

export function navigateToCardRoute({ replace = false } = {}) {
  if (typeof window === 'undefined') return;
  const targetUrl = buildCardUrl();
  syncAdminDocumentBase(true);
  if (window.location.pathname !== targetUrl || window.location.hash) {
    window.history[replace ? 'replaceState' : 'pushState']({ mode: 'card', isAdmin: false, isCustomer: false, isCard: true }, '', targetUrl);
  }
}

export function resolveAppAssetUrl(rawUrl, { absolute = false } = {}) {
  const value = String(rawUrl || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || /^data:/i.test(value)) return value;
  const basePath = typeof window !== 'undefined' ? getAppBasePath() : '';
  const relPath = value.startsWith('/') ? `${basePath}${value}` : `${basePath}/${value}`;
  if (absolute && typeof window !== 'undefined') {
    return `${window.location.origin}${relPath}`;
  }
  return relPath;
}
