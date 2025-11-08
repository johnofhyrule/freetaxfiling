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

  let score = 0;
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
    // Score higher for partners with more headroom
    const agiHeadroom = partner.maxAGI - userProfile.agi;
    const agiHeadroomPercent = (agiHeadroom / partner.maxAGI) * 100;
    score += Math.min(agiHeadroomPercent / 10, 10); // Max 10 points
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
        score += 5;
      }
    }
  }

  // Check military-only restriction
  if (partner.militaryOnly && !userProfile.isMilitary) {
    isEligible = false;
    reasons.disqualified.push("This option is only available to military members");
  } else if (partner.militaryOnly && userProfile.isMilitary) {
    reasons.eligible.push("Military-only option (you qualify)");
    score += 15; // High bonus for military-specific options
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
      score += 5;
    }
  } else {
    reasons.eligible.push(`Available in ${userProfile.state}`);
    score += 5;
  }

  // Check state tax return support
  if (userProfile.needsStateTaxReturn) {
    if (partner.supportedForms.state) {
      reasons.eligible.push("Supports state returns");
      score += 10;
    } else {
      reasons.warnings.push("Does not support state returns");
      score -= 15; // Penalty if they need state but partner doesn't offer
    }
  }

  // Check schedule support
  if (userProfile.hasSchedules.length > 0) {
    const unsupportedSchedules = userProfile.hasSchedules.filter(
      (schedule) => !partner.supportedForms.schedules.includes(schedule)
    );

    if (unsupportedSchedules.length === 0) {
      reasons.eligible.push("Supports all needed tax schedules");
      score += 10;
    } else {
      reasons.warnings.push(
        `May not support: ${unsupportedSchedules.map((s) => `Schedule ${s}`).join(", ")}`
      );
      score -= unsupportedSchedules.length * 5; // Penalty per missing schedule
    }
  }

  // Check prior year return support
  if (userProfile.needsPriorYearReturn) {
    if (partner.features.priorYearReturns) {
      reasons.eligible.push("Supports prior year returns");
      score += 10;
    } else {
      reasons.warnings.push("Does not support prior year returns");
      score -= 10;
    }
  }

  // Check special eligibility matches
  if (userProfile.isMilitary && partner.specialEligibility?.military) {
    reasons.eligible.push("Military-friendly features");
    score += 10;
  }

  if (userProfile.isStudent && partner.specialEligibility?.students) {
    reasons.eligible.push("Student-friendly features");
    score += 8;
  }

  if (userProfile.hasDisability && partner.specialEligibility?.disabilities) {
    reasons.eligible.push("Disability support features");
    score += 8;
  }

  if (
    userProfile.age &&
    userProfile.age >= 55 &&
    partner.specialEligibility?.seniorCitizens
  ) {
    reasons.eligible.push("Senior citizen features");
    score += 8;
  }

  // Check preference matches (bonus points, not requirements)
  if (userProfile.preferSpanish) {
    if (partner.features.spanishLanguage) {
      reasons.eligible.push("Spanish language available");
      score += 8;
    } else {
      reasons.warnings.push("No Spanish language support");
      score -= 3;
    }
  }

  if (userProfile.wantsLiveSupport) {
    if (partner.features.liveSupport) {
      reasons.eligible.push("Live customer support available");
      score += 6;
    } else {
      reasons.warnings.push("No live support");
      score -= 2;
    }
  }

  if (userProfile.wantsMobileApp) {
    if (partner.features.mobileApp) {
      reasons.eligible.push("Mobile app available");
      score += 6;
    } else {
      reasons.warnings.push("No mobile app");
      score -= 2;
    }
  }

  // Additional feature bonuses
  if (partner.features.importW2) {
    reasons.eligible.push("Can import W-2 data");
    score += 3;
  }

  // Ensure score is not negative
  score = Math.max(0, score);

  // Cap score at 100
  score = Math.min(100, score);

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
