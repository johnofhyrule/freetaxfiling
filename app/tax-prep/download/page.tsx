"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentTaxReturn } from "@/lib/tax-prep/storage";
import { generateForm1040PDF } from "@/lib/tax-prep/pdf-generator";

export default function DownloadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    const taxReturn = getCurrentTaxReturn();
    if (!taxReturn) {
      router.push("/tax-prep/start");
      return;
    }

    // Check if return is complete
    if (!taxReturn.progress.completedSections.includes("review")) {
      router.push("/tax-prep/interview/review");
      return;
    }
  }, [router]);

  const handleDownloadPDF = async () => {
    setLoading(true);
    setError("");

    try {
      const taxReturn = getCurrentTaxReturn();
      if (!taxReturn) {
        throw new Error("No tax return found");
      }

      // Generate PDF
      const pdfBytes = await generateForm1040PDF(taxReturn);

      // Create blob and download
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Form-1040-${taxReturn.form1040.taxYear}-${taxReturn.form1040.taxpayer.lastName}.pdf`;
      link.click();

      URL.revokeObjectURL(url);

      setPdfGenerated(true);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = async () => {
    setLoading(true);
    setError("");

    try {
      const taxReturn = getCurrentTaxReturn();
      if (!taxReturn) {
        throw new Error("No tax return found");
      }

      // Generate PDF
      const pdfBytes = await generateForm1040PDF(taxReturn);

      // Create blob and open in new tab
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => URL.revokeObjectURL(url), 100);

      setPdfGenerated(true);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/tax-prep" className="text-xl font-bold text-primary">
            Tax Preparation Assistant
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          {!pdfGenerated && (
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <svg
                className="h-10 w-10 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}

          {pdfGenerated && (
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-10 w-10 text-primary"
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
          )}
        </div>

        <h1 className="text-center text-3xl font-bold text-foreground">
          {pdfGenerated ? "PDF Ready!" : "Your Return is Complete"}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600">
          {pdfGenerated
            ? "Your tax return PDF has been generated. You can download it again or print it."
            : "Generate your Form 1040 PDF to print and mail to the IRS."}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-8 rounded-lg bg-red-50 p-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            onClick={handleDownloadPDF}
            disabled={loading}
            className="flex min-w-[200px] items-center justify-center gap-3 whitespace-nowrap rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-secondary/90 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>

          <button
            onClick={handlePreviewPDF}
            disabled={loading}
            className="flex min-w-[200px] items-center justify-center gap-3 whitespace-nowrap rounded-lg border-2 border-primary px-8 py-4 text-lg font-semibold text-primary transition-all hover:bg-primary/10 disabled:opacity-50"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview PDF
          </button>
        </div>

        {/* Next Steps */}
        <div className="mt-16 rounded-lg bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Next Steps
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Print Your Return
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Print the PDF on standard 8.5" x 11" paper. Make sure all
                  information is clearly readable.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Sign Your Return
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Sign and date your tax return. If filing jointly, your spouse
                  must also sign.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Attach W-2 Forms
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Attach Copy B of all your W-2 forms to the front of your
                  return.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Mail to the IRS
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Mail your return to the IRS address for your state. Find your
                  mailing address at{" "}
                  <a
                    href="https://www.irs.gov/filing/where-to-file-paper-tax-returns-with-or-without-a-payment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    IRS.gov
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  5
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Keep a Copy
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Keep a copy of your return and all supporting documents for at
                  least 3 years.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">
            📋 Important Notice
          </h3>
          <p className="text-sm text-blue-800">
            This PDF is a simplified version of Form 1040 for demonstration
            purposes. For official IRS forms, visit{" "}
            <a
              href="https://www.irs.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              IRS.gov
            </a>
            . The tax calculation is based on 2024 tax brackets and may not
            account for all tax situations. Consult a tax professional if you
            have complex tax needs.
          </p>
        </div>

        {/* Back to Review */}
        <div className="mt-8 text-center">
          <Link
            href="/tax-prep/interview/review"
            className="text-primary hover:underline"
          >
            ← Back to Review
          </Link>
        </div>
      </main>
    </div>
  );
}
