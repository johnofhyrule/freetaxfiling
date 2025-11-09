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
import { PersonalInfo } from "@/lib/tax-prep/types";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
] as const;

const basicInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleInitial: z.string().max(1).optional(),
  lastName: z.string().min(1, "Last name is required"),
  ssn: z
    .string()
    .regex(/^\d{3}-?\d{2}-?\d{4}$/, "Invalid SSN format (XXX-XX-XXXX)"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  occupation: z.string().optional(),

  address: z.string().min(1, "Address is required"),
  aptUnit: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.enum(US_STATES, { required_error: "State is required" }),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),

  phoneNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

export default function BasicInfoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
  });

  useEffect(() => {
    // Load existing data
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    const { taxpayer } = taxReturn.form1040;
    if (taxpayer) {
      setValue("firstName", taxpayer.firstName || "");
      setValue("middleInitial", taxpayer.middleInitial || "");
      setValue("lastName", taxpayer.lastName || "");
      setValue("ssn", taxpayer.ssn || "");
      setValue("dateOfBirth", taxpayer.dateOfBirth || "");
      setValue("occupation", taxpayer.occupation || "");
      setValue("address", taxpayer.address || "");
      setValue("aptUnit", taxpayer.aptUnit || "");
      setValue("city", taxpayer.city || "");
      setValue("state", taxpayer.state as any);
      setValue("zipCode", taxpayer.zipCode || "");
      setValue("phoneNumber", taxpayer.phoneNumber || "");
      setValue("email", taxpayer.email || "");
    }

    setIsLoading(false);
  }, [router, setValue]);

  const onSubmit = (data: BasicInfoFormData) => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Update taxpayer info
    taxReturn.form1040.taxpayer = {
      ...data,
      middleInitial: data.middleInitial || undefined,
      occupation: data.occupation || undefined,
      aptUnit: data.aptUnit || undefined,
      phoneNumber: data.phoneNumber || undefined,
      email: data.email || undefined,
    };

    // Update progress
    if (!taxReturn.progress.completedSections.includes("basic-info")) {
      taxReturn.progress.completedSections.push("basic-info");
    }
    taxReturn.progress.currentStep = 1;

    // Save
    saveTaxReturn(taxReturn);

    // Navigate to next step
    router.push("/tax-prep/interview/dependents");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Let's start with your basic information
        </h1>
        <p className="mt-2 text-gray-600">
          This information will appear on your Form 1040. Make sure everything is
          accurate.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Personal Information
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
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
                Middle Initial
              </label>
              <input
                type="text"
                maxLength={1}
                {...register("middleInitial")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-4">
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

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Social Security Number (SSN) *
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

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Occupation
            </label>
            <input
              type="text"
              placeholder="e.g., Software Engineer"
              {...register("occupation")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Address */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Mailing Address
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            This is where the IRS will send your refund check or any correspondence.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Street Address *
            </label>
            <input
              type="text"
              {...register("address")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Apartment / Unit
            </label>
            <input
              type="text"
              placeholder="Apt 123"
              {...register("aptUnit")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mt-4 grid gap-6 md:grid-cols-6">
            <div className="md:col-span-3">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                City *
              </label>
              <input
                type="text"
                {...register("city")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                State *
              </label>
              <select
                {...register("state")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">--</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ZIP Code *
              </label>
              <input
                type="text"
                placeholder="12345"
                {...register("zipCode")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Contact Information (Optional)
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="(123) 456-7890"
                {...register("phoneNumber")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => router.push("/tax-prep")}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Save & Exit
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
