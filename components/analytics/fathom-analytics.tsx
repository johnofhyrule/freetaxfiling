'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Fathom Analytics Client Component
 *
 * Loads Fathom Analytics script and tracks page views
 * Only active when NEXT_PUBLIC_FATHOM_SITE_ID is set
 *
 * Privacy features:
 * - No cookies
 * - No personal data collection
 * - GDPR compliant
 * - EU data hosting
 */
export function FathomAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const siteId = process.env.NEXT_PUBLIC_FATHOM_SITE_ID;

  // Load Fathom script on mount
  useEffect(() => {
    // Don't load if no site ID configured
    if (!siteId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Fathom] Not loaded - NEXT_PUBLIC_FATHOM_SITE_ID not set');
      }
      return;
    }

    // Don't load if already loaded
    if (window.fathom) {
      return;
    }

    // Load Fathom Analytics script
    const script = document.createElement('script');
    script.src = 'https://cdn.usefathom.com/script.js';
    script.setAttribute('data-site', siteId);
    script.setAttribute('data-spa', 'auto'); // Enable SPA mode for Next.js
    script.defer = true;

    // Optional: honor Do Not Track
    script.setAttribute('data-honor-dnt', 'true');

    // Optional: exclude localhost in development
    if (process.env.NODE_ENV === 'development') {
      script.setAttribute('data-excluded-domains', 'localhost');
    }

    document.head.appendChild(script);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Fathom] Script loaded with site ID:', siteId);
    }

    // Cleanup function
    return () => {
      // Note: We don't remove the script on unmount as it should persist
      // across the entire app lifecycle
    };
  }, [siteId]);

  // Track page views on route changes (SPA navigation)
  useEffect(() => {
    if (!siteId || !window.fathom) {
      return;
    }

    // Fathom's auto-tracking should handle this with data-spa="auto"
    // but we can manually track if needed
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    if (process.env.NODE_ENV === 'development') {
      console.log('[Fathom] Page view:', url);
    }

    // Optional: Manually track pageview
    // window.fathom.trackPageview({ url });
  }, [pathname, searchParams, siteId]);

  // This component doesn't render anything
  return null;
}
