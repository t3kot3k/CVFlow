"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import {
  ClipboardList,
  Plus,
  Search,
  Chrome,
  X,
  GripVertical,
  MoreHorizontal,
  MapPin,
  Clock,
  Briefcase,
  Video,
  Building,
  PartyPopper,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  FileText,
  Sparkles,
  Mail,
  Mic,
  MessageSquare,
  Calendar,
  Send,
  Edit3,
  Trash2,
  LinkIcon,
} from "lucide-react"

/* ──────────── Types ──────────── */
type Stage = "saved" | "applied" | "interview" | "offer" | "rejected"

interface Job {
  id: number
  company: string
  initial: string
  color: string
  role: string
  location: string
  dateLabel: string
  tags: string[]
  stage: Stage
  atsMatch?: number
  salary?: string
  interviewDate?: string
  interviewType?: string
  countdown?: string
  daysWaiting?: number
}

/* ──────────── Mock Data ──────────── */
const initialJobs: Job[] = [
  // SAVED
  { id: 1, company: "Deloitte", initial: "D", color: "bg-[#86BC25]", role: "Senior Consultant", location: "Paris, France", dateLabel: "Saved 2 days ago", tags: ["Consulting", "France"], stage: "saved", atsMatch: 78 },
  { id: 2, company: "Spotify", initial: "S", color: "bg-[#1DB954]", role: "Product Designer", location: "Stockholm, Sweden", dateLabel: "Saved 4 days ago", tags: ["Tech", "Sweden"], stage: "saved", atsMatch: 82 },
  { id: 3, company: "McKinsey", initial: "M", color: "bg-[#003366]", role: "Business Analyst", location: "London, UK", dateLabel: "Saved 1 week ago", tags: ["Consulting", "UK"], stage: "saved" },
  { id: 4, company: "Airbnb", initial: "A", color: "bg-[#FF5A5F]", role: "UX Researcher", location: "Remote", dateLabel: "Saved 3 days ago", tags: ["Tech", "Remote"], stage: "saved", atsMatch: 65 },
  { id: 5, company: "BMW", initial: "B", color: "bg-[#0066B1]", role: "Data Analyst", location: "Munich, Germany", dateLabel: "Saved 5 days ago", tags: ["Automotive", "Germany"], stage: "saved" },
  { id: 6, company: "LVMH", initial: "L", color: "bg-[#8B6914]", role: "Marketing Manager", location: "Paris, France", dateLabel: "Saved 1 day ago", tags: ["Luxury", "France"], stage: "saved", atsMatch: 91 },
  // APPLIED
  { id: 7, company: "Google", initial: "G", color: "bg-[#4285F4]", role: "Frontend Engineer", location: "Dublin, Ireland", dateLabel: "Applied Jan 15", tags: ["Tech", "Ireland"], stage: "applied", atsMatch: 88, daysWaiting: 12 },
  { id: 8, company: "Figma", initial: "F", color: "bg-[#A259FF]", role: "Product Designer", location: "San Francisco, USA", dateLabel: "Applied Jan 18", tags: ["Design", "USA"], stage: "applied", atsMatch: 74, daysWaiting: 9 },
  { id: 9, company: "Stripe", initial: "S", color: "bg-[#635BFF]", role: "Technical PM", location: "Remote", dateLabel: "Applied Jan 10", tags: ["Fintech", "Remote"], stage: "applied", daysWaiting: 17 },
  { id: 10, company: "Netflix", initial: "N", color: "bg-[#E50914]", role: "Content Strategist", location: "Amsterdam, NL", dateLabel: "Applied Jan 20", tags: ["Media", "Netherlands"], stage: "applied", daysWaiting: 7 },
  { id: 11, company: "Shopify", initial: "S", color: "bg-[#96BF48]", role: "Growth Lead", location: "Remote", dateLabel: "Applied Jan 8", tags: ["E-commerce", "Remote"], stage: "applied", daysWaiting: 19 },
  { id: 12, company: "Notion", initial: "N", color: "bg-[#000000]", role: "Design Engineer", location: "New York, USA", dateLabel: "Applied Jan 22", tags: ["Tech", "USA"], stage: "applied", atsMatch: 85, daysWaiting: 5 },
  { id: 13, company: "Revolut", initial: "R", color: "bg-[#0075EB]", role: "Risk Analyst", location: "London, UK", dateLabel: "Applied Jan 12", tags: ["Fintech", "UK"], stage: "applied", daysWaiting: 15 },
  { id: 14, company: "Canva", initial: "C", color: "bg-[#00C4CC]", role: "UX Writer", location: "Sydney, Australia", dateLabel: "Applied Jan 5", tags: ["Design", "Australia"], stage: "applied", daysWaiting: 22 },
  // INTERVIEW
  { id: 15, company: "Meta", initial: "M", color: "bg-[#0668E1]", role: "Product Manager", location: "London, UK", dateLabel: "Interview scheduled", tags: ["Tech", "UK"], stage: "interview", interviewDate: "Feb 20, 14:00", interviewType: "Video call", countdown: "In 3 days" },
  { id: 16, company: "Amazon", initial: "A", color: "bg-[#FF9900]", role: "Solutions Architect", location: "Berlin, Germany", dateLabel: "Interview scheduled", tags: ["Cloud", "Germany"], stage: "interview", interviewDate: "Feb 25, 10:00", interviewType: "On-site", countdown: "In 8 days" },
  { id: 17, company: "Salesforce", initial: "S", color: "bg-[#00A1E0]", role: "Account Executive", location: "Paris, France", dateLabel: "Interview scheduled", tags: ["SaaS", "France"], stage: "interview", interviewDate: "Feb 18, 16:30", interviewType: "Video call", countdown: "Tomorrow" },
  // OFFER
  { id: 18, company: "Microsoft", initial: "M", color: "bg-[#00A4EF]", role: "Senior PM", location: "Dublin, Ireland", dateLabel: "Offer received!", tags: ["Tech", "Ireland"], stage: "offer", salary: "\u20AC72,000/year" },
  { id: 19, company: "Accenture", initial: "A", color: "bg-[#A100FF]", role: "Strategy Consultant", location: "Paris, France", dateLabel: "Offer received!", tags: ["Consulting", "France"], stage: "offer", salary: "\u20AC52,000/year" },
  // REJECTED
  { id: 20, company: "Apple", initial: "A", color: "bg-gray-400", role: "iOS Developer", location: "Cupertino, USA", dateLabel: "Rejected Feb 1", tags: ["Tech", "USA"], stage: "rejected" },
  { id: 21, company: "Tesla", initial: "T", color: "bg-gray-400", role: "Energy Analyst", location: "Berlin, Germany", dateLabel: "Rejected Jan 28", tags: ["Auto", "Germany"], stage: "rejected" },
  { id: 22, company: "Uber", initial: "U", color: "bg-gray-400", role: "Operations Lead", location: "Amsterdam, NL", dateLabel: "Rejected Jan 25", tags: ["Mobility", "NL"], stage: "rejected" },
  { id: 23, company: "Twitter", initial: "X", color: "bg-gray-400", role: "Data Scientist", location: "Remote", dateLabel: "Rejected Feb 3", tags: ["Tech", "Remote"], stage: "rejected" },
  { id: 24, company: "Palantir", initial: "P", color: "bg-gray-400", role: "Forward Deploy", location: "London, UK", dateLabel: "Rejected Jan 20", tags: ["Data", "UK"], stage: "rejected" },
  { id: 25, company: "Snap", initial: "S", color: "bg-gray-400", role: "AR Engineer", location: "LA, USA", dateLabel: "Rejected Jan 15", tags: ["Social", "USA"], stage: "rejected" },
  { id: 26, company: "Lyft", initial: "L", color: "bg-gray-400", role: "Product Analyst", location: "San Francisco, USA", dateLabel: "Rejected Jan 10", tags: ["Mobility", "USA"], stage: "rejected" },
  { id: 27, company: "Coinbase", initial: "C", color: "bg-gray-400", role: "Compliance Lead", location: "Remote", dateLabel: "Rejected Jan 30", tags: ["Crypto", "Remote"], stage: "rejected" },
  { id: 28, company: "Zoom", initial: "Z", color: "bg-gray-400", role: "Solutions Eng.", location: "Remote", dateLabel: "Rejected Feb 5", tags: ["Video", "Remote"], stage: "rejected" },
]

