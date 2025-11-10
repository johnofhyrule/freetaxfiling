"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCurrentTaxReturn,
  saveTaxReturn,
} from "@/lib/tax-prep/storage";
import {
  STANDARD_DEDUCTIONS_2024,
  STANDARD_DEDUCTIONS_2023,
  FilingStatus,
} from "@/lib/tax-prep/types";

export default function ReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Tax calculation state
  const [totalIncome, setTotalIncome] = useState(0);
  const [adjustedGrossIncome, setAdjustedGrossIncome] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [taxableIncome, setTaxableIncome] = useState(0);
  const [taxBeforeCredits, setTaxBeforeCredits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [refundOrOwed, setRefundOrOwed] = useState(0);
  const [isRefund, setIsRefund] = useState(true);

  // Tax return data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [taxYear, setTaxYear] = useState(2024);

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Personal info
    setFirstName(taxReturn.form1040.taxpayer.firstName);
    setLastName(taxReturn.form1040.taxpayer.lastName);
    setFilingStatus(taxReturn.form1040.filingStatus);
    setTaxYear(taxReturn.form1040.taxYear);

    // Calculate totals
    const w2Wages = taxReturn.form1040.w2Income.reduce((sum, w2) => sum + w2.wages, 0);
    const interestIncome = taxReturn.form1040.interest1099INT.reduce(
      (sum, int) => sum + int.interestIncome,
      0
    );
    const dividendIncome = taxReturn.form1040.dividends1099DIV.reduce(
      (sum, div) => sum + div.ordinaryDividends,
      0
    );
    const capitalGains = taxReturn.form1040.capitalGains1099B.reduce(
      (sum, cg) => sum + cg.gainOrLoss,
      0
    );
    const miscIncome = taxReturn.form1040.misc1099.reduce((sum, misc) => {
      return sum +
        (misc.nonemployeeCompensation || 0) +
        (misc.rents || 0) +
        (misc.royalties || 0) +
        (misc.otherIncome || 0);
    }, 0);

    // Self-employment income (net profit)
    const selfEmploymentIncome = (taxReturn.form1040.selfEmploymentIncome || []).reduce((sum, business) => {
      const income = business.grossReceipts - business.returns + business.otherIncome;
      const expenses =
        business.advertising +
        business.carAndTruck +
        business.commissions +
        business.insurance +
        business.interest +
        business.legal +
        business.officeExpense +
        business.rent +
        business.repairs +
        business.supplies +
        business.taxes +
        business.travel +
        business.meals +
        business.utilities +
        business.wages +
        business.otherExpenses.reduce((s, e) => s + e.amount, 0);
      return sum + (income - expenses);
    }, 0);

    // Rental income (net income)
    const rentalIncome = (taxReturn.form1040.rentalIncome || []).reduce((sum, property) => {
      const expenses =
        property.advertising +
        property.auto +
        property.cleaning +
        property.commissions +
        property.insurance +
        property.legal +
        property.management +
        property.mortgage +
        property.otherInterest +
        property.repairs +
        property.supplies +
        property.taxes +
        property.utilities +
        property.depreciation +
        property.otherExpenses.reduce((s, e) => s + e.amount, 0);
      return sum + (property.rents - expenses);
    }, 0);

    const totalGrossIncome = w2Wages + interestIncome + dividendIncome + capitalGains + miscIncome + selfEmploymentIncome + rentalIncome;
    setTotalIncome(totalGrossIncome);

    // Adjustments to income
    const adjustments = taxReturn.form1040.adjustments;
    const totalAdjustments =
      adjustments.educatorExpenses +
      adjustments.businessExpenses +
      adjustments.hsaDeduction +
      adjustments.movingExpenses +
      adjustments.selfEmploymentTax +
      adjustments.selfEmployedRetirement +
      adjustments.selfEmployedHealthInsurance +
      adjustments.penalty +
      adjustments.iraDeduction +
      adjustments.studentLoanInterest +
      adjustments.tuitionAndFees;

    // AGI = Total Income - Adjustments
    const agi = totalGrossIncome - totalAdjustments;
    setAdjustedGrossIncome(agi);

    // Deduction
    let deduct = 0;
    if (taxReturn.form1040.useStandardDeduction) {
      if (taxYear === 2024) {
        deduct = STANDARD_DEDUCTIONS_2024[taxReturn.form1040.filingStatus];
      } else if (taxYear === 2023) {
        deduct = STANDARD_DEDUCTIONS_2023[taxReturn.form1040.filingStatus];
      }
    } else if (taxReturn.form1040.itemizedDeductions) {
      const itemized = taxReturn.form1040.itemizedDeductions;
      const saltCap = Math.min(
        10000,
        itemized.stateIncomeTax + itemized.realEstateTax + itemized.personalPropertyTax
      );
      deduct =
        itemized.medicalExpenses +
        saltCap +
        itemized.mortgageInterest +
        itemized.mortgagePoints +
        itemized.mortgageInsurance +
        itemized.cashContributions +
        itemized.nonCashContributions +
        itemized.casualtyLosses;
    }
    setDeduction(deduct);

    // Taxable Income
    const taxable = Math.max(0, agi - deduct);
    setTaxableIncome(taxable);

    // Tax calculation (simplified 2024 tax brackets for single filer)
    const tax = calculateTax(taxable, taxReturn.form1040.filingStatus);
    setTaxBeforeCredits(tax);

    // Credits
    const credits =
      taxReturn.form1040.credits.childTaxCredit +
      taxReturn.form1040.credits.otherDependentCredit +
      taxReturn.form1040.credits.childCareCredit +
      taxReturn.form1040.credits.educationCredits +
      taxReturn.form1040.credits.retirementSavingsCredit;
    setTotalCredits(credits);

    // Total Tax
    const finalTax = Math.max(0, tax - credits);
    setTotalTax(finalTax);

    // Payments
    const payments =
      taxReturn.form1040.payments.federalWithholding +
      taxReturn.form1040.payments.estimatedPayments +
      taxReturn.form1040.payments.refundAppliedFromPriorYear;
    setTotalPayments(payments);

    // Refund or Amount Owed
    const difference = payments - finalTax;
    setRefundOrOwed(Math.abs(difference));
    setIsRefund(difference >= 0);

    setLoading(false);
  }, [router, taxYear]);

  // Simplified tax calculation (2024 single filer rates)
  const calculateTax = (taxableIncome: number, filingStatus: FilingStatus): number => {
    // This is a simplified calculation for demonstration
    // Real calculation would use exact tax brackets and rates

    if (filingStatus === "single") {
      if (taxableIncome <= 11600) return taxableIncome * 0.10;
      if (taxableIncome <= 47150) return 1160 + (taxableIncome - 11600) * 0.12;
      if (taxableIncome <= 100525) return 5426 + (taxableIncome - 47150) * 0.22;
      if (taxableIncome <= 191950) return 17168.50 + (taxableIncome - 100525) * 0.24;
      if (taxableIncome <= 243725) return 39110.50 + (taxableIncome - 191950) * 0.32;
      if (taxableIncome <= 609350) return 55678.50 + (taxableIncome - 243725) * 0.35;
      return 183647.25 + (taxableIncome - 609350) * 0.37;
    }

    // Similar calculations for other filing statuses
    // For now, using single rates as placeholder
    return taxableIncome * 0.22; // Simplified
  };

  const handleFinalize = () => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) return;

    // Mark as complete
    if (!taxReturn.progress.completedSections.includes("review")) {
      taxReturn.progress.completedSections.push("review");
    }
    taxReturn.progress.currentStep = 7;

    saveTaxReturn(taxReturn);

    // Navigate to PDF download page
    router.push("/tax-prep/download");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Calculating your taxes...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Review Your Tax Return
        </h1>
        <p className="mt-2 text-gray-600">
          Review all information before completing your return. You can go back to
          any section to make changes.
        </p>
      </div>

      {/* Refund/Owe Banner */}
      <div
        className={`mb-8 rounded-lg p-8 ${
          isRefund ? "bg-success" : "bg-secondary"
        }`}
      >
        <div className="text-center text-white">
          <p className="text-lg font-medium">
            {isRefund ? "Estimated Refund" : "Estimated Amount Owed"}
          </p>
          <p className="mt-2 text-5xl font-bold">
            ${refundOrOwed.toLocaleString()}
          </p>
          {isRefund && (
            <p className="mt-4 text-sm opacity-90">
              You overpaid your taxes and are due a refund!
            </p>
          )}
          {!isRefund && (
            <p className="mt-4 text-sm opacity-90">
              You'll need to pay this amount by the tax deadline.
            </p>
          )}
        </div>
      </div>

      {/* Tax Calculation Breakdown */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Tax Calculation
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-gray-700">Total Income</span>
            <span className="font-semibold text-foreground">
              ${totalIncome.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-gray-700">Adjusted Gross Income (AGI)</span>
            <span className="font-semibold text-foreground">
              ${adjustedGrossIncome.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-gray-700">Deduction</span>
            <span className="font-semibold text-foreground">
              -${deduction.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-gray-700">Taxable Income</span>
            <span className="font-semibold text-foreground">
              ${taxableIncome.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-gray-700">Tax Before Credits</span>
            <span className="font-semibold text-foreground">
              ${taxBeforeCredits.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-gray-700">Total Credits</span>
            <span className="font-semibold text-success">
              -${totalCredits.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-4">
            <span className="text-lg font-semibold text-foreground">
              Total Tax
            </span>
            <span className="text-xl font-bold text-foreground">
              ${totalTax.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-gray-300 pt-3">
            <span className="text-gray-700">Total Payments & Withholding</span>
            <span className="font-semibold text-success">
              ${totalPayments.toLocaleString()}
            </span>
          </div>

          <div
            className={`flex items-center justify-between rounded-lg p-4 ${
              isRefund ? "bg-success/10" : "bg-secondary/10"
            }`}
          >
            <span className="text-lg font-semibold text-foreground">
              {isRefund ? "Refund" : "Amount Owed"}
            </span>
            <span
              className={`text-2xl font-bold ${
                isRefund ? "text-success" : "text-secondary"
              }`}
            >
              ${refundOrOwed.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Personal Information
          </h2>
          <Link
            href="/tax-prep/interview/basic-info"
            className="text-sm text-primary hover:underline"
          >
            Edit
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-gray-700">Name:</span>{" "}
            {firstName} {lastName}
          </p>
          <p>
            <span className="font-medium text-gray-700">Filing Status:</span>{" "}
            {filingStatus.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </p>
          <p>
            <span className="font-medium text-gray-700">Tax Year:</span> {taxYear}
          </p>
        </div>
      </div>

      {/* Edit Links */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/tax-prep/interview/dependents"
          className="rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-gray-50"
        >
          <h3 className="font-semibold text-foreground">Dependents</h3>
          <p className="mt-1 text-sm text-gray-600">
            Edit your dependents and credits
          </p>
        </Link>

        <Link
          href="/tax-prep/interview/w2-income"
          className="rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-gray-50"
        >
          <h3 className="font-semibold text-foreground">Income</h3>
          <p className="mt-1 text-sm text-gray-600">Edit W-2 and other income</p>
        </Link>

        <Link
          href="/tax-prep/interview/deductions"
          className="rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-gray-50"
        >
          <h3 className="font-semibold text-foreground">Deductions</h3>
          <p className="mt-1 text-sm text-gray-600">
            Edit standard or itemized deductions
          </p>
        </Link>

        <Link
          href="/tax-prep/interview/credits"
          className="rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-gray-50"
        >
          <h3 className="font-semibold text-foreground">Credits</h3>
          <p className="mt-1 text-sm text-gray-600">Edit tax credits</p>
        </Link>

        <Link
          href="/tax-prep/interview/payments"
          className="rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-gray-50"
        >
          <h3 className="font-semibold text-foreground">Payments</h3>
          <p className="mt-1 text-sm text-gray-600">
            Edit payments and withholding
          </p>
        </Link>
      </div>

      {/* Warning */}
      <div className="mb-8 rounded-lg bg-yellow-50 p-6">
        <h3 className="mb-2 font-semibold text-yellow-900">
          ⚠️ Important Reminder
        </h3>
        <p className="text-sm text-yellow-800">
          This is a simplified tax calculation for demonstration purposes. For
          complex tax situations, consider consulting a tax professional. Make sure
          all information is accurate before submitting your return to the IRS.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/tax-prep/interview/bank-info")}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleFinalize}
          className="rounded-lg bg-success px-8 py-4 text-lg font-semibold text-white hover:bg-success/90 hover:shadow-lg"
        >
          Complete Return & Generate PDF
        </button>
      </div>
    </div>
  );
}
