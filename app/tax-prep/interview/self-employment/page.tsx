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
import { SelfEmploymentIncome } from "@/lib/tax-prep/types";

const selfEmploymentSchema = z.object({
  businessName: z.string().optional(),
  businessDescription: z.string().min(1, "Business description is required"),
  principalBusinessCode: z.string().optional(),

  // Income
  grossReceipts: z.number().min(0, "Cannot be negative"),
  returns: z.number().min(0, "Cannot be negative"),
  otherIncome: z.number().min(0, "Cannot be negative"),

  // Expenses
  advertising: z.number().min(0, "Cannot be negative"),
  carAndTruck: z.number().min(0, "Cannot be negative"),
  commissions: z.number().min(0, "Cannot be negative"),
  insurance: z.number().min(0, "Cannot be negative"),
  interest: z.number().min(0, "Cannot be negative"),
  legal: z.number().min(0, "Cannot be negative"),
  officeExpense: z.number().min(0, "Cannot be negative"),
  rent: z.number().min(0, "Cannot be negative"),
  repairs: z.number().min(0, "Cannot be negative"),
  supplies: z.number().min(0, "Cannot be negative"),
  taxes: z.number().min(0, "Cannot be negative"),
  travel: z.number().min(0, "Cannot be negative"),
  meals: z.number().min(0, "Cannot be negative"),
  utilities: z.number().min(0, "Cannot be negative"),
  wages: z.number().min(0, "Cannot be negative"),
});

type SelfEmploymentFormData = z.infer<typeof selfEmploymentSchema>;

