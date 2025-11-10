import { FilingStatus, TaxYear } from './types';

/**
 * Tax Brackets for all filing statuses
 * Source: IRS Publication 17
 */

export interface TaxBracket {
  rate: number;
  min: number;
  max: number | null; // null for highest bracket
}

// 2025 Tax Brackets (projected based on inflation adjustments)
export const TAX_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, min: 0, max: 11925 },
    { rate: 0.12, min: 11925, max: 48475 },
    { rate: 0.22, min: 48475, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250525 },
    { rate: 0.35, min: 250525, max: 626350 },
    { rate: 0.37, min: 626350, max: null },
  ],
  'married-joint': [
    { rate: 0.10, min: 0, max: 23850 },
    { rate: 0.12, min: 23850, max: 96950 },
    { rate: 0.22, min: 96950, max: 206700 },
    { rate: 0.24, min: 206700, max: 394600 },
    { rate: 0.32, min: 394600, max: 501050 },
    { rate: 0.35, min: 501050, max: 751600 },
    { rate: 0.37, min: 751600, max: null },
  ],
  'married-separate': [
    { rate: 0.10, min: 0, max: 11925 },
    { rate: 0.12, min: 11925, max: 48475 },
    { rate: 0.22, min: 48475, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250525 },
    { rate: 0.35, min: 250525, max: 375800 },
    { rate: 0.37, min: 375800, max: null },
  ],
  'head-of-household': [
    { rate: 0.10, min: 0, max: 17000 },
    { rate: 0.12, min: 17000, max: 64850 },
    { rate: 0.22, min: 64850, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250500 },
    { rate: 0.35, min: 250500, max: 626350 },
    { rate: 0.37, min: 626350, max: null },
  ],
  'qualifying-widow': [
    { rate: 0.10, min: 0, max: 23850 },
    { rate: 0.12, min: 23850, max: 96950 },
    { rate: 0.22, min: 96950, max: 206700 },
    { rate: 0.24, min: 206700, max: 394600 },
    { rate: 0.32, min: 394600, max: 501050 },
    { rate: 0.35, min: 501050, max: 751600 },
    { rate: 0.37, min: 751600, max: null },
  ],
};

// 2024 Tax Brackets
export const TAX_BRACKETS_2024: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, min: 0, max: 11600 },
    { rate: 0.12, min: 11600, max: 47150 },
    { rate: 0.22, min: 47150, max: 100525 },
    { rate: 0.24, min: 100525, max: 191950 },
    { rate: 0.32, min: 191950, max: 243725 },
    { rate: 0.35, min: 243725, max: 609350 },
    { rate: 0.37, min: 609350, max: null },
  ],
  'married-joint': [
    { rate: 0.10, min: 0, max: 23200 },
    { rate: 0.12, min: 23200, max: 94300 },
    { rate: 0.22, min: 94300, max: 201050 },
    { rate: 0.24, min: 201050, max: 383900 },
    { rate: 0.32, min: 383900, max: 487450 },
    { rate: 0.35, min: 487450, max: 731200 },
    { rate: 0.37, min: 731200, max: null },
  ],
  'married-separate': [
    { rate: 0.10, min: 0, max: 11600 },
    { rate: 0.12, min: 11600, max: 47150 },
    { rate: 0.22, min: 47150, max: 100525 },
    { rate: 0.24, min: 100525, max: 191950 },
    { rate: 0.32, min: 191950, max: 243725 },
    { rate: 0.35, min: 243725, max: 365600 },
    { rate: 0.37, min: 365600, max: null },
  ],
  'head-of-household': [
    { rate: 0.10, min: 0, max: 16550 },
    { rate: 0.12, min: 16550, max: 63100 },
    { rate: 0.22, min: 63100, max: 100500 },
    { rate: 0.24, min: 100500, max: 191950 },
    { rate: 0.32, min: 191950, max: 243700 },
    { rate: 0.35, min: 243700, max: 609350 },
    { rate: 0.37, min: 609350, max: null },
  ],
  'qualifying-widow': [
    { rate: 0.10, min: 0, max: 23200 },
    { rate: 0.12, min: 23200, max: 94300 },
    { rate: 0.22, min: 94300, max: 201050 },
    { rate: 0.24, min: 201050, max: 383900 },
    { rate: 0.32, min: 383900, max: 487450 },
    { rate: 0.35, min: 487450, max: 731200 },
    { rate: 0.37, min: 731200, max: null },
  ],
};

