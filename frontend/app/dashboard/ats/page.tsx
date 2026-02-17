"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  HelpCircle,
  FileText,
  ChevronDown,
  Upload,
  ExternalLink,
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
  ArrowRight,
  X,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

/* ── Mock Data ── */
const mockCVs = [
  { id: 1, title: "Software Engineer \u2014 Google", atsScore: 87 },
  { id: 2, title: "UX Researcher Resume", atsScore: 72 },
  { id: 3, title: "Senior PM Application", atsScore: 91 },
]

const mockMiniPreviews = [
  { id: 1, label: "Modern" },
  { id: 2, label: "Classic" },
  { id: 3, label: "Executive" },
]

const scoreBreakdown = [
  { label: "Keyword match", icon: Key, score: 78, color: "#dda15e" },
  { label: "Section structure", icon: Layers, score: 95, color: "#606c38" },
  { label: "Formatting safety", icon: FileCheck, score: 100, color: "#606c38" },
  { label: "Content quality", icon: PenTool, score: 71, color: "#dda15e" },
  { label: "Length optimization", icon: Ruler, score: 85, color: "#606c38" },
]

const missingKeywords = [
  "React.js",
  "TypeScript",
  "Agile",
  "CI/CD",
  "Product Analytics",
  "Stakeholder management",
]

const suggestions = [
  {
    text: "Your summary doesn\u2019t mention \u2018product analytics\u2019 \u2014 add it to reach 95+",
  },
  {
    text: "Add \u2018CI/CD\u2019 to your skills section to match 3 job requirements",
  },
  {
    text: "Quantify your achievements in bullet 2 of Work Experience",
  },
]

const diffChanges = [
  {
    section: "Work Experience \u2014 Bullet 2",
    before: "Managed social media campaigns for the company.",
    after:
      "Led data-driven social media strategy (React, Analytics), increasing engagement KPIs by 340% and reaching 2.3M users.",
  },
  {
    section: "Professional Summary",
    before: "Experienced software engineer with a strong background.",
    after:
      "Product-minded software engineer with 5+ years in TypeScript/React, driving cross-functional Agile teams to ship user-facing features at scale.",
  },
  {
    section: "Skills",
    before: "JavaScript, HTML, CSS, Git",
    after: "TypeScript, React.js, CI/CD, Product Analytics, Agile, Git, HTML, CSS",
  },
  {
    section: "Work Experience \u2014 Bullet 5",
    before: "Worked with stakeholders to improve processes.",
    after:
      "Partnered with senior stakeholders to redesign onboarding flow, reducing churn by 22% within 3 months.",
  },
]

const presentKeywords = [
  { word: "JavaScript", match: true },
  { word: "Git", match: true },
  { word: "HTML/CSS", match: true },
  { word: "Team leadership", match: true },
  { word: "API design", match: true },
  { word: "Figma", match: true },
  { word: "Node.js", match: true },
  { word: "SQL", match: true },
]

const missingKeywordsTab = [
  { word: "React.js", priority: "high" },
  { word: "TypeScript", priority: "high" },
  { word: "CI/CD", priority: "high" },
  { word: "Agile", priority: "medium" },
  { word: "Product Analytics", priority: "medium" },
  { word: "Stakeholder management", priority: "medium" },
  { word: "A/B testing", priority: "low" },
  { word: "Microservices", priority: "low" },
]

/* ── Animated Score Ring ── */
function ScoreRing({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference)
    }, 300)
    return () => clearTimeout(timer)
  }, [score, circumference])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(254,250,224,0.1)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bc6c25" />
            <stop offset="50%" stopColor="#dda15e" />
            <stop offset="100%" stopColor="#606c38" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-[#fefae0]">{score}</span>
        <span className="text-sm text-[#fefae0]/60">/100</span>
      </div>
    </div>
  )
}

/* ── Loading Step ── */
function LoadingStep({
  text,
  status,
}: {
  text: string
  status: "done" | "active" | "pending"
}) {
  return (
    <div className="flex items-center gap-3">
      {status === "done" && (
        <Check className="h-4 w-4 text-[#606c38]" />
      )}
      {status === "active" && (
        <Loader2 className="h-4 w-4 animate-spin text-[#dda15e]" />
      )}
      {status === "pending" && (
        <div className="h-4 w-4 rounded-full border-2 border-[#606c38]/30" />
      )}
      <span
        className={`text-sm ${
          status === "done"
            ? "text-[#606c38]"
            : status === "active"
            ? "text-[#283618] font-medium"
            : "text-[#606c38]/50"
        }`}
      >
        {text}
      </span>
    </div>
  )
}