export default function SelfEmploymentPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<SelfEmploymentIncome[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showExpenses, setShowExpenses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SelfEmploymentFormData>({
    resolver: zodResolver(selfEmploymentSchema),
    defaultValues: {
      grossReceipts: 0,
      returns: 0,
      otherIncome: 0,
      advertising: 0,
      carAndTruck: 0,
      commissions: 0,
      insurance: 0,
      interest: 0,
      legal: 0,
      officeExpense: 0,
      rent: 0,
      repairs: 0,
      supplies: 0,
      taxes: 0,
      travel: 0,
      meals: 0,
      utilities: 0,
      wages: 0,
    },
  });

  // Watch form values for live calculations
  const formValues = watch();

  const calculateNetProfit = (business: SelfEmploymentIncome | SelfEmploymentFormData) => {
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
      business.wages;

    const otherExpenses = 'otherExpenses' in business
      ? business.otherExpenses.reduce((sum, e) => sum + e.amount, 0)
      : 0;

    return income - expenses - otherExpenses;
  };

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    setBusinesses(taxReturn.form1040.selfEmploymentIncome || []);
  }, [router]);

  const handleAddBusiness = (data: SelfEmploymentFormData) => {
    const newBusiness: SelfEmploymentIncome = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      businessName: data.businessName,
      businessDescription: data.businessDescription,
      principalBusinessCode: data.principalBusinessCode,
      grossReceipts: data.grossReceipts,
      returns: data.returns,
      otherIncome: data.otherIncome,
      advertising: data.advertising,
      carAndTruck: data.carAndTruck,
      commissions: data.commissions,
      insurance: data.insurance,
      interest: data.interest,
      legal: data.legal,
      officeExpense: data.officeExpense,
      rent: data.rent,
      repairs: data.repairs,
      supplies: data.supplies,
      taxes: data.taxes,
      travel: data.travel,
      meals: data.meals,
      utilities: data.utilities,
      wages: data.wages,
      otherExpenses: [],
    };

    let updatedBusinesses: SelfEmploymentIncome[];
    if (editingId) {
      updatedBusinesses = businesses.map((b) => (b.id === editingId ? newBusiness : b));
      setEditingId(null);
    } else {
      updatedBusinesses = [...businesses, newBusiness];
    }

    setBusinesses(updatedBusinesses);
    setIsAdding(false);
    reset();

    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.selfEmploymentIncome = updatedBusinesses;
      saveTaxReturn(taxReturn);
    }
  };

  const handleEditBusiness = (business: SelfEmploymentIncome) => {
    setIsAdding(true);
    setEditingId(business.id);
    reset(business);
    setShowExpenses(true);
  };

  const handleDeleteBusiness = (id: string) => {
    if (!confirm("Are you sure you want to remove this business?")) return;

    const updatedBusinesses = businesses.filter((b) => b.id !== id);
    setBusinesses(updatedBusinesses);

    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.selfEmploymentIncome = updatedBusinesses;
      saveTaxReturn(taxReturn);
    }
  };

  const handleContinue = () => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    if (!taxReturn.progress.completedSections.includes("self-employment")) {
      taxReturn.progress.completedSections.push("self-employment");
    }
    taxReturn.progress.currentStep = 6;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/rental-income");
  };

  const totalNetProfit = businesses.reduce((sum, b) => sum + calculateNetProfit(b), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Self-Employment Income</h1>
        <p className="mt-2 text-gray-600">
          Report income and expenses from your business or freelance work (Schedule C).
        </p>
      </div>

      {/* Summary */}
      {businesses.length > 0 && !isAdding && (
        <div className="mb-8 rounded-lg bg-primary/10 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Total Businesses</p>
              <p className="text-2xl font-bold text-foreground">{businesses.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Net Profit</p>
              <p className={`text-2xl font-bold ${totalNetProfit >= 0 ? 'text-success' : 'text-red-600'}`}>
                ${totalNetProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Businesses List */}
      {businesses.length > 0 && !isAdding && (
        <div className="mb-8 space-y-4">
          {businesses.map((business) => {
            const netProfit = calculateNetProfit(business);
            const totalIncome = business.grossReceipts - business.returns + business.otherIncome;
            const totalExpenses = totalIncome - netProfit;

            return (
              <div
                key={business.id}
                className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {business.businessName || business.businessDescription}
                  </h3>
                  {business.businessName && (
                    <p className="text-sm text-gray-500">{business.businessDescription}</p>
                  )}
                  <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className="font-medium text-gray-700">Gross Income</p>
                      <p className="text-foreground">${totalIncome.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Total Expenses</p>
                      <p className="text-foreground">${totalExpenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Net Profit</p>
                      <p className={netProfit >= 0 ? 'text-success font-semibold' : 'text-red-600 font-semibold'}>
                        ${netProfit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEditBusiness(business)}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBusiness(business.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Business Form */}
      {isAdding ? (
        <form onSubmit={handleSubmit(handleAddBusiness)} className="mb-8">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              {editingId ? "Edit Business" : "Add Self-Employment Business"}
            </h2>

            {/* Business Info */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium text-foreground">Business Information</h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  {...register("businessName")}
                  placeholder="e.g., Smith Consulting LLC"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Business Description *
                </label>
                <input
                  type="text"
                  {...register("businessDescription")}
                  placeholder="e.g., Freelance web development"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.businessDescription && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.businessDescription.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Principal Business Code (Optional)
                </label>
                <input
                  type="text"
                  {...register("principalBusinessCode")}
                  placeholder="6-digit NAICS code"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Income */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium text-foreground">Income</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Gross Receipts *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("grossReceipts", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Returns & Allowances
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("returns", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Other Income
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("otherIncome", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">
                  Net Income: ${(formValues.grossReceipts - formValues.returns + formValues.otherIncome).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Expenses Toggle */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowExpenses(!showExpenses)}
                className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-left hover:bg-gray-100"
              >
                <span className="font-medium text-foreground">
                  Business Expenses (Click to {showExpenses ? 'hide' : 'show'})
                </span>
                <svg
                  className={`h-5 w-5 transform transition-transform ${showExpenses ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expenses */}
            {showExpenses && (
              <div className="mb-6 space-y-4">
                <h3 className="font-medium text-foreground">Expenses</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Advertising</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("advertising", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Car & Truck Expenses</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("carAndTruck", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Commissions & Fees</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("commissions", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Insurance</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("insurance", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Interest (Mortgage, Other)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("interest", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Legal & Professional</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("legal", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Office Expense</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("officeExpense", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Rent or Lease</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("rent", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Repairs & Maintenance</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("repairs", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Supplies</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("supplies", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Taxes & Licenses</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("taxes", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Travel</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("travel", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Meals (50% deductible)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("meals", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Utilities</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("utilities", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Wages (Not Including Self)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("wages", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-orange-50 p-3">
                  <p className="text-sm font-medium text-orange-900">
                    Estimated Net Profit: ${calculateNetProfit(formValues).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
              >
                {editingId ? "Update Business" : "Add Business"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setShowExpenses(false);
                  reset();
                }}
                className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 font-semibold text-gray-700 hover:border-primary hover:text-primary"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add a Business
          </button>
        </div>
      )}

      {/* Help Box */}
      <div className="mb-8 rounded-lg bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">
          About Self-Employment Income
        </h3>
        <p className="text-sm text-blue-800">
          Report income from freelancing, consulting, or running a business. This includes
          income from platforms like Uber, DoorDash, Upwork, or your own business.
          You can deduct ordinary and necessary business expenses.
        </p>
        <p className="mt-2 text-sm font-semibold text-blue-900">
          Note: Self-employment income is subject to self-employment tax (Social Security and Medicare).
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/tax-prep/interview/1099-income")}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isAdding}
            className="rounded-lg bg-secondary px-8 py-2 font-semibold text-white hover:bg-secondary/90 disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
