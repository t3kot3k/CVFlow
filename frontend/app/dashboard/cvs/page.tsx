"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText, Plus, Clock, Edit3, Download, Copy, Trash2,
  MoreHorizontal, Search, LayoutGrid, List, Loader2, AlertCircle,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cvApi, type CVSummary } from "@/lib/api/cv"
import { ApiError } from "@/lib/api/client"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
}

function atsColor(score: number | null) {
  if (score === null) return "text-[#606c38]/40"
  if (score >= 80) return "text-[#606c38]"
  if (score >= 60) return "text-[#dda15e]"
  return "text-[#bc6c25]"
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function CVsListPage() {
  const router = useRouter()
  const [cvs, setCvs] = useState<CVSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [view, setView] = useState<"grid" | "list">("list")
  const [search, setSearch] = useState("")
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await cvApi.list()
      setCvs(data)
    } catch (err) {
      const msg = err instanceof ApiError
        ? `[${err.status}] ${err.message}`
        : String(err)
      setError(`Failed to load CVs: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // AuthGuard (in dashboard layout) already confirmed the user is logged in
  // before this component mounts — call the API directly.
  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const cv = await cvApi.create()
      router.push(`/dashboard/cvs/${cv.id}`)
    } catch {
      setCreating(false)
      setError("Failed to create CV. Please try again.")
    }
  }

  const handleDuplicate = async (id: string) => {
    setOpenMenu(null)
    setActionLoading(prev => ({ ...prev, [id]: "duplicate" }))
    try {
      await cvApi.duplicate(id)
      await load()
    } catch {
      setError("Failed to duplicate CV.")
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  const handleDownload = async (id: string) => {
    setOpenMenu(null)
    setError(null)
    setActionLoading(prev => ({ ...prev, [id]: "download" }))
    try {
      const blob = await cvApi.downloadPreview(id)
      const url = URL.createObjectURL(blob)
      const title = cvs.find(c => c.id === id)?.title ?? "cv"
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${title}.pdf`
      document.body.appendChild(a)
      a.click()
      // Defer cleanup so the browser can initiate the download before we revoke the URL
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch {
      setError("PDF download failed. Make sure the backend is running.")
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null)
    setOpenMenu(null)
    setActionLoading(prev => ({ ...prev, [id]: "delete" }))
    try {
      await cvApi.delete(id)
      setCvs(prev => prev.filter(cv => cv.id !== id))
    } catch {
      setError("Failed to delete CV.")
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  const filtered = cvs.filter(cv =>
    cv.title.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-7 w-24 rounded-lg bg-[#606c38]/10 animate-pulse" />
            <div className="mt-1 h-4 w-32 rounded bg-[#606c38]/10 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-full bg-[#dda15e]/20 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-white border border-[#606c38]/10 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4"
          >
            <h3 className="text-base font-bold text-[#283618]">Delete CV?</h3>
            <p className="mt-2 text-sm text-[#606c38]">
              This action cannot be undone. The CV will be permanently deleted.
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#606c38] border border-[#606c38]/20 hover:bg-[#606c38]/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#283618]">My CVs</h1>
          <p className="mt-0.5 text-sm text-[#606c38]">
            {cvs.length} {cvs.length === 1 ? "resume" : "resumes"} created
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-full bg-[#dda15e] px-5 py-2.5 text-sm font-semibold text-[#283618] transition-all hover:bg-[#bc6c25] hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {creating ? "Creating…" : "Create new CV"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Filters bar — only shown when there are CVs */}
      {cvs.length > 0 && <div className="flex items-center gap-3">
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
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${view === "list" ? "bg-[#283618] text-[#fefae0]" : "text-[#606c38] hover:text-[#283618]"}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${view === "grid" ? "bg-[#283618] text-[#fefae0]" : "text-[#606c38] hover:text-[#283618]"}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>}

      {/* Empty state */}
      {cvs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#606c38]/10 mb-4">
            <FileText className="h-8 w-8 text-[#606c38]/50" />
          </div>
          <h3 className="text-base font-bold text-[#283618]">No CVs yet</h3>
          <p className="mt-1 text-sm text-[#606c38]">Create your first CV to get started.</p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#dda15e] px-6 py-2.5 text-sm font-semibold text-[#283618] hover:bg-[#bc6c25] transition-colors disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {creating ? "Creating…" : "Create my first CV"}
          </button>
        </div>
      )}

      {/* No search results */}
      {cvs.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-8 w-8 text-[#606c38]/30 mb-3" />
          <p className="text-sm font-semibold text-[#283618]">No CVs match &quot;{search}&quot;</p>
          <button onClick={() => setSearch("")} className="mt-2 text-xs text-[#dda15e] hover:text-[#bc6c25]">
            Clear search
          </button>
        </div>
      )}

      {/* List view */}
      {filtered.length > 0 && view === "list" && (
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
                  <span className="hidden sm:inline">Created {formatDate(cv.created_at)}</span>
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

              {/* Quick actions (visible on hover) */}
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Link
                  href={`/dashboard/cvs/${cv.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38] transition-colors hover:bg-[#606c38]/10"
                  aria-label="Edit"
                >
                  <Edit3 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDownload(cv.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38] transition-colors hover:bg-[#606c38]/10"
                  aria-label="Download PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>

              {/* 3-dot menu */}
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
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                    >
                      <Link
                        href={`/dashboard/cvs/${cv.id}`}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-[#606c38]" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(cv.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5"
                      >
                        <Copy className="h-3.5 w-3.5 text-[#606c38]" /> Duplicate
                      </button>
                      <button
                        onClick={() => handleDownload(cv.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#283618] hover:bg-[#606c38]/5"
                      >
                        <Download className="h-3.5 w-3.5 text-[#606c38]" /> Download PDF
                      </button>
                      <button
                        onClick={() => { setOpenMenu(null); setDeleteConfirm(cv.id) }}
                        className="flex w-full items-center gap-2 border-t border-[#606c38]/10 px-3 py-2 text-xs text-[#bc6c25] hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {/* Create new card */}
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

      {/* Grid view */}
      {filtered.length > 0 && view === "grid" && (
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
              {/* Preview area */}
              <div className="relative flex h-40 items-center justify-center bg-[#fefae0]">
                {actionLoading[cv.id] ? (
                  <Loader2 className="h-8 w-8 text-[#606c38]/50 animate-spin" />
                ) : (
                  <FileText className="h-12 w-12 text-[#606c38]/30" />
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 bg-[#283618]/40">
                  <Link
                    href={`/dashboard/cvs/${cv.id}`}
                    className="flex items-center gap-1.5 rounded-full bg-[#dda15e] px-4 py-2 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDownload(cv.id)}
                    className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#fefae0]"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                </div>
              </div>

              {/* Card info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-sm font-semibold text-[#283618]">{cv.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cv.status === "complete" ? "bg-[#606c38]/10 text-[#606c38]" : "bg-[#dda15e]/10 text-[#dda15e]"}`}>
                    {cv.status === "complete" ? "Complete" : "Draft"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-[#606c38]/70">
                    <Clock className="h-3 w-3" />
                    {formatDate(cv.updated_at)}
                  </span>
                  {cv.ats_score !== null && (
                    <div className="flex items-center gap-1.5">
                      <Progress value={cv.ats_score} className="h-1.5 w-14 bg-[#606c38]/10" />
                      <span className={`text-xs font-bold ${atsColor(cv.ats_score)}`}>{cv.ats_score}%</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2 border-t border-[#606c38]/10 pt-3">
                  <button
                    onClick={() => handleDuplicate(cv.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[#606c38] hover:bg-[#606c38]/10 transition-colors"
                  >
                    <Copy className="h-3 w-3" /> Duplicate
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cv.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[#bc6c25] hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Create new card */}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 p-8 text-sm font-semibold text-[#606c38]/60 transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5 disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-8 w-8 animate-spin" /> : <Plus className="h-8 w-8" />}
            {creating ? "Creating…" : "Create a new CV"}
          </button>
        </div>
      )}
    </div>
  )
}
