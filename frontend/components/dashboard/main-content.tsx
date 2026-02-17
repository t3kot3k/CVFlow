"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText,
  Plus,
  BarChart3,
  Briefcase,
  TrendingUp,
  MoreHorizontal,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Download,
  Clock,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

/* ──────────── Stat Cards ──────────── */
const stats = [
  {
    label: "Total CVs",
    value: "3",
    change: "+1 this week",
    icon: FileText,
    color: "bg-[#606c38]/10 text-[#606c38]",
    href: "/dashboard/cvs",
  },
  {
    label: "Avg. ATS Score",
    value: "78%",
    change: "+5% from last",
    icon: BarChart3,
    color: "bg-[#dda15e]/10 text-[#dda15e]",
    href: "/dashboard/ats",
  },
  {
    label: "Applications Sent",
    value: "12",
    change: "4 this month",
    icon: Briefcase,
    color: "bg-[#283618]/10 text-[#283618]",
    href: "/dashboard/jobs",
  },
  {
    label: "Profile Views",
    value: "47",
    change: "+18% increase",
    icon: TrendingUp,
    color: "bg-[#bc6c25]/10 text-[#bc6c25]",
    href: "/dashboard/linkedin",
  },
]

/* ──────────── Mock CVs ──────────── */
const recentCVs = [
  {
    id: 1,
    title: "Product Designer CV",
    updatedAt: "2 hours ago",
    atsScore: 85,
    template: "Modern",
    status: "complete" as const,
  },
  {
    id: 2,
    title: "UX Researcher Resume",
    updatedAt: "1 day ago",
    atsScore: 72,
    template: "Classic",
    status: "draft" as const,
  },
  {
    id: 3,
    title: "Senior PM Application",
    updatedAt: "3 days ago",
    atsScore: 91,
    template: "Executive",
    status: "complete" as const,
  },
]

/* ──────────── Activity Feed ──────────── */
const activities = [
  {
    text: "ATS score for \"Product Designer CV\" improved to 85%",
    time: "2 hours ago",
    icon: BarChart3,
  },
  {
    text: "You created \"UX Researcher Resume\"",
    time: "1 day ago",
    icon: Plus,
  },
  {
    text: "\"Senior PM Application\" was downloaded as PDF",
    time: "3 days ago",
    icon: Download,
  },
  {
    text: "You applied to Figma via Job Tracker",
    time: "5 days ago",
    icon: Briefcase,
  },
]

/* ──────────── Quick Tips ──────────── */
const tips = [
  "Add quantified achievements (numbers, percentages) to boost your ATS score by up to 20%.",
  "Tailor your CV keywords to each job description for better match rates.",
  "Keep your CV to 1-2 pages. Recruiters spend only 7 seconds on a first scan.",
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
}

