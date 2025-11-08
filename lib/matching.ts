import { Partner, UserProfile, MatchScore } from "./types";

/**
 * Main matching algorithm to find suitable Free File partners
 * Returns partners sorted by match score (highest first)
 */
export function matchPartnersToUser(
  partners: Partner[],
  userProfile: UserProfile
): MatchScore[] {
  const matches = partners.map((partner) => {
    const score = calculateMatchScore(partner, userProfile);
    return score;
  });

  // Sort by score (highest first), then by eligibility
  return matches.sort((a, b) => {
    if (a.isEligible !== b.isEligible) {
      return a.isEligible ? -1 : 1;
    }
    return b.score - a.score;
  });
}

/**
 * Calculate match score for a single partner
 * Starts at 100 and deducts points for unmet requirements
 */
function calculateMatchScore(
  partner: Partner,
  userProfile: UserProfile
): MatchScore {
  const reasons = {
    eligible: [] as string[],
    warnings: [] as string[],
    disqualified: [] as string[],
  };

  let score = 100; // Start at perfect match
  let isEligible = true;

  // Check AGI eligibility (hard requirement)
  if (userProfile.agi > partner.maxAGI) {
    isEligible = false;
    reasons.disqualified.push(
      `AGI of $${userProfile.agi.toLocaleString()} exceeds limit of $${partner.maxAGI.toLocaleString()}`
    );
  } else {
    reasons.eligible.push(
      `Within AGI limit ($${partner.maxAGI.toLocaleString()})`
    );
    // Deduct if close to the AGI limit (less headroom)
    const agiHeadroom = partner.maxAGI - userProfile.agi;
    const agiHeadroomPercent = (agiHeadroom / partner.maxAGI) * 100;
    if (agiHeadroomPercent < 20) {
      // If within 20% of limit, deduct up to 10 points
      score -= Math.max(0, 10 - (agiHeadroomPercent / 2));
      reasons.warnings.push(
        `Close to AGI limit (${Math.round(100 - agiHeadroomPercent)}% of maximum)`
      );
    }
  }

  // Check age requirements
  if (userProfile.age) {
    if (partner.minAge && userProfile.age < partner.minAge) {
      isEligible = false;
      reasons.disqualified.push(
        `Minimum age requirement is ${partner.minAge}, you are ${userProfile.age}`
      );
    } else if (partner.maxAge && userProfile.age > partner.maxAge) {
      isEligible = false;
      reasons.disqualified.push(
        `Maximum age limit is ${partner.maxAge}, you are ${userProfile.age}`
      );
    } else {
      if (partner.minAge || partner.maxAge) {
        reasons.eligible.push("Meets age requirements");
      }
    }
  }

  // Check military-only restriction
  if (partner.militaryOnly && !userProfile.isMilitary) {
    isEligible = false;
    reasons.disqualified.push("This option is only available to military members");
  } else if (partner.militaryOnly && userProfile.isMilitary) {
    reasons.eligible.push("Military-only option (you qualify)");
  }

  // Check state restrictions
  if (partner.stateRestrictions) {
    const { type, states } = partner.stateRestrictions;
    const stateIncluded = states.includes(userProfile.state);

    if (type === "include" && !stateIncluded) {
      isEligible = false;
      reasons.disqualified.push(
        `Not available in ${userProfile.state}`
      );
    } else if (type === "exclude" && stateIncluded) {
      isEligible = false;
      reasons.disqualified.push(
        `Not available in ${userProfile.state}`
      );
    } else {
      reasons.eligible.push(`Available in ${userProfile.state}`);
    }
  } else {
    reasons.eligible.push(`Available in ${userProfile.state}`);
  }

  // Check state tax return support (CRITICAL - 20 point deduction if missing)
  if (userProfile.needsStateTaxReturn) {
    if (partner.supportedForms.state) {
      reasons.eligible.push("Supports state returns");
    } else {
      reasons.warnings.push("Does not support state returns");
      score -= 20; // Major deduction - this is a critical need
    }
  }

  // Check schedule support (5 points per missing schedule)
  if (userProfile.hasSchedules.length > 0) {
    const unsupportedSchedules = userProfile.hasSchedules.filter(
      (schedule) => !partner.supportedForms.schedules.includes(schedule)
    );

    if (unsupportedSchedules.length === 0) {
      reasons.eligible.push("Supports all needed tax schedules");
    } else {
      reasons.warnings.push(
        `May not support: ${unsupportedSchedules.map((s) => `Schedule ${s}`).join(", ")}`
      );
      score -= unsupportedSchedules.length * 8; // 8 points per missing schedule
    }
  }

  // Check prior year return support (15 point deduction if needed but missing)
  if (userProfile.needsPriorYearReturn) {
    if (partner.features.priorYearReturns) {
      reasons.eligible.push("Supports prior year returns");
    } else {
      reasons.warnings.push("Does not support prior year returns");
      score -= 15;
    }
  }

  // Check special eligibility matches (10 point deduction each if you qualify but partner doesn't offer)
  if (userProfile.isMilitary) {
    if (partner.specialEligibility?.military) {
      reasons.eligible.push("Military-friendly features");
    } else {
      score -= 5; // Minor deduction - nice to have
    }
  }

  if (userProfile.isStudent) {
    if (partner.specialEligibility?.students) {
      reasons.eligible.push("Student-friendly features");
    } else {
      score -= 5;
    }
  }

  if (userProfile.hasDisability) {
    if (partner.specialEligibility?.disabilities) {
      reasons.eligible.push("Disability support features");
    } else {
      score -= 5;
    }
  }

  if (userProfile.age && userProfile.age >= 55) {
    if (partner.specialEligibility?.seniorCitizens) {
      reasons.eligible.push("Senior citizen features");
    } else {
      score -= 5;
    }
  }

  // Check preference matches (smaller deductions - these are preferences, not needs)
  if (userProfile.preferSpanish) {
    if (partner.features.spanishLanguage) {
      reasons.eligible.push("Spanish language available");
    } else {
      reasons.warnings.push("No Spanish language support");
      score -= 10; // Moderate deduction for language preference
    }
  }

  if (userProfile.wantsLiveSupport) {
    if (partner.features.liveSupport) {
      reasons.eligible.push("Live customer support available");
    } else {
      reasons.warnings.push("No live support");
      score -= 8;
    }
  }

  if (userProfile.wantsMobileApp) {
    if (partner.features.mobileApp) {
      reasons.eligible.push("Mobile app available");
    } else {
      reasons.warnings.push("No mobile app");
      score -= 5;
    }
  }

  // Additional feature bonus (add to eligible list, but don't penalize if missing)
  if (partner.features.importW2) {
    reasons.eligible.push("Can import W-2 data");
  }

  // Ensure score stays within 0-100 range
  score = Math.max(0, Math.min(100, score));

  return {
    partner,
    score: Math.round(score),
    isEligible,
    reasons,
  };
}

/**
 * Helper to get top N matches
 */
export function getTopMatches(
  matches: MatchScore[],
  count: number = 3
): MatchScore[] {
  return matches.filter((m) => m.isEligible).slice(0, count);
}

/**
 * Helper to get all eligible matches
 */
export function getEligibleMatches(matches: MatchScore[]): MatchScore[] {
  return matches.filter((m) => m.isEligible);
}

/**
 * Helper to get ineligible matches (for educational purposes)
 */
export function getIneligibleMatches(matches: MatchScore[]): MatchScore[] {
  return matches.filter((m) => !m.isEligible);
}
