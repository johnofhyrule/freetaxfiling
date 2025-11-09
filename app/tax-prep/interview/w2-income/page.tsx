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
import { W2Income } from "@/lib/tax-prep/types";

const w2Schema = z.object({
  employerName: z.string().min(1, "Employer name is required"),
  employerEIN: z
    .string()
    .regex(/^\d{2}-?\d{7}$/, "Invalid EIN format (XX-XXXXXXX)"),
  wages: z.number().min(0, "Cannot be negative"),
  federalTaxWithheld: z.number().min(0, "Cannot be negative"),
  socialSecurityWages: z.number().min(0, "Cannot be negative"),
  socialSecurityTaxWithheld: z.number().min(0, "Cannot be negative"),
  medicareWages: z.number().min(0, "Cannot be negative"),
  medicareTaxWithheld: z.number().min(0, "Cannot be negative"),
  stateTaxWithheld: z.number().min(0, "Cannot be negative").optional(),
  stateWages: z.number().min(0, "Cannot be negative").optional(),
  state: z.string().optional(),
});

type W2FormData = z.infer<typeof w2Schema>;

export default function W2IncomePage() {
  const router = useRouter();
  const [w2s, setW2s] = useState<W2Income[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<W2FormData>({
    resolver: zodResolver(w2Schema),
    defaultValues: {
      wages: 0,
      federalTaxWithheld: 0,
      socialSecurityWages: 0,
      socialSecurityTaxWithheld: 0,
      medicareWages: 0,
      medicareTaxWithheld: 0,
      stateTaxWithheld: 0,
      stateWages: 0,
    },
  });

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    setW2s(taxReturn.form1040.w2Income || []);
  }, [router]);

  const handleAddW2 = (data: W2FormData) => {
    const newW2: W2Income = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      employerName: data.employerName,
      employerEIN: data.employerEIN,
      wages: data.wages,
      federalTaxWithheld: data.federalTaxWithheld,
      socialSecurityWages: data.socialSecurityWages,
      socialSecurityTaxWithheld: data.socialSecurityTaxWithheld,
      medicareWages: data.medicareWages,
      medicareTaxWithheld: data.medicareTaxWithheld,
      stateTaxWithheld: data.stateTaxWithheld,
      stateWages: data.stateWages,
      state: data.state,
    };

    let updatedW2s: W2Income[];
    if (editingId) {
      updatedW2s = w2s.map((w) => (w.id === editingId ? newW2 : w));
      setEditingId(null);
    } else {
      updatedW2s = [...w2s, newW2];
    }

    setW2s(updatedW2s);
    setIsAdding(false);
    reset();

    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.w2Income = updatedW2s;
      saveTaxReturn(taxReturn);
    }
  };

  const handleEditW2 = (w2: W2Income) => {
    setIsAdding(true);
    setEditingId(w2.id);
    setValue("employerName", w2.employerName);
    setValue("employerEIN", w2.employerEIN);
    setValue("wages", w2.wages);
    setValue("federalTaxWithheld", w2.federalTaxWithheld);
    setValue("socialSecurityWages", w2.socialSecurityWages);
    setValue("socialSecurityTaxWithheld", w2.socialSecurityTaxWithheld);
    setValue("medicareWages", w2.medicareWages);
    setValue("medicareTaxWithheld", w2.medicareTaxWithheld);
    setValue("stateTaxWithheld", w2.stateTaxWithheld || 0);
    setValue("stateWages", w2.stateWages || 0);
    setValue("state", w2.state || "");
  };

  const handleDeleteW2 = (id: string) => {
    if (!confirm("Are you sure you want to remove this W-2?")) return;

    const updatedW2s = w2s.filter((w) => w.id !== id);
    setW2s(updatedW2s);

    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.w2Income = updatedW2s;
      saveTaxReturn(taxReturn);
    }
  };

  const handleContinue = () => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    if (!taxReturn.progress.completedSections.includes("w2-income")) {
      taxReturn.progress.completedSections.push("w2-income");
    }
    taxReturn.progress.currentStep = 3;

    saveTaxReturn(taxReturn);
    router.push("/tax-prep/interview/deductions");
  };

  const totalWages = w2s.reduce((sum, w2) => sum + w2.wages, 0);
  const totalFederalWithheld = w2s.reduce((sum, w2) => sum + w2.federalTaxWithheld, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">W-2 Wage Income</h1>
        <p className="mt-2 text-gray-600">
          Enter information from your W-2 forms. Your employer provides these at
          the end of the year.
        </p>
      </div>

      {/* Summary */}
      {w2s.length > 0 && !isAdding && (
        <div className="mb-8 rounded-lg bg-primary/10 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Total Wages</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalWages.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Federal Tax Withheld</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalFederalWithheld.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing W-2s List */}
      {w2s.length > 0 && !isAdding && (
        <div className="mb-8 space-y-4">
          {w2s.map((w2) => (
            <div
              key={w2.id}
              className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {w2.employerName}
                </h3>
                <p className="text-sm text-gray-500">EIN: {w2.employerEIN}</p>
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                  <div>
                    <p className="font-medium text-gray-700">Wages (Box 1)</p>
                    <p className="text-foreground">
                      ${w2.wages.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Federal Withholding (Box 2)
                    </p>
                    <p className="text-foreground">
                      ${w2.federalTaxWithheld.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Social Security Tax (Box 4)
                    </p>
                    <p className="text-foreground">
                      ${w2.socialSecurityTaxWithheld.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <button
                  onClick={() => handleEditW2(w2)}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteW2(w2.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add W-2 Form */}
      {isAdding ? (
        <form onSubmit={handleSubmit(handleAddW2)} className="mb-8">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {editingId ? "Edit W-2" : "Add W-2 Form"}
            </h2>

            <div className="space-y-6">
              {/* Employer Info */}
              <div>
                <h3 className="mb-3 font-medium text-foreground">
                  Employer Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Employer Name *
                    </label>
                    <input
                      type="text"
                      {...register("employerName")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.employerName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.employerName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Employer ID Number (EIN) *
                    </label>
                    <input
                      type="text"
                      placeholder="XX-XXXXXXX"
                      {...register("employerEIN")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.employerEIN && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.employerEIN.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Federal Boxes */}
              <div>
                <h3 className="mb-3 font-medium text-foreground">
                  Federal Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 1 - Wages, Tips, Other Compensation *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("wages", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.wages && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.wages.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 2 - Federal Income Tax Withheld *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("federalTaxWithheld", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.federalTaxWithheld && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.federalTaxWithheld.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Security & Medicare */}
              <div>
                <h3 className="mb-3 font-medium text-foreground">
                  Social Security & Medicare
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 3 - Social Security Wages *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("socialSecurityWages", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 4 - Social Security Tax Withheld *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("socialSecurityTaxWithheld", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 5 - Medicare Wages *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("medicareWages", { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Box 6 - Medicare Tax Withheld *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("medicareTaxWithheld", {
                        valueAsNumber: true,
                      })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
              >
                {editingId ? "Update W-2" : "Add W-2"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
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
            Add a W-2
          </button>
        </div>
      )}

      {/* Help Box */}
      <div className="mb-8 rounded-lg bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">
          Where to find this information
        </h3>
        <p className="text-sm text-blue-800">
          Your W-2 form is provided by your employer, usually by January 31st. All
          the boxes are clearly labeled on the form. The most important boxes are:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• <strong>Box 1:</strong> Total wages you earned</li>
          <li>• <strong>Box 2:</strong> Federal income tax withheld</li>
          <li>• <strong>Boxes 3-6:</strong> Social Security and Medicare taxes</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/tax-prep/interview/dependents")}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          {w2s.length === 0 && (
            <button
              type="button"
              onClick={handleContinue}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Skip (No W-2 Income)
            </button>
          )}
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