export function DashboardMainContent() {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [currentTip, setCurrentTip] = useState(0)

  return (
    <div className="min-h-full w-full space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── Stat Strip ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-2xl border border-[#606c38]/10 bg-white p-5 transition-shadow hover:shadow-md hover:border-[#dda15e]/30 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-medium text-[#606c38]/60">
                  {stat.change}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-[#283618]">
                {stat.value}
              </p>
              <p className="text-xs text-[#606c38]">{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ── Two-column layout: CVs + sidebar tips ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent CVs - 2/3 */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#283618]">Recent CVs</h2>
            <Link
              href="/dashboard/cvs"
              className="flex items-center gap-1 text-xs font-semibold text-[#dda15e] transition-colors hover:text-[#bc6c25]"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCVs.map((cv, i) => (
              <Link
                key={cv.id}
                href={`/dashboard/cvs/${cv.id}`}
                className="block"
              >
              <motion.div
                custom={i + 4}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="group relative flex items-center gap-4 rounded-2xl border border-[#606c38]/10 bg-white p-4 transition-all hover:shadow-md hover:border-[#dda15e]/30 cursor-pointer"
              >
                {/* CV icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#606c38]/10">
                  <FileText className="h-6 w-6 text-[#606c38]" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-[#283618]">
                      {cv.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        cv.status === "complete"
                          ? "bg-[#606c38]/10 text-[#606c38]"
                          : "bg-[#dda15e]/10 text-[#dda15e]"
                      }`}
                    >
                      {cv.status === "complete" ? "Complete" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-[#606c38]/70">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {cv.updatedAt}
                    </span>
                    <span>{cv.template} template</span>
                  </div>
                </div>

                {/* ATS Score */}
                <div className="hidden shrink-0 text-center sm:block">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={cv.atsScore}
                      className="h-2 w-20 bg-[#606c38]/10"
                    />
                    <span
                      className={`text-xs font-bold ${
                        cv.atsScore >= 80
                          ? "text-[#606c38]"
                          : cv.atsScore >= 60
                          ? "text-[#dda15e]"
                          : "text-[#bc6c25]"
                      }`}
                    >
                      {cv.atsScore}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[#606c38]/50">
                    ATS Score
                  </p>
                </div>

                {/* Quick actions */}
                <div className="relative z-10 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.preventDefault()}>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38] transition-colors hover:bg-[#606c38]/10"
                    aria-label="Edit CV"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38] transition-colors hover:bg-[#606c38]/10"
                    aria-label="Preview CV"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* 3-dot menu */}
                <div className="relative z-10 shrink-0" onClick={(e) => e.preventDefault()}>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setOpenMenu(openMenu === cv.id ? null : cv.id)
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38]/40 transition-colors hover:bg-[#606c38]/10 hover:text-[#606c38]"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenu === cv.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                      >
                        <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5">
                          <Copy className="h-3.5 w-3.5 text-[#606c38]" />
                          Duplicate
                        </button>
                        <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5">
                          <Download className="h-3.5 w-3.5 text-[#606c38]" />
                          Download PDF
                        </button>
                        <button className="flex w-full items-center gap-2 border-t border-[#606c38]/10 px-3 py-2 text-xs text-[#bc6c25] hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
              </Link>
            ))}
          </div>

          {/* Create new card */}
          <Link
            href="/dashboard/cvs/new"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 py-8 text-sm font-semibold text-[#606c38]/60 transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5"
          >
            <Plus className="h-5 w-5" />
            Create a new CV
          </Link>
        </div>

        {/* Right column -- 1/3 */}
        <div className="space-y-6">
          {/* Quick Tip card */}
          <motion.div
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-[#dda15e]/20 bg-[#dda15e]/5 p-5"
          >
            <div className="flex items-center gap-2 text-[#dda15e]">
              <Lightbulb className="h-5 w-5" />
              <h3 className="text-sm font-bold">Quick Tip</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#283618]/80">
              {tips[currentTip]}
            </p>
            <button
              onClick={() => setCurrentTip((currentTip + 1) % tips.length)}
              className="mt-3 text-xs font-semibold text-[#dda15e] transition-colors hover:text-[#bc6c25]"
            >
              {"Next tip \u2192"}
            </button>
          </motion.div>

          {/* Activity feed */}
          <motion.div
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-[#606c38]/10 bg-white p-5"
          >
            <h3 className="text-sm font-bold text-[#283618]">
              Recent Activity
            </h3>
            <div className="mt-4 space-y-4">
              {activities.map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#606c38]/10">
                    <activity.icon className="h-4 w-4 text-[#606c38]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#283618] leading-relaxed">
                      {activity.text}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#606c38]/50">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Profile completion */}
          <motion.div
            custom={9}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-[#606c38]/10 bg-white p-5"
          >
            <h3 className="text-sm font-bold text-[#283618]">
              Profile Completion
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={65} className="h-2 flex-1 bg-[#606c38]/10" />
              <span className="text-sm font-bold text-[#283618]">65%</span>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { text: "Add work experience", done: true },
                { text: "Upload a photo", done: true },
                { text: "Add skills section", done: false },
                { text: "Write a summary", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.done ? (
                    <CheckCircle className="h-4 w-4 text-[#606c38]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-[#606c38]/20" />
                  )}
                  <span
                    className={`text-xs ${
                      item.done
                        ? "text-[#606c38] line-through"
                        : "text-[#283618]"
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
