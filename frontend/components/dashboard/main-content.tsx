"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, auth } from "@/lib/firebase"
import { motion } from "framer-motion"
import {
  FileText, Plus, BarChart3, Briefcase, TrendingUp, MoreHorizontal,
  Edit3, Copy, Trash2, Download, Clock, Lightbulb, ArrowRight,
  CheckCircle, Loader2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cvApi, type CVSummary } from "@/lib/api/cv"

const tips = [
  "Add quantified achievements (numbers, percentages) to boost your ATS score by up to 20%.",
  "Tailor your CV keywords to each job description for better match rates.",
  "Keep your CV to 1-2 pages. Recruiters spend only 7 seconds on a first scan.",
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function atsColor(score: number | null) {
  if (!score) return "text-[#606c38]/40"
  if (score >= 80) return "text-[#606c38]"
  if (score >= 60) return "text-[#dda15e]"
  return "text-[#bc6c25]"
}

export function DashboardMainContent() {
  const router = useRouter()
  const [cvs, setCvs] = useState<CVSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [currentTip, setCurrentTip] = useState(0)
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({})

  const loadCvs = useCallback(() => {
    cvApi.list()
      .then(setCvs)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Wait for Firebase auth to be ready before calling API (avoids 403 on refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadCvs()
      } else {
        setIsLoading(false)
      }
    })
    return () => unsubscribe()
  }, [loadCvs])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const cv = await cvApi.create()
      router.push(`/dashboard/cvs/${cv.id}`)
    } catch {
      setCreating(false)
    }
  }

  const handleDuplicate = async (id: string) => {
    setOpenMenu(null)
    setActionLoading(prev => ({ ...prev, [id]: "duplicate" }))
    try {
      await cvApi.duplicate(id)
      const updated = await cvApi.list()
      setCvs(updated)
    } catch {} finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  const handleDownload = async (id: string) => {
    setOpenMenu(null)
    setActionLoading(prev => ({ ...prev, [id]: "download" }))
    try { await cvApi.downloadPreview(id) } catch {}
    finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  const handleDelete = async (id: string) => {
    setOpenMenu(null)
    setActionLoading(prev => ({ ...prev, [id]: "delete" }))
    try {
      await cvApi.delete(id)
      setCvs(prev => prev.filter(cv => cv.id !== id))
    } catch {}
    finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  // Computed stats
  const totalCVs = cvs.length
  const atsScores = cvs.filter(cv => cv.ats_score !== null).map(cv => cv.ats_score as number)
  const avgAts = atsScores.length > 0
    ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
    : null
  const recentCVs = cvs.slice(0, 3)

  // Onboarding progress
  const steps = [
    { text: "Create an account", done: true },
    { text: "Create your first CV", done: totalCVs > 0 },
    { text: "Run ATS analysis", done: atsScores.length > 0 },
    { text: "Apply to a job", done: false },
  ]
  const progressPct = Math.round((steps.filter(s => s.done).length / steps.length) * 100)

  const stats = [
    {
      label: "Total CVs",
      value: isLoading ? "—" : String(totalCVs),
      change: isLoading ? "" : totalCVs === 0 ? "No resumes yet" : `${totalCVs} ${totalCVs === 1 ? "resume" : "resumes"}`,
      icon: FileText,
      color: "bg-[#606c38]/10 text-[#606c38]",
      href: "/dashboard/cvs",
    },
    {
      label: "Avg. ATS Score",
      value: isLoading ? "—" : avgAts !== null ? `${avgAts}%` : "N/A",
      change: isLoading ? "" : avgAts !== null
        ? (avgAts >= 80 ? "Great score!" : avgAts >= 60 ? "Room to improve" : "Needs work")
        : "No scores yet",
      icon: BarChart3,
      color: "bg-[#dda15e]/10 text-[#dda15e]",
      href: "/dashboard/ats",
    },
    {
      label: "Applications Sent",
      value: "—",
      change: "Track in Job Tracker",
      icon: Briefcase,
      color: "bg-[#283618]/10 text-[#283618]",
      href: "/dashboard/jobs",
    },
    {
      label: "Profile Views",
      value: "—",
      change: "Connect LinkedIn",
      icon: TrendingUp,
      color: "bg-[#bc6c25]/10 text-[#bc6c25]",
      href: "/dashboard/linkedin",
    },
  ]

  return (
    <div className="min-h-full w-full space-y-6 p-4 sm:p-6 lg:p-8">

      {/* Stat strip */}
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
                <span className="text-[10px] font-medium text-[#606c38]/60">{stat.change}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-[#283618]">
                {isLoading
                  ? <span className="inline-block h-7 w-12 rounded bg-[#606c38]/10 animate-pulse" />
                  : stat.value}
              </p>
              <p className="text-xs text-[#606c38]">{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Recent CVs — 2/3 */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#283618]">Recent CVs</h2>
            <Link href="/dashboard/cvs" className="flex items-center gap-1 text-xs font-semibold text-[#dda15e] hover:text-[#bc6c25] transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-2xl bg-white border border-[#606c38]/10 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && cvs.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#606c38]/20 py-16 text-center">
              <FileText className="h-10 w-10 text-[#606c38]/20 mb-3" />
              <p className="text-sm font-semibold text-[#283618]">No CVs yet</p>
              <p className="mt-1 text-xs text-[#606c38]">Create your first CV to get started.</p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#dda15e] px-5 py-2 text-sm font-semibold text-[#283618] hover:bg-[#bc6c25] transition-colors disabled:opacity-60"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "Creating…" : "Create my first CV"}
              </button>
            </div>
          )}

          {/* CV list */}
          {!isLoading && recentCVs.length > 0 && (
            <div className="space-y-3">
              {recentCVs.map((cv, i) => (
                <Link key={cv.id} href={`/dashboard/cvs/${cv.id}`} className="block">
                  <motion.div
                    custom={i + 4}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="group relative flex items-center gap-4 rounded-2xl border border-[#606c38]/10 bg-white p-4 transition-all hover:shadow-md hover:border-[#dda15e]/30 cursor-pointer"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#606c38]/10">
                      {actionLoading[cv.id] ? (
                        <Loader2 className="h-5 w-5 text-[#606c38] animate-spin" />
                      ) : (
                        <FileText className="h-6 w-6 text-[#606c38]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-[#283618]">{cv.title}</h3>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cv.status === "complete" ? "bg-[#606c38]/10 text-[#606c38]" : "bg-[#dda15e]/10 text-[#dda15e]"}`}>
                          {cv.status === "complete" ? "Complete" : "Draft"}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-[#606c38]/70">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(cv.updated_at)}
                        </span>
                        <span>{cv.template_id} template</span>
                      </div>
                    </div>

                    {cv.ats_score !== null && (
                      <div className="hidden shrink-0 text-center sm:block">
                        <div className="flex items-center gap-2">
                          <Progress value={cv.ats_score} className="h-2 w-20 bg-[#606c38]/10" />
                          <span className={`text-xs font-bold ${atsColor(cv.ats_score)}`}>{cv.ats_score}%</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-[#606c38]/50">ATS Score</p>
                      </div>
                    )}

                    {/* Quick edit */}
                    <div className="relative z-10 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.preventDefault()}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38] transition-colors hover:bg-[#606c38]/10">
                        <Edit3 className="h-4 w-4" />
                      </div>
                    </div>

                    {/* 3-dot menu */}
                    <div className="relative z-10 shrink-0" onClick={e => e.preventDefault()}>
                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          setOpenMenu(openMenu === cv.id ? null : cv.id)
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38]/40 transition-colors hover:bg-[#606c38]/10 hover:text-[#606c38]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === cv.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                          >
                            <button onClick={() => handleDuplicate(cv.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5">
                              <Copy className="h-3.5 w-3.5 text-[#606c38]" /> Duplicate
                            </button>
                            <button onClick={() => handleDownload(cv.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5">
                              <Download className="h-3.5 w-3.5 text-[#606c38]" /> Download PDF
                            </button>
                            <button onClick={() => handleDelete(cv.id)} className="flex w-full items-center gap-2 border-t border-[#606c38]/10 px-3 py-2 text-xs text-[#bc6c25] hover:bg-red-50">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}

              {/* Create new */}
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 py-8 text-sm font-semibold text-[#606c38]/60 transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5 disabled:opacity-60"
              >
                {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                {creating ? "Creating…" : "Create a new CV"}
              </button>
            </div>
          )}
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-6">

          {/* Quick Tip */}
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
            <p className="mt-3 text-sm leading-relaxed text-[#283618]/80">{tips[currentTip]}</p>
            <button
              onClick={() => setCurrentTip((currentTip + 1) % tips.length)}
              className="mt-3 text-xs font-semibold text-[#dda15e] hover:text-[#bc6c25] transition-colors"
            >
              {"Next tip \u2192"}
            </button>
          </motion.div>

          {/* Get Started checklist */}
          <motion.div
            custom={8}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-[#606c38]/10 bg-white p-5"
          >
            <h3 className="text-sm font-bold text-[#283618]">Get Started</h3>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={progressPct} className="h-2 flex-1 bg-[#606c38]/10" />
              <span className="text-sm font-bold text-[#283618]">{progressPct}%</span>
            </div>
            <div className="mt-4 space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  {step.done ? (
                    <CheckCircle className="h-4 w-4 text-[#606c38]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-[#606c38]/20" />
                  )}
                  <span className={`text-xs ${step.done ? "text-[#606c38] line-through" : "text-[#283618]"}`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            custom={9}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl border border-[#606c38]/10 bg-white p-5"
          >
            <h3 className="text-sm font-bold text-[#283618] mb-3">Explore CVFlow</h3>
            <div className="space-y-1">
              {[
                { label: "ATS Score Checker", href: "/dashboard/ats", icon: BarChart3 },
                { label: "Cover Letter Generator", href: "/dashboard/cover-letter", icon: FileText },
                { label: "Job Tracker", href: "/dashboard/jobs", icon: Briefcase },
                { label: "Interview Prep", href: "/dashboard/interview", icon: TrendingUp },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5 transition-colors"
                >
                  <item.icon className="h-4 w-4 text-[#606c38]" />
                  {item.label}
                  <ArrowRight className="h-3 w-3 text-[#606c38]/40 ml-auto" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
