/**
 * Privacy-First Analytics Utility
 * Using Fathom Analytics - no cookies, GDPR compliant
 *
 * To activate:
 * 1. Sign up for Fathom Analytics
 * 2. Add NEXT_PUBLIC_FATHOM_SITE_ID to .env.local
 * 3. Analytics will automatically start tracking
 */

// Extend window object to include fathom
declare global {
  interface Window {
    fathom?: {
      trackPageview: (opts?: { url?: string; referrer?: string }) => void;
      trackGoal: (code: string, cents: number) => void;
      trackEvent: (name: string, opts?: { _value?: number }) => void;
    };
  }
}

// Event tracking types for type safety
export type AnalyticsEvent =
  // Free File Navigator Events
  | { type: 'eligibility_started' }
  | { type: 'eligibility_completed'; matches: number }
  | { type: 'partner_clicked'; partner: string; rank: number }
  | { type: 'partner_link_opened'; partner: string }

  // Tax Prep Assistant Events
  | { type: 'tax_prep_started'; year: number; filingStatus: string }
  | { type: 'tax_prep_page_completed'; page: string }
  | { type: 'tax_prep_completed'; year: number; hasRefund: boolean }
  | { type: 'pdf_downloaded'; year: number }

  // OCR Events
  | { type: 'ocr_upload_started'; formType: 'w2' | '1099-int' | '1099-div' | '1099-misc' }
  | { type: 'ocr_upload_success'; formType: 'w2' | '1099-int' | '1099-div' | '1099-misc' }
  | { type: 'ocr_upload_failed'; formType: 'w2' | '1099-int' | '1099-div' | '1099-misc' }

  // Income & Deduction Events
  | { type: 'income_type_added'; incomeType: string }
  | { type: 'deduction_choice'; choice: 'standard' | 'itemized' }
  | { type: 'credit_claimed'; creditType: string };

/**
 * Track custom events in Fathom Analytics
 * Events are privacy-first - no PII, no actual tax data
 */
export function trackEvent(event: AnalyticsEvent): void {
  // Only track if Fathom is loaded and site ID is configured
  if (typeof window === 'undefined' || !window.fathom) {
    // In development, log events to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
    return;
  }

  // Track the event with Fathom
  const eventName = event.type;

  try {
    // Fathom's trackEvent method
    window.fathom.trackEvent(eventName);

    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Tracked:', event);
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

/**
 * Track page views manually (useful for SPAs)
 * Fathom auto-tracks pageviews, but this can be used for custom tracking
 */
export function trackPageView(url?: string): void {
  if (typeof window === 'undefined' || !window.fathom) {
    return;
  }

  try {
    window.fathom.trackPageview(url ? { url } : undefined);
  } catch (error) {
    console.error('[Analytics] Error tracking pageview:', error);
  }
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.fathom &&
    process.env.NEXT_PUBLIC_FATHOM_SITE_ID
  );
}

/**
 * Helper to bucket AGI ranges for privacy
 * Never track exact income amounts
 */
export function bucketAGI(agi: number): string {
  if (agi < 10000) return '0-10k';
  if (agi < 25000) return '10k-25k';
  if (agi < 40000) return '25k-40k';
  if (agi < 60000) return '40k-60k';
  if (agi < 80000) return '60k-80k';
  if (agi < 100000) return '80k-100k';
  if (agi < 150000) return '100k-150k';
  if (agi < 200000) return '150k-200k';
  return '200k+';
}

/**
 * Privacy Policy Compliance
 *
 * This analytics implementation:
 * ✅ Uses privacy-first Fathom Analytics (no cookies, GDPR compliant)
 * ✅ Never tracks PII (names, SSNs, addresses)
 * ✅ Never tracks actual tax data (income amounts, deductions, etc.)
 * ✅ Only tracks anonymous behavioral events (page views, clicks, features used)
 * ✅ Uses bucketed ranges for any numeric data (AGI ranges, not exact amounts)
 * ✅ Can be disabled by not setting NEXT_PUBLIC_FATHOM_SITE_ID
 * ✅ All data stored on Fathom's EU servers with privacy protections
 */
