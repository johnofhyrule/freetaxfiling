import { FilingStatus, TaxYear } from './types';

/**
 * 2024 Tax Brackets for all filing statuses
 * Source: IRS Publication 17
 */

export interface TaxBracket {
  rate: number;
  min: number;
  max: number | null; // null for highest bracket
}

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

/**
 * Calculate federal income tax using progressive tax brackets
 */
export function calculateIncomeTax(
  taxableIncome: number,
  filingStatus: FilingStatus,
  taxYear: TaxYear = 2024
): number {
  if (taxableIncome <= 0) return 0;

  // Currently only 2024 brackets implemented
  // TODO: Add 2025, 2023, 2022 brackets
  const brackets = TAX_BRACKETS_2024[filingStatus];
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
