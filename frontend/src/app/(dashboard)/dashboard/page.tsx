"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data
const recentAssets = [
  {
    id: 1,
    name: "Senior_PM_Resume_Google.pdf",
    type: "CV",
    modifiedAt: "2h ago",
    status: "Optimized",
  },
  {
    id: 2,
    name: "Meta_Cover_Letter_V2.docx",
    type: "Cover Letter",
    modifiedAt: "1d ago",
    status: "Draft",
  },
  {
    id: 3,
    name: "Profile_Picture_Enhancement.jpg",
    type: "Photo",
    modifiedAt: "3d ago",
    status: "Enhanced",
  },
];

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
  return (
    <>
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[#0e121b] dark:text-white text-3xl font-black tracking-tight">
            Welcome back, Alex
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
        {/* Profile Readiness (Span 2) */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Job Readiness Score</h3>
              <Badge variant="success">Good Progress</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-primary">85%</span>
                <span className="text-sm text-[#4d6599]">15% to reaching 100%</span>
              </div>
              <div className="w-full bg-[#e7ebf3] dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "85%" }} />
              </div>
              <p className="text-sm text-[#4d6599] leading-relaxed">
                <span className="font-semibold text-[#0e121b] dark:text-white">
                  Action needed:
                </span>{" "}
                Complete your professional background summary to unlock personalized AI
                interview prep.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#e7ebf3] dark:border-gray-800 flex gap-4">
              <Button variant="link" className="text-sm font-bold text-primary">
                Complete Setup
              </Button>
              <Button variant="link" className="text-sm font-bold text-[#4d6599]">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <h3 className="text-lg font-bold">Quick AI Tips</h3>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
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
            <Button
              variant="outline"
              className="mt-4 w-full py-2 text-xs font-bold border-dashed"
            >
              View All Insights
            </Button>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stat 1 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="size-14 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[32px]">task_alt</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-[#4d6599]">Total CVs Optimized</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">12</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center">
                      <span className="material-symbols-outlined text-[16px]">
                        trending_up
                      </span>
                      +2
                    </p>
                  </div>
                  <p className="text-xs text-[#4d6599] mt-1">Last activity: 4 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stat 2 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="size-14 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                  <span className="material-symbols-outlined text-[32px]">mail</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-[#4d6599]">
                    Cover Letters Generated
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">8</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center">
                      <span className="material-symbols-outlined text-[16px]">
                        trending_up
                      </span>
                      +1
                    </p>
                  </div>
                  <p className="text-xs text-[#4d6599] mt-1">Last activity: Yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assets (Full Width) */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="border-b border-[#e7ebf3] dark:border-gray-800 flex flex-row items-center justify-between">
            <CardTitle>Recent Assets</CardTitle>
            <Button variant="link" className="text-sm font-bold text-primary">
              View All
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background-light dark:bg-gray-800/50 text-xs font-bold text-[#4d6599] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Asset Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Last Modified</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7ebf3] dark:divide-gray-800 text-sm">
                {recentAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold">{asset.name}</td>
                    <td className="px-6 py-4">{asset.type}</td>
                    <td className="px-6 py-4 text-[#4d6599]">{asset.modifiedAt}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          asset.status === "Optimized" || asset.status === "Enhanced"
                            ? "success"
                            : "info"
                        }
                      >
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#4d6599] hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
