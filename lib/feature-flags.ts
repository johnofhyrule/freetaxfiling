/**
 * Feature Flag Configuration
 *
 * Centralized feature flag management for gradual rollout of new features.
 * Feature flags are controlled via environment variables.
 */

export const FEATURES = {
  /**
   * Tax Preparation Assistant (PRD 2)
   * Client-side tax prep tool with PDF generation
   */
  TAX_PREP: process.env.NEXT_PUBLIC_FEATURE_TAX_PREP === 'true',

  /**
   * State Filing Solution (PRD 3)
   * Multi-state e-filing platform
   */
  STATE_FILING: process.env.NEXT_PUBLIC_FEATURE_STATE_FILING === 'true',

  /**
   * Advocacy Platform (PRD 4)
   * Grassroots advocacy for free filing
   */
  ADVOCACY: process.env.NEXT_PUBLIC_FEATURE_ADVOCACY === 'true',
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}
