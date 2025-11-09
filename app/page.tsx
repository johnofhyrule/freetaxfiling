"use client";

import Link from "next/link";
import { useState } from "react";
import { FEATURES } from "@/lib/feature-flags";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-primary">Free File Navigator</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            {/* Alert Banner */}
            <div className="mb-8 inline-block rounded-lg bg-secondary/10 px-4 py-2">
              <p className="text-sm font-medium text-secondary">
                IRS Direct File discontinued — but free filing is still available
              </p>
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Find truly free
              <br />
              <span className="text-primary">tax filing options</span>
            </h2>

            {/* Subheadline */}
            <div className="mx-auto mt-6 w-full max-w-3xl px-4">
              <p className="text-lg text-gray-600 sm:text-xl">
                Answer a few quick questions and we'll match you with the best
                IRS Free File partner for your situation. No hidden fees, no
                surprises.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-10">
              <Link
                href="/eligibility"
                className="inline-block rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-secondary/90 hover:shadow-lg"
              >
                Find Your Free Filing Option →
              </Link>
            </div>

            {/* Tax Prep Assistant CTA (Feature Flag) */}
            {FEATURES.TAX_PREP && (
              <div className="mt-6">
                <Link
                  href="/tax-prep"
                  className="inline-block text-primary hover:underline"
                >
                  Or prepare your own taxes with our Tax Prep Assistant →
                </Link>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col items-center justify-center gap-6 text-sm text-gray-500 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>IRS Free File Partners</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Free Federal & State</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="mb-12 text-center text-2xl font-bold text-foreground sm:text-3xl">
              How it works
            </h3>
            <div className="grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  1
                </div>
                <h4 className="mb-2 text-lg font-semibold text-foreground">
                  Answer Questions
                </h4>
                <p className="text-gray-600">
                  Tell us about your income, age, state, and tax situation.
                  Takes less than 2 minutes.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  2
                </div>
                <h4 className="mb-2 text-lg font-semibold text-foreground">
                  Get Matched
                </h4>
                <p className="text-gray-600">
                  Our algorithm matches you with IRS Free File partners that
                  fit your needs.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  3
                </div>
                <h4 className="mb-2 text-lg font-semibold text-foreground">
                  File for Free
                </h4>
                <p className="text-gray-600">
                  Compare your options and start filing with your chosen
                  partner. 100% free.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section - Basecamp Style Collapsible */}
        <div className="border-t border-gray-200 bg-white py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h3 className="mb-16 text-3xl font-bold text-foreground">
              Questions & Answers
            </h3>
            <div className="divide-y divide-gray-200">
              {[
                {
                  q: "What is IRS Free File?",
                  a: "IRS Free File is a partnership between the IRS and tax software companies that offers free federal and state tax preparation for eligible taxpayers. If you meet certain income requirements, you can file your taxes completely free using brand-name tax software."
                },
                {
                  q: "Is this really 100% free?",
                  a: "Yes! If you qualify for a partner based on your AGI and other requirements, both federal and state returns are completely free. There are no hidden fees, upgrade prompts, or surprise charges. However, each partner has specific eligibility requirements, which is why we help you find the right match."
                },
                {
                  q: "How does the matching work?",
                  a: "We ask about your income, age, state, tax situation, and preferences. Our algorithm compares these against the eligibility requirements of all 8 Free File partners and shows you which ones you qualify for, ranked by how well they match your needs. You'll see a match score (0-100%) for each eligible partner."
                },
                {
                  q: "What if my income is too high?",
                  a: "Free File partners typically have AGI limits ranging from $35,000 to $79,000. If your income exceeds these limits, you won't qualify for Free File, but you may still be eligible for IRS Free File Fillable Forms (basic online forms) or commercial tax software with paid options."
                },
                {
                  q: "Do you store my tax information?",
                  a: "No. We only use your information to match you with partners. All data is stored temporarily in your browser and is never sent to our servers. When you click through to a partner, you'll create an account directly with them."
                },
                {
                  q: "Can I file previous years' tax returns?",
                  a: "Some Free File partners support prior year returns, while others only support the current tax year. Our matcher will show you which partners offer this feature if you indicate you need it. Check the partner's specific offerings for details on which years are supported."
                },
                {
                  q: "What's the difference between partners?",
                  a: "Each partner has different AGI limits, supported tax forms, features (like Spanish language support or mobile apps), and age restrictions. Some specialize in military members, students, or seniors. Our tool helps you understand these differences and find the best fit for your specific situation."
                }
              ].map((faq, index) => (
                <div key={index} className="py-8">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-start justify-between text-left"
                  >
                    <h4 className="pr-8 text-xl font-bold text-foreground">
                      {faq.q}
                    </h4>
                    <span className="flex-shrink-0 text-2xl font-light text-gray-400">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="mt-4 pr-12">
                      <p className="text-lg leading-relaxed text-gray-700">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h3 className="mb-4 text-3xl font-bold text-white">
              Ready to find your free filing option?
            </h3>
            <p className="mb-8 text-lg text-blue-100">
              Join thousands of taxpayers who've filed for free with IRS Free
              File partners.
            </p>
            <Link
              href="/eligibility"
              className="inline-block rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-secondary/90 hover:shadow-lg"
            >
              Get Started Now →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>
            Free File Navigator is an independent service. Not affiliated with
            the IRS.
          </p>
          <p className="mt-2">
            Data based on IRS Free File program requirements.
          </p>
        </div>
      </footer>
    </div>
  );
}
