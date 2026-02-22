"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  HelpCircle,
  FileText,
  ChevronDown,
  Sparkles,
  Check,
  Loader2,
  Search,
  Key,
  Layers,
  Ruler,
  PenTool,
  FileCheck,
  AlertTriangle,
  X,
  BarChart3,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { onAuthStateChanged, auth } from "@/lib/firebase"
import { cvApi, type CVSummary } from "@/lib/api/cv"
import { atsApi, type ATSAnalysisResult, type ComparisonItem } from "@/lib/api/ats"

// ---------------------------------------------------------------------------
// Icon map for backend ScoreBreakdown.icon strings
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  key: Key,
  layers: Layers,
  "file-check": FileCheck,
  "pen-tool": PenTool,
  ruler: Ruler,
}
function getBreakdownIcon(icon: string) {
  return ICON_MAP[icon] ?? BarChart3
}

// ---------------------------------------------------------------------------
// Animated Score Ring
// ---------------------------------------------------------------------------
function ScoreRing({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const t = setTimeout(() => setOffset(circumference - (score / 100) * circumference), 300)
    return () => clearTimeout(t)
  }, [score, circumference])

  const color = score >= 80 ? "#606c38" : score >= 60 ? "#dda15e" : "#bc6c25"
  const message =
    score >= 85 ? "Strong match — you'll pass most ATS systems"
    : score >= 70 ? "Good match — a few improvements suggested"
    : score >= 50 ? "Fair match — missing key keywords"
    : "Weak match — significant tailoring needed"

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(254,250,224,0.08)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold text-[#fefae0]">{score}</span>
          <span className="text-sm text-[#fefae0]/60">/100</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color }}>{message}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading step indicator
// ---------------------------------------------------------------------------
function LoadingStep({ text, status }: { text: string; status: "done" | "active" | "pending" }) {
  return (
    <div className="flex items-center gap-3">
      {status === "done" && <Check className="h-4 w-4 text-[#606c38]" />}
      {status === "active" && <Loader2 className="h-4 w-4 animate-spin text-[#dda15e]" />}
      {status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-[#606c38]/30" />}
      <span className={`text-sm ${
        status === "done" ? "text-[#606c38]"
        : status === "active" ? "text-[#283618] font-medium"
        : "text-[#606c38]/50"
      }`}>{text}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status badge for comparison table
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: ComparisonItem["status"] }) {
  if (status === "match") return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#606c38]/20 px-2.5 py-1 text-xs font-semibold text-[#606c38]">
      <CheckCircle2 className="h-3.5 w-3.5" /> Match
    </span>
  )
  if (status === "missing") return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#bc6c25]/20 px-2.5 py-1 text-xs font-semibold text-[#bc6c25]">
      <XCircle className="h-3.5 w-3.5" /> Missing
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dda15e]/20 px-2.5 py-1 text-xs font-semibold text-[#dda15e]">
      <AlertCircle className="h-3.5 w-3.5" /> Partial
    </span>
  )
}

