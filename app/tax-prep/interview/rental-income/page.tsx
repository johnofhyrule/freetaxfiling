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
import { RentalIncome } from "@/lib/tax-prep/types";

const rentalIncomeSchema = z.object({
  propertyAddress: z.string().min(1, "Property address is required"),
  propertyType: z.enum(["single-family", "multi-family", "vacation", "commercial", "land", "other"]),
  daysRented: z.number().min(0, "Cannot be negative").max(365, "Cannot exceed 365"),
  daysPersonalUse: z.number().min(0, "Cannot be negative").max(365, "Cannot exceed 365"),

  // Income
  rents: z.number().min(0, "Cannot be negative"),

  // Expenses
  advertising: z.number().min(0, "Cannot be negative"),
  auto: z.number().min(0, "Cannot be negative"),
  cleaning: z.number().min(0, "Cannot be negative"),
  commissions: z.number().min(0, "Cannot be negative"),
  insurance: z.number().min(0, "Cannot be negative"),
  legal: z.number().min(0, "Cannot be negative"),
  management: z.number().min(0, "Cannot be negative"),
  mortgage: z.number().min(0, "Cannot be negative"),
  otherInterest: z.number().min(0, "Cannot be negative"),
  repairs: z.number().min(0, "Cannot be negative"),
  supplies: z.number().min(0, "Cannot be negative"),
  taxes: z.number().min(0, "Cannot be negative"),
  utilities: z.number().min(0, "Cannot be negative"),
  depreciation: z.number().min(0, "Cannot be negative"),
});

type RentalIncomeFormData = z.infer<typeof rentalIncomeSchema>;

