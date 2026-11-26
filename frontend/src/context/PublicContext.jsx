// frontend/src/context/PublicContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { resolveAppAssetUrl } from '../utils/adminRouter';

const PublicContext = createContext(null);

export function PublicProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBootstrap = async () => {
    try {
      setLoading(true);
      const res = await api.getBootstrap();
      if (res && res.data) {
        setData(res.data);
        injectSEOAndTracking(res.data);
      }
    } catch (err) {
      console.error('Failed to load salon bootstrap data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onAdminPath = typeof window !== 'undefined' && /\/admin(\/|$)/i.test(window.location.pathname);
    if (!onAdminPath) {
      fetchBootstrap();
      return undefined;
    }
    // Defer heavy storefront bootstrap on admin routes so auth & active console data load first
    const timer = window.setTimeout(() => {
      fetchBootstrap();
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  // Dynamic SEO & Analytics Injection
  const injectSEOAndTracking = (bootstrapData) => {
    if (!bootstrapData) return;
    if (typeof window !== 'undefined' && /\/(admin|account|my-bookings|login|register)(\/|$)/i.test(window.location.pathname)) {
      return;
    }

    const { seo, tracking } = bootstrapData;

    // 1. Update Document Title
    if (seo?.title) {
      document.title = seo.title;
    }

    const resolvedOgImage = resolveAppAssetUrl(seo?.og_image, { absolute: true });

    // 2. Update/Inject Meta Tags
    updateMetaTag('description', seo?.description);
    updateMetaTag('keywords', seo?.keywords);
    updateMetaTag('robots', seo?.robots);
    updateMetaProperty('og:title', seo?.og_title || seo?.title);
    updateMetaProperty('og:description', seo?.og_description || seo?.description);
    if (resolvedOgImage) {
      updateMetaProperty('og:image', resolvedOgImage);
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:image', resolvedOgImage);
    } else {
      document.querySelector('meta[property="og:image"]')?.remove();
      document.querySelector('meta[name="twitter:image"]')?.remove();
    }
    updateMetaProperty('og:type', 'website');

    // 3. Google Search Console Verification Meta Tag
    if (tracking?.gsc?.method === 'meta_tag' && tracking.gsc.meta_tag) {
      const parts = tracking.gsc.meta_tag.split('=');
      const content = parts.length > 1 ? parts.slice(1).join('=') : tracking.gsc.meta_tag;
      updateMetaTag('google-site-verification', content);
    }

    // 4. Google Analytics 4 (GA4) Injection
    if (tracking?.ga4?.enabled && tracking.ga4.measurement_id && !window.__ga4_injected) {
      window.__ga4_injected = true;
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.ga4.measurement_id}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', tracking.ga4.measurement_id);
    }

    // 5. Microsoft Clarity Injection
    if (tracking?.clarity?.enabled && tracking.clarity.project_id && !window.__clarity_injected) {
      window.__clarity_injected = true;
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", tracking.clarity.project_id);
    }

    // 6. Meta Pixel Injection
    if (tracking?.meta_pixel?.enabled && tracking.meta_pixel.pixel_id && !window.__pixel_injected) {
      window.__pixel_injected = true;
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      if (window.fbq) {
        window.fbq('init', tracking.meta_pixel.pixel_id);
        if (tracking.meta_pixel.events?.page_view) {
          window.fbq('track', 'PageView');
        }
      }
    }
  };

  const updateMetaTag = (name, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const updateMetaProperty = (property, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Dispatch custom tracking event across GA4 and Meta Pixel
  const trackConversionEvent = (eventName, params = {}) => {
    // GA4
    if (window.gtag && data?.tracking?.ga4?.enabled) {
      window.gtag('event', eventName, params);
    }
    // Meta Pixel
    if (window.fbq && data?.tracking?.meta_pixel?.enabled) {
      if (eventName === 'begin_booking') window.fbq('track', 'Schedule', params);
      else if (eventName === 'booking_confirmed') window.fbq('track', 'Purchase', params);
      else if (eventName === 'view_service') window.fbq('track', 'ViewContent', params);
      else window.fbq('trackCustom', eventName, params);
    }
    // Also notify server-side CAPI logger
    api.trackEvent(eventName, params).catch(() => {});
  };

  return (
    <PublicContext.Provider
      value={{
        salon: data?.salon || {},
        hours: data?.hours || [],
        specialClosures: data?.special_closures || [],
        categories: data?.categories || [],
        services: data?.services || [],
        packages: data?.packages || [],
        stylists: data?.stylists || [],
        gallery: data?.gallery || [],
        testimonials: data?.testimonials || [],
        faqs: data?.faqs || [],
        hero: data?.hero || {},
        bookingRules: data?.booking_rules || {},
        payments: data?.payments || {},
        tracking: data?.tracking || {},
        seo: data?.seo || {},
        maintenance: data?.maintenance || { enabled: false },
        loading,
        error,
        refresh: fetchBootstrap,
        trackConversionEvent
      }}
    >
      {children}
    </PublicContext.Provider>
  );
}

export const usePublic = () => {
  const ctx = useContext(PublicContext);
  if (!ctx) throw new Error('usePublic must be used within PublicProvider');
  return ctx;
};
