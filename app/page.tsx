import Link from "next/link";

export default function Home() {
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
