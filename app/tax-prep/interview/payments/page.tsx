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

const paymentsSchema = z.object({
  estimatedPayments: z.number().min(0).default(0),
  refundAppliedFromPriorYear: z.number().min(0).default(0),
  // Bank info for refund
  wantsDirectDeposit: z.boolean().default(false),
  routingNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  accountType: z.enum(["checking", "savings"]).optional(),
});

type PaymentsFormData = z.infer<typeof paymentsSchema>;

export default function PaymentsPage() {
  const router = useRouter();
  const [federalWithholding, setFederalWithholding] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentsFormData>({
    resolver: zodResolver(paymentsSchema),
    defaultValues: {
      estimatedPayments: 0,
      refundAppliedFromPriorYear: 0,
      wantsDirectDeposit: false,
    },
  });

  const wantsDirectDeposit = watch("wantsDirectDeposit");
  const estimatedPayments = watch("estimatedPayments") || 0;
  const refundApplied = watch("refundAppliedFromPriorYear") || 0;

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Calculate federal withholding from all W-2s
    const totalWithholding = taxReturn.form1040.w2Income.reduce(
      (sum, w2) => sum + w2.federalTaxWithheld,
      0
    );
    setFederalWithholding(totalWithholding);
  }, [router]);

  // Calculate total payments
  useEffect(() => {
    const total = federalWithholding + estimatedPayments + refundApplied;
    setTotalPayments(total);
  }, [federalWithholding, estimatedPayments, refundApplied]);

  const onSubmit = (data: PaymentsFormData) => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Update payments
    taxReturn.form1040.payments = {
      federalWithholding,
      estimatedPayments: data.estimatedPayments,
      refundAppliedFromPriorYear: data.refundAppliedFromPriorYear,
      earnedIncomeCredit: 0,
      additionalChildTaxCredit: 0,
      other: 0,
    };

    // Update bank info if direct deposit selected
    if (data.wantsDirectDeposit && data.routingNumber && data.accountNumber) {
      taxReturn.form1040.refund = {
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber,
        accountType: data.accountType || "checking",
      };
    } else {
      delete taxReturn.form1040.refund;
    }

    // Update progress
    if (!taxReturn.progress.completedSections.includes("payments")) {
      taxReturn.progress.completedSections.push("payments");
    }
    taxReturn.progress.currentStep = 6;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/bank-info");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Payments and Withholding
        </h1>
        <p className="mt-2 text-gray-600">
          Tell us about any payments you've already made toward your taxes this
          year.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Federal Withholding (Auto-calculated) */}
        <div className="rounded-lg bg-primary/10 p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Federal Tax Withheld from Wages
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            This amount was automatically calculated from your W-2 forms.
          </p>
          <div className="text-3xl font-bold text-primary">
            ${federalWithholding.toLocaleString()}
          </div>
        </div>

        {/* Estimated Tax Payments */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Estimated Tax Payments
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            If you made quarterly estimated tax payments during the year, enter
            the total amount here.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Total Estimated Payments
            </label>
            <input
              type="number"
              step="0.01"
              {...register("estimatedPayments", { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="0.00"
            />
            <p className="mt-2 text-sm text-gray-500">
              Includes all Form 1040-ES payments made during the tax year
            </p>
          </div>
        </div>

        {/* Prior Year Refund Applied */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Prior Year Refund Applied
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            If you applied part of your prior year tax refund to this year's
            estimated tax, enter that amount here.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Amount Applied from Prior Year
            </label>
            <input
              type="number"
              step="0.01"
              {...register("refundAppliedFromPriorYear", { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Total Payments Summary */}
        {totalPayments > 0 && (
          <div className="rounded-lg bg-success/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Total Payments
                </h3>
                <p className="text-sm text-gray-600">
                  All payments and withholding for this tax year
                </p>
              </div>
              <div className="text-3xl font-bold text-success">
                ${totalPayments.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Direct Deposit Info */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Refund Direct Deposit (Optional)
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            If you're expecting a refund, you can have it directly deposited into
            your bank account for faster processing.
          </p>

          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register("wantsDirectDeposit")}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
              />
              <span className="font-medium text-gray-700">
                I want direct deposit for my refund
              </span>
            </label>
          </div>

          {wantsDirectDeposit && (
            <div className="space-y-4 rounded-lg bg-gray-50 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Account Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="checking"
                      {...register("accountType")}
                      defaultChecked
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">Checking</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="savings"
                      {...register("accountType")}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">Savings</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Routing Number *
                </label>
                <input
                  type="text"
                  maxLength={9}
                  {...register("routingNumber")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="9 digits"
                />
                {errors.routingNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.routingNumber.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Found on the bottom left of your check
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Account Number *
                </label>
                <input
                  type="text"
                  {...register("accountNumber")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Account number"
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.accountNumber.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Found on the bottom of your check, after the routing number
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Make sure your account information is correct. Incorrect
                  information may delay your refund.
                </p>
              </div>
            </div>
          )}

          {!wantsDirectDeposit && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                If you don't choose direct deposit, the IRS will mail you a paper
                check. This typically takes 3-4 weeks longer than direct deposit.
              </p>
            </div>
          )}
        </div>

        {/* Help Box */}
        <div className="rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">
            What counts as a payment?
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>
              • <strong>Federal withholding:</strong> Tax withheld from your
              paychecks (shown on W-2 Box 2)
            </li>
            <li>
              • <strong>Estimated payments:</strong> Quarterly payments you made
              using Form 1040-ES
            </li>
            <li>
              • <strong>Prior year refund:</strong> If you chose to apply last
              year's refund to this year
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => router.push("/tax-prep/interview/credits")}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="rounded-lg bg-secondary px-8 py-2 font-semibold text-white hover:bg-secondary/90"
          >
            Review My Return →
          </button>
        </div>
      </form>
    </div>
  );
}