// ---------------------------------------------------------------------------
// Download report as .txt
// ---------------------------------------------------------------------------
function downloadReport(result: ATSAnalysisResult, cvTitle: string) {
  const pad = (s: string, n: number) => s.slice(0, n).padEnd(n)
  const lines: string[] = [
    "═══════════════════════════════════════════════════════",
    "  ATS ANALYSIS REPORT",
    `  CV: ${cvTitle}`,
    `  Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
    "═══════════════════════════════════════════════════════",
    "",
    `OVERALL ATS SCORE: ${result.overall_score}/100`,
    `Keyword Match Rate: ${result.keyword_match_pct}%`,
    "",
    "─── SCORE BREAKDOWN ───────────────────────────────────",
    ...result.breakdown.map((b) => `  ${b.label.padEnd(22)} ${b.score}%`),
    "",
    "─── IMPROVEMENT SUGGESTIONS ───────────────────────────",
    ...result.suggestions.map((s, i) => `  ${i + 1}. ${s}`),
    "",
    "─── MISSING KEYWORDS ──────────────────────────────────",
    ...(result.missing_keywords.length > 0
      ? result.missing_keywords.map((k) => `  • ${k}`)
      : ["  None — all key keywords are present."]),
    "",
    "─── PRESENT KEYWORDS ──────────────────────────────────",
    ...(result.present_keywords.length > 0
      ? result.present_keywords.map((k) => `  ✓ ${k}`)
      : ["  None detected."]),
    "",
    "─── REQUIREMENTS VS YOUR CV ───────────────────────────",
    `  ${"Requirement".padEnd(32)}| ${"Your CV".padEnd(32)}| Status`,
    "  " + "─".repeat(80),
    ...result.comparison.map((c) =>
      `  ${pad(c.requirement, 32)}| ${pad(c.cv_value, 32)}| ${c.status.toUpperCase()}`
    ),
    "",
    "═══════════════════════════════════════════════════════",
    "  Generated by CVFlow — cvflow.app",
    "═══════════════════════════════════════════════════════",
  ]

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ATS-Report-${cvTitle.replace(/[^a-z0-9]/gi, "_").slice(0, 40)}.txt`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ATSWorkspacePage() {
  const [cvs, setCvs] = useState<CVSummary[]>([])
  const [cvsLoading, setCvsLoading] = useState(true)
  const [selectedCv, setSelectedCv] = useState<CVSummary | null>(null)
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false)

  const [jobDescription, setJobDescription] = useState("")

  const [analyzing, setAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [result, setResult] = useState<ATSAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<"score" | "keywords" | "comparison">("score")
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set())

  const [uploadingPdf, setUploadingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    setUploadingPdf(true)
    setError(null)
    try {
      const newCv = await cvApi.uploadPdf(file)
      const summary: CVSummary = {
        id: newCv.id,
        title: newCv.title,
        template_id: newCv.template_id,
        ats_score: newCv.ats_score,
        status: newCv.status,
        created_at: newCv.created_at,
        updated_at: newCv.updated_at,
      }
      setCvs(prev => [summary, ...prev])
      setSelectedCv(summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.")
    } finally {
      setUploadingPdf(false)
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        cvApi.list()
          .then((list) => {
            setCvs(list)
            if (list.length > 0) setSelectedCv(list[0])
          })
          .catch(() => {})
          .finally(() => setCvsLoading(false))
      } else {
        setCvsLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const handleAnalyze = async () => {
    if (!selectedCv || !jobDescription.trim()) return
    setError(null)
    setAnalyzing(true)
    setAnalysisStep(0)
    setResult(null)
    setAddedKeywords(new Set())

    const delays = [2000, 5000, 9000, 13000]
    const timers = delays.map((delay, i) => setTimeout(() => setAnalysisStep(i + 1), delay))

    try {
      const res = await atsApi.analyze(selectedCv.id, jobDescription)
      timers.forEach(clearTimeout)
      setAnalysisStep(4)
      setCvs(prev => prev.map(c =>
        c.id === selectedCv.id ? { ...c, ats_score: res.overall_score } : c
      ))
      setSelectedCv(prev => prev ? { ...prev, ats_score: res.overall_score } : prev)
      setTimeout(() => {
        setAnalyzing(false)
        setResult(res)
        setActiveTab("score")
      }, 400)
    } catch (err) {
      timers.forEach(clearTimeout)
      setAnalyzing(false)
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(`Analysis failed: ${msg}`)
    }
  }

  const handleKeywordClick = (kw: string) => {
    const isAdding = !addedKeywords.has(kw)
    setAddedKeywords(prev => {
      const next = new Set(prev)
      isAdding ? next.add(kw) : next.delete(kw)
      return next
    })
    if (isAdding && selectedCv) {
      atsApi.applyChanges(selectedCv.id, [], [kw]).catch(() => {})
    }
  }

  const loadingSteps = [
    { text: "Reading your CV...", status: analysisStep >= 1 ? "done" : "pending" },
    { text: "Parsing job requirements...", status: analysisStep >= 2 ? "done" : analysisStep >= 1 ? "active" : "pending" },
    { text: "Comparing keywords...", status: analysisStep >= 3 ? "done" : analysisStep >= 2 ? "active" : "pending" },
    { text: "Generating analysis...", status: analysisStep >= 4 ? "done" : analysisStep >= 3 ? "active" : "pending" },
  ] as { text: string; status: "done" | "active" | "pending" }[]

  const tabs = [
    { key: "score" as const, label: "ATS Score" },
    { key: "keywords" as const, label: "Keywords" },
    { key: "comparison" as const, label: "Comparison" },
  ]

  const canAnalyze = !!selectedCv && jobDescription.trim().length > 0 && !analyzing

  const matchCount = result?.comparison.filter(c => c.status === "match").length ?? 0
  const partialCount = result?.comparison.filter(c => c.status === "partial").length ?? 0
  const missingCount = result?.comparison.filter(c => c.status === "missing").length ?? 0

  return (
    <div className="flex h-screen flex-col bg-[#fefae0]">

      {/* ── Top Bar ── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#606c38]/15 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-5 w-px bg-[#606c38]/15" />
          <h1 className="text-lg font-bold text-[#283618]">ATS Score & Analysis</h1>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618]">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">How it works?</span>
        </button>
      </header>

      {/* ── Error banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="shrink-0 text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main 2-panel layout ── */}
      <div className="flex min-h-0 flex-1">

        {/* ──── LEFT PANEL ──── */}
        <div className="w-full overflow-y-auto p-6 sm:p-8 lg:w-[45%]">

          <h2 className="text-lg font-bold text-[#283618]">1. Select your CV</h2>
          <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handlePdfUpload}
            />

            {cvsLoading ? (
              <div className="h-12 animate-pulse rounded-xl bg-[#606c38]/10" />
            ) : (
              <>
                <div className="relative">
                  <button
                    onClick={() => cvs.length > 0 && setCvDropdownOpen(!cvDropdownOpen)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      cvs.length > 0
                        ? "border-[#606c38]/20 hover:border-[#dda15e] cursor-pointer"
                        : "border-dashed border-[#606c38]/20 cursor-default"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 shrink-0 text-[#606c38]" />
                      <span className="truncate text-sm font-medium text-[#283618]">
                        {cvs.length === 0
                          ? "No CVs yet — upload a PDF below"
                          : (selectedCv?.title ?? "Select a CV")}
                      </span>
                    </div>
                    {cvs.length > 0 && (
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {selectedCv?.ats_score != null && (
                          <span className="rounded-full bg-[#606c38]/10 px-2 py-0.5 text-xs font-bold text-[#606c38]">
                            {selectedCv.ats_score}/100
                          </span>
                        )}
                        <ChevronDown className={`h-4 w-4 text-[#606c38] transition-transform ${cvDropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {cvDropdownOpen && cvs.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setCvDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute inset-x-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                        >
                          {cvs.map((cv) => (
                            <button
                              key={cv.id}
                              onClick={() => { setSelectedCv(cv); setCvDropdownOpen(false) }}
                              className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[#fefae0] ${
                                selectedCv?.id === cv.id
                                  ? "bg-[#dda15e]/10 font-semibold text-[#283618]"
                                  : "text-[#283618]"
                              }`}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 shrink-0 text-[#606c38]" />
                                <span className="truncate">{cv.title}</span>
                              </span>
                              {cv.ats_score != null && (
                                <span className="ml-3 shrink-0 text-xs text-[#606c38]">{cv.ats_score}/100</span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {uploadingPdf && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 rounded-xl border border-[#dda15e]/30 bg-[#dda15e]/5 px-4 py-3">
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#dda15e]" />
                        <div>
                          <p className="text-sm font-medium text-[#283618]">Extracting CV with AI…</p>
                          <p className="text-xs text-[#606c38]">Parsing your PDF — takes about 10–15 seconds</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!uploadingPdf && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#606c38]/20 py-2.5 text-xs text-[#606c38]/60 transition-colors hover:border-[#dda15e] hover:text-[#606c38]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload a PDF from your computer
                  </button>
                )}
              </>
            )}
          </div>

          <div className="my-6 flex items-center justify-center">
            <span className="text-2xl text-[#606c38]/30">+</span>
          </div>

          <h2 className="text-lg font-bold text-[#283618]">2. Paste the job description</h2>
          <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
            <textarea
              ref={textareaRef}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={"Paste the full job description here (from LinkedIn, Indeed, or any job site).\n\nInclude: job title, responsibilities, required skills, experience…"}
              className="h-52 w-full resize-none rounded-xl border border-[#606c38]/20 bg-[#fefae0] p-3 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 leading-relaxed"
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-[#606c38]/50">
                Copy the description from the job posting and paste it here
              </span>
              <span className={`text-xs font-medium ${jobDescription.length >= 500 ? "text-[#606c38]" : "text-[#606c38]/40"}`}>
                {jobDescription.length.toLocaleString()} chars
              </span>
            </div>
          </div>

          {/* Analyze Button / Loading */}
          <div className="mt-6">
            {!analyzing ? (
              <>
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#dda15e] py-4 text-lg font-bold text-[#283618] shadow-lg transition-all hover:bg-[#bc6c25] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                >
                  <Sparkles className="h-5 w-5" />
                  Analyze my CV
                </button>
                {!canAnalyze && (selectedCv === null || cvs.length === 0) && (
                  <p className="mt-2 text-center text-xs text-[#606c38]/60">Select a CV first</p>
                )}
                {!canAnalyze && selectedCv !== null && jobDescription.trim().length === 0 && (
                  <p className="mt-2 text-center text-xs text-[#606c38]/60">Paste a job description to continue</p>
                )}
                {canAnalyze && (
                  <p className="mt-2 text-center text-xs text-[#606c38]/60">Analysis takes about 15–20 seconds</p>
                )}
              </>
            ) : (
              <div className="rounded-2xl border-2 border-[#dda15e]/40 bg-white p-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dda15e]/15">
                    <Sparkles className="h-5 w-5 text-[#dda15e]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#283618]">Analyzing your CV…</p>
                    <p className="text-xs text-[#606c38]/60">This takes about 15–20 seconds</p>
                  </div>
                </div>

                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#fefae0]">
                  <motion.div
                    className="h-full rounded-full bg-[#dda15e]"
                    initial={{ width: "5%" }}
                    animate={{ width: `${Math.max(5, (analysisStep / 4) * 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-[#606c38]/40">
                  {Math.round(Math.max(5, (analysisStep / 4) * 100))}%
                </p>

                <div className="mt-5 space-y-3">
                  {loadingSteps.map((step, i) => (
                    <LoadingStep key={i} text={step.text} status={step.status} />
                  ))}
                </div>

                <p className="mt-5 rounded-xl bg-[#fefae0] px-3 py-2 text-xs text-[#606c38]/60 text-center">
                  AI is reading your CV and matching it against the job requirements
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ──── RIGHT PANEL ──── */}
        <div className="hidden lg:flex lg:w-[55%] flex-col overflow-y-auto bg-[#283618] p-6 sm:p-8">

          {analyzing ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" width="96" height="96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(254,250,224,0.08)" strokeWidth="6" />
                  <motion.circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke="#dda15e" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={251}
                    initial={{ strokeDashoffset: 251 }}
                    animate={{ strokeDashoffset: 251 - (Math.max(5, (analysisStep / 4) * 100) / 100) * 251 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <Sparkles className="h-8 w-8 text-[#dda15e]" />
              </div>
              <p className="mt-5 text-base font-bold text-[#fefae0]/70">
                {loadingSteps.find(s => s.status === "active")?.text ?? "Starting analysis…"}
              </p>
              <p className="mt-1 text-sm text-[#fefae0]/30">Results will appear here shortly</p>
            </div>
          ) : !result ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fefae0]/5">
                <Search className="h-10 w-10 text-[#fefae0]/30" />
              </div>
              <p className="mt-6 text-lg font-semibold text-[#fefae0]/40">
                Your ATS analysis will appear here.
              </p>
              <p className="mt-1 text-sm text-[#fefae0]/25">
                Select a CV and paste a job offer to start.
              </p>
            </div>
          ) : (
            <div>
              {/* Tabs */}
              <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      activeTab === tab.key
                        ? "bg-[#dda15e] text-[#283618]"
                        : "text-[#fefae0]/60 hover:text-[#fefae0]"
                    }`}
                  >
                    {tab.label}
                    {tab.key === "comparison" && result.comparison.length > 0 && (
                      <span className="rounded-full bg-[#dda15e]/30 px-1.5 py-0.5 text-[10px]">
                        {result.comparison.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── TAB 1: ATS Score ── */}
              {activeTab === "score" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">

                  <ScoreRing score={result.overall_score} />

                  {result.breakdown.length > 0 && (
                    <div className="mt-8 space-y-4">
                      {result.breakdown.map((metric) => {
                        const Icon = getBreakdownIcon(metric.icon)
                        const color = metric.score >= 80 ? "#606c38" : metric.score >= 60 ? "#dda15e" : "#bc6c25"
                        return (
                          <div key={metric.label}>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-sm text-[#fefae0]">
                                <Icon className="h-4 w-4 text-[#fefae0]/60" />
                                {metric.label}
                              </span>
                              <span className="text-sm font-bold text-[#fefae0]">{metric.score}%</span>
                            </div>
                            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#fefae0]/10">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.score}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {result.missing_keywords.length > 0 && (
                    <div className="mt-8">
                      <p className="mb-3 text-sm font-semibold text-[#fefae0]">
                        Missing keywords — click to add to your CV:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_keywords.map((kw) => (
                          <button
                            key={kw}
                            onClick={() => handleKeywordClick(kw)}
                            className={`rounded-full px-3 py-1 text-sm transition-colors ${
                              addedKeywords.has(kw)
                                ? "bg-[#606c38] text-[#fefae0]"
                                : "bg-[#bc6c25]/30 text-[#fefae0] hover:bg-[#dda15e] hover:text-[#283618]"
                            }`}
                            title="Click to add to your CV skills"
                          >
                            {kw}{" "}
                            {addedKeywords.has(kw)
                              ? <Check className="ml-1 inline h-3 w-3" />
                              : <span className="ml-1">+</span>
                            }
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.suggestions.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <p className="text-sm font-semibold text-[#fefae0]">
                        Improvement suggestions ({result.suggestions.length}):
                      </p>
                      {result.suggestions.map((suggestion, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl bg-[#fefae0]/10 p-3.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dda15e]/20 text-xs font-bold text-[#dda15e]">
                            {i + 1}
                          </span>
                          <p className="text-sm text-[#fefae0] leading-relaxed">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── TAB 2: Keywords ── */}
              {activeTab === "keywords" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-sm font-bold text-[#606c38]">
                        Present in your CV ({result.present_keywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.present_keywords.map((kw) => (
                          <span
                            key={kw}
                            className="flex items-center gap-1.5 rounded-full bg-[#606c38]/20 px-3 py-1 text-sm text-[#fefae0]"
                          >
                            <Check className="h-3 w-3 text-[#606c38]" />
                            {kw}
                          </span>
                        ))}
                        {result.present_keywords.length === 0 && (
                          <p className="text-sm text-[#fefae0]/40">No matched keywords found</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-bold text-[#bc6c25]">
                        Missing ({result.missing_keywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_keywords.map((kw) => (
                          <button
                            key={kw}
                            onClick={() => handleKeywordClick(kw)}
                            className={`rounded-full px-3 py-1 text-sm transition-colors ${
                              addedKeywords.has(kw)
                                ? "bg-[#606c38] text-[#fefae0]"
                                : "bg-[#bc6c25]/30 text-[#fefae0] hover:bg-[#dda15e] hover:text-[#283618]"
                            }`}
                          >
                            {kw}
                          </button>
                        ))}
                        {result.missing_keywords.length === 0 && (
                          <p className="text-sm text-[#fefae0]/40">No missing keywords — great match!</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-[#fefae0]/10 p-4 text-center">
                    <p className="text-3xl font-bold text-[#dda15e]">{Math.round(result.keyword_match_pct)}%</p>
                    <p className="mt-1 text-sm text-[#fefae0]/60">Keyword match rate</p>
                  </div>
                </motion.div>
              )}

              {/* ── TAB 3: Comparison ── */}
              {activeTab === "comparison" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">

                  {/* Summary counters */}
                  <div className="mb-5 flex gap-3">
                    <div className="flex-1 rounded-xl bg-[#606c38]/20 p-3 text-center">
                      <p className="text-2xl font-bold text-[#606c38]">{matchCount}</p>
                      <p className="text-xs text-[#fefae0]/60">Matched</p>
                    </div>
                    <div className="flex-1 rounded-xl bg-[#dda15e]/10 p-3 text-center">
                      <p className="text-2xl font-bold text-[#dda15e]">{partialCount}</p>
                      <p className="text-xs text-[#fefae0]/60">Partial</p>
                    </div>
                    <div className="flex-1 rounded-xl bg-[#bc6c25]/20 p-3 text-center">
                      <p className="text-2xl font-bold text-[#bc6c25]">{missingCount}</p>
                      <p className="text-xs text-[#fefae0]/60">Missing</p>
                    </div>
                  </div>

                  {result.comparison.length === 0 ? (
                    <div className="rounded-xl bg-[#fefae0]/10 p-8 text-center">
                      <p className="text-sm text-[#fefae0]/50">
                        No comparison data — re-run the analysis to generate it.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-[#fefae0]/10">
                      {/* Header */}
                      <div className="grid grid-cols-[1fr_1fr_100px] gap-3 border-b border-[#fefae0]/10 bg-[#fefae0]/5 px-4 py-2.5">
                        <span className="text-xs font-bold uppercase tracking-wide text-[#fefae0]/50">Requirement</span>
                        <span className="text-xs font-bold uppercase tracking-wide text-[#fefae0]/50">Your CV</span>
                        <span className="text-xs font-bold uppercase tracking-wide text-[#fefae0]/50">Status</span>
                      </div>
                      {/* Rows */}
                      {result.comparison.map((item, i) => (
                        <div
                          key={i}
                          className={`grid grid-cols-[1fr_1fr_100px] gap-3 px-4 py-3 text-sm ${
                            i % 2 === 0 ? "bg-[#fefae0]/[0.03]" : ""
                          } border-l-2 ${
                            item.status === "missing" ? "border-[#bc6c25]"
                            : item.status === "partial" ? "border-[#dda15e]"
                            : "border-[#606c38]"
                          }`}
                        >
                          <span className="text-[#fefae0]/80 leading-snug">{item.requirement}</span>
                          <span className={`leading-snug ${
                            item.status === "missing" ? "italic text-[#fefae0]/30" : "text-[#fefae0]/70"
                          }`}>
                            {item.cv_value}
                          </span>
                          <div><StatusBadge status={item.status} /></div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Download report button ── */}
              <div className="mt-8 flex justify-center border-t border-[#fefae0]/10 pt-6">
                <button
                  onClick={() => downloadReport(result, selectedCv?.title ?? "CV")}
                  className="flex items-center gap-2 rounded-full bg-[#606c38] px-8 py-3 text-sm font-semibold text-[#fefae0] shadow-lg transition-colors hover:bg-[#283618]"
                >
                  <Download className="h-4 w-4" />
                  Download report (.txt)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
