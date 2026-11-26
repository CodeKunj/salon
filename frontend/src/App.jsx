// frontend/src/App.jsx
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertTriangle, Home, QrCode } from 'lucide-react';
import { PublicProvider, usePublic } from './context/PublicContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerAuthProvider, useCustomerAuth } from './context/CustomerAuthContext';
import { BookingProvider } from './context/BookingContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Storefront & Booking Modal (lazy-loaded so Admin Console stays ultra-light)
const PublicSite = lazy(() => import('./components/public/PublicSite'));
const BookingModal = lazy(() => import('./components/public/BookingModal'));
const VisitingCardPage = lazy(() => import('./components/public/VisitingCardPage'));
const WhatsAppFloat = lazy(() => import('./components/common/WhatsAppFloat'));

// Admin & Customer Components (lazy-loaded so storefront & inactive consoles stay fast)
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./components/admin/AdminOverview'));
const AdminBookings = lazy(() => import('./components/admin/AdminBookings'));
const AdminCustomers = lazy(() => import('./components/admin/AdminCustomers'));
const AdminShareCard = lazy(() => import('./components/admin/AdminShareCard'));
const AdminServices = lazy(() => import('./components/admin/AdminServices'));
const AdminStylists = lazy(() => import('./components/admin/AdminStylists'));
const AdminCMS = lazy(() => import('./components/admin/AdminCMS'));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings'));
const CustomerPortal = lazy(() => import('./components/customer/CustomerPortal'));

function AtelierSpinner({ fullScreen = true, label = 'INITIALIZING ATELIER SUITES...' }) {
  return (
    <div className={`${fullScreen ? 'min-h-screen bg-[#F7F1E8]' : 'min-h-[320px]'} flex items-center justify-center p-4`}>
      <div className="text-center space-y-3">
        <div className="w-9 h-9 rounded-full border-2 border-[#B4563E] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-[#665B54] font-mono tracking-widest uppercase">{label}</p>
      </div>
    </div>
  );
}

import {
  ACCOUNT_TAB_TITLES,
  ADMIN_TABS,
  ADMIN_TAB_TITLES,
  canAccessAdminTab,
  getDefaultAdminTab,
  getDefaultSubTab,
  navigateToAdminRoute,
  navigateToCardRoute,
  navigateToCustomerRoute,
  navigateToPublicRoute,
  parseAppRoute,
  sanitizeSubTab,
  syncAdminDocumentBase,
} from './utils/adminRouter';