// 2023 Tax Brackets
export const TAX_BRACKETS_2023: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, min: 0, max: 11000 },
    { rate: 0.12, min: 11000, max: 44725 },
    { rate: 0.22, min: 44725, max: 95375 },
    { rate: 0.24, min: 95375, max: 182100 },
    { rate: 0.32, min: 182100, max: 231250 },
    { rate: 0.35, min: 231250, max: 578125 },
    { rate: 0.37, min: 578125, max: null },
  ],
  'married-joint': [
    { rate: 0.10, min: 0, max: 22000 },
    { rate: 0.12, min: 22000, max: 89075 },
    { rate: 0.22, min: 89075, max: 190750 },
    { rate: 0.24, min: 190750, max: 364200 },
    { rate: 0.32, min: 364200, max: 462500 },
    { rate: 0.35, min: 462500, max: 693750 },
    { rate: 0.37, min: 693750, max: null },
  ],
  'married-separate': [
    { rate: 0.10, min: 0, max: 11000 },
    { rate: 0.12, min: 11000, max: 44725 },
    { rate: 0.22, min: 44725, max: 95375 },
    { rate: 0.24, min: 95375, max: 182100 },
    { rate: 0.32, min: 182100, max: 231250 },
    { rate: 0.35, min: 231250, max: 346875 },
    { rate: 0.37, min: 346875, max: null },
  ],
  'head-of-household': [
    { rate: 0.10, min: 0, max: 15700 },
    { rate: 0.12, min: 15700, max: 59850 },
    { rate: 0.22, min: 59850, max: 95350 },
    { rate: 0.24, min: 95350, max: 182100 },
    { rate: 0.32, min: 182100, max: 231250 },
    { rate: 0.35, min: 231250, max: 578100 },
    { rate: 0.37, min: 578100, max: null },
  ],
  'qualifying-widow': [
    { rate: 0.10, min: 0, max: 22000 },
    { rate: 0.12, min: 22000, max: 89075 },
    { rate: 0.22, min: 89075, max: 190750 },
    { rate: 0.24, min: 190750, max: 364200 },
    { rate: 0.32, min: 364200, max: 462500 },
    { rate: 0.35, min: 462500, max: 693750 },
    { rate: 0.37, min: 693750, max: null },
  ],
};

// 2022 Tax Brackets
export const TAX_BRACKETS_2022: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { rate: 0.10, min: 0, max: 10275 },
    { rate: 0.12, min: 10275, max: 41775 },
    { rate: 0.22, min: 41775, max: 89075 },
    { rate: 0.24, min: 89075, max: 170050 },
    { rate: 0.32, min: 170050, max: 215950 },
    { rate: 0.35, min: 215950, max: 539900 },
    { rate: 0.37, min: 539900, max: null },
  ],
  'married-joint': [
    { rate: 0.10, min: 0, max: 20550 },
    { rate: 0.12, min: 20550, max: 83550 },
    { rate: 0.22, min: 83550, max: 178150 },
    { rate: 0.24, min: 178150, max: 340100 },
    { rate: 0.32, min: 340100, max: 431900 },
    { rate: 0.35, min: 431900, max: 647850 },
    { rate: 0.37, min: 647850, max: null },
  ],
  'married-separate': [
    { rate: 0.10, min: 0, max: 10275 },
    { rate: 0.12, min: 10275, max: 41775 },
    { rate: 0.22, min: 41775, max: 89075 },
    { rate: 0.24, min: 89075, max: 170050 },
    { rate: 0.32, min: 170050, max: 215950 },
    { rate: 0.35, min: 215950, max: 323925 },
    { rate: 0.37, min: 323925, max: null },
  ],
  'head-of-household': [
    { rate: 0.10, min: 0, max: 14650 },
    { rate: 0.12, min: 14650, max: 55900 },
    { rate: 0.22, min: 55900, max: 89050 },
    { rate: 0.24, min: 89050, max: 170050 },
    { rate: 0.32, min: 170050, max: 215950 },
    { rate: 0.35, min: 215950, max: 539900 },
    { rate: 0.37, min: 539900, max: null },
  ],
  'qualifying-widow': [
    { rate: 0.10, min: 0, max: 20550 },
    { rate: 0.12, min: 20550, max: 83550 },
    { rate: 0.22, min: 83550, max: 178150 },
    { rate: 0.24, min: 178150, max: 340100 },
    { rate: 0.32, min: 340100, max: 431900 },
    { rate: 0.35, min: 431900, max: 647850 },
    { rate: 0.37, min: 647850, max: null },
  ],
};

