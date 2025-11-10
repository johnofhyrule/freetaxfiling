/**
 * Type definitions for Tax Preparation Assistant
 * Based on IRS Form 1040 and common schedules
 */

// Filing Status
export type FilingStatus =
  | "single"
  | "married-joint"
  | "married-separate"
  | "head-of-household"
  | "qualifying-widow";

// Tax Year
export type TaxYear = 2022 | 2023 | 2024 | 2025;

// Personal Information
export interface PersonalInfo {
  firstName: string;
  middleInitial?: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  occupation?: string;

  // Address
  address: string;
  aptUnit?: string;
  city: string;
  state: string;
  zipCode: string;

  // Contact
  phoneNumber?: string;
  email?: string;
}

// Spouse Information (for married filing jointly/separately)
export interface SpouseInfo extends PersonalInfo {
  // Inherits all fields from PersonalInfo
}

// Dependent Information
export interface Dependent {
  id: string; // UUID for tracking
  firstName: string;
  middleInitial?: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  relationship: string; // Son, Daughter, Parent, etc.
  monthsLivedWithYou: number; // 0-12

  // Credits eligibility
  qualifiesForChildTaxCredit: boolean;
  qualifiesForOtherDependentCredit: boolean;
}

// W-2 Income
export interface W2Income {
  id: string;
  employerName: string;
  employerEIN: string;

  // Box numbers from W-2
  wages: number; // Box 1
  federalTaxWithheld: number; // Box 2
  socialSecurityWages: number; // Box 3
  socialSecurityTaxWithheld: number; // Box 4
  medicareWages: number; // Box 5
  medicareTaxWithheld: number; // Box 6

  // State tax (if applicable)
  stateTaxWithheld?: number;
  stateWages?: number;
  state?: string;
}

// 1099 Income Types
export interface Income1099INT {
  id: string;
  payerName: string;
  payerEIN?: string;
  interestIncome: number; // Box 1
  earlyWithdrawalPenalty?: number; // Box 2
  federalTaxWithheld?: number; // Box 4
}

export interface Income1099DIV {
  id: string;
  payerName: string;
  payerEIN?: string;
  ordinaryDividends: number; // Box 1a
  qualifiedDividends: number; // Box 1b
  totalCapitalGainDistributions?: number; // Box 2a
  federalTaxWithheld?: number; // Box 4
}

export interface Income1099B {
  id: string;
  brokerName: string;

  // Capital gains/losses
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: number;
  costBasis: number;
  gainOrLoss: number;
  shortTermOrLongTerm: "short" | "long";
}

export interface Income1099MISC {
  id: string;
  payerName: string;
  payerEIN?: string;
  nonemployeeCompensation?: number; // Box 1 (for 1099-NEC after 2020)
  rents?: number; // Box 1 (old form)
  royalties?: number; // Box 2
  otherIncome?: number; // Box 3
  federalTaxWithheld?: number; // Box 4
}

// Self-Employment Income (Schedule C)
export interface SelfEmploymentIncome {
  id: string;
  businessName?: string;
  businessDescription: string;
  principalBusinessCode?: string;

  // Income
  grossReceipts: number;
  returns: number;
  otherIncome: number;

  // Expenses
  advertising: number;
  carAndTruck: number;
  commissions: number;
  insurance: number;
  interest: number;
  legal: number;
  officeExpense: number;
  rent: number;
  repairs: number;
  supplies: number;
  taxes: number;
  travel: number;
  meals: number;
  utilities: number;
  wages: number;
  otherExpenses: Array<{ description: string; amount: number }>;
}

// Rental Income (Schedule E)
export interface RentalIncome {
  id: string;
  propertyAddress: string;
  propertyType: "single-family" | "multi-family" | "vacation" | "commercial" | "land" | "other";
  daysRented: number;
  daysPersonalUse: number;

  // Income
  rents: number;

  // Expenses
  advertising: number;
  auto: number;
  cleaning: number;
  commissions: number;
  insurance: number;
  legal: number;
  management: number;
  mortgage: number;
  otherInterest: number;
  repairs: number;
  supplies: number;
  taxes: number;
  utilities: number;
  depreciation: number;
  otherExpenses: Array<{ description: string; amount: number }>;
}

// Deductions (Schedule A - Itemized Deductions)
export interface ItemizedDeductions {
  // Medical and Dental
  medicalExpenses: number;

  // State and Local Taxes (SALT) - capped at $10,000
  stateIncomeTax: number;
  realEstateTax: number;
  personalPropertyTax: number;

  // Mortgage Interest
  mortgageInterest: number; // Form 1098
  mortgagePoints: number;
  mortgageInsurance: number;

  // Charitable Contributions
  cashContributions: number;
  nonCashContributions: number;

  // Casualty and Theft Losses
  casualtyLosses: number;

  // Other
  otherDeductions: Array<{ description: string; amount: number }>;
}

