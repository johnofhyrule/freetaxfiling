// Core partner and eligibility types for Free File Navigator

export interface Partner {
  id: string;
  name: string;
  url: string;
  logo?: string;

  // Eligibility criteria
  maxAGI: number; // Maximum Adjusted Gross Income
  minAge?: number; // Minimum age requirement (if any)
  maxAge?: number; // Maximum age requirement (if any)

  // Geographic restrictions
  stateRestrictions?: {
    type: "include" | "exclude";
    states: string[]; // Two-letter state codes
  };
  militaryOnly?: boolean;

  // Tax form support
  supportedForms: {
    federal: string[]; // e.g., ["1040", "1040-SR"]
    state: boolean; // Does it support state returns?
    schedules: string[]; // e.g., ["A", "B", "C", "D", "EIC"]
  };

  // Features
  features: {
    priorYearReturns: boolean; // Can file previous years
    importW2: boolean; // Can import W-2 data
    liveSupport: boolean; // Offers live customer support
    mobileApp: boolean; // Has mobile app
    spanishLanguage: boolean; // Offers Spanish language support
  };

  // Special eligibility
  specialEligibility?: {
    students?: boolean;
    military?: boolean;
    disabilities?: boolean;
    seniorCitizens?: boolean;
  };

  // Metadata
  description: string;
  highlights: string[]; // Key selling points
  limitations?: string[]; // Known limitations or caveats
}

export interface UserProfile {
  // Basic info
  agi: number; // Adjusted Gross Income
  age?: number;
  state: string; // Two-letter state code

  // Tax situation
  needsStateTaxReturn: boolean;
  filingStatus: "single" | "married-joint" | "married-separate" | "head-of-household" | "qualifying-widow";
  hasSchedules: string[]; // Which schedules they need (A, B, C, D, EIC, etc.)
  needsPriorYearReturn: boolean;

  // Special circumstances
  isMilitary: boolean;
  isStudent: boolean;
  hasDisability: boolean;
  preferSpanish: boolean;

  // Preferences
  wantsLiveSupport: boolean;
  wantsMobileApp: boolean;
}

export interface MatchScore {
  partner: Partner;
  score: number; // 0-100
  isEligible: boolean;
  reasons: {
    eligible: string[]; // Why they match
    warnings: string[]; // Potential issues
    disqualified: string[]; // Why they're not eligible (if applicable)
  };
}
