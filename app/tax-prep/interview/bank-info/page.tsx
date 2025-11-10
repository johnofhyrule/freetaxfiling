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

const bankInfoSchema = z.object({
  routingNumber: z
    .string()
    .regex(/^\d{9}$/, "Routing number must be exactly 9 digits")
    .optional()
    .or(z.literal("")),
  accountNumber: z
    .string()
    .min(4, "Account number must be at least 4 digits")
    .max(17, "Account number cannot exceed 17 digits")
    .optional()
    .or(z.literal("")),
  accountType: z.enum(["checking", "savings"]).optional(),
});

type BankInfoFormData = z.infer<typeof bankInfoSchema>;

export default function BankInfoPage() {
  const router = useRouter();
  const [skipDirectDeposit, setSkipDirectDeposit] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BankInfoFormData>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      routingNumber: "",
      accountNumber: "",
      accountType: "checking",
    },
  });

  const formValues = watch();

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    if (taxReturn.form1040.refund) {
      reset({
        routingNumber: taxReturn.form1040.refund.routingNumber,
        accountNumber: taxReturn.form1040.refund.accountNumber,
        accountType: taxReturn.form1040.refund.accountType,
      });
    } else {
      setSkipDirectDeposit(true);
    }
  }, [router, reset]);

  const handleSave = (data: BankInfoFormData) => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Only save if user provided bank info
    if (!skipDirectDeposit && data.routingNumber && data.accountNumber && data.accountType) {
      taxReturn.form1040.refund = {
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
      };
    } else {
      // Clear refund info if skipping
      taxReturn.form1040.refund = undefined;
    }

    if (!taxReturn.progress.completedSections.includes("bank-info")) {
      taxReturn.progress.completedSections.push("bank-info");
    }
    taxReturn.progress.currentStep = 12;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/review");
  };

  const handleSkip = () => {
    setSkipDirectDeposit(true);
    reset({
      routingNumber: "",
      accountNumber: "",
      accountType: "checking",
    });
  };

  const handleUseDirectDeposit = () => {
    setSkipDirectDeposit(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Refund or Payment Information
        </h1>
        <p className="mt-2 text-gray-600">
          Enter your bank account information to receive your refund via direct
          deposit (fastest method).
        </p>
      </div>

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
              Your information is secure
            </h3>
            <p className="text-sm text-gray-700">
              Your bank account information is stored locally on your device
              only. We never send it to our servers. Direct deposit is the
              fastest way to receive your refund (typically 1-3 weeks).
            </p>
          </div>
        </div>
      </div>

      {skipDirectDeposit ? (
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No Direct Deposit
            </h3>
            <p className="mt-2 text-gray-600">
              You've chosen to skip direct deposit. If you're receiving a
              refund, you'll receive a paper check by mail (typically 4-6
              weeks).
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleUseDirectDeposit}
              className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
            >
              Add Direct Deposit Information
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleSave)}>
          <div className="mb-8 space-y-6 rounded-lg bg-white p-6 shadow-sm">
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
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Checking</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="savings"
                    {...register("accountType")}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Savings</span>
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Routing Number *
              </label>
              <p className="mb-2 text-xs text-gray-500">
                The 9-digit number on the bottom left of your check
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={9}
                {...register("routingNumber")}
                placeholder="123456789"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.routingNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.routingNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Account Number *
              </label>
              <p className="mb-2 text-xs text-gray-500">
                The account number on your check (4-17 digits)
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={17}
                {...register("accountNumber")}
                placeholder="1234567890"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.accountNumber.message}
                </p>
              )}
            </div>

            {/* Check Image Helper */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-blue-900">
                Where to find this information
              </h4>
              <div className="text-xs text-blue-800">
                <p className="mb-1">
                  <strong>Routing Number:</strong> 9-digit number on the bottom
                  left of your check
                </p>
                <p>
                  <strong>Account Number:</strong> Number between the routing
                  number and check number (usually 10-12 digits)
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Skip direct deposit (receive paper check instead)
              </button>
            </div>
          </div>

          {/* Help Box */}
          <div className="mb-8 rounded-lg bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">
              About Direct Deposit
            </h3>
            <p className="mb-2 text-sm text-blue-800">
              <strong>For refunds:</strong> Direct deposit is the fastest way to
              receive your refund. Most taxpayers receive their refund within 21
              days of e-filing.
            </p>
            <p className="text-sm text-blue-800">
              <strong>For payments:</strong> If you owe taxes, you can pay via
              direct debit, check, money order, or online payment.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => router.push("/tax-prep/interview/payments")}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>

            <button
              type="submit"
              className="rounded-lg bg-secondary px-8 py-2 font-semibold text-white hover:bg-secondary/90"
            >
              Continue to Review →
            </button>
          </div>
        </form>
      )}

      {/* Skip option when showing form */}
      {skipDirectDeposit && (
        <div className="flex justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => router.push("/tax-prep/interview/payments")}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={() => handleSave({ routingNumber: "", accountNumber: "", accountType: "checking" })}
            className="rounded-lg bg-secondary px-8 py-2 font-semibold text-white hover:bg-secondary/90"
          >
            Continue to Review →
          </button>
        </div>
      )}
    </div>
  );
}
