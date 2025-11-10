"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getCurrentTaxReturn,
  saveTaxReturn,
} from "@/lib/tax-prep/storage";
import { AdjustmentsToIncome } from "@/lib/tax-prep/types";

const adjustmentsSchema = z.object({
  educatorExpenses: z.number().min(0, "Cannot be negative"),
  businessExpenses: z.number().min(0, "Cannot be negative"),
  hsaDeduction: z.number().min(0, "Cannot be negative"),
  movingExpenses: z.number().min(0, "Cannot be negative"),
  selfEmploymentTax: z.number().min(0, "Cannot be negative"),
  selfEmployedRetirement: z.number().min(0, "Cannot be negative"),
  selfEmployedHealthInsurance: z.number().min(0, "Cannot be negative"),
  penalty: z.number().min(0, "Cannot be negative"),
  iraDeduction: z.number().min(0, "Cannot be negative"),
  studentLoanInterest: z.number().min(0, "Cannot be negative"),
  tuitionAndFees: z.number().min(0, "Cannot be negative"),
});

type AdjustmentsFormData = z.infer<typeof adjustmentsSchema>;

export default function AdjustmentsPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AdjustmentsFormData>({
    resolver: zodResolver(adjustmentsSchema),
    defaultValues: {
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
  });

  const formValues = watch();

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    if (taxReturn.form1040.adjustments) {
      reset(taxReturn.form1040.adjustments);
    }
  }, [router, reset]);

  const handleSave = (data: AdjustmentsFormData) => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    taxReturn.form1040.adjustments = data;

    if (!taxReturn.progress.completedSections.includes("adjustments")) {
      taxReturn.progress.completedSections.push("adjustments");
    }
    taxReturn.progress.currentStep = 8;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/credits");
  };

  const totalAdjustments =
    formValues.educatorExpenses +
    formValues.businessExpenses +
    formValues.hsaDeduction +
    formValues.movingExpenses +
    formValues.selfEmploymentTax +
    formValues.selfEmployedRetirement +
    formValues.selfEmployedHealthInsurance +
    formValues.penalty +
    formValues.iraDeduction +
    formValues.studentLoanInterest +
    formValues.tuitionAndFees;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Adjustments to Income
        </h1>
        <p className="mt-2 text-gray-600">
          These are "above-the-line" deductions that reduce your Adjusted Gross
          Income (AGI). They are available even if you take the standard
          deduction.
        </p>
      </div>

      {/* Summary */}
      {totalAdjustments > 0 && (
        <div className="mb-8 rounded-lg bg-success/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Adjustments</p>
              <p className="text-2xl font-bold text-success">
                ${totalAdjustments.toLocaleString()}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              These reduce your taxable income
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(handleSave)}>
        <div className="mb-8 space-y-6 rounded-lg bg-white p-6 shadow-sm">
          {/* Education */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Education</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Educator Expenses
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  For K-12 teachers, up to $300 ($600 if married filing jointly)
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("educatorExpenses", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Student Loan Interest
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Up to $2,500 of interest paid on qualified student loans
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("studentLoanInterest", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tuition and Fees (if applicable)
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  For yourself, spouse, or dependent (subject to phase-outs)
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("tuitionAndFees", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Retirement & Savings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 font-semibold text-foreground">
              Retirement & Savings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  IRA Deduction
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Traditional IRA contributions (subject to limits and phase-outs)
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("iraDeduction", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Health Savings Account (HSA) Deduction
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Contributions to HSA not made through your employer
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("hsaDeduction", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Early Withdrawal Penalty
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Penalty on early withdrawal of savings (from 1099-INT box 2)
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("penalty", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Self-Employment */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 font-semibold text-foreground">
              Self-Employment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Self-Employment Tax Deduction
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Deductible portion of self-employment tax (typically 50%)
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("selfEmploymentTax", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Self-Employed SEP, SIMPLE, and Qualified Plans
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Contributions to retirement plans for self-employed
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("selfEmployedRetirement", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Self-Employed Health Insurance Deduction
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Health insurance premiums paid for yourself and family
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("selfEmployedHealthInsurance", {
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Other */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="mb-4 font-semibold text-foreground">Other</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Business Expenses for Armed Forces Reservists, Performing
                  Artists, Fee-Basis Officials
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Unreimbursed employee business expenses (limited to specific
                  categories)
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("businessExpenses", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Moving Expenses for Armed Forces Members
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Moving expenses due to military orders (active duty only)
                </p>
                <input
                  type="number"
                  step="0.01"
                  {...register("movingExpenses", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Help Box */}
        <div className="mb-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">
            About Adjustments to Income
          </h3>
          <p className="text-sm text-blue-800">
            These deductions are sometimes called "above-the-line" deductions
            because they reduce your income before calculating your Adjusted
            Gross Income (AGI). You can claim these even if you take the
            standard deduction.
          </p>
          <p className="mt-2 text-sm text-blue-800">
            <strong>Tip:</strong> Many of these have income limits or
            phase-outs. The system will calculate your final deduction amount
            based on your total income.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => router.push("/tax-prep/interview/deductions")}
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