// Adjustments to Income (Schedule 1)
export interface AdjustmentsToIncome {
  educatorExpenses: number;
  businessExpenses: number; // For reservists, performing artists, etc.
  hsaDeduction: number;
  movingExpenses: number; // For military only
  selfEmploymentTax: number; // Half of SE tax
  selfEmployedRetirement: number;
  selfEmployedHealthInsurance: number;
  penalty: number; // Early withdrawal penalty
  iraDeduction: number;
  studentLoanInterest: number;
  tuitionAndFees: number;
}

// Tax Credits (Schedule 3)
export interface TaxCredits {
  childTaxCredit: number;
  otherDependentCredit: number;
  childCareCredit: number;
  educationCredits: number; // American Opportunity or Lifetime Learning
  retirementSavingsCredit: number;
  earnedIncomeCredit: number;
  premiumTaxCredit: number; // ACA
}

// Additional Taxes (Schedule 2)
export interface AdditionalTaxes {
  selfEmploymentTax: number;
  additionalMedicareTax: number;
  netInvestmentIncomeTax: number;
  underpaymentPenalty: number;
}

// Form 1040 - Main Return
export interface Form1040 {
  // Meta
  taxYear: TaxYear;
  filingStatus: FilingStatus;

  // Personal Info
  taxpayer: PersonalInfo;
  spouse?: SpouseInfo;
  dependents: Dependent[];

  // Income
  w2Income: W2Income[];
  interest1099INT: Income1099INT[];
  dividends1099DIV: Income1099DIV[];
  capitalGains1099B: Income1099B[];
  misc1099: Income1099MISC[];

  selfEmploymentIncome?: SelfEmploymentIncome[];
  rentalIncome?: RentalIncome[];

  otherIncome: {
    unemployment: number;
    socialSecurity: number;
    stateTaxRefund: number;
    alimony: number;
    other: Array<{ description: string; amount: number }>;
  };

  // Deductions
  useStandardDeduction: boolean;
  itemizedDeductions?: ItemizedDeductions;

  // Adjustments
  adjustments: AdjustmentsToIncome;

  // Credits
  credits: TaxCredits;

  // Additional Taxes
  additionalTaxes: AdditionalTaxes;

  // Payments
  payments: {
    federalWithholding: number; // Sum of all W-2 box 2
    estimatedPayments: number;
    refundAppliedFromPriorYear: number;
    earnedIncomeCredit: number;
    additionalChildTaxCredit: number;
    other: number;
  };

  // Bank Info (for direct deposit refund)
  refund?: {
    routingNumber: string;
    accountNumber: string;
    accountType: "checking" | "savings";
  };

  // Payment (if owe)
  payment?: {
    paymentDate?: string;
    checkNumber?: string;
  };
}

// Interview Progress Tracker
export interface InterviewProgress {
  currentStep: number;
  totalSteps: number;
  completedSections: string[];
  lastSaved: string; // ISO date string
}

// Complete Tax Return Data
export interface TaxReturn {
  id: string;
  form1040: Form1040;
  progress: InterviewProgress;
  createdAt: string;
  updatedAt: string;
}

// Interview Steps
export type InterviewStep =
  | "welcome"
  | "basic-info"
  | "filing-status"
  | "dependents"
  | "w2-income"
  | "1099-income"
  | "self-employment"
  | "rental-income"
  | "deductions"
  | "adjustments"
  | "credits"
  | "payments"
  | "bank-info"
  | "review"
  | "complete";

// Standard Deduction Amounts (2025 - projected based on inflation adjustment)
export const STANDARD_DEDUCTIONS_2025: Record<FilingStatus, number> = {
  single: 15000,
  "married-joint": 30000,
  "married-separate": 15000,
  "head-of-household": 22500,
  "qualifying-widow": 30000,
};

// Standard Deduction Amounts (2024)
export const STANDARD_DEDUCTIONS_2024: Record<FilingStatus, number> = {
  single: 14600,
  "married-joint": 29200,
  "married-separate": 14600,
  "head-of-household": 21900,
  "qualifying-widow": 29200,
};

// Standard Deduction Amounts (2023)
export const STANDARD_DEDUCTIONS_2023: Record<FilingStatus, number> = {
  single: 13850,
  "married-joint": 27700,
  "married-separate": 13850,
  "head-of-household": 20800,
  "qualifying-widow": 27700,
};

// Standard Deduction Amounts (2022)
export const STANDARD_DEDUCTIONS_2022: Record<FilingStatus, number> = {
  single: 12950,
  "married-joint": 25900,
  "married-separate": 12950,
  "head-of-household": 19400,
  "qualifying-widow": 25900,
};

// Tax Brackets (simplified - actual calculation is more complex)
export interface TaxBracket {
  rate: number;
  min: number;
  max: number | null; // null for highest bracket
}
