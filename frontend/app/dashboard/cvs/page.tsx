"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText,
  Plus,
  Clock,
  Edit3,
  Eye,
  Download,
  Copy,
  Trash2,
  MoreHorizontal,
  Search,
  LayoutGrid,
  List,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

const allCVs = [
  {
    id: 1,
    title: "Product Designer CV",
    updatedAt: "2 hours ago",
    createdAt: "Jan 15, 2026",
    atsScore: 85,
    template: "Modern",
    status: "complete" as const,
  },
  {
    id: 2,
    title: "UX Researcher Resume",
    updatedAt: "1 day ago",
    createdAt: "Jan 10, 2026",
    atsScore: 72,
    template: "Classic",
    status: "draft" as const,
  },
  {
    id: 3,
    title: "Senior PM Application",
    updatedAt: "3 days ago",
    createdAt: "Dec 28, 2025",
    atsScore: 91,
    template: "Executive",
    status: "complete" as const,
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
}

export default function CVsListPage() {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [view, setView] = useState<"grid" | "list">("list")
  const [search, setSearch] = useState("")

  const filtered = allCVs.filter((cv) =>
    cv.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#283618]">My CVs</h1>
          <p className="mt-0.5 text-sm text-[#606c38]">
            {allCVs.length} resumes created
          </p>
        </div>
        <Link
          href="/dashboard/cvs/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#dda15e] px-5 py-2.5 text-sm font-semibold text-[#283618] transition-all hover:bg-[#bc6c25] hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Create new CV
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606c38]/50" />
          <input
            type="text"
            placeholder="Search CVs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#606c38]/20 bg-white py-2 pl-9 pr-4 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
          />
        </div>
        <div className="flex items-center rounded-full border border-[#606c38]/20 bg-white p-0.5">
          <button
            onClick={() => setView("list")}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              view === "list"
                ? "bg-[#283618] text-[#fefae0]"
                : "text-[#606c38] hover:text-[#283618]"
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              view === "grid"
                ? "bg-[#283618] text-[#fefae0]"
                : "text-[#606c38] hover:text-[#283618]"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CV list */}
      {view === "list" ? (
        <div className="space-y-3">
          {filtered.map((cv, i) => (
            <motion.div
              key={cv.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="group relative flex items-center gap-4 rounded-2xl border border-[#606c38]/10 bg-white p-4 transition-all hover:shadow-md hover:border-[#dda15e]/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#606c38]/10">
                <FileText className="h-6 w-6 text-[#606c38]" />
              </div>

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
                  <span className="hidden sm:inline">Created {cv.createdAt}</span>
                </div>
              </div>

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

              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Link
                  href={`/dashboard/cvs/${cv.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38] transition-colors hover:bg-[#606c38]/10"
                  aria-label="Edit CV"
                >
                  <Edit3 className="h-4 w-4" />
                </Link>
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38] transition-colors hover:bg-[#606c38]/10"
                  aria-label="Preview CV"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={() => setOpenMenu(openMenu === cv.id ? null : cv.id)}
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
                      <Link
                        href={`/dashboard/cvs/${cv.id}`}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-[#606c38]" />
                        Edit
                      </Link>
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
          ))}

          {/* Create new card */}
          <Link
            href="/dashboard/cvs/new"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 py-8 text-sm font-semibold text-[#606c38]/60 transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5"
          >
            <Plus className="h-5 w-5" />
            Create a new CV
          </Link>
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cv, i) => (
            <motion.div
              key={cv.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="group relative overflow-hidden rounded-2xl border border-[#606c38]/10 bg-white transition-all hover:shadow-md hover:border-[#dda15e]/30"
            >
              {/* Card preview area */}
              <div className="relative flex h-40 items-center justify-center bg-[#fefae0]">
                <FileText className="h-12 w-12 text-[#606c38]/30" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 bg-[#283618]/40">
                  <Link
                    href={`/dashboard/cvs/${cv.id}`}
                    className="flex items-center gap-1.5 rounded-full bg-[#dda15e] px-4 py-2 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#fefae0]">
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                </div>
              </div>

              {/* Card info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
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
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-[#606c38]/70">
                    <Clock className="h-3 w-3" />
                    {cv.updatedAt}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Progress
                      value={cv.atsScore}
                      className="h-1.5 w-14 bg-[#606c38]/10"
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
                </div>
              </div>
            </motion.div>
          ))}

          {/* Create new card */}
          <Link
            href="/dashboard/cvs/new"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 p-8 text-sm font-semibold text-[#606c38]/60 transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5"
          >
            <Plus className="h-8 w-8" />
            Create a new CV
          </Link>
        </div>
      )}
    </div>
  )
}