/**
 * Calculate federal income tax using progressive tax brackets
 */
export function calculateIncomeTax(
  taxableIncome: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear = 2024
): number {
  if (taxableIncome <= 0) return 0;

  // Select appropriate tax brackets based on year
  let brackets: TaxBracket[];
  switch (taxYear) {
    case 2025:
      brackets = TAX_BRACKETS_2025[filingStatus];
      break;
    case 2024:
      brackets = TAX_BRACKETS_2024[filingStatus];
      break;
    case 2023:
      brackets = TAX_BRACKETS_2023[filingStatus];
      break;
    case 2022:
      brackets = TAX_BRACKETS_2022[filingStatus];
      break;
    default:
      brackets = TAX_BRACKETS_2024[filingStatus];
  }
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    const bracketMin = bracket.min;
    const bracketMax = bracket.max ?? Infinity;

    if (taxableIncome > bracketMin) {
      const taxableInBracket = Math.min(taxableIncome, bracketMax) - bracketMin;
      tax += taxableInBracket * bracket.rate;
      previousMax = bracketMax;
    }

    if (taxableIncome <= bracketMax) {
      break;
    }
  }

  return Math.round(tax * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate self-employment tax (Social Security + Medicare)
 * Social Security: 12.4% on first $168,600 (2024)
 * Medicare: 2.9% on all SE income
 * Additional Medicare: 0.9% on income over threshold
 */
export function calculateSelfEmploymentTax(
  netSelfEmploymentIncome: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear = 2024
): { seTax: number; deductibleAmount: number } {
  if (netSelfEmploymentIncome <= 0) {
    return { seTax: 0, deductibleAmount: 0 };
  }

  // 92.35% of net SE income is subject to SE tax
  const seIncome = netSelfEmploymentIncome * 0.9235;

  // 2024 Social Security wage base
  const ssWageBase = 168600;

  // Social Security tax (12.4% up to wage base)
  const ssTax = Math.min(seIncome, ssWageBase) * 0.124;

  // Medicare tax (2.9% on all SE income)
  const medicareTax = seIncome * 0.029;

  // Additional Medicare tax (0.9% over threshold)
  const additionalMedicareThreshold = filingStatus === 'married-joint' ? 250000 : 200000;
  const additionalMedicareTax = Math.max(0, seIncome - additionalMedicareThreshold) * 0.009;

  const totalSETax = ssTax + medicareTax + additionalMedicareTax;

  // Deductible amount (employer-equivalent portion = 50%)
  const deductibleAmount = totalSETax * 0.5;

  return {
    seTax: Math.round(totalSETax * 100) / 100,
    deductibleAmount: Math.round(deductibleAmount * 100) / 100,
  };
}

/**
 * Calculate Earned Income Credit (EIC) for 2024
 * Based on AGI, earned income, and number of qualifying children
 */
export function calculateEarnedIncomeCredit(
  agi: number,
  earnedIncome: number,
  qualifyingChildren: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear = 2024
): number {
  // 2024 EIC parameters
  const eicLimits2024 = {
    0: {
      maxCredit: 632,
      earnedIncomeLimit: { single: 18591, married: 25511 },
      agiPhaseout: { single: 9800, married: 16370 },
    },
    1: {
      maxCredit: 4213,
      earnedIncomeLimit: { single: 49084, married: 56004 },
      agiPhaseout: { single: 24210, married: 31130 },
    },
    2: {
      maxCredit: 6960,
      earnedIncomeLimit: { single: 54884, married: 61804 },
      agiPhaseout: { single: 24210, married: 31130 },
    },
    3: {
      maxCredit: 7830,
      earnedIncomeLimit: { single: 58770, married: 65690 },
      agiPhaseout: { single: 24210, married: 31130 },
    },
  };

  const children = Math.min(qualifyingChildren, 3) as 0 | 1 | 2 | 3;
  const limits = eicLimits2024[children];
  const isMarried = filingStatus === 'married-joint';

  const incomeLimit = isMarried ? limits.earnedIncomeLimit.married : limits.earnedIncomeLimit.single;
  const phaseoutStart = isMarried ? limits.agiPhaseout.married : limits.agiPhaseout.single;

  // Not eligible if AGI or earned income exceeds limit
  if (agi > incomeLimit || earnedIncome > incomeLimit) {
    return 0;
  }

  // Calculate credit based on earned income (phase-in)
  const phaseInRate = children === 0 ? 0.0765 : children === 1 ? 0.34 : children === 2 ? 0.40 : 0.45;
  let credit = Math.min(earnedIncome * phaseInRate, limits.maxCredit);

  // Apply AGI phase-out if applicable
  if (agi > phaseoutStart) {
    const phaseoutRate = children === 0 ? 0.0765 : children === 1 ? 0.1598 : children === 2 ? 0.2106 : 0.2106;
    const phaseoutAmount = (agi - phaseoutStart) * phaseoutRate;
    credit = Math.max(0, credit - phaseoutAmount);
  }

  return Math.round(credit * 100) / 100;
}

/**
 * Calculate Child Tax Credit for 2024
 * $2,000 per qualifying child under 17
 * Begins to phase out at $200,000 ($400,000 for married filing jointly)
 */
export function calculateChildTaxCredit(
  qualifyingChildren: number,
  agi: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear = 2024
): number {
  const creditPerChild = 2000;
  const phaseoutThreshold = filingStatus === 'married-joint' ? 400000 : 200000;
  const phaseoutRate = 0.05; // $50 per $1,000 over threshold

  let credit = qualifyingChildren * creditPerChild;

  // Phase out if AGI exceeds threshold
  if (agi > phaseoutThreshold) {
    const excessIncome = agi - phaseoutThreshold;
    const phaseoutAmount = Math.ceil(excessIncome / 1000) * 50;
    credit = Math.max(0, credit - phaseoutAmount);
  }

  return credit;
}

/**
 * Calculate Additional Child Tax Credit (refundable portion)
 * Lesser of:
 * 1. $1,800 per child (2024), or
 * 2. 15% of earned income over $2,500
 */
export function calculateAdditionalChildTaxCredit(
  qualifyingChildren: number,
  earnedIncome: number,
  childTaxCreditUsed: number,
  taxYear: TaxYear = 2024
): number {
  const maxRefundablePerChild = 1800;
  const earnedIncomeThreshold = 2500;

  // Calculate maximum refundable amount
  const maxRefundable = Math.min(
    qualifyingChildren * maxRefundablePerChild,
    Math.max(0, earnedIncome - earnedIncomeThreshold) * 0.15
  );

  // Can only claim additional CTC up to the amount of unused CTC
  return Math.min(maxRefundable, childTaxCreditUsed);
}

/**
 * Calculate Child and Dependent Care Credit
 * Credit for expenses to care for qualifying children or dependents while you work
 * Maximum expenses: $3,000 for 1 child, $6,000 for 2+ children
 * Credit rate: 20-35% based on AGI
 */
export function calculateChildCareCredit(
  qualifyingExpenses: number,
  qualifyingDependents: number,
  agi: number,
  taxYear: TaxYear = 2024
): number {
  if (qualifyingExpenses <= 0 || qualifyingDependents === 0) return 0;

  // Maximum allowable expenses
  const maxExpenses = qualifyingDependents === 1 ? 3000 : 6000;
  const allowableExpenses = Math.min(qualifyingExpenses, maxExpenses);

  // Credit percentage based on AGI
  // 35% for AGI up to $15,000, decreases by 1% for each $2,000 over
  // Minimum credit rate is 20% (for AGI over $43,000)
  let creditRate = 0.35;
  if (agi > 15000) {
    const excessAGI = agi - 15000;
    const reductionSteps = Math.floor(excessAGI / 2000);
    creditRate = Math.max(0.20, 0.35 - (reductionSteps * 0.01));
  }

  return Math.round(allowableExpenses * creditRate);
}

/**
 * Calculate American Opportunity Tax Credit (AOTC)
 * For first 4 years of undergraduate education
 * Maximum credit: $2,500 per student
 * 100% of first $2,000 + 25% of next $2,000 in qualified expenses
 * Phases out between $80k-$90k (single) or $160k-$180k (married joint)
 */
export function calculateAmericanOpportunityCredit(
  qualifiedExpenses: number,
  agi: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear = 2024
): number {
  if (qualifiedExpenses <= 0) return 0;

  // Calculate base credit (100% of first $2k + 25% of next $2k)
  let credit = 0;
  if (qualifiedExpenses <= 2000) {
    credit = qualifiedExpenses;
  } else {
    credit = 2000 + Math.min(qualifiedExpenses - 2000, 2000) * 0.25;
  }

  // Maximum credit is $2,500
  credit = Math.min(credit, 2500);

  // Phase-out based on AGI
  const phaseoutStart = filingStatus === 'married-joint' ? 160000 : 80000;
  const phaseoutEnd = filingStatus === 'married-joint' ? 180000 : 90000;
  const phaseoutRange = phaseoutEnd - phaseoutStart;

  if (agi >= phaseoutEnd) {
    return 0;
  }

  if (agi > phaseoutStart) {
    const phaseoutAmount = (agi - phaseoutStart) / phaseoutRange;
    credit = credit * (1 - phaseoutAmount);
  }

  return Math.round(credit);
}

/**
 * Calculate Lifetime Learning Credit
 * For any level of post-secondary education
 * Maximum credit: $2,000 per tax return (not per student)
 * 20% of first $10,000 in qualified expenses
 * Phases out between $80k-$90k (single) or $160k-$180k (married joint)
 */
export function calculateLifetimeLearningCredit(
  qualifiedExpenses: number,
  agi: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear = 2024
): number {
  if (qualifiedExpenses <= 0) return 0;

  // Calculate base credit (20% of first $10,000)
  let credit = Math.min(qualifiedExpenses, 10000) * 0.20;

  // Phase-out based on AGI (same as AOTC)
  const phaseoutStart = filingStatus === 'married-joint' ? 160000 : 80000;
  const phaseoutEnd = filingStatus === 'married-joint' ? 180000 : 90000;
  const phaseoutRange = phaseoutEnd - phaseoutStart;

  if (agi >= phaseoutEnd) {
    return 0;
  }

  if (agi > phaseoutStart) {
    const phaseoutAmount = (agi - phaseoutStart) / phaseoutRange;
    credit = credit * (1 - phaseoutAmount);
  }

  return Math.round(credit);
}

/**
 * Calculate Alternative Minimum Tax (AMT)
 * Applies to high-income taxpayers with certain deductions
 * Ensures minimum tax payment regardless of deductions
 */
export function calculateAMT(
  taxableIncome: number,
  itemizedDeductions: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear = 2024
): number {
  // 2024 AMT exemption amounts
  const exemptions2024 = {
    single: 85700,
    'married-joint': 133300,
    'married-separate': 66650,
    'head-of-household': 85700,
    'qualifying-widow': 133300,
  };

  // AMT exemption phase-out thresholds (2024)
  const phaseoutThresholds2024 = {
    single: 609350,
    'married-joint': 1218700,
    'married-separate': 609350,
    'head-of-household': 609350,
    'qualifying-widow': 1218700,
  };

  // Get exemption and threshold for filing status
  const exemption = exemptions2024[filingStatus];
  const phaseoutThreshold = phaseoutThresholds2024[filingStatus];

  // Calculate Alternative Minimum Taxable Income (AMTI)
  // Simplified: taxable income + add-back certain deductions
  // In real world, would add back state/local taxes, misc. deductions, etc.
  const stateLocalTaxAddBack = Math.min(itemizedDeductions * 0.3, 10000); // Estimate SALT
  const amti = taxableIncome + stateLocalTaxAddBack;

  // Apply exemption (with phase-out)
  let applicableExemption = exemption;
  if (amti > phaseoutThreshold) {
    const excessAMTI = amti - phaseoutThreshold;
    const exemptionReduction = excessAMTI * 0.25;
    applicableExemption = Math.max(0, exemption - exemptionReduction);
  }

  // Calculate AMT base
  const amtBase = Math.max(0, amti - applicableExemption);

  // AMT rates: 26% on first $220,700 (MFJ $110,350 MFS), 28% above
  const amtThreshold = filingStatus === 'married-joint' ? 220700 :
                       filingStatus === 'married-separate' ? 110350 : 220700;

  let tentativeAMT = 0;
  if (amtBase <= amtThreshold) {
    tentativeAMT = amtBase * 0.26;
  } else {
    tentativeAMT = amtThreshold * 0.26 + (amtBase - amtThreshold) * 0.28;
  }

  // AMT is the excess of tentative AMT over regular tax
  // This function just returns tentative AMT
  // The review page will compare it to regular tax
  return Math.round(tentativeAMT);
}
