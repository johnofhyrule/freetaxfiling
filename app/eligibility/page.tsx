"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  eligibilityFormSchema,
  type EligibilityFormData,
  US_STATES,
  TAX_SCHEDULES,
} from "@/lib/schemas";
import { trackEvent } from "@/lib/analytics";

export default function EligibilityPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EligibilityFormData>({
    resolver: zodResolver(eligibilityFormSchema),
    defaultValues: {
      needsStateTaxReturn: true,
      hasSchedules: [],
      needsPriorYearReturn: false,
      isMilitary: false,
      isStudent: false,
      hasDisability: false,
      preferSpanish: false,
      wantsLiveSupport: false,
      wantsMobileApp: false,
    },
  });

  // Track when user starts eligibility form
  useEffect(() => {
    trackEvent({ type: 'eligibility_started' });
  }, []);

  const onSubmit = (data: EligibilityFormData) => {
    // Store form data in sessionStorage
    sessionStorage.setItem("eligibilityData", JSON.stringify(data));
    // Navigate to results page
    router.push("/results");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-primary">
            Free File Navigator
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Find Your Match
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Answer a few questions to get matched with free filing options.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* AGI Input */}
              <div>
                <label
                  htmlFor="agi"
                  className="block text-sm font-medium text-gray-700"
                >
                  Adjusted Gross Income (AGI) *
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Find this on line 11 of your Form 1040 from last year
                </p>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    id="agi"
                    {...register("agi", { valueAsNumber: true })}
                    className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
                {errors.agi && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.agi.message}
                  </p>
                )}
              </div>

              {/* Age Input */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Age (optional)
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Some partners have age requirements
                </p>
                <input
                  type="number"
                  id="age"
                  {...register("age", { valueAsNumber: true })}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Optional"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* State Select */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State *
                </label>
                <select
                  id="state"
                  {...register("state")}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select your state</option>
                  {US_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>

              {/* Filing Status */}
              <div>
                <label
                  htmlFor="filingStatus"
                  className="block text-sm font-medium text-gray-700"
                >
                  Filing Status *
                </label>
                <select
                  id="filingStatus"
                  {...register("filingStatus")}
                  className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select filing status</option>
                  <option value="single">Single</option>
                  <option value="married-joint">Married Filing Jointly</option>
                  <option value="married-separate">
                    Married Filing Separately
                  </option>
                  <option value="head-of-household">Head of Household</option>
                  <option value="qualifying-widow">Qualifying Widow(er)</option>
                </select>
                {errors.filingStatus && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.filingStatus.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tax Situation Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Tax Situation
            </h2>

            <div className="space-y-6">
              {/* State Tax Return */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="needsStateTaxReturn"
                  {...register("needsStateTaxReturn")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="needsStateTaxReturn"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  I need to file a state tax return
                </label>
              </div>

              {/* Prior Year Return */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="needsPriorYearReturn"
                  {...register("needsPriorYearReturn")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="needsPriorYearReturn"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  I need to file a prior year return
                </label>
              </div>

              {/* Tax Schedules */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tax Schedules (select all that apply)
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Check any schedules you need to file
                </p>
                <div className="mt-3 space-y-2">
                  {TAX_SCHEDULES.map((schedule) => (
                    <div key={schedule.value} className="flex items-start">
                      <input
                        type="checkbox"
                        id={`schedule-${schedule.value}`}
                        value={schedule.value}
                        {...register("hasSchedules")}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`schedule-${schedule.value}`}
                        className="ml-3 text-sm text-gray-700"
                      >
                        {schedule.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Special Circumstances */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Special Circumstances
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="isMilitary"
                  {...register("isMilitary")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isMilitary"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  I am active military or veteran
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="isStudent"
                  {...register("isStudent")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isStudent"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  I am a student
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="hasDisability"
                  {...register("hasDisability")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="hasDisability"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  I have a disability
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Preferences (optional)
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="preferSpanish"
                  {...register("preferSpanish")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="preferSpanish"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  I prefer Spanish language support
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="wantsLiveSupport"
                  {...register("wantsLiveSupport")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="wantsLiveSupport"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  I want live customer support
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="wantsMobileApp"
                  {...register("wantsMobileApp")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="wantsMobileApp"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  I want a mobile app
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-white hover:bg-secondary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Finding matches..." : "Find My Options →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
