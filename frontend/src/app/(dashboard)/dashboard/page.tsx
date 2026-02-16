"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { userApi } from "@/lib/api/client";
import type { UserStats } from "@/lib/api/client";

/* ------------------------------------------------------------------ */
/*  AI Tips data                                                       */
/* ------------------------------------------------------------------ */
const aiTips = [
  {
    label: "CV Optimization",
    color: "text-blue-600",
    tip: "Include keywords directly from the job description in your skills section for better ATS matching.",
  },
  {
    label: "Cover Letter",
    color: "text-purple-600",
    tip: "Address the hiring manager by name to show you've researched the company.",
  },
  {
    label: "Photo Tips",
    color: "text-orange-500",
    tip: "Use a neutral, uncluttered background for headshots to keep focus on your professional presence.",
  },
];

/* ------------------------------------------------------------------ */
/*  Mock recent assets (will be replaced with API data later)          */
/* ------------------------------------------------------------------ */
const recentAssets = [
  {
    name: "Software_Engineer_CV.pdf",
    type: "CV",
    modified: "2 hours ago",
    status: "Optimized" as const,
  },
  {
    name: "Cover_Letter_Google.docx",
    type: "Cover Letter",
    modified: "1 day ago",
    status: "Optimized" as const,
  },
  {
    name: "PM_Resume_Draft.pdf",
    type: "CV",
    modified: "3 days ago",
    status: "Draft" as const,
  },
  {
    name: "Amazon_Cover_Letter.docx",
    type: "Cover Letter",
    modified: "5 days ago",
    status: "Draft" as const,
  },
];

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                            */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  iconBg,
  iconColor,
  title,
  value,
  growth,
  lastActivity,
  loading,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  value: number;
  growth: string;
  lastActivity: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div
          className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <span className={`material-symbols-outlined text-xl ${iconColor}`}>
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {loading ? "..." : value}
            </span>
            <span className="text-sm font-medium text-green-600">{growth}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4">{lastActivity}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "Optimized" | "Draft" }) {
  const classes =
    status === "Optimized"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${classes}`}
    >
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const displayName =
    profile?.displayName || user?.email?.split("@")[0] || "Alex";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userApi.getStats();
        setStats(data);
      } catch {
        /* silent */
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  /* Derive readiness score from completeness */
  const completenessFlags = stats
    ? [
        stats.completeness.has_cv,
        stats.completeness.has_letter,
        stats.completeness.has_photo,
        stats.completeness.has_application,
      ]
    : [];
  const completedCount = completenessFlags.filter(Boolean).length;
  const readinessScore = loadingStats ? 0 : Math.round((completedCount / 4) * 100);
  const remaining = 100 - readinessScore;

  return (
    <div className="space-y-8">
      {/* ── 1. Page Header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back, {displayName}
          </h2>
          <p className="text-gray-500 mt-1">
            Here&apos;s an overview of your career optimization progress.
          </p>
        </div>
        <Link
          href="/cv-optimizer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create New Asset
        </Link>
      </div>

      {/* ── 2. Top Section: Readiness + Tips ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Job Readiness Score (col-span-2) ── */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {/* header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Job Readiness Score
            </h3>
            <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 text-xs font-medium px-3 py-1">
              {readinessScore >= 80
                ? "Great Progress"
                : readinessScore >= 50
                  ? "Good Progress"
                  : "Getting Started"}
            </span>
          </div>

          {/* score */}
          <p className="text-4xl font-bold text-blue-600 mb-4">
            {loadingStats ? "..." : `${readinessScore}%`}
          </p>

          {/* progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mb-6">
            {remaining}% to reaching 100%
          </p>

          {/* action row */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Action needed</span>
            <Link
              href="/cv-optimizer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Complete Setup
            </Link>
            <button
              type="button"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* ── Quick AI Tips ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">
            Quick AI Tips
          </h3>

          <div className="flex-1 space-y-4">
            {aiTips.map((tip, i) => (
              <div key={i}>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${tip.color}`}
                >
                  {tip.label}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {tip.tip}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <Link
              href="/cv-optimizer"
              className="w-full inline-flex justify-center items-center gap-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 px-4 py-2 transition-all duration-200"
            >
              View All Insights
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. Middle Section: Quick Stats ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon="description"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          title="Total CVs Optimized"
          value={stats?.cv_count ?? 0}
          growth={`+${stats?.cv_count ? Math.min(stats.cv_count, 2) : 0}`}
          lastActivity="Last activity: 2 hours ago"
          loading={loadingStats}
        />
        <StatCard
          icon="auto_fix_high"
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          title="Cover Letters Generated"
          value={stats?.letter_count ?? 0}
          growth={`+${stats?.letter_count ? Math.min(stats.letter_count, 1) : 0}`}
          lastActivity="Last activity: 1 day ago"
          loading={loadingStats}
        />
      </div>

      {/* ── 4. Bottom Section: Recent Assets Table ──────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Assets
          </h3>
          <Link
            href="/cv-optimizer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium uppercase text-gray-500 pb-3 pr-4">
                  Asset Name
                </th>
                <th className="text-left text-xs font-medium uppercase text-gray-500 pb-3 pr-4">
                  Type
                </th>
                <th className="text-left text-xs font-medium uppercase text-gray-500 pb-3 pr-4">
                  Last Modified
                </th>
                <th className="text-left text-xs font-medium uppercase text-gray-500 pb-3 pr-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium uppercase text-gray-500 pb-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentAssets.map((asset, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400 text-lg">
                        {asset.name.endsWith(".pdf")
                          ? "picture_as_pdf"
                          : "article"}
                      </span>
                      <span className="font-medium text-gray-900">
                        {asset.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{asset.type}</td>
                  <td className="py-3 pr-4 text-gray-500">{asset.modified}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="py-3">
                    <Link
                      href="/cv-optimizer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