export default function RentalIncomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<RentalIncome[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showExpenses, setShowExpenses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RentalIncomeFormData>({
    resolver: zodResolver(rentalIncomeSchema),
    defaultValues: {
      propertyType: "single-family",
      daysRented: 0,
      daysPersonalUse: 0,
      rents: 0,
      advertising: 0,
      auto: 0,
      cleaning: 0,
      commissions: 0,
      insurance: 0,
      legal: 0,
      management: 0,
      mortgage: 0,
      otherInterest: 0,
      repairs: 0,
      supplies: 0,
      taxes: 0,
      utilities: 0,
      depreciation: 0,
    },
  });

  const formValues = watch();

  const calculateNetIncome = (property: RentalIncome | RentalIncomeFormData) => {
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
      property.depreciation;

    const otherExpenses = 'otherExpenses' in property
      ? property.otherExpenses.reduce((sum, e) => sum + e.amount, 0)
      : 0;

    return property.rents - expenses - otherExpenses;
  };

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    setProperties(taxReturn.form1040.rentalIncome || []);
  }, [router]);

  const handleAddProperty = (data: RentalIncomeFormData) => {
    const newProperty: RentalIncome = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      propertyAddress: data.propertyAddress,
      propertyType: data.propertyType,
      daysRented: data.daysRented,
      daysPersonalUse: data.daysPersonalUse,
      rents: data.rents,
      advertising: data.advertising,
      auto: data.auto,
      cleaning: data.cleaning,
      commissions: data.commissions,
      insurance: data.insurance,
      legal: data.legal,
      management: data.management,
      mortgage: data.mortgage,
      otherInterest: data.otherInterest,
      repairs: data.repairs,
      supplies: data.supplies,
      taxes: data.taxes,
      utilities: data.utilities,
      depreciation: data.depreciation,
      otherExpenses: [],
    };

    let updatedProperties: RentalIncome[];
    if (editingId) {
      updatedProperties = properties.map((p) => (p.id === editingId ? newProperty : p));
      setEditingId(null);
    } else {
      updatedProperties = [...properties, newProperty];
    }

    setProperties(updatedProperties);
    setIsAdding(false);
    reset();

    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.rentalIncome = updatedProperties;
      saveTaxReturn(taxReturn);
    }
  };

  const handleEditProperty = (property: RentalIncome) => {
    setIsAdding(true);
    setEditingId(property.id);
    reset(property);
    setShowExpenses(true);
  };

  const handleDeleteProperty = (id: string) => {
    if (!confirm("Are you sure you want to remove this rental property?")) return;

    const updatedProperties = properties.filter((p) => p.id !== id);
    setProperties(updatedProperties);

    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.rentalIncome = updatedProperties;
      saveTaxReturn(taxReturn);
    }
  };

  const handleContinue = () => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    if (!taxReturn.progress.completedSections.includes("rental-income")) {
      taxReturn.progress.completedSections.push("rental-income");
    }
    taxReturn.progress.currentStep = 7;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/deductions");
  };

  const totalNetIncome = properties.reduce((sum, p) => sum + calculateNetIncome(p), 0);
  const totalRentalIncome = properties.reduce((sum, p) => sum + p.rents, 0);

  const propertyTypeLabels: Record<RentalIncome["propertyType"], string> = {
    "single-family": "Single Family",
    "multi-family": "Multi-Family",
    "vacation": "Vacation/Short-term Rental",
    "commercial": "Commercial",
    "land": "Land",
    "other": "Other",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Rental Income</h1>
        <p className="mt-2 text-gray-600">
          Report income and expenses from rental properties (Schedule E).
        </p>
      </div>

      {/* Summary */}
      {properties.length > 0 && !isAdding && (
        <div className="mb-8 rounded-lg bg-primary/10 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-foreground">{properties.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Rental Income</p>
              <p className="text-2xl font-bold text-foreground">${totalRentalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Net Income</p>
              <p className={`text-2xl font-bold ${totalNetIncome >= 0 ? 'text-success' : 'text-red-600'}`}>
                ${totalNetIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Properties List */}
      {properties.length > 0 && !isAdding && (
        <div className="mb-8 space-y-4">
          {properties.map((property) => {
            const netIncome = calculateNetIncome(property);
            const totalExpenses = property.rents - netIncome;

            return (
              <div
                key={property.id}
                className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {property.propertyAddress}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {propertyTypeLabels[property.propertyType]} • {property.daysRented} days rented
                  </p>
                  <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <p className="font-medium text-gray-700">Rental Income</p>
                      <p className="text-foreground">${property.rents.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Total Expenses</p>
                      <p className="text-foreground">${totalExpenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Net Income</p>
                      <p className={netIncome >= 0 ? 'text-success font-semibold' : 'text-red-600 font-semibold'}>
                        ${netIncome.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEditProperty(property)}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
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

      {/* Add Property Form */}
      {isAdding ? (
        <form onSubmit={handleSubmit(handleAddProperty)} className="mb-8">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              {editingId ? "Edit Rental Property" : "Add Rental Property"}
            </h2>

            {/* Property Info */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium text-foreground">Property Information</h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Property Address *
                </label>
                <input
                  type="text"
                  {...register("propertyAddress")}
                  placeholder="123 Main St, City, State ZIP"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.propertyAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.propertyAddress.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Property Type *
                </label>
                <select
                  {...register("propertyType")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="single-family">Single Family Home</option>
                  <option value="multi-family">Multi-Family (2-4 units)</option>
                  <option value="vacation">Vacation/Short-term Rental</option>
                  <option value="commercial">Commercial Property</option>
                  <option value="land">Land</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Days Rented *
                  </label>
                  <input
                    type="number"
                    {...register("daysRented", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.daysRented && (
                    <p className="mt-1 text-sm text-red-600">{errors.daysRented.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Days of Personal Use
                  </label>
                  <input
                    type="number"
                    {...register("daysPersonalUse", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Income */}
            <div className="mb-6 space-y-4">
              <h3 className="font-medium text-foreground">Rental Income</h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rents Received *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("rents", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
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
                  Rental Expenses (Click to {showExpenses ? 'hide' : 'show'})
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">Auto & Travel</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("auto", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Cleaning & Maintenance</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("cleaning", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Commissions</label>
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">Legal & Professional</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("legal", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Management Fees</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("management", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Mortgage Interest</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("mortgage", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Other Interest</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("otherInterest", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Repairs</label>
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">Property Taxes</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("taxes", { valueAsNumber: true })}
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">Depreciation</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("depreciation", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-orange-50 p-3">
                  <p className="text-sm font-medium text-orange-900">
                    Estimated Net Income: ${calculateNetIncome(formValues).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
              >
                {editingId ? "Update Property" : "Add Property"}
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
            Add a Rental Property
          </button>
        </div>
      )}

      {/* Help Box */}
      <div className="mb-8 rounded-lg bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">
          About Rental Income
        </h3>
        <p className="text-sm text-blue-800">
          Report income and expenses from rental real estate. This includes long-term rentals,
          vacation rentals (Airbnb, VRBO), and commercial properties. You can deduct expenses
          related to managing and maintaining the property.
        </p>
        <p className="mt-2 text-sm font-semibold text-blue-900">
          Note: If you used the property for personal purposes for more than 14 days or 10% of
          rental days, special rules may apply.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/tax-prep/interview/self-employment")}
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
