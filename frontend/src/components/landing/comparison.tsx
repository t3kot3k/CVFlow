"use client";

import { cn } from "@/lib/utils";

const comparisonRows = [
  { feature: "AI-Powered CV Analysis", recruitAI: true, others: false },
  { feature: "ATS Compatibility Score", recruitAI: true, others: "partial" },
  {
    feature: "AI Cover Letter Generation (3 tones)",
    recruitAI: true,
    others: false,
  },
  {
    feature: "AI Professional Photo Enhancement",
    recruitAI: true,
    others: false,
  },
  {
    feature: "Real-Time Application Tracking",
    recruitAI: true,
    others: false,
  },
  {
    feature: "Recruiter-Tested CV Templates",
    recruitAI: true,
    others: true,
  },
  {
    feature: "Personalized Keyword Suggestions",
    recruitAI: true,
    others: false,
  },
  { feature: "Free Plan Available", recruitAI: true, others: "partial" },
];

export function Comparison() {
  return (
    <section
      className="px-6 lg:px-40 py-20 bg-white dark:bg-background-dark/50"
      id="compare"
    >
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Comparison
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Recruit AI and not another tool?
          </h2>
          <p className="text-[#4d6599] dark:text-gray-400">
            See how we compare to generic CV builders and job search tools.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_120px] min-w-[500px] bg-gray-50 dark:bg-[#1c2231] px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-bold text-[#4d6599] dark:text-gray-400">
              Feature
            </span>
            <span className="text-sm font-bold text-primary text-center">
              Recruit AI
            </span>
            <span className="text-sm font-bold text-[#4d6599] dark:text-gray-400 text-center">
              Others
            </span>
          </div>

          {/* Table rows */}
          {comparisonRows.map((row, index) => (
            <div
              key={row.feature}
              className={cn(
                "grid grid-cols-[1fr_120px_120px] min-w-[500px] px-6 py-4 items-center",
                index < comparisonRows.length - 1 &&
                  "border-b border-gray-100 dark:border-gray-800"
              )}
            >
              <span className="text-sm font-medium">{row.feature}</span>
              <div className="flex justify-center">
                <span
                  className="material-symbols-outlined text-green-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div className="flex justify-center">
                {row.others === true ? (
                  <span
                    className="material-symbols-outlined text-green-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                ) : row.others === "partial" ? (
                  <span
                    className="material-symbols-outlined text-yellow-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    remove_circle
                  </span>
                ) : (
                  <span
                    className="material-symbols-outlined text-red-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    cancel
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
