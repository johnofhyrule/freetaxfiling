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

const creditsSchema = z.object({
  childCareExpenses: z.number().min(0).default(0),
  educationExpenses: z.number().min(0).default(0),
  retirementContributions: z.number().min(0).default(0),
});

type CreditsFormData = z.infer<typeof creditsSchema>;

export default function CreditsPage() {
  const router = useRouter();
  const [childTaxCreditAmount, setChildTaxCreditAmount] = useState(0);
  const [otherDependentCreditAmount, setOtherDependentCreditAmount] = useState(0);
  const [estimatedChildCareCredit, setEstimatedChildCareCredit] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreditsFormData>({
    resolver: zodResolver(creditsSchema),
    defaultValues: {
      childCareExpenses: 0,
      educationExpenses: 0,
      retirementContributions: 0,
    },
  });

  const watchedChildCare = watch("childCareExpenses");

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Calculate Child Tax Credit
    const qualifyingChildren = taxReturn.form1040.dependents.filter(
      (d) => d.qualifiesForChildTaxCredit
    ).length;
    const childCredit = qualifyingChildren * 2000; // $2,000 per child
    setChildTaxCreditAmount(childCredit);

    // Calculate Other Dependent Credit
    const otherDependents = taxReturn.form1040.dependents.filter(
      (d) => d.qualifiesForOtherDependentCredit
    ).length;
    const otherCredit = otherDependents * 500; // $500 per other dependent
    setOtherDependentCreditAmount(otherCredit);
  }, [router]);

  // Estimate child care credit (simplified - actual calculation is complex)
  useEffect(() => {
    // Child care credit is 20-35% of expenses, max $3,000 for 1 child, $6,000 for 2+
    // Using 20% as conservative estimate
    const credit = Math.round(watchedChildCare * 0.2);
    setEstimatedChildCareCredit(credit);
  }, [watchedChildCare]);

  const onSubmit = (data: CreditsFormData) => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Update credits (simplified - actual calculations would be more complex)
    taxReturn.form1040.credits = {
      childTaxCredit: childTaxCreditAmount,
      otherDependentCredit: otherDependentCreditAmount,
      childCareCredit: estimatedChildCareCredit,
      educationCredits: data.educationExpenses > 0 ? Math.min(2500, data.educationExpenses * 0.25) : 0,
      retirementSavingsCredit: 0, // Simplified
      earnedIncomeCredit: 0, // Would require complex calculation
      premiumTaxCredit: 0,
    };

    // Update progress
    if (!taxReturn.progress.completedSections.includes("credits")) {
      taxReturn.progress.completedSections.push("credits");
    }
    taxReturn.progress.currentStep = 5;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/payments");
  };

  const totalCredits =
    childTaxCreditAmount +
    otherDependentCreditAmount +
    estimatedChildCareCredit;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Tax Credits</h1>
        <p className="mt-2 text-gray-600">
          Tax credits directly reduce the amount of tax you owe. They're more
          valuable than deductions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Automatic Credits Summary */}
        {(childTaxCreditAmount > 0 || otherDependentCreditAmount > 0) && (
          <div className="rounded-lg bg-success/10 p-6">
            <h2 className="mb-4 text-xl font-semibold text-success">
              ✓ Automatic Credits Based on Your Dependents
            </h2>
            <div className="space-y-3">
              {childTaxCreditAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Child Tax Credit</span>
                  <span className="text-xl font-bold text-success">
                    ${childTaxCreditAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {otherDependentCreditAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Other Dependent Credit</span>
                  <span className="text-xl font-bold text-success">
                    ${otherDependentCreditAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Child and Dependent Care Credit */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Child and Dependent Care Credit
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            If you paid for child care or dependent care so you could work, you
            may qualify for this credit.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Total Child/Dependent Care Expenses
            </label>
            <input
              type="number"
              step="0.01"
              {...register("childCareExpenses", { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="0.00"
            />
            <p className="mt-2 text-sm text-gray-500">
              Maximum $3,000 for one dependent, $6,000 for two or more
            </p>

            {estimatedChildCareCredit > 0 && (
              <div className="mt-4 rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-gray-700">
                  Estimated credit:{" "}
                  <span className="font-bold text-primary">
                    ${estimatedChildCareCredit.toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Education Credits */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Education Credits
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            If you or your dependents paid for higher education, you may qualify
            for the American Opportunity Credit or Lifetime Learning Credit.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Qualified Education Expenses
            </label>
            <input
              type="number"
              step="0.01"
              {...register("educationExpenses", { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="0.00"
            />
            <p className="mt-2 text-sm text-gray-500">
              American Opportunity Credit: Up to $2,500 per student
            </p>
          </div>
        </div>

        {/* Retirement Savings Credit */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Retirement Savings Contributions Credit (Saver's Credit)
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            If you contributed to an IRA or 401(k), you may qualify for this
            credit (income limits apply).
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              IRA or 401(k) Contributions
            </label>
            <input
              type="number"
              step="0.01"
              {...register("retirementContributions", { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="0.00"
            />
            <p className="mt-2 text-sm text-gray-500">
              Credit ranges from 10% to 50% of contributions, up to $2,000
            </p>
          </div>
        </div>

        {/* Total Credits Summary */}
        {totalCredits > 0 && (
          <div className="rounded-lg bg-primary p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Total Tax Credits
                </h3>
                <p className="text-sm text-blue-100">
                  These credits will directly reduce your tax owed
                </p>
              </div>
              <div className="text-3xl font-bold text-white">
                ${totalCredits.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Help Box */}
        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">
            Credits vs. Deductions
          </h3>
          <p className="text-sm text-blue-800">
            Tax credits are more valuable than deductions. A credit reduces your
            tax bill dollar-for-dollar, while a deduction only reduces your
            taxable income. For example, a $1,000 credit saves you $1,000 in
            taxes, but a $1,000 deduction might only save you $200-$300
            depending on your tax bracket.
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
