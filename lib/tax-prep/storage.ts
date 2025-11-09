/**
 * Local Storage Management for Tax Preparation Assistant
 *
 * All tax data is stored client-side in localStorage for privacy.
 * Data is never sent to any server.
 */

import { TaxReturn, Form1040, TaxYear, FilingStatus } from "./types";

const STORAGE_KEY = "tax-prep-returns";
const CURRENT_RETURN_KEY = "tax-prep-current";

/**
 * Initialize a new tax return
 */
export function initializeTaxReturn(
  taxYear: TaxYear,
  filingStatus: FilingStatus
): TaxReturn {
  const now = new Date().toISOString();

  const newReturn: TaxReturn = {
    id: generateId(),
    form1040: {
      taxYear,
      filingStatus,
      taxpayer: {
        firstName: "",
        lastName: "",
        ssn: "",
        dateOfBirth: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      dependents: [],
      w2Income: [],
      interest1099INT: [],
      dividends1099DIV: [],
      capitalGains1099B: [],
      misc1099: [],
      otherIncome: {
        unemployment: 0,
        socialSecurity: 0,
        stateTaxRefund: 0,
        alimony: 0,
        other: [],
      },
      useStandardDeduction: true,
      adjustments: {
        educatorExpenses: 0,
        businessExpenses: 0,
        hsaDeduction: 0,
        movingExpenses: 0,
        selfEmploymentTax: 0,
        selfEmployedRetirement: 0,
        selfEmployedHealthInsurance: 0,
        penalty: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        tuitionAndFees: 0,
      },
      credits: {
        childTaxCredit: 0,
        otherDependentCredit: 0,
        childCareCredit: 0,
        educationCredits: 0,
        retirementSavingsCredit: 0,
        earnedIncomeCredit: 0,
        premiumTaxCredit: 0,
      },
      additionalTaxes: {
        selfEmploymentTax: 0,
        additionalMedicareTax: 0,
        netInvestmentIncomeTax: 0,
        underpaymentPenalty: 0,
      },
      payments: {
        federalWithholding: 0,
        estimatedPayments: 0,
        refundAppliedFromPriorYear: 0,
        earnedIncomeCredit: 0,
        additionalChildTaxCredit: 0,
        other: 0,
      },
    },
    progress: {
      currentStep: 0,
      totalSteps: 15,
      completedSections: [],
      lastSaved: now,
    },
    createdAt: now,
    updatedAt: now,
  };

  return newReturn;
}

/**
 * Save tax return to localStorage
 */
export function saveTaxReturn(taxReturn: TaxReturn): void {
  try {
    // Update timestamp
    taxReturn.updatedAt = new Date().toISOString();
    taxReturn.progress.lastSaved = taxReturn.updatedAt;

    // Get all returns
    const returns = getAllTaxReturns();

    // Update or add this return
    const index = returns.findIndex((r) => r.id === taxReturn.id);
    if (index >= 0) {
      returns[index] = taxReturn;
    } else {
      returns.push(taxReturn);
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));

    // Set as current return
    localStorage.setItem(CURRENT_RETURN_KEY, taxReturn.id);
  } catch (error) {
    console.error("Error saving tax return:", error);
    throw new Error("Failed to save tax return. Your browser storage may be full.");
  }
}

/**
 * Get current tax return
 */
export function getCurrentTaxReturn(): TaxReturn | null {
  try {
    const currentId = localStorage.getItem(CURRENT_RETURN_KEY);
    if (!currentId) return null;

    const returns = getAllTaxReturns();
    return returns.find((r) => r.id === currentId) || null;
  } catch (error) {
    console.error("Error loading tax return:", error);
    return null;
  }
}

/**
 * Get all tax returns
 */
export function getAllTaxReturns(): TaxReturn[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    return JSON.parse(data) as TaxReturn[];
  } catch (error) {
    console.error("Error loading tax returns:", error);
    return [];
  }
}

/**
 * Get tax return by ID
 */
export function getTaxReturnById(id: string): TaxReturn | null {
  const returns = getAllTaxReturns();
  return returns.find((r) => r.id === id) || null;
}

/**
 * Delete tax return
 */
export function deleteTaxReturn(id: string): void {
  try {
    const returns = getAllTaxReturns();
    const filtered = returns.filter((r) => r.id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // If this was the current return, clear it
    const currentId = localStorage.getItem(CURRENT_RETURN_KEY);
    if (currentId === id) {
      localStorage.removeItem(CURRENT_RETURN_KEY);
    }
  } catch (error) {
    console.error("Error deleting tax return:", error);
    throw new Error("Failed to delete tax return.");
  }
}

/**
 * Set current tax return
 */
export function setCurrentTaxReturn(id: string): void {
  localStorage.setItem(CURRENT_RETURN_KEY, id);
}

/**
 * Clear all tax returns (use with caution!)
 */
export function clearAllTaxReturns(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CURRENT_RETURN_KEY);
}

/**
 * Export tax return as JSON (for backup)
 */
export function exportTaxReturn(taxReturn: TaxReturn): string {
  return JSON.stringify(taxReturn, null, 2);
}

/**
 * Import tax return from JSON
 */
export function importTaxReturn(jsonString: string): TaxReturn {
  try {
    const taxReturn = JSON.parse(jsonString) as TaxReturn;

    // Validate basic structure
    if (!taxReturn.id || !taxReturn.form1040) {
      throw new Error("Invalid tax return format");
    }

    return taxReturn;
  } catch (error) {
    console.error("Error importing tax return:", error);
    throw new Error("Failed to import tax return. Invalid file format.");
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate storage usage (in KB)
 */
export function getStorageUsage(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return 0;

    // Calculate size in KB
    return new Blob([data]).size / 1024;
  } catch (error) {
    return 0;
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}