function SalonApp() {
  const { maintenance, seo, salon, loading, error: publicError, refresh: refreshPublic } = usePublic();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isCustomerAuthenticated, customerLoading } = useCustomerAuth();

  const [route, setRoute] = useState(() => parseAppRoute());
  const [accessNotice, setAccessNotice] = useState('');
  const [prefillGuest, setPrefillGuest] = useState(null);
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine === false : false
  );

  // Listen to browser online/offline network status
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Keep <base data-admin-base> and legacy hash URLs synced cleanly
  useEffect(() => {
    syncAdminDocumentBase(route.isAdmin || route.isCustomer || route.isCard);
    if (route.isAdmin && route.fromHash) {
      navigateToAdminRoute(route.tab, route.subTab, { replace: true });
    } else if (route.isCustomer && route.fromHash) {
      navigateToCustomerRoute(route.accountTab, {
        authMode: route.explicitAuth ? route.authMode : null,
        replace: true,
      });
    } else if (route.isCard && route.fromHash) {
      navigateToCardRoute({ replace: true });
    }
  }, [route.isAdmin, route.isCustomer, route.isCard, route.fromHash, route.tab, route.subTab, route.accountTab, route.explicitAuth, route.authMode]);

  // Listen to browser Back/Forward (popstate) and hashchange
  useEffect(() => {
    const syncFromBrowser = () => {
      const parsed = parseAppRoute();
      syncAdminDocumentBase(parsed.isAdmin || parsed.isCustomer || parsed.isCard);
      if (parsed.isAdmin && parsed.fromHash) {
        navigateToAdminRoute(parsed.tab, parsed.subTab, { replace: true });
      } else if (parsed.isCustomer && parsed.fromHash) {
        navigateToCustomerRoute(parsed.accountTab, {
          authMode: parsed.explicitAuth ? parsed.authMode : null,
          replace: true,
        });
      } else if (parsed.isCard && parsed.fromHash) {
        navigateToCardRoute({ replace: true });
      }
      setRoute(parsed);
    };
    window.addEventListener('popstate', syncFromBrowser);
    window.addEventListener('hashchange', syncFromBrowser);
    return () => {
      window.removeEventListener('popstate', syncFromBrowser);
      window.removeEventListener('hashchange', syncFromBrowser);
    };
  }, []);

  // Update document title for Admin / Customer Portal / Visiting Card and restore SEO title for public site
  useEffect(() => {
    if (route.isAdmin) {
      const label = ADMIN_TAB_TITLES[route.tab] || 'Atelier Portal';
      document.title = `RiTiVerse Admin — ${label}`;
    } else if (route.isCustomer) {
      const titleKey = isCustomerAuthenticated ? route.accountTab : route.authMode;
      const label = ACCOUNT_TAB_TITLES[titleKey] || 'Client Portal';
      document.title = `RiTiVerse — ${label}`;
    } else if (route.isCard) {
      document.title = `${salon?.salon_name || 'RiTiVerse Salon'} — Digital Visiting Card`;
    } else if (route.isNotFound) {
      document.title = 'Page Not Found — RiTiVerse Salon';
    } else if (seo?.title) {
      document.title = seo.title;
    }
  }, [route.isAdmin, route.isCustomer, route.isCard, route.tab, route.accountTab, route.authMode, isCustomerAuthenticated, seo?.title, salon?.salon_name]);

  // Sync customer route URLs based on authentication state
  useEffect(() => {
    if (!route.isCustomer || customerLoading) return;
    if (isCustomerAuthenticated && (route.explicitAuth || route.rawTab === 'my-bookings' || !route.rawSubTab)) {
      navigateToCustomerRoute(route.accountTab, { authMode: null, replace: true });
      setRoute((prev) => ({
        ...prev,
        explicitAuth: false,
        rawTab: 'account',
        rawSubTab: prev.accountTab,
      }));
    } else if (!isCustomerAuthenticated && !route.explicitAuth) {
      navigateToCustomerRoute(route.accountTab, { authMode: route.authMode || 'login', replace: true });
      setRoute((prev) => ({
        ...prev,
        explicitAuth: true,
        rawTab: prev.authMode || 'login',
      }));
    }
  }, [route.isCustomer, route.explicitAuth, route.rawTab, route.rawSubTab, route.accountTab, route.authMode, isCustomerAuthenticated, customerLoading]);

  // Enforce role-based URL route guard whenever authenticated user or route changes
  useEffect(() => {
    if (!route.isAdmin || !isAuthenticated || !user?.role) return;

    if (!canAccessAdminTab(user.role, route.tab)) {
      const fallbackTab = getDefaultAdminTab(user.role);
      const fallbackSub = getDefaultSubTab(fallbackTab, user.role);
      setAccessNotice(`"${ADMIN_TAB_TITLES[route.tab] || route.tab}" is restricted for your role.`);
      navigateToAdminRoute(fallbackTab, fallbackSub, { replace: true });
      setRoute((prev) => ({
        ...prev,
        mode: 'admin',
        isAdmin: true,
        isNotFound: false,
        tab: fallbackTab,
        subTab: fallbackSub,
        rawTab: fallbackTab,
        rawSubTab: fallbackSub,
        fromHash: false,
      }));
      return;
    }

    if (route.rawTab && !ADMIN_TABS.includes(route.rawTab)) {
      setAccessNotice(`Section "${route.rawTab}" was not found. Showing ${ADMIN_TAB_TITLES[route.tab] || 'Dashboard'}.`);
    }

    const sanitizedSub = sanitizeSubTab(route.tab, route.subTab, user.role);
    if (sanitizedSub !== route.subTab) {
      navigateToAdminRoute(route.tab, sanitizedSub, { replace: true });
      setRoute((prev) => ({ ...prev, subTab: sanitizedSub }));
    }
  }, [route.isAdmin, route.tab, route.subTab, route.rawTab, isAuthenticated, user?.role]);

  const navigateAdmin = (nextTab, nextSubTab = null) => {
    const role = user?.role;
    const targetTab = role && !canAccessAdminTab(role, nextTab) ? getDefaultAdminTab(role) : nextTab;
    const resolvedSub = sanitizeSubTab(targetTab, nextSubTab, role);
    setAccessNotice('');
    navigateToAdminRoute(targetTab, resolvedSub, { replace: false });
    setRoute((prev) => ({
      ...prev,
      mode: 'admin',
      isAdmin: true,
      isCustomer: false,
      isCard: false,
      isNotFound: false,
      tab: targetTab,
      subTab: resolvedSub,
      rawTab: targetTab,
      rawSubTab: resolvedSub,
      fromHash: false,
    }));
  };

  const openCustomerPortal = (nextAccountTab = 'upcoming', options = {}) => {
    const resolvedAuthMode = isCustomerAuthenticated ? null : (options.authMode || 'login');
    if (options.prefillGuest) {
      setPrefillGuest(options.prefillGuest);
    }
    navigateToCustomerRoute(nextAccountTab, { authMode: resolvedAuthMode, replace: false });
    setRoute((prev) => ({
      ...prev,
      mode: 'customer',
      isAdmin: false,
      isCustomer: true,
      isCard: false,
      isNotFound: false,
      accountTab: nextAccountTab,
      authMode: resolvedAuthMode || 'login',
      explicitAuth: Boolean(resolvedAuthMode),
      rawTab: resolvedAuthMode || 'account',
      rawSubTab: nextAccountTab,
      fromHash: false,
    }));
  };

  const openCard = () => {
    navigateToCardRoute({ replace: false });
    setRoute((prev) => ({
      ...prev,
      mode: 'card',
      isAdmin: false,
      isCustomer: false,
      isCard: true,
      isNotFound: false,
      rawTab: 'card',
      rawSubTab: null,
      fromHash: false,
    }));
  };

  const exitToPublic = () => {
    setAccessNotice('');
    navigateToPublicRoute({ replace: false });
      setRoute({
        mode: 'public',
        isAdmin: false,
        isCustomer: false,
        isCard: false,
        isNotFound: false,
        tab: 'overview',
        subTab: null,
        accountTab: 'upcoming',
        authMode: 'login',
        explicitAuth: false,
        rawTab: null,
        rawSubTab: null,
        fromHash: false,
      });
    };

    const offlineBanner = isOffline ? (
      <div
        role="status"
        className="fixed bottom-4 left-4 z-[130] max-w-sm rounded-2xl bg-[#1A1614] text-[#FFFDF8] border border-[#D6A984]/40 px-4 py-2.5 shadow-xl flex items-center gap-2.5 text-xs"
      >
        <WifiOff className="w-4 h-4 text-[#D6A984] shrink-0" />
        <span>You are offline. Changes may not save until reconnected.</span>
      </div>
    ) : null;

  if ((route.isAdmin && authLoading) || (!route.isAdmin && !route.isCustomer && !route.isNotFound && loading)) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#B4563E] border-t-transparent animate-spin mx-auto" />
          <h2 className="text-lg font-mono text-[#1A1614] tracking-widest uppercase font-semibold">
            RiTiVerse Salon
          </h2>
          <p className="text-xs text-[#665B54] font-mono tracking-widest">
            {route.isAdmin ? 'VERIFYING ATELIER ACCESS...' : 'INITIALIZING ATELIER SUITES...'}
          </p>
        </div>
      </div>
    );
  }

  // Bootstrap API Connection Error Fallback (Public & Visiting Card routes)
  if (publicError && !route.isAdmin && !route.isCustomer && !route.isNotFound && !salon?.salon_name) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] text-[#1A1614] flex items-center justify-center p-6">
        {offlineBanner}
        <div className="max-w-md w-full bg-[#FFFDF8] border border-[#1A1614]/15 p-8 shadow-[10px_10px_0px_rgba(180,86,62,0.16)] text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#933E29] font-semibold block">
              RiTiVerse Salon &amp; Aesthetics
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-light text-[#1A1614]">
              Unable to Connect
            </h1>
            <p className="text-xs sm:text-sm text-[#665B54] leading-relaxed">
              {publicError || 'We could not load the studio catalog right now. Please try again.'}
            </p>
          </div>
          <button
            type="button"
            onClick={refreshPublic}
            className="px-6 py-2.5 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] text-xs font-mono uppercase tracking-wider font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // Site-Wide Maintenance Mode Guard (if enabled and not in admin mode)
  if (maintenance?.enabled && !route.isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] text-[#1A1614] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <span className="text-5xl text-[#B4563E] font-bold tracking-tight uppercase block">RiTiVerse</span>
          <h1 className="text-2xl font-light">Studio Under Seasonal Preparation</h1>
          <p className="text-sm text-[#665B54] font-light leading-relaxed">
            {maintenance.message || 'We are curating new seasonal beauty experiences. Our studio reopens shortly.'}
          </p>
        </div>
      </div>
    );
  }

  // ADMIN VIEW
  if (route.isAdmin) {
    if (!isAuthenticated) {
      return (
        <Suspense fallback={<AtelierSpinner label="LOADING ATELIER PORTAL..." />}>
          <AdminLogin
            onClose={exitToPublic}
            onLoginSuccess={(loggedInUser) => {
              const role = loggedInUser?.role;
              const requestedTab = route.tab;
              const targetTab = role && canAccessAdminTab(role, requestedTab)
                ? requestedTab
                : getDefaultAdminTab(role);
              const targetSub = sanitizeSubTab(targetTab, route.subTab, role);
              setAccessNotice('');
              navigateToAdminRoute(targetTab, targetSub, { replace: true });
              setRoute((prev) => ({
                ...prev,
                mode: 'admin',
                isAdmin: true,
                isCustomer: false,
                tab: targetTab,
                subTab: targetSub,
                rawTab: targetTab,
                rawSubTab: targetSub,
                fromHash: false,
              }));
            }}
          />
        </Suspense>
      );
    }

    const activeTab = canAccessAdminTab(user?.role, route.tab)
      ? route.tab
      : getDefaultAdminTab(user?.role);

    return (
      <Suspense fallback={<AtelierSpinner label="OPENING ADMIN WORKSPACE..." />}>
        <AdminLayout
          activeTab={activeTab}
          onSelectTab={(nextTab) => navigateAdmin(nextTab)}
          onTabChange={(nextTab) => navigateAdmin(nextTab)}
          onExitAdmin={exitToPublic}
        >
          {accessNotice && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-4">
              <span>{accessNotice}</span>
              <button
                type="button"
                onClick={() => setAccessNotice('')}
                className="font-semibold text-amber-900 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
          <Suspense fallback={<AtelierSpinner fullScreen={false} label="LOADING MODULE..." />}>
            <ErrorBoundary
              variant="inline"
              resetKey={`${activeTab}:${route.subTab || ''}`}
              onReturnHome={() => navigateAdmin('overview')}
            >
              {activeTab === 'overview' && <AdminOverview onNavigate={(tab, sub) => navigateAdmin(tab, sub)} />}
              {activeTab === 'bookings' && <AdminBookings />}
              {activeTab === 'customers' && <AdminCustomers />}
              {activeTab === 'share' && (
                <AdminShareCard
                  onOpenCard={openCard}
                  onNavigateSettings={() => navigateAdmin('settings', 'general')}
                />
              )}
              {activeTab === 'services' && (
                <AdminServices
                  activeSubTab={route.subTab}
                  onSubTabChange={(sub) => navigateAdmin('services', sub)}
                />
              )}
              {activeTab === 'stylists' && <AdminStylists />}
              {activeTab === 'cms' && (
                <AdminCMS
                  activeSubTab={route.subTab}
                  onSubTabChange={(sub) => navigateAdmin('cms', sub)}
                />
              )}
              {activeTab === 'settings' && (
                <AdminSettings
                  activeModule={route.subTab}
                  onModuleChange={(mod) => navigateAdmin('settings', mod)}
                />
              )}
            </ErrorBoundary>
          </Suspense>
          {offlineBanner}
        </AdminLayout>
      </Suspense>
    );
  }

  // CUSTOMER AUTH & MY BOOKINGS PORTAL VIEW
  if (route.isCustomer) {
    return (
      <>
        {offlineBanner}
        <Suspense fallback={<AtelierSpinner label="LOADING CLIENT PORTAL..." />}>
          <CustomerPortal
            accountTab={route.accountTab}
            authMode={route.authMode}
            prefillGuest={prefillGuest}
            onAccountTabChange={(nextSub) => openCustomerPortal(nextSub)}
            onAuthModeChange={(mode) => openCustomerPortal('upcoming', { authMode: mode })}
            onBackToSite={exitToPublic}
          />
        </Suspense>
        <ErrorBoundary variant="silent">
          <Suspense fallback={null}>
            <BookingModal onOpenCustomerPortal={openCustomerPortal} />
            <WhatsAppFloat />
          </Suspense>
        </ErrorBoundary>
      </>
    );
  }

  // DIGITAL VISITING CARD & QR SHARE PAGE
  if (route.isCard) {
    return (
      <>
        {offlineBanner}
        <Suspense fallback={<AtelierSpinner label="LOADING VISITING CARD..." />}>
          <VisitingCardPage
            onBackToSite={exitToPublic}
            onOpenCustomerPortal={openCustomerPortal}
          />
        </Suspense>
        <ErrorBoundary variant="silent">
          <Suspense fallback={null}>
            <BookingModal onOpenCustomerPortal={openCustomerPortal} />
            <WhatsAppFloat />
          </Suspense>
        </ErrorBoundary>
      </>
    );
  }

  // 404 NOT FOUND VIEW
  if (route.isNotFound) {
    return (
      <div className="min-h-screen bg-[#F7F1E8] text-[#1A1614] flex items-center justify-center p-6">
        {offlineBanner}
        <div className="max-w-md w-full bg-[#FFFDF8] border border-[#1A1614]/15 p-8 shadow-[10px_10px_0px_rgba(180,86,62,0.16)] text-center space-y-5">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#B4563E] font-bold block">
            Error 404
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-light text-[#1A1614]">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#665B54] leading-relaxed">
            The atelier page <span className="font-mono text-[#1A1614]">{route.rawTab}</span> does not exist or has moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={exitToPublic}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#B4563E] hover:bg-[#933E29] text-[#FFFDF8] text-xs font-mono uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </button>
            <button
              type="button"
              onClick={openCard}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#1A1614]/20 hover:border-[#B4563E] text-[#1A1614] text-xs font-mono uppercase tracking-wider font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-[#B4563E]" />
              <span>Visiting Card</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PUBLIC WEBSITE VIEW (CHAMPAGNE SILK, OBSIDIAN & BURNISHED COPPER THEME)
  return (
    <Suspense fallback={<AtelierSpinner label="INITIALIZING ATELIER SUITES..." />}>
      {offlineBanner}
      <PublicSite
        onOpenCustomerPortal={openCustomerPortal}
        onOpenCard={openCard}
      />
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary variant="fullscreen">
      <ToastProvider>
        <PublicProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <BookingProvider>
                <SalonApp />
              </BookingProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </PublicProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