/* ── Main Page ── */
export default function ATSWorkspacePage() {
  const [selectedCV, setSelectedCV] = useState(mockCVs[0])
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState(1)
  const [jobUrl, setJobUrl] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState<"score" | "tailored" | "keywords">("score")
  const [acceptedChanges, setAcceptedChanges] = useState<Set<number>>(new Set())
  const [rejectedChanges, setRejectedChanges] = useState<Set<number>>(new Set())
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setAnalysisStep(0)
    const steps = [1, 2, 3, 4]
    steps.forEach((step, i) => {
      setTimeout(() => {
        setAnalysisStep(step)
        if (step === 4) {
          setTimeout(() => {
            setAnalyzing(false)
            setShowResults(true)
          }, 600)
        }
      }, (i + 1) * 1200)
    })
  }

  const loadingSteps = [
    { text: "Reading your CV...", status: analysisStep >= 1 ? "done" : "pending" },
    { text: "Parsing job requirements...", status: analysisStep >= 2 ? "done" : analysisStep >= 1 ? "active" : "pending" },
    { text: "Comparing keywords...", status: analysisStep >= 3 ? "done" : analysisStep >= 2 ? "active" : "pending" },
    { text: "Generating suggestions...", status: analysisStep >= 4 ? "done" : analysisStep >= 3 ? "active" : "pending" },
  ] as { text: string; status: "done" | "active" | "pending" }[]

  const tabs = [
    { key: "score" as const, label: "ATS Score" },
    { key: "tailored" as const, label: "Tailored CV" },
    { key: "keywords" as const, label: "Keywords" },
  ]

  const pendingChanges = diffChanges.filter(
    (_, i) => !acceptedChanges.has(i) && !rejectedChanges.has(i)
  ).length

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
          <h1 className="text-lg font-bold text-[#283618]">
            ATS Score & Tailoring
          </h1>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618]">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">How it works?</span>
        </button>
      </header>

      {/* ── Main 2-panel layout ── */}
      <div className="flex min-h-0 flex-1">
        {/* ──── LEFT PANEL ──── */}
        <div className="w-full overflow-y-auto p-6 sm:p-8 lg:w-[45%]">
          {/* Step 1: Select CV */}
          <h2 className="text-lg font-bold text-[#283618]">1. Select your CV</h2>

          <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
            {/* CV Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCvDropdownOpen(!cvDropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-[#606c38]/20 px-4 py-3 text-left transition-colors hover:border-[#dda15e]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 shrink-0 text-[#606c38]" />
                  <span className="truncate text-sm font-medium text-[#283618]">
                    {selectedCV.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="rounded-full bg-[#606c38]/10 px-2 py-0.5 text-xs font-bold text-[#606c38]">
                    {selectedCV.atsScore}/100
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#606c38] transition-transform ${
                      cvDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              <AnimatePresence>
                {cvDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setCvDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                    >
                      {mockCVs.map((cv) => (
                        <button
                          key={cv.id}
                          onClick={() => {
                            setSelectedCV(cv)
                            setCvDropdownOpen(false)
                          }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[#fefae0] ${
                            selectedCV.id === cv.id
                              ? "bg-[#dda15e]/10 font-semibold text-[#283618]"
                              : "text-[#283618]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#606c38]" />
                            {cv.title}
                          </span>
                          <span className="text-xs text-[#606c38]">
                            {cv.atsScore}/100
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#606c38] transition-colors hover:text-[#283618]">
              <Upload className="h-4 w-4" />
              Upload new PDF
            </button>

            {/* Mini CV preview strip */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {mockMiniPreviews.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreview(p.id)}
                  className={`flex h-20 w-[60px] shrink-0 flex-col items-center justify-center rounded-lg border-2 bg-[#fefae0] text-[10px] text-[#606c38] transition-all ${
                    selectedPreview === p.id
                      ? "border-[#dda15e] shadow-md"
                      : "border-[#606c38]/15 hover:border-[#606c38]/40"
                  }`}
                >
                  <FileText className="h-5 w-5 mb-1 text-[#606c38]/50" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center">
            <span className="text-2xl text-[#606c38]/30">+</span>
          </div>

          {/* Step 2: Job Offer */}
          <h2 className="text-lg font-bold text-[#283618]">
            2. Paste the job offer
          </h2>

          <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
            {/* URL input */}
            <label className="text-xs text-[#606c38]">
              Or paste job URL (LinkedIn, Indeed...)
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/..."
                className="flex-1 rounded-xl border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
              />
              <button className="shrink-0 rounded-xl bg-[#606c38]/10 px-4 py-2 text-sm font-semibold text-[#606c38] transition-colors hover:bg-[#606c38]/20">
                {"Fetch \u2192"}
              </button>
            </div>

            <p className="my-3 text-center text-xs text-gray-400">
              {"— or paste the full job description below —"}
            </p>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={
                "Paste the complete job description here for best results.\nInclude: job title, requirements, responsibilities, skills..."
              }
              className="h-48 w-full resize-none rounded-xl border border-[#606c38]/20 bg-[#fefae0] p-3 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 leading-relaxed"
            />
            <div className="mt-1 text-right">
              <span className="text-xs text-[#606c38]">
                {jobDescription.length.toLocaleString()} / recommended 500+
              </span>
            </div>
          </div>

          {/* Analyze Button / Loading */}
          <div className="mt-6">
            {!analyzing ? (
              <>
                <button
                  onClick={handleAnalyze}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#dda15e] py-4 text-lg font-bold text-[#283618] shadow-lg transition-all hover:bg-[#bc6c25] hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="h-5 w-5" />
                  Analyze & Tailor my CV
                </button>
                <p className="mt-2 text-center text-xs text-[#606c38]/60">
                  {"Powered by Gemini 2.5 Pro \u00B7 Takes ~10 seconds"}
                </p>
              </>
            ) : (
              <div className="rounded-2xl border border-[#dda15e]/30 bg-white p-6">
                <div className="flex items-center gap-2 text-[#283618]">
                  <Sparkles className="h-5 w-5 text-[#dda15e]" />
                  <span className="font-bold">Analyzing your CV...</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#fefae0]">
                  <motion.div
                    className="h-full rounded-full bg-[#dda15e]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(analysisStep / 4) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="mt-4 space-y-2.5">
                  {loadingSteps.map((step, i) => (
                    <LoadingStep key={i} text={step.text} status={step.status} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ──── RIGHT PANEL ──── */}
        <div className="hidden lg:flex lg:w-[55%] flex-col overflow-y-auto bg-[#283618] p-6 sm:p-8">
          {!showResults ? (
            /* ── Placeholder state ── */
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
            /* ── Results ── */
            <div>
              {/* Tabs */}
              <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      activeTab === tab.key
                        ? "bg-[#dda15e] text-[#283618]"
                        : "text-[#fefae0]/60 hover:text-[#fefae0]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── TAB 1: ATS Score ── */}
              {activeTab === "score" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  {/* Score Hero */}
                  <div className="flex flex-col items-center text-center">
                    <ScoreRing score={87} />
                    <p className="mt-3 text-sm font-semibold text-[#dda15e]">
                      {"Strong match \u2014 you\u2019ll pass most ATS systems"}
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="mt-8 space-y-4">
                    {scoreBreakdown.map((metric) => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm text-[#fefae0]">
                            <metric.icon className="h-4 w-4 text-[#fefae0]/60" />
                            {metric.label}
                          </span>
                          <span className="text-sm font-bold text-[#fefae0]">
                            {metric.score}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#fefae0]/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.score}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: metric.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Missing Keywords */}
                  <div className="mt-8">
                    <p className="text-sm font-semibold text-[#fefae0] mb-3">
                      Missing keywords from the job offer:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {missingKeywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() =>
                            setAddedKeywords((prev) => {
                              const next = new Set(prev)
                              if (next.has(kw)) next.delete(kw)
                              else next.add(kw)
                              return next
                            })
                          }
                          className={`rounded-full px-3 py-1 text-sm transition-colors ${
                            addedKeywords.has(kw)
                              ? "bg-[#606c38] text-[#fefae0]"
                              : "bg-[#bc6c25]/30 text-[#fefae0] hover:bg-[#dda15e] hover:text-[#283618]"
                          }`}
                          title="Click to add to your CV skills section"
                        >
                          {kw} {addedKeywords.has(kw) ? <Check className="ml-1 inline h-3 w-3" /> : "+"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="mt-8 space-y-3">
                    <p className="text-sm font-semibold text-[#fefae0]">
                      3 quick wins:
                    </p>
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl bg-[#fefae0]/10 p-3"
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0 text-[#dda15e] mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-[#fefae0] leading-relaxed">
                            {s.text}
                          </p>
                          <button className="mt-1 text-xs font-semibold text-[#dda15e] hover:underline">
                            {"Apply fix \u2192"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── TAB 2: Tailored CV ── */}
              {activeTab === "tailored" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <span className="inline-block rounded-full bg-[#dda15e] px-3 py-1 text-sm font-semibold text-[#283618]">
                    {diffChanges.length} changes applied to your CV
                  </span>

                  <div className="mt-4 space-y-4">
                    {diffChanges.map((change, i) => (
                      <div
                        key={i}
                        className={`rounded-xl bg-[#fefae0]/10 p-4 transition-opacity ${
                          rejectedChanges.has(i) ? "opacity-40" : ""
                        }`}
                      >
                        <p className="text-xs font-semibold text-[#fefae0]/70 uppercase tracking-wide">
                          {change.section}
                        </p>
                        <p className="mt-2 text-sm text-[#bc6c25]/80 line-through leading-relaxed">
                          {change.before}
                        </p>
                        <p className="mt-1 text-sm text-[#606c38] leading-relaxed">
                          {change.after}
                        </p>
                        {!acceptedChanges.has(i) && !rejectedChanges.has(i) && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() =>
                                setAcceptedChanges((prev) => new Set(prev).add(i))
                              }
                              className="flex items-center gap-1 rounded-full bg-[#606c38] px-3 py-1 text-xs font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38]/80"
                            >
                              <Check className="h-3 w-3" /> Accept
                            </button>
                            <button
                              onClick={() =>
                                setRejectedChanges((prev) => new Set(prev).add(i))
                              }
                              className="flex items-center gap-1 rounded-full bg-[#bc6c25]/30 px-3 py-1 text-xs font-semibold text-[#fefae0] transition-colors hover:bg-[#bc6c25]/50"
                            >
                              <X className="h-3 w-3" /> Reject
                            </button>
                          </div>
                        )}
                        {acceptedChanges.has(i) && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-[#606c38] font-semibold">
                            <Check className="h-3 w-3" /> Accepted
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bottom actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {pendingChanges > 0 && (
                      <button
                        onClick={() => {
                          const all = new Set(acceptedChanges)
                          diffChanges.forEach((_, i) => {
                            if (!rejectedChanges.has(i)) all.add(i)
                          })
                          setAcceptedChanges(all)
                        }}
                        className="rounded-full bg-[#dda15e] px-6 py-2 text-sm font-bold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                      >
                        Accept all {pendingChanges} changes
                      </button>
                    )}
                    <button className="rounded-full bg-[#606c38] px-6 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38]/80">
                      Download tailored CV
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── TAB 3: Keywords ── */}
              {activeTab === "keywords" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Present */}
                    <div>
                      <h3 className="text-sm font-bold text-[#606c38] mb-3">
                        Present in your CV
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {presentKeywords.map((kw) => (
                          <span
                            key={kw.word}
                            className="flex items-center gap-1.5 rounded-full bg-[#606c38]/20 px-3 py-1 text-sm text-[#fefae0]"
                          >
                            <Check className="h-3 w-3 text-[#606c38]" />
                            {kw.word}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing */}
                    <div>
                      <h3 className="text-sm font-bold text-[#bc6c25] mb-3">
                        Missing
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {missingKeywordsTab.map((kw) => (
                          <span
                            key={kw.word}
                            className={`rounded-full px-3 py-1 text-sm text-[#fefae0] ${
                              kw.priority === "high"
                                ? "bg-[#bc6c25]/40"
                                : kw.priority === "medium"
                                ? "bg-[#bc6c25]/25"
                                : "bg-[#bc6c25]/15"
                            }`}
                          >
                            {kw.word}
                            <span className="ml-1 text-[10px] opacity-70 uppercase">
                              {kw.priority}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Match percentage */}
                  <div className="mt-8 rounded-xl bg-[#fefae0]/10 p-4 text-center">
                    <p className="text-3xl font-bold text-[#dda15e]">
                      {Math.round(
                        (presentKeywords.length /
                          (presentKeywords.length + missingKeywordsTab.length)) *
                          100
                      )}
                      %
                    </p>
                    <p className="mt-1 text-sm text-[#fefae0]/60">
                      Keyword match rate
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
