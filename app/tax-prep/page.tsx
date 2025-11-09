"use client";

import Link from "next/link";
import { FEATURES } from "@/lib/feature-flags";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function TaxPrepPage() {
  // Feature flag check
  useEffect(() => {
    if (!FEATURES.TAX_PREP) {
      redirect("/");
    }
  }, []);

  if (!FEATURES.TAX_PREP) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary">
              Free File Navigator
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            {/* Alert Banner */}
            <div className="mb-8 inline-block rounded-lg bg-success/10 px-4 py-2">
              <p className="text-sm font-medium text-success">
                100% Free • Privacy-First • No E-Filing Required
              </p>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Prepare your taxes
              <br />
              <span className="text-primary">for free</span>
            </h1>

            {/* Subheadline */}
            <div className="mx-auto mt-6 w-full max-w-3xl px-4">
              <p className="text-lg text-gray-600 sm:text-xl">
                Complete your federal tax return with our step-by-step guide.
                We'll help you fill out Form 1040 and common schedules, then
                generate a PDF you can print and mail to the IRS.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-10">
              <Link
                href="/tax-prep/start"
                className="inline-block rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-secondary/90 hover:shadow-lg"
              >
                Start Your Tax Return →
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col items-center justify-center gap-6 text-sm text-gray-500 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Your data stays on your device</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>IRS-approved forms</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No income limits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl">
              What's included
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Form 1040 + Schedules
                </h3>
                <p className="text-gray-600">
                  Complete support for Form 1040 and common schedules (A, C, D,
                  E, SE). Covers most tax situations including self-employment,
                  investments, and itemized deductions.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <svg
                    className="h-6 w-6 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Privacy-First Design
                </h3>
                <p className="text-gray-600">
                  All data is stored locally on your device. Nothing is sent to
                  our servers. You maintain complete control over your sensitive
                  tax information.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <svg
                    className="h-6 w-6 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  PDF Generation
                </h3>
                <p className="text-gray-600">
                  Download IRS-ready PDFs of your completed forms. Print and
                  mail them to the IRS. No e-filing fees or restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who Is This For Section */}
        <div className="border-t border-gray-200 bg-white py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-foreground">
              Is this right for you?
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Your income is above Free File limits ($79,000 AGI)
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Free File partners have income restrictions. This tool has
                    none.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    You value privacy and want full control
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Your tax data never leaves your device. No accounts, no
                    tracking, no data mining.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    You're comfortable mailing your return
                  </h3>
                  <p className="mt-1 text-gray-600">
                    This tool doesn't e-file. You'll print and mail your
                    completed forms to the IRS.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    You need to file prior year returns
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Works for any recent tax year (2021-2024). Perfect for
                    catching up on missed filings.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-lg bg-gray-50 p-6">
              <h3 className="mb-2 font-semibold text-foreground">
                Not sure if this is right for you?
              </h3>
              <p className="text-gray-600">
                Check out our{" "}
                <Link href="/eligibility" className="text-primary hover:underline">
                  Free File Navigator
                </Link>{" "}
                to see if you qualify for free e-filing through an IRS Free File
                partner. If your income is under $79,000, you might have better
                options.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Ready to get started?
            </h2>
            <p className="mb-8 text-lg text-blue-100">
              Complete your tax return in 30-60 minutes. Save hundreds of
              dollars in filing fees.
            </p>
            <Link
              href="/tax-prep/start"
              className="inline-block rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-secondary/90 hover:shadow-lg"
            >
              Start Your Tax Return →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>
            Tax Preparation Assistant is an independent service. Not affiliated
            with the IRS.
          </p>
          <p className="mt-2">
            All tax data is stored locally on your device. We never see or
            store your information.
          </p>
        </div>
      </footer>
    </div>
  );
}
