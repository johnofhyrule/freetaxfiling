"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EligibilityFormData } from "@/lib/schemas";
import { UserProfile, MatchScore } from "@/lib/types";
import { getAllPartners } from "@/lib/data/partners";
import { matchPartnersToUser, getEligibleMatches } from "@/lib/matching";
import { trackEvent } from "@/lib/analytics";

export default function ResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Get eligibility data from sessionStorage
    const eligibilityData = sessionStorage.getItem("eligibilityData");

    if (!eligibilityData) {
      // Redirect to eligibility form if no data
      router.push("/eligibility");
      return;
    }

    const formData: EligibilityFormData = JSON.parse(eligibilityData);

    // Convert form data to UserProfile
    const profile: UserProfile = {
      agi: formData.agi,
      age: formData.age,
      state: formData.state,
      needsStateTaxReturn: formData.needsStateTaxReturn,
      filingStatus: formData.filingStatus,
      hasSchedules: formData.hasSchedules,
      needsPriorYearReturn: formData.needsPriorYearReturn,
      isMilitary: formData.isMilitary,
      isStudent: formData.isStudent,
      hasDisability: formData.hasDisability,
      preferSpanish: formData.preferSpanish,
      wantsLiveSupport: formData.wantsLiveSupport,
      wantsMobileApp: formData.wantsMobileApp,
    };

    setUserProfile(profile);

    // Run matching algorithm
    const partners = getAllPartners();
    const matchResults = matchPartnersToUser(partners, profile);
    const eligibleMatches = getEligibleMatches(matchResults);

    // Track eligibility completion with number of matches
    trackEvent({
      type: 'eligibility_completed',
      matches: eligibleMatches.length
    });

    setMatches(matchResults);
    setIsLoading(false);
  }, [router]);

  const handlePartnerClick = (partnerName: string, rank: number) => {
    trackEvent({
      type: 'partner_clicked',
      partner: partnerName,
      rank: rank,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-gray-600">Finding your matches...</p>
        </div>
      </div>
    );
  }

  const eligibleMatches = getEligibleMatches(matches);
  const topMatch = eligibleMatches[0];

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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Your Free Filing Options
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            We found {eligibleMatches.length} free filing{" "}
            {eligibleMatches.length === 1 ? "option" : "options"} that match
            your situation.
          </p>
        </div>

        {eligibleMatches.length === 0 ? (
          // No matches found
          <div className="rounded-lg bg-yellow-50 p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold text-yellow-900">
              No Matches Found
            </h2>
            <p className="mb-4 text-yellow-800">
              Unfortunately, we couldn't find any Free File partners that match
              your criteria. This might be because your AGI exceeds the limits
              or you have specific requirements that aren't met.
            </p>
            <Link
              href="/eligibility"
              className="inline-block rounded-lg bg-secondary px-6 py-3 text-white hover:bg-secondary/90"
            >
              Try Again
            </Link>
          </div>
        ) : (
          <>
            {/* Top Recommendation */}
            {topMatch && (
              <div className="mb-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 p-6 text-white shadow-lg">
                <div className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                  ⭐ Top Recommendation
                </div>
                <h2 className="mb-2 text-2xl font-bold">
                  {topMatch.partner.name}
                </h2>
                <p className="mb-4 text-blue-100">
                  {topMatch.partner.description}
                </p>
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <div className="text-sm text-blue-100">Match Score</div>
                    <div className="text-2xl font-bold">{topMatch.score}%</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-blue-100">
                      Why this is a great match:
                    </div>
                    <ul className="mt-1 text-sm">
                      {topMatch.reasons.eligible.slice(0, 3).map((reason, i) => (
                        <li key={i}>✓ {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <a
                  href={topMatch.partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handlePartnerClick(topMatch.partner.name, 1)}
                  className="inline-block rounded-lg bg-secondary px-6 py-3 font-semibold text-white hover:bg-secondary/90"
                >
                  Start Filing with {topMatch.partner.name} →
                </a>
              </div>
            )}

            {/* All Eligible Matches */}
            <div className="mb-8">
              <h3 className="mb-4 text-2xl font-bold text-foreground">
                All Your Options
              </h3>
              <div className="grid gap-6 lg:grid-cols-2">
                {eligibleMatches.map((match, index) => (
                  <div
                    key={match.partner.id}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-foreground">
                          {match.partner.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {match.partner.description}
                        </p>
                      </div>
                      <div className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        {match.score}%
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="mb-4">
                      <h5 className="mb-2 text-sm font-semibold text-gray-700">
                        Key Features
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {match.partner.highlights.map((highlight, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Why it matches */}
                    {match.reasons.eligible.length > 0 && (
                      <div className="mb-4">
                        <h5 className="mb-2 text-sm font-semibold text-green-700">
                          ✓ Why it matches
                        </h5>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {match.reasons.eligible.slice(0, 4).map((reason, i) => (
                            <li key={i}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {match.reasons.warnings.length > 0 && (
                      <div className="mb-4">
                        <h5 className="mb-2 text-sm font-semibold text-yellow-700">
                          ⚠ Things to note
                        </h5>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {match.reasons.warnings.map((warning, i) => (
                            <li key={i}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Limitations */}
                    {match.partner.limitations &&
                      match.partner.limitations.length > 0 && (
                        <div className="mb-4">
                          <h5 className="mb-2 text-sm font-semibold text-gray-700">
                            Limitations
                          </h5>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {match.partner.limitations.map((limitation, i) => (
                              <li key={i}>• {limitation}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* CTA */}
                    <a
                      href={match.partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handlePartnerClick(match.partner.name, index + 1)}
                      className="block w-full rounded-lg border-2 border-primary bg-white py-2 text-center font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      Visit {match.partner.name} →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-foreground">
                Compare Features
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 pr-4 font-semibold text-gray-900">
                        Partner
                      </th>
                      <th className="pb-3 pr-4 font-semibold text-gray-900">
                        Max AGI
                      </th>
                      <th className="pb-3 pr-4 font-semibold text-gray-900">
                        State Returns
                      </th>
                      <th className="pb-3 pr-4 font-semibold text-gray-900">
                        Live Support
                      </th>
                      <th className="pb-3 pr-4 font-semibold text-gray-900">
                        Mobile App
                      </th>
                      <th className="pb-3 font-semibold text-gray-900">
                        Spanish
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleMatches.map((match) => (
                      <tr
                        key={match.partner.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {match.partner.name}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          ${match.partner.maxAGI.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          {match.partner.supportedForms.state ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {match.partner.features.liveSupport ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-400">✗</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {match.partner.features.mobileApp ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-400">✗</span>
                          )}
                        </td>
                        <td className="py-3">
                          {match.partner.features.spanishLanguage ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-400">✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/eligibility"
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                ← Adjust Criteria
              </Link>
              <Link
                href="/"
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
              >
                Start Over
              </Link>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>
            Free File Navigator is an independent service. Not affiliated with
            the IRS.
          </p>
          <p className="mt-2">
            Always verify eligibility directly with the partner before filing.
          </p>
        </div>
      </footer>
    </div>
  );
}
