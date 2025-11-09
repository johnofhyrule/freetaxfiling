"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentTaxReturn } from "@/lib/tax-prep/storage";
import { InterviewStep } from "@/lib/tax-prep/types";

const INTERVIEW_STEPS: Array<{
  path: string;
  label: string;
  step: InterviewStep;
}> = [
  { path: "basic-info", label: "Basic Info", step: "basic-info" },
  { path: "filing-status", label: "Filing Status", step: "filing-status" },
  { path: "dependents", label: "Dependents", step: "dependents" },
  { path: "w2-income", label: "W-2 Income", step: "w2-income" },
  { path: "1099-income", label: "1099 Income", step: "1099-income" },
  { path: "self-employment", label: "Self-Employment", step: "self-employment" },
  { path: "rental-income", label: "Rental Income", step: "rental-income" },
  { path: "deductions", label: "Deductions", step: "deductions" },
  { path: "adjustments", label: "Adjustments", step: "adjustments" },
  { path: "credits", label: "Credits", step: "credits" },
  { path: "payments", label: "Payments", step: "payments" },
  { path: "bank-info", label: "Bank Info", step: "bank-info" },
  { path: "review", label: "Review", step: "review" },
];

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [taxYear, setTaxYear] = useState<number>(2024);

  useEffect(() => {
    // Get current tax return to show progress
    const taxReturn = getCurrentTaxReturn();
    if (taxReturn) {
      setTaxYear(taxReturn.form1040.taxYear);

      // Calculate current step based on pathname
      const currentPath = pathname?.split("/").pop() || "";
      const stepIndex = INTERVIEW_STEPS.findIndex((s) => s.path === currentPath);

      if (stepIndex >= 0) {
        setCurrentStep(stepIndex + 1);
        setProgressPercent(((stepIndex + 1) / INTERVIEW_STEPS.length) * 100);
      }
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/tax-prep" className="text-xl font-bold text-primary">
                Tax Prep Assistant
              </Link>
              <p className="text-sm text-gray-500">Tax Year {taxYear}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden text-sm text-gray-600 sm:block">
                Step {currentStep} of {INTERVIEW_STEPS.length}
              </div>
              <Link
                href="/tax-prep"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Save & Exit
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer Help */}
      <footer className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>
            Your data is saved automatically to your browser.{" "}
            <Link href="/tax-prep/privacy" className="text-primary hover:underline">
              Learn about privacy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
