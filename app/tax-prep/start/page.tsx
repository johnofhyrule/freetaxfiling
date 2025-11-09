"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FEATURES } from "@/lib/feature-flags";
import { redirect } from "next/navigation";
import {
  initializeTaxReturn,
  saveTaxReturn,
  getCurrentTaxReturn,
  isStorageAvailable,
} from "@/lib/tax-prep/storage";
import { TaxYear, FilingStatus } from "@/lib/tax-prep/types";

const TAX_YEARS: TaxYear[] = [2024, 2023, 2022, 2021];

const FILING_STATUSES: Array<{
  value: FilingStatus;
  label: string;
  description: string;
}> = [
  {
    value: "single",
    label: "Single",
    description: "Unmarried, divorced, or legally separated",
  },
  {
    value: "married-joint",
    label: "Married Filing Jointly",
    description: "Married and filing a joint return with your spouse",
  },
  {
    value: "married-separate",
    label: "Married Filing Separately",
    description: "Married but filing separate returns",
  },
  {
    value: "head-of-household",
    label: "Head of Household",
    description: "Unmarried and paying more than half the cost of keeping up a home",
  },
  {
    value: "qualifying-widow",
    label: "Qualifying Surviving Spouse",
    description: "Widowed in the past 2 years with a dependent child",
  },
];

export default function StartTaxPrepPage() {
  const router = useRouter();
  const [taxYear, setTaxYear] = useState<TaxYear>(2024);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [hasExistingReturn, setHasExistingReturn] = useState(false);
  const [storageError, setStorageError] = useState(false);

  // Feature flag check
  useEffect(() => {
    if (!FEATURES.TAX_PREP) {
      redirect("/");
    }

    // Check for existing return
    const existing = getCurrentTaxReturn();
    if (existing) {
      setHasExistingReturn(true);
    }

    // Check storage availability
    if (!isStorageAvailable()) {
      setStorageError(true);
    }
  }, []);

  const handleStartNewReturn = () => {
    if (!isStorageAvailable()) {
      alert("Your browser's localStorage is not available. Please enable cookies and try again.");
      return;
    }

    // Initialize new return
    const newReturn = initializeTaxReturn(taxYear, filingStatus);
    saveTaxReturn(newReturn);

    // Navigate to first step
    router.push("/tax-prep/interview/basic-info");
  };

  const handleContinueExisting = () => {
    router.push("/tax-prep/interview/basic-info");
  };

  if (!FEATURES.TAX_PREP) {
    return null;
  }

  if (storageError) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/tax-prep" className="text-xl font-bold text-primary">
              Tax Preparation Assistant
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-6">
            <h2 className="mb-4 text-xl font-bold text-red-900">
              Browser Storage Not Available
            </h2>
            <p className="mb-4 text-red-800">
              This tool requires browser localStorage to function. Please enable
              cookies and local storage in your browser settings, then try again.
            </p>
            <Link
              href="/tax-prep"
              className="inline-block text-primary hover:underline"
            >
              ← Back to Tax Prep
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/tax-prep" className="text-xl font-bold text-primary">
              Tax Preparation Assistant
            </Link>
            <Link
              href="/tax-prep"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Existing Return Alert */}
        {hasExistingReturn && (
          <div className="mb-8 rounded-lg bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">
              You have a tax return in progress
            </h3>
            <p className="mb-4 text-blue-800">
              Would you like to continue where you left off, or start a new
              return?
            </p>
            <button
              onClick={handleContinueExisting}
              className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
            >
              Continue Existing Return
            </button>
          </div>
        )}

        {/* Start New Return */}
        <div>
          <h1 className="mb-6 text-3xl font-bold text-foreground">
            {hasExistingReturn ? "Start a new return" : "Let's get started"}
          </h1>

          {/* Privacy Notice */}
          <div className="mb-8 rounded-lg bg-success/10 p-6">
            <div className="flex gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-success"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="mb-1 font-semibold text-success">
                  Your data stays private
                </h3>
                <p className="text-sm text-gray-700">
                  All information is stored locally in your browser. Nothing is
                  sent to our servers. You can close this page at any time and
                  resume later.
                </p>
              </div>
            </div>
          </div>

          {/* Tax Year Selection */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-foreground">
              Which tax year are you filing?
            </label>
            <div className="grid gap-3 sm:grid-cols-4">
              {TAX_YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => setTaxYear(year)}
                  className={`rounded-lg border-2 px-4 py-3 font-semibold transition-all ${
                    taxYear === year
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Select the year you're filing for. You can file prior year returns.
            </p>
          </div>

          {/* Filing Status Selection */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-foreground">
              What is your filing status?
            </label>
            <div className="space-y-3">
              {FILING_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilingStatus(status.value)}
                  className={`block w-full rounded-lg border-2 p-4 text-left transition-all ${
                    filingStatus === status.value
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">
                        {status.label}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {status.description}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          filingStatus === status.value
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {filingStatus === status.value && (
                          <svg
                            className="h-4 w-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-end">
            <button
              onClick={handleStartNewReturn}
              className="rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-secondary/90 hover:shadow-lg"
            >
              Start Tax Return →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