const stageConfig: Record<Stage, { label: string; borderColor: string }> = {
  saved: { label: "SAVED", borderColor: "border-gray-200" },
  applied: { label: "APPLIED", borderColor: "border-[#dda15e]" },
  interview: { label: "INTERVIEW", borderColor: "border-[#606c38]" },
  offer: { label: "OFFER", borderColor: "border-[#283618]" },
  rejected: { label: "REJECTED / CLOSED", borderColor: "border-gray-200" },
}

const stageOrder: Stage[] = ["saved", "applied", "interview", "offer", "rejected"]

/* ──────────── Component ──────────── */
export default function JobTrackerPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStage, setFilterStage] = useState<string>("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [detailTab, setDetailTab] = useState<"overview" | "notes" | "timeline">("overview")
  const [showAddModal, setShowAddModal] = useState(false)
  const [noteText, setNoteText] = useState("Met the recruiter at a career fair in Paris. She mentioned the team is growing fast and they need someone with consulting + tech background.\n\nFollow-up email sent on Jan 20.")
  const [draggedJob, setDraggedJob] = useState<Job | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  /* filters */
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      !searchQuery ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStage = filterStage === "all" || j.stage === filterStage
    return matchesSearch && matchesStage
  })

  const jobsByStage = (stage: Stage) => filteredJobs.filter((j) => j.stage === stage)

  /* stats */
  const totalJobs = jobs.length
  const appliedCount = jobs.filter((j) => j.stage === "applied").length
  const interviewCount = jobs.filter((j) => j.stage === "interview").length
  const offerCount = jobs.filter((j) => j.stage === "offer").length
  const responseRate = totalJobs > 0 ? Math.round(((interviewCount + offerCount) / totalJobs) * 100) : 0

  /* drag & drop */
  const handleDragStart = (job: Job) => setDraggedJob(job)
  const handleDragEnd = () => setDraggedJob(null)
  const handleDrop = (targetStage: Stage) => {
    if (!draggedJob) return
    setJobs((prev) =>
      prev.map((j) => (j.id === draggedJob.id ? { ...j, stage: targetStage } : j))
    )
    setDraggedJob(null)
  }

  return (
    <div className="flex h-screen flex-col bg-[#fefae0]">
      {/* ══════════ TOP BAR ══════════ */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#606c38]/10 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#606c38] hover:text-[#283618] transition-colors lg:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link href="/dashboard" className="hidden lg:block text-[#606c38] hover:text-[#283618] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <ClipboardList className="h-5 w-5 text-[#606c38]" />
          <h1 className="text-base font-bold text-[#283618]">Job Tracker</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#dda15e] px-3 py-1.5 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] sm:px-4 sm:text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add application</span>
          </button>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="appearance-none rounded-full border border-[#606c38]/20 bg-white py-1.5 pl-3 pr-8 text-xs text-[#283618] outline-none focus:border-[#dda15e] focus:ring-1 focus:ring-[#dda15e]/30"
            >
              <option value="all">All stages</option>
              {stageOrder.map((s) => (
                <option key={s} value={s}>{stageConfig[s].label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#606c38]" />
          </div>

          {/* Search */}
          <div className="hidden items-center gap-1.5 rounded-full border border-[#606c38]/20 bg-[#fefae0] px-3 py-1.5 sm:flex">
            <Search className="h-3.5 w-3.5 text-[#606c38]" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 border-none bg-transparent text-xs text-[#283618] outline-none placeholder:text-[#606c38]/50"
            />
          </div>

          <Link
            href="#"
            className="hidden items-center gap-1 text-xs text-[#606c38] transition-colors hover:text-[#dda15e] lg:flex"
          >
            <Chrome className="h-3.5 w-3.5" />
            {"Get Chrome Extension \u2192"}
          </Link>
        </div>
      </header>

      {/* ══════════ STATS BAR ══════════ */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-[#606c38]/10 bg-white px-4 py-2.5 text-xs text-[#606c38] sm:gap-3 sm:px-6 sm:py-3 sm:text-sm">
        <span className="font-medium text-[#283618]">{totalJobs} total</span>
        <span className="text-[#606c38]/30">{"\u00B7"}</span>
        <span>{appliedCount} applied</span>
        <span className="text-[#606c38]/30">{"\u00B7"}</span>
        <span>{interviewCount} interviews</span>
        <span className="text-[#606c38]/30">{"\u00B7"}</span>
        <span>{offerCount} offers</span>
        <span className="text-[#606c38]/30">{"\u00B7"}</span>
        <span>
          Response rate: <span className="font-semibold text-[#dda15e]">{responseRate}%</span>
        </span>
      </div>

      {/* ══════════ KANBAN BOARD ══════════ */}
      <div ref={boardRef} className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6">
        <div className="flex h-full gap-4" style={{ minWidth: stageOrder.length * 296 }}>
          {stageOrder.map((stage) => {
            const stageJobs = jobsByStage(stage)
            return (
              <div
                key={stage}
                className="flex h-full w-[280px] shrink-0 flex-col"
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("bg-[#dda15e]/5"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("bg-[#dda15e]/5")}
                onDrop={(e) => { e.currentTarget.classList.remove("bg-[#dda15e]/5"); handleDrop(stage); }}
              >
                {/* Column header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#606c38]">
                      {stageConfig[stage].label}
                    </span>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#283618] px-1.5 text-[10px] font-semibold text-[#fefae0]">
                      {stageJobs.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-[10px] font-medium text-[#606c38] transition-colors hover:text-[#dda15e]"
                  >
                    + Add
                  </button>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-2">
                  {stageJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      draggable
                      onDragStart={() => handleDragStart(job)}
                      onDragEnd={handleDragEnd}
                      onClick={() => { setSelectedJob(job); setDetailTab("overview"); }}
                      className={`group cursor-pointer rounded-2xl border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                        stageConfig[stage].borderColor
                      } ${stage === "interview" ? "shadow-md" : ""} ${
                        stage === "rejected" ? "opacity-60" : ""
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${job.color}`}>
                            {job.initial}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#283618]">{job.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <GripVertical className="h-3.5 w-3.5 text-[#606c38]/30 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity" />
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 flex items-center justify-center rounded-md text-[#606c38]/40 hover:bg-[#606c38]/10 hover:text-[#606c38] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Role */}
                      <p className="mt-1.5 text-sm text-[#606c38]">{job.role}</p>

                      {/* Location + Date */}
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-400">{job.dateLabel}</p>

                      {/* Tags */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#fefae0] px-2 py-0.5 text-[10px] text-[#606c38]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stage-specific content */}
                      {stage === "saved" && (
                        <div className="mt-3 flex items-center justify-between">
                          {job.atsMatch && (
                            <span className="text-[11px] text-[#dda15e] font-medium">
                              CV match: {job.atsMatch}%
                            </span>
                          )}
                          <span className="text-[11px] text-[#606c38] hover:text-[#dda15e] cursor-pointer transition-colors">
                            {"Apply now \u2192"}
                          </span>
                        </div>
                      )}

                      {stage === "applied" && (
                        <div className="mt-3 space-y-1">
                          {job.daysWaiting && job.daysWaiting > 10 && (
                            <p className="text-[11px] font-medium text-[#bc6c25]">
                              Days waiting: {job.daysWaiting}
                            </p>
                          )}
                          {job.daysWaiting && job.daysWaiting <= 10 && (
                            <p className="text-[11px] text-gray-400">
                              Days waiting: {job.daysWaiting}
                            </p>
                          )}
                          <span className="text-[11px] text-[#dda15e] cursor-pointer hover:text-[#bc6c25] transition-colors">
                            {"Send follow-up \u2709\uFE0F"}
                          </span>
                        </div>
                      )}

                      {stage === "interview" && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-semibold text-[#283618]">
                            {job.interviewDate}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-[#606c38]/10 px-2 py-0.5 text-[10px] text-[#606c38]">
                              {job.interviewType === "Video call" ? (
                                <Video className="h-3 w-3" />
                              ) : (
                                <Building className="h-3 w-3" />
                              )}
                              {job.interviewType}
                            </span>
                            <span className="text-[11px] font-medium text-[#dda15e]">
                              {job.countdown}
                            </span>
                          </div>
                          <button className="flex items-center gap-1 rounded-full bg-[#606c38] px-3 py-1 text-[10px] font-semibold text-[#fefae0] transition-colors hover:bg-[#283618]">
                            <Mic className="h-3 w-3" />
                            {"Practice interview \u2192"}
                          </button>
                        </div>
                      )}

                      {stage === "offer" && (
                        <div className="mt-3 space-y-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#606c38] px-2 py-0.5 text-[10px] font-semibold text-[#fefae0]">
                            <PartyPopper className="h-3 w-3" />
                            Offer received!
                          </span>
                          {job.salary && (
                            <p className="flex items-center gap-1 text-sm font-semibold text-[#283618]">
                              <DollarSign className="h-3.5 w-3.5 text-[#606c38]" />
                              {job.salary}
                            </p>
                          )}
                          <div className="flex gap-2 text-[11px]">
                            <span className="text-[#606c38] hover:text-[#dda15e] cursor-pointer transition-colors">
                              {"View offer details \u2192"}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#606c38] hover:text-[#dda15e] cursor-pointer transition-colors">
                            {"Compare salaries \u2192"}
                          </span>
                        </div>
                      )}

                      {stage === "rejected" && (
                        <div className="mt-2">
                          <span className="text-[11px] text-[#606c38] hover:text-[#dda15e] cursor-pointer transition-colors">
                            {"Get feedback? \u2192"}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════ CARD DETAIL SLIDE-IN ══════════ */}
      <AnimatePresence>
        {selectedJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setSelectedJob(null)}
            />
            <motion.aside
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[480px] flex-col bg-white shadow-2xl"
            >
              {/* Detail Header */}
              <div className="flex items-center justify-between border-b border-[#606c38]/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold ${selectedJob.color}`}>
                    {selectedJob.initial}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#283618]">{selectedJob.company}</h2>
                    <p className="text-sm text-[#606c38]">{selectedJob.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38]/50 transition-colors hover:bg-[#606c38]/10 hover:text-[#283618]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#606c38]/10 px-6">
                {(["overview", "notes", "timeline"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                      detailTab === tab
                        ? "border-[#dda15e] text-[#283618]"
                        : "border-transparent text-[#606c38]/60 hover:text-[#283618]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-6">
                {detailTab === "overview" && (
                  <div className="space-y-6">
                    {/* Company info */}
                    <div className="rounded-xl border border-[#606c38]/10 p-4 space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#606c38]">Company Info</h3>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold ${selectedJob.color}`}>
                          {selectedJob.initial}
                        </div>
                        <div>
                          <p className="font-semibold text-[#283618]">{selectedJob.company}</p>
                          <p className="text-xs text-[#606c38]">{selectedJob.tags[0]} industry</p>
                        </div>
                      </div>
                    </div>

                    {/* Job details */}
                    <div className="rounded-xl border border-[#606c38]/10 p-4 space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#606c38]">Job Details</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] uppercase text-[#606c38]/60">Role</p>
                          <p className="font-medium text-[#283618]">{selectedJob.role}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-[#606c38]/60">Location</p>
                          <p className="font-medium text-[#283618]">{selectedJob.location}</p>
                        </div>
                        {selectedJob.salary && (
                          <div>
                            <p className="text-[10px] uppercase text-[#606c38]/60">Salary</p>
                            <p className="font-medium text-[#283618]">{selectedJob.salary}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] uppercase text-[#606c38]/60">Type</p>
                          <p className="font-medium text-[#283618]">{selectedJob.location.includes("Remote") ? "Remote" : "Hybrid"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stage selector */}
                    <div className="rounded-xl border border-[#606c38]/10 p-4 space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#606c38]">Stage</h3>
                      <div className="flex flex-wrap gap-2">
                        {stageOrder.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setJobs((prev) =>
                                prev.map((j) => (j.id === selectedJob.id ? { ...j, stage: s } : j))
                              )
                              setSelectedJob({ ...selectedJob, stage: s })
                            }}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-colors ${
                              selectedJob.stage === s
                                ? "bg-[#283618] text-[#fefae0]"
                                : "border border-[#606c38]/20 text-[#606c38] hover:bg-[#606c38]/10"
                            }`}
                          >
                            {stageConfig[s].label.toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CV linked */}
                    {selectedJob.atsMatch && (
                      <div className="rounded-xl border border-[#606c38]/10 p-4 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#606c38]">Linked CV</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#606c38]/10">
                            <FileText className="h-5 w-5 text-[#606c38]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#283618]">Product Designer CV</p>
                            <p className="text-xs text-[#dda15e]">ATS match: {selectedJob.atsMatch}%</p>
                          </div>
                          <Link href="/dashboard/cvs" className="text-[11px] text-[#606c38] hover:text-[#dda15e]">
                            Change CV
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Key contacts */}
                    <div className="rounded-xl border border-[#606c38]/10 p-4 space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#606c38]">Key Contacts</h3>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-[#606c38] hover:text-[#dda15e] transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                        Add contact
                      </button>
                    </div>

                    {/* Quick actions */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#606c38]">Quick Actions</h3>
                      <Link
                        href="/dashboard/ats"
                        className="flex items-center gap-2 rounded-xl border border-[#606c38]/10 px-4 py-2.5 text-sm text-[#283618] transition-colors hover:bg-[#dda15e]/10"
                      >
                        <Sparkles className="h-4 w-4 text-[#dda15e]" />
                        Tailor my CV for this job
                      </Link>
                      <Link
                        href="/dashboard/cover-letter"
                        className="flex items-center gap-2 rounded-xl border border-[#606c38]/10 px-4 py-2.5 text-sm text-[#283618] transition-colors hover:bg-[#dda15e]/10"
                      >
                        <Mail className="h-4 w-4 text-[#606c38]" />
                        Generate cover letter
                      </Link>
                      <button className="flex w-full items-center gap-2 rounded-xl border border-[#606c38]/10 px-4 py-2.5 text-sm text-[#283618] transition-colors hover:bg-[#dda15e]/10">
                        <Mic className="h-4 w-4 text-[#606c38]" />
                        Practice interview for this role
                      </button>
                    </div>
                  </div>
                )}

                {detailTab === "notes" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#606c38]">Notes</h3>
                      <span className="flex items-center gap-1 text-[10px] text-[#606c38]/50">
                        <Clock className="h-3 w-3" />
                        Auto-saved
                      </span>
                    </div>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="min-h-[300px] w-full rounded-xl border border-[#606c38]/10 bg-[#fefae0]/50 p-4 text-sm text-[#283618] leading-relaxed outline-none focus:border-[#dda15e] focus:ring-1 focus:ring-[#dda15e]/30 resize-none"
                      placeholder="Add your notes here..."
                    />
                  </div>
                )}

                {detailTab === "timeline" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#606c38]">Activity Timeline</h3>
                      <button className="flex items-center gap-1 text-xs font-medium text-[#606c38] hover:text-[#dda15e] transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                        Log activity
                      </button>
                    </div>
                    <div className="relative ml-3 border-l-2 border-[#606c38]/15 pl-6 space-y-6">
                      {[
                        { date: "Feb 15, 2025", event: "Interview scheduled for Feb 20", icon: Calendar },
                        { date: "Jan 20, 2025", event: "Follow-up email sent", icon: Send },
                        { date: "Jan 15, 2025", event: `Applied to ${selectedJob.company}`, icon: Briefcase },
                        { date: "Jan 10, 2025", event: "CV tailored for this position", icon: FileText },
                        { date: "Jan 8, 2025", event: "Job saved from LinkedIn", icon: LinkIcon },
                      ].map((item, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#606c38]/20 bg-white">
                            <item.icon className="h-2.5 w-2.5 text-[#606c38]" />
                          </div>
                          <p className="text-[10px] font-medium text-[#606c38]/60">{item.date}</p>
                          <p className="mt-0.5 text-sm text-[#283618]">{item.event}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detail footer */}
              <div className="flex items-center justify-between border-t border-[#606c38]/10 px-6 py-3">
                <button className="flex items-center gap-1 text-xs text-[#bc6c25] hover:text-[#bc6c25]/80 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-full bg-[#dda15e] px-4 py-1.5 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                >
                  Done
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════ ADD APPLICATION MODAL ══════════ */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-auto"
            >
              <div className="flex items-center justify-between border-b border-[#606c38]/10 px-6 py-4">
                <h2 className="text-lg font-bold text-[#283618]">Add a job application</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38]/50 hover:bg-[#606c38]/10 hover:text-[#283618]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                {/* URL import */}
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#dda15e]/40 bg-[#dda15e]/5 p-3">
                  <LinkIcon className="h-4 w-4 text-[#dda15e]" />
                  <input
                    type="url"
                    placeholder="Paste LinkedIn / Indeed URL to auto-fill..."
                    className="flex-1 border-none bg-transparent text-sm text-[#283618] outline-none placeholder:text-[#606c38]/50"
                  />
                  <button className="text-xs font-semibold text-[#dda15e] hover:text-[#bc6c25]">Import</button>
                </div>

                <div className="relative flex items-center py-1">
                  <div className="flex-1 border-t border-[#606c38]/10" />
                  <span className="px-3 text-[10px] text-[#606c38]/50">or fill manually</span>
                  <div className="flex-1 border-t border-[#606c38]/10" />
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#606c38]">Company</label>
                    <input className="w-full rounded-lg border border-[#606c38]/15 bg-[#fefae0]/50 px-3 py-2 text-sm text-[#283618] outline-none focus:border-[#dda15e]" placeholder="e.g. Google" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#606c38]">Role</label>
                    <input className="w-full rounded-lg border border-[#606c38]/15 bg-[#fefae0]/50 px-3 py-2 text-sm text-[#283618] outline-none focus:border-[#dda15e]" placeholder="e.g. Product Manager" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#606c38]">Location</label>
                    <input className="w-full rounded-lg border border-[#606c38]/15 bg-[#fefae0]/50 px-3 py-2 text-sm text-[#283618] outline-none focus:border-[#dda15e]" placeholder="e.g. London, UK" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#606c38]">Job URL</label>
                    <input className="w-full rounded-lg border border-[#606c38]/15 bg-[#fefae0]/50 px-3 py-2 text-sm text-[#283618] outline-none focus:border-[#dda15e]" placeholder="https://..." />
                  </div>
                </div>

                {/* Stage selector */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-[#606c38]">Stage</label>
                  <div className="flex flex-wrap gap-2">
                    {stageOrder.slice(0, 4).map((s) => (
                      <button
                        key={s}
                        className="rounded-full border border-[#606c38]/20 px-3 py-1 text-[11px] font-medium capitalize text-[#606c38] transition-colors hover:bg-[#283618] hover:text-[#fefae0] focus:bg-[#283618] focus:text-[#fefae0]"
                      >
                        {stageConfig[s].label.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#606c38]/10 px-6 py-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border-2 border-[#283618] px-5 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full bg-[#dda15e] px-5 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                >
                  Save application
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
