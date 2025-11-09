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
import { Dependent } from "@/lib/tax-prep/types";

const dependentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleInitial: z.string().max(1).optional(),
  lastName: z.string().min(1, "Last name is required"),
  ssn: z
    .string()
    .regex(/^\d{3}-?\d{2}-?\d{4}$/, "Invalid SSN format (XXX-XX-XXXX)"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  relationship: z.string().min(1, "Relationship is required"),
  monthsLivedWithYou: z
    .number()
    .min(0, "Cannot be negative")
    .max(12, "Cannot exceed 12 months"),
});

type DependentFormData = z.infer<typeof dependentSchema>;

export default function DependentsPage() {
  const router = useRouter();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DependentFormData>({
    resolver: zodResolver(dependentSchema),
    defaultValues: {
      monthsLivedWithYou: 12,
    },
  });

  useEffect(() => {
    // Load existing data
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    setDependents(taxReturn.form1040.dependents || []);
  }, [router]);

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const qualifiesForChildTaxCredit = (dob: string): boolean => {
    const age = calculateAge(dob);
    return age < 17;
  };

  const handleAddDependent = (data: DependentFormData) => {
    const newDependent: Dependent = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      firstName: data.firstName,
      middleInitial: data.middleInitial || undefined,
      lastName: data.lastName,
      ssn: data.ssn,
      dateOfBirth: data.dateOfBirth,
      relationship: data.relationship,
      monthsLivedWithYou: data.monthsLivedWithYou,
      qualifiesForChildTaxCredit: qualifiesForChildTaxCredit(data.dateOfBirth),
      qualifiesForOtherDependentCredit: !qualifiesForChildTaxCredit(data.dateOfBirth),
    };

    let updatedDependents: Dependent[];
    if (editingId) {
      updatedDependents = dependents.map((d) =>
        d.id === editingId ? newDependent : d
      );
      setEditingId(null);
    } else {
      updatedDependents = [...dependents, newDependent];
    }

    setDependents(updatedDependents);
    setIsAdding(false);
    reset();

    // Auto-save
    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.dependents = updatedDependents;
      saveTaxReturn(taxReturn);
    }
  };

  const handleEditDependent = (dependent: Dependent) => {
    setIsAdding(true);
    setEditingId(dependent.id);
    setValue("firstName", dependent.firstName);
    setValue("middleInitial", dependent.middleInitial || "");
    setValue("lastName", dependent.lastName);
    setValue("ssn", dependent.ssn);
    setValue("dateOfBirth", dependent.dateOfBirth);
    setValue("relationship", dependent.relationship);
    setValue("monthsLivedWithYou", dependent.monthsLivedWithYou);
  };

  const handleDeleteDependent = (id: string) => {
    if (!confirm("Are you sure you want to remove this dependent?")) return;

    const updatedDependents = dependents.filter((d) => d.id !== id);
    setDependents(updatedDependents);

    // Auto-save
    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      taxReturn.form1040.dependents = updatedDependents;
      saveTaxReturn(taxReturn);
    }
  };

  const handleContinue = () => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Update progress
    if (!taxReturn.progress.completedSections.includes("dependents")) {
      taxReturn.progress.completedSections.push("dependents");
    }
    taxReturn.progress.currentStep = 2;

    // Save
    saveTaxReturn(taxReturn);

    // Navigate to next step
    router.push("/tax-prep/interview/w2-income");
  };

  const handleSkip = () => {
    handleContinue();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Who are your dependents?
        </h1>
        <p className="mt-2 text-gray-600">
          A dependent is a qualifying child or relative you support financially.
          Dependents can help you qualify for valuable tax credits.
        </p>
      </div>

      {/* Existing Dependents List */}
      {dependents.length > 0 && !isAdding && (
        <div className="mb-8 space-y-4">
          {dependents.map((dependent) => {
            const age = calculateAge(dependent.dateOfBirth);
            return (
              <div
                key={dependent.id}
                className="flex items-start justify-between rounded-lg bg-white p-6 shadow-sm"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {dependent.firstName} {dependent.middleInitial && `${dependent.middleInitial}. `}
                    {dependent.lastName}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Relationship:</span>{" "}
                      {dependent.relationship}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span> {age} years old
                    </p>
                    <p>
                      <span className="font-medium">Months lived with you:</span>{" "}
                      {dependent.monthsLivedWithYou}
                    </p>
                    {dependent.qualifiesForChildTaxCredit && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1">
                        <svg
                          className="h-4 w-4 text-success"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-success">
                          Qualifies for Child Tax Credit
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEditDependent(dependent)}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDependent(dependent.id)}
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

      {/* Add Dependent Form */}
      {isAdding ? (
        <form onSubmit={handleSubmit(handleAddDependent)} className="mb-8">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {editingId ? "Edit Dependent" : "Add a Dependent"}
            </h2>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...register("firstName")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    M.I.
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    {...register("middleInitial")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Social Security Number *
                  </label>
                  <input
                    type="text"
                    placeholder="XXX-XX-XXXX"
                    {...register("ssn")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.ssn && (
                    <p className="mt-1 text-sm text-red-600">{errors.ssn.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    {...register("dateOfBirth")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Relationship *
                  </label>
                  <select
                    {...register("relationship")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select relationship</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Stepchild">Stepchild</option>
                    <option value="Foster child">Foster child</option>
                    <option value="Grandchild">Grandchild</option>
                    <option value="Parent">Parent</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other relative">Other relative</option>
                  </select>
                  {errors.relationship && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.relationship.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Months Lived With You *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    {...register("monthsLivedWithYou", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.monthsLivedWithYou && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.monthsLivedWithYou.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:bg-primary/90"
              >
                {editingId ? "Update Dependent" : "Add Dependent"}
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
            Add a Dependent
          </button>
        </div>
      )}

      {/* Help Box */}
      <div className="mb-8 rounded-lg bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">
          Who qualifies as a dependent?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            • <strong>Qualifying Child:</strong> Under age 17, lived with you for
            more than half the year, and you provided more than half their support
          </li>
          <li>
            • <strong>Qualifying Relative:</strong> Related to you, lived with you
            all year OR you provided more than half their support
          </li>
          <li>
            • Children under 17 may qualify for the Child Tax Credit ($2,000 per
            child)
          </li>
          <li>
            • Other dependents may qualify for the Other Dependent Credit ($500)
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/tax-prep/interview/basic-info")}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          {dependents.length === 0 && (
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Skip (No Dependents)
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
