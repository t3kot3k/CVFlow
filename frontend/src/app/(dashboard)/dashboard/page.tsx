"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useCredits } from "@/contexts/credits-context";
import { creditsApi, type CreditTransaction } from "@/lib/api/client";

const aiTips = [
  {
    category: "CV Optimization",
    tip: "Ensure your skills section contains keywords directly from the job description for ATS.",
  },
  {
    category: "Photography",
    tip: "Use a neutral background for headshots to keep the focus on your professional presence.",
  },
  {
    category: "Cover Letters",
    tip: "Address the hiring manager by name to show you've done your research.",
  },
];

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { credits, isPremium } = useCredits();
  const [recentActivity, setRecentActivity] = useState<CreditTransaction[]>([]);

  const displayName =
    profile?.displayName || user?.email?.split("@")[0] || "there";

  useEffect(() => {
    if (!user) return;
    creditsApi.getHistory(5, 0).then((res) => {
      setRecentActivity(res.transactions);
    }).catch(() => {});
  }, [user]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return "Yesterday";
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[#0e121b] dark:text-white text-3xl font-black tracking-tight">
            Welcome back, {displayName}
          </h2>
          <p className="text-[#4d6599] dark:text-gray-400 text-base">
            Here&apos;s an overview of your job search progress and AI assets.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cv-tools">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create New Asset</span>
          </Link>
        </Button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Balance Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  token
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4d6599]">Credit Balance</p>
                <p className="text-3xl font-black">{credits}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/settings#credits">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Buy Credits
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Status Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`size-12 rounded-full flex items-center justify-center ${
                  isPremium
                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isPremium ? "workspace_premium" : "shield"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4d6599]">Plan</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black">
                    {isPremium ? "Pro" : "Free"}
                  </p>
                  {isPremium && (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>
              </div>
            </div>
            {!isPremium && (
              <Button className="w-full" asChild>
                <Link href="/dashboard/settings#subscription">
                  Upgrade to Pro
                </Link>
              </Button>
            )}
            {isPremium && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/settings#subscription">
                  Manage Subscription
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <h3 className="text-lg font-bold">Quick AI Tips</h3>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
              {aiTips.map((tip, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-background-light dark:bg-gray-800/50 border border-transparent hover:border-primary/20 transition-all"
                >
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    {tip.category}
                  </p>
                  <p className="text-sm text-[#0e121b] dark:text-gray-200 font-medium leading-snug">
                    {tip.tip}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity (Full Width) */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="border-b border-[#e7ebf3] dark:border-gray-800 flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="link" className="text-sm font-bold text-primary" asChild>
              <Link href="/dashboard/settings#credits">View All</Link>
            </Button>
          </CardHeader>
          {recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-background-light dark:bg-gray-800/50 text-xs font-bold text-[#4d6599] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Credits</th>
                    <th className="px-6 py-3">Balance After</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7ebf3] dark:divide-gray-800 text-sm">
                  {recentActivity.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{tx.description}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            tx.credits_delta > 0
                              ? "text-green-600 font-semibold"
                              : tx.credits_delta < 0
                              ? "text-red-500 font-semibold"
                              : "text-gray-400"
                          }
                        >
                          {tx.credits_delta > 0 ? "+" : ""}
                          {tx.credits_delta}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#4d6599]">{tx.balance_after}</td>
                      <td className="px-6 py-4 text-[#4d6599]">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <CardContent className="py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">
                history
              </span>
              <p className="text-sm text-[#4d6599]">
                No activity yet. Start by analyzing a CV or generating a cover letter!
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
