"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getCurrentTaxReturn,
  saveTaxReturn,
} from "@/lib/tax-prep/storage";
import { STANDARD_DEDUCTIONS_2024, STANDARD_DEDUCTIONS_2023 } from "@/lib/tax-prep/types";

const itemizedDeductionsSchema = z.object({
  medicalExpenses: z.number().min(0),
  stateIncomeTax: z.number().min(0),
  realEstateTax: z.number().min(0),
  personalPropertyTax: z.number().min(0),
  mortgageInterest: z.number().min(0),
  mortgagePoints: z.number().min(0),
  mortgageInsurance: z.number().min(0),
  cashContributions: z.number().min(0),
  nonCashContributions: z.number().min(0),
  casualtyLosses: z.number().min(0),
});

type ItemizedDeductionsFormData = z.infer<typeof itemizedDeductionsSchema>;

export default function DeductionsPage() {
  const router = useRouter();
  const [useStandardDeduction, setUseStandardDeduction] = useState(true);
  const [standardDeductionAmount, setStandardDeductionAmount] = useState(0);
  const [itemizedTotal, setItemizedTotal] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ItemizedDeductionsFormData>({
    resolver: zodResolver(itemizedDeductionsSchema),
    defaultValues: {
      medicalExpenses: 0,
      stateIncomeTax: 0,
      realEstateTax: 0,
      personalPropertyTax: 0,
      mortgageInterest: 0,
      mortgagePoints: 0,
      mortgageInsurance: 0,
      cashContributions: 0,
      nonCashContributions: 0,
      casualtyLosses: 0,
    },
  });

  // Watch all itemized deduction fields
  const watchedFields = watch();

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Get standard deduction amount based on filing status and tax year
    const filingStatus = taxReturn.form1040.filingStatus;
    const taxYear = taxReturn.form1040.taxYear;

    let stdDeduction = 0;
    if (taxYear === 2024) {
      stdDeduction = STANDARD_DEDUCTIONS_2024[filingStatus];
    } else if (taxYear === 2023) {
      stdDeduction = STANDARD_DEDUCTIONS_2023[filingStatus];
    }

    setStandardDeductionAmount(stdDeduction);
    setUseStandardDeduction(taxReturn.form1040.useStandardDeduction);
  }, [router]);

  // Calculate itemized total whenever fields change
  useEffect(() => {
    const medical = watchedFields.medicalExpenses || 0;

    // SALT (State and Local Tax) deduction is capped at $10,000
    const saltTotal = Math.min(
      10000,
      (watchedFields.stateIncomeTax || 0) +
      (watchedFields.realEstateTax || 0) +
      (watchedFields.personalPropertyTax || 0)
    );

    const mortgageTotal =
      (watchedFields.mortgageInterest || 0) +
      (watchedFields.mortgagePoints || 0) +
      (watchedFields.mortgageInsurance || 0);

    const charitable =
      (watchedFields.cashContributions || 0) +
      (watchedFields.nonCashContributions || 0);

    const casualty = watchedFields.casualtyLosses || 0;

    const total = medical + saltTotal + mortgageTotal + charitable + casualty;
    setItemizedTotal(total);
  }, [watchedFields]);

  const onSubmit = (data: ItemizedDeductionsFormData) => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Update deduction info
    taxReturn.form1040.useStandardDeduction = useStandardDeduction;

    if (!useStandardDeduction) {
      taxReturn.form1040.itemizedDeductions = {
        medicalExpenses: data.medicalExpenses,
        stateIncomeTax: data.stateIncomeTax,
        realEstateTax: data.realEstateTax,
        personalPropertyTax: data.personalPropertyTax,
        mortgageInterest: data.mortgageInterest,
        mortgagePoints: data.mortgagePoints,
        mortgageInsurance: data.mortgageInsurance,
        cashContributions: data.cashContributions,
        nonCashContributions: data.nonCashContributions,
        casualtyLosses: data.casualtyLosses,
        otherDeductions: [],
      };
    }

    // Update progress
    if (!taxReturn.progress.completedSections.includes("deductions")) {
      taxReturn.progress.completedSections.push("deductions");
    }
    taxReturn.progress.currentStep = 4;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/adjustments");
  };

  const saltTotal = Math.min(
    10000,
    (watchedFields.stateIncomeTax || 0) +
    (watchedFields.realEstateTax || 0) +
    (watchedFields.personalPropertyTax || 0)
  );

  const isItemizedBetter = itemizedTotal > standardDeductionAmount;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Deductions
        </h1>
        <p className="mt-2 text-gray-600">
          Choose between the standard deduction or itemized deductions. We'll
          help you decide which is better for you.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Deduction Type Selection */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Which deduction would you like to use?
          </h2>

          <div className="space-y-4">
            {/* Standard Deduction */}
            <button
              type="button"
              onClick={() => setUseStandardDeduction(true)}
              className={`block w-full rounded-lg border-2 p-6 text-left transition-all ${
                useStandardDeduction
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-foreground">
                      Standard Deduction
                    </div>
                    {useStandardDeduction && (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-primary">
                    ${standardDeductionAmount.toLocaleString()}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    The standard deduction is a fixed amount that reduces your
                    taxable income. Most people use this option because it's
                    simpler and often results in a larger deduction.
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      useStandardDeduction
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {useStandardDeduction && (
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

            {/* Itemized Deduction */}
            <button
              type="button"
              onClick={() => setUseStandardDeduction(false)}
              className={`block w-full rounded-lg border-2 p-6 text-left transition-all ${
                !useStandardDeduction
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-foreground">
                      Itemized Deductions
                    </div>
                    {!useStandardDeduction && (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                        Selected
                      </span>
                    )}
                    {isItemizedBetter && (
                      <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
                        Better Option!
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-primary">
                    ${itemizedTotal.toLocaleString()}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Itemized deductions let you deduct specific expenses like
                    mortgage interest, charitable donations, and state taxes.
                    Choose this if your itemized total exceeds the standard
                    deduction.
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      !useStandardDeduction
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {!useStandardDeduction && (
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
          </div>
        </div>

        {/* Itemized Deductions Form */}
        {!useStandardDeduction && (
          <div className="space-y-6">
            {/* Medical Expenses */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">
                Medical and Dental Expenses
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                You can deduct medical expenses that exceed 7.5% of your AGI.
              </p>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Total Medical Expenses
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("medicalExpenses", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* State and Local Taxes (SALT) */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">
                State and Local Taxes (SALT)
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Limited to $10,000 total. Includes state income tax, real estate
                tax, and personal property tax.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    State Income Tax Paid
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("stateIncomeTax", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Real Estate Tax
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("realEstateTax", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Personal Property Tax
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("personalPropertyTax", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {saltTotal >= 10000 && (
                <div className="mt-4 rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Your SALT deduction is capped at $10,000. You entered $
                    {(
                      (watchedFields.stateIncomeTax || 0) +
                      (watchedFields.realEstateTax || 0) +
                      (watchedFields.personalPropertyTax || 0)
                    ).toLocaleString()}
                    , but only $10,000 will be deductible.
                  </p>
                </div>
              )}
            </div>

            {/* Mortgage Interest */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">
                Home Mortgage Interest
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mortgage Interest (Form 1098)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("mortgageInterest", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mortgage Points
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("mortgagePoints", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mortgage Insurance Premiums
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("mortgageInsurance", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Charitable Contributions */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground">
                Charitable Contributions
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Cash Contributions
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("cashContributions", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Non-Cash Contributions (Clothing, Goods, etc.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("nonCashContributions", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendation */}
        {!useStandardDeduction && (
          <div className={`rounded-lg p-6 ${isItemizedBetter ? 'bg-success/10' : 'bg-yellow-50'}`}>
            <h3 className={`mb-2 font-semibold ${isItemizedBetter ? 'text-success' : 'text-yellow-800'}`}>
              {isItemizedBetter ? '✓ Good choice!' : '⚠️ Consider the standard deduction'}
            </h3>
            <p className={`text-sm ${isItemizedBetter ? 'text-success/90' : 'text-yellow-700'}`}>
              {isItemizedBetter
                ? `Your itemized deductions ($${itemizedTotal.toLocaleString()}) exceed the standard deduction ($${standardDeductionAmount.toLocaleString()}). You'll save more by itemizing.`
                : `Your itemized deductions ($${itemizedTotal.toLocaleString()}) are less than the standard deduction ($${standardDeductionAmount.toLocaleString()}). You might want to use the standard deduction instead.`}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => router.push("/tax-prep/interview/rental-income")}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="rounded-lg bg-secondary px-8 py-2 font-semibold text-white hover:bg-secondary/90"
          >
            Continue →
          </button>
        </div>
      </form>
    </div>
  );
}
