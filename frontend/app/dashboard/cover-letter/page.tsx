"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  FileText,
  Check,
  Mail,
  Clock,
  ExternalLink,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react"
import { onAuthStateChanged, auth } from "@/lib/firebase"
import { cvApi, type CVSummary } from "@/lib/api/cv"
import { coverLetterApi, type CoverLetterContent, type CoverLetterVersion, type CoverLetterTone, type CoverLetterFormat } from "@/lib/api/cover-letter"

/* ──────────── Types ──────────── */
type Tab = "edit" | "before-after" | "versions"

const LANG_ISO: Record<string, string> = {
  French: "fr", English: "en", Spanish: "es", Arabic: "ar", Portuguese: "pt",
}

export default function CoverLetterPage() {
  /* ── CVs ── */
  const [cvs, setCvs] = useState<CVSummary[]>([])
  const [cvsLoading, setCvsLoading] = useState(true)
  const [selectedCv, setSelectedCv] = useState<CVSummary | null>(null)
  const [cvDropOpen, setCvDropOpen] = useState(false)

  /* ── Left panel state ── */
  const [jobDesc, setJobDesc] = useState("")
  const [activeTone, setActiveTone] = useState<CoverLetterTone>("professional")
  const [activeFormat, setActiveFormat] = useState<CoverLetterFormat>("international")
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState("English")
  const [customInstructions, setCustomInstructions] = useState("")
  const [generating, setGenerating] = useState(false)

  /* ── Cover letter content ── */
  const [clId, setClId] = useState<string | null>(null)
  const [paragraphs, setParagraphs] = useState<string[]>([])
  const [originalParagraphs, setOriginalParagraphs] = useState<string[]>([]) // for before/after
  const [generated, setGenerated] = useState(false)

  /* ── Editor state ── */
  const [activeTab, setActiveTab] = useState<Tab>("edit")
  const [hoveredPara, setHoveredPara] = useState<number | null>(null)
  const [rewritingPara, setRewritingPara] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  /* ── Versions ── */
  const [versions, setVersions] = useState<CoverLetterVersion[]>([])
  const [savingVersion, setSavingVersion] = useState(false)

  /* ── Download ── */
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null)

  /* ── Error ── */
  const [error, setError] = useState<string | null>(null)

  /* ── Load CVs on auth ── */
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

  /* ── Load versions when clId changes ── */
  useEffect(() => {
    if (!clId) return
    coverLetterApi.listVersions(clId)
      .then(setVersions)
      .catch(() => {})
  }, [clId])

  /* ── Generate ── */
  const handleGenerate = async () => {
    if (!selectedCv) { setError("Please select a CV first."); return }
    if (!jobDesc.trim()) { setError("Please paste a job description."); return }
    setError(null)
    setGenerating(true)
    setOriginalParagraphs(paragraphs) // save before for comparison
    try {
      const result: CoverLetterContent = await coverLetterApi.generate({
        cv_id: selectedCv.id,
        job_description: jobDesc,
        tone: activeTone,
        format: activeFormat,
        language: LANG_ISO[selectedLang] ?? "en",
        custom_instructions: customInstructions || undefined,
      })
      setParagraphs(result.paragraphs)
      setClId(result.id ?? null)
      setGenerated(true)
      setActiveTab("edit")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Try again.")
    } finally {
      setGenerating(false)
    }
  }

  /* ── Rewrite paragraph ── */
  const handleRewrite = async (index: number) => {
    if (!paragraphs[index]) return
    setRewritingPara(index)
    try {
      const { rewritten_text } = await coverLetterApi.rewriteParagraph(
        index, paragraphs[index], activeTone
      )
      setParagraphs(prev => {
        const next = [...prev]
        next[index] = rewritten_text
        return next
      })
    } catch {
      // silent — user can try again
    } finally {
      setRewritingPara(null)
    }
  }

  /* ── Copy ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(paragraphs.join("\n\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── Download ── */
  const handleDownload = async (format: "pdf" | "docx") => {
    if (!paragraphs.length) return
    setDownloading(format)
    setError(null)
    try {
      const blob = await coverLetterApi.download(paragraphs, format, activeTone, activeFormat)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `cover-letter.${format}`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { if (a.parentNode) a.parentNode.removeChild(a); URL.revokeObjectURL(url) }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed. Try again.")
    } finally {
      setDownloading(null)
    }
  }

  /* ── Save version ── */
  const handleSaveVersion = async () => {
    if (!clId) return
    setSavingVersion(true)
    try {
      const v = await coverLetterApi.saveVersion(clId)
      setVersions(prev => [v, ...prev])
    } catch {
      // silent
    } finally {
      setSavingVersion(false)
    }
  }

  const wordCount = paragraphs.join(" ").split(/\s+/).filter(Boolean).length
  const canGenerate = !!selectedCv && !!jobDesc.trim() && !generating

  const tones: { key: CoverLetterTone; label: string }[] = [
    { key: "professional", label: "Professional" },
    { key: "enthusiastic", label: "Enthusiastic" },
    { key: "concise", label: "Concise" },
    { key: "creative", label: "Creative" },
  ]
  const languages = ["French", "English", "Spanish", "Arabic", "Portuguese"]
  const formats: { key: CoverLetterFormat; label: string; desc: string }[] = [
    { key: "us", label: "US Cover Letter", desc: "3 paragraphs" },
    { key: "french", label: "French Lettre de Motivation", desc: "Formal" },
    { key: "international", label: "African / International", desc: "Selected" },
  ]

  const langFlag: Record<string, string> = {
    French: "🇫🇷", English: "🇬🇧", Spanish: "🇪🇸", Arabic: "🇸🇦", Portuguese: "🇧🇷",
  }

  return (
    <div className="flex h-screen flex-col bg-[#fefae0]">
      {/* ── Top Bar ── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#606c38]/15 bg-white px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-5 w-px bg-[#606c38]/15" />
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#dda15e]" />
            <span className="text-sm font-semibold text-[#283618]">Cover Letter</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {generated && clId && (
            <button
              onClick={handleSaveVersion}
              disabled={savingVersion}
              className="flex items-center gap-1.5 rounded-full border border-[#606c38]/20 px-3 py-1.5 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5 disabled:opacity-50"
            >
              {savingVersion ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
              Save version
            </button>
          )}
          <span className="flex items-center gap-1 text-xs text-[#606c38]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#606c38]" />
            {generated ? "Generated" : "Ready"}
          </span>
        </div>
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

      {/* ── 3-panel body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ═══════ LEFT SETTINGS PANEL ═══════ */}
        <aside className="w-[280px] shrink-0 overflow-y-auto border-r border-[#606c38]/10 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#283618]">
            <Mail className="h-5 w-5 text-[#dda15e]" />
            Cover Letter
          </h2>

          {/* Linked CV selector */}
          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              Based on CV:
            </label>
            <div className="relative mt-1.5">
              {cvsLoading ? (
                <div className="h-[52px] animate-pulse rounded-xl bg-[#606c38]/10" />
              ) : (
                <button
                  onClick={() => cvs.length > 0 && setCvDropOpen(!cvDropOpen)}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#606c38]/20 bg-[#fefae0] p-3 text-left transition-colors hover:border-[#dda15e]"
                >
                  <div className="flex h-9 w-7 shrink-0 items-center justify-center rounded bg-[#606c38]/10">
                    <FileText className="h-4 w-4 text-[#606c38]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#283618]">
                      {selectedCv?.title ?? (cvs.length === 0 ? "No CVs yet" : "Select a CV")}
                    </p>
                    <p className="text-[10px] text-[#606c38]">
                      {selectedCv ? selectedCv.template_id + " template" : "Go to CVs to create one"}
                    </p>
                  </div>
                  {cvs.length > 0 && <ChevronDown className={`h-4 w-4 shrink-0 text-[#606c38] transition-transform ${cvDropOpen ? "rotate-180" : ""}`} />}
                </button>
              )}
              <AnimatePresence>
                {cvDropOpen && cvs.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCvDropOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                    >
                      {cvs.map((cv) => (
                        <button
                          key={cv.id}
                          onClick={() => { setSelectedCv(cv); setCvDropOpen(false) }}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#fefae0] ${
                            selectedCv?.id === cv.id ? "bg-[#dda15e]/10" : ""
                          }`}
                        >
                          <div className="flex h-8 w-6 items-center justify-center rounded bg-[#606c38]/10">
                            <FileText className="h-3.5 w-3.5 text-[#606c38]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#283618]">{cv.title}</p>
                            <p className="text-[10px] text-[#606c38]">{cv.template_id}</p>
                          </div>
                          {selectedCv?.id === cv.id && <Check className="ml-auto h-4 w-4 text-[#dda15e]" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Job Offer */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              For this job:
            </label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste job description or title..."
              className="mt-1.5 h-24 w-full resize-none rounded-xl border border-[#606c38]/20 bg-[#fefae0] p-3 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
            />
            <Link
              href="/dashboard/jobs"
              className="mt-1 inline-flex items-center gap-1 text-xs text-[#606c38] transition-colors hover:text-[#283618]"
            >
              <ExternalLink className="h-3 w-3" />
              Link from Job Tracker
            </Link>
          </div>

          {/* Tone selector */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              Tone:
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {tones.map((tone) => (
                <button
                  key={tone.key}
                  onClick={() => setActiveTone(tone.key)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTone === tone.key
                      ? "bg-[#283618] text-[#fefae0]"
                      : "border border-[#606c38]/20 text-[#283618] hover:border-[#606c38]/40"
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format selector */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              Format:
            </label>
            <div className="mt-1.5 space-y-2">
              {formats.map((fmt) => (
                <label
                  key={fmt.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                    activeFormat === fmt.key
                      ? "border-[#dda15e] bg-[#dda15e]/5"
                      : "border-[#606c38]/15 hover:border-[#606c38]/30"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      activeFormat === fmt.key ? "border-[#dda15e]" : "border-[#606c38]/30"
                    }`}
                  >
                    {activeFormat === fmt.key && <div className="h-2 w-2 rounded-full bg-[#dda15e]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#283618]">{fmt.label}</p>
                    <p className="text-[10px] text-[#606c38]">({fmt.desc})</p>
                  </div>
                  <input
                    type="radio"
                    name="format"
                    value={fmt.key}
                    checked={activeFormat === fmt.key}
                    onChange={() => setActiveFormat(fmt.key)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              Language:
            </label>
            <div className="relative mt-1.5">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] transition-colors hover:border-[#dda15e]"
              >
                <span>{langFlag[selectedLang]} {selectedLang}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-[#606c38] transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => { setSelectedLang(lang); setLangOpen(false) }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-[#283618] transition-colors hover:bg-[#fefae0] ${
                            selectedLang === lang ? "bg-[#dda15e]/10 font-medium" : ""
                          }`}
                        >
                          <span>{langFlag[lang]}</span>
                          {lang}
                          {selectedLang === lang && <Check className="ml-auto h-3.5 w-3.5 text-[#dda15e]" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Custom instructions */}
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              Custom instructions:
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder={"Add specific instructions...\ne.g. Mention my 5 years in Dakar. Focus on leadership."}
              className="mt-1.5 h-20 w-full resize-none rounded-xl border border-[#606c38]/20 bg-[#fefae0] p-3 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#dda15e] py-3 text-sm font-bold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {generated ? "Regenerate Cover Letter" : "Generate Cover Letter"}
              </>
            )}
          </button>
          {!canGenerate && !generating && (
            <p className="mt-2 text-center text-xs text-[#606c38]/60">
              {!selectedCv ? "Select a CV first" : "Paste a job description to continue"}
            </p>
          )}
          {canGenerate && (
            <p className="mt-2 text-center text-xs text-[#606c38]/60">
              Generation takes about 10–15 seconds
            </p>
          )}
        </aside>

        {/* ═══════ CENTER EDITOR ═══════ */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex shrink-0 items-center gap-1 border-b border-[#606c38]/10 bg-white px-6 pt-3">
            {(
              [
                { key: "edit" as Tab, label: "Edit" },
                { key: "before-after" as Tab, label: "Before / After" },
                { key: "versions" as Tab, label: `Versions (${versions.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-[#283618]"
                    : "text-[#606c38]/60 hover:text-[#283618]"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="cl-tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#dda15e]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Editor area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {/* ── TAB: Edit ── */}
              {activeTab === "edit" && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-auto max-w-2xl"
                >
                  {/* Generating overlay */}
                  {generating && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-[#dda15e]/40 bg-white p-5 shadow-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dda15e]/15">
                        <Sparkles className="h-5 w-5 text-[#dda15e]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#283618]">Generating your cover letter…</p>
                        <p className="text-xs text-[#606c38]/60">This takes about 10–15 seconds</p>
                      </div>
                      <Loader2 className="ml-auto h-5 w-5 animate-spin text-[#dda15e]" />
                    </div>
                  )}

                  {!generated && !generating ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white p-12 text-center">
                      <Mail className="h-12 w-12 text-[#606c38]/30" />
                      <p className="mt-4 text-base font-semibold text-[#283618]/60">
                        Your cover letter will appear here.
                      </p>
                      <p className="mt-1 text-sm text-[#606c38]/40">
                        Select a CV, paste a job description, and click Generate.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl bg-white p-8 shadow-sm">
                        {/* Letter content */}
                        <div className="space-y-5">
                          {paragraphs.map((para, i) => {
                            const isFirst = i === 0
                            const isLast = i === paragraphs.length - 1
                            const isShort = para.split(" ").length <= 5 // salutation or signature

                            return (
                              <div
                                key={i}
                                className="group relative"
                                onMouseEnter={() => setHoveredPara(i)}
                                onMouseLeave={() => setHoveredPara(null)}
                              >
                                <p
                                  contentEditable={!generating}
                                  suppressContentEditableWarning
                                  onBlur={(e) => {
                                    const newParas = [...paragraphs]
                                    newParas[i] = e.currentTarget.textContent || para
                                    setParagraphs(newParas)
                                  }}
                                  className={`outline-none focus:ring-2 focus:ring-[#dda15e]/20 rounded px-1 -mx-1 text-sm leading-relaxed text-[#283618] ${
                                    isFirst ? "font-semibold" : isLast ? "font-semibold" : isShort ? "" : ""
                                  }`}
                                >
                                  {para}
                                </p>

                                {/* Rewrite button — only on body paragraphs */}
                                {!isShort && !isFirst && !isLast && (
                                  <AnimatePresence>
                                    {hoveredPara === i && rewritingPara !== i && (
                                      <motion.button
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -4 }}
                                        onClick={() => handleRewrite(i)}
                                        className="absolute -right-2 top-0 flex items-center gap-1 rounded-full bg-[#dda15e] px-3 py-1 text-xs font-semibold text-[#283618] shadow-md transition-colors hover:bg-[#bc6c25]"
                                      >
                                        <Sparkles className="h-3 w-3" />
                                        Rewrite
                                      </motion.button>
                                    )}
                                    {rewritingPara === i && (
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute -right-2 top-0 flex items-center gap-1 rounded-full bg-[#dda15e]/80 px-3 py-1 text-xs text-[#283618]"
                                      >
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Rewriting…
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Bottom actions */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-[#606c38]">
                          {wordCount} words · ~1 page
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 rounded-full border border-[#606c38]/20 px-3 py-1.5 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5"
                          >
                            {copied ? <Check className="h-3.5 w-3.5 text-[#606c38]" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                          <button
                            onClick={() => handleDownload("pdf")}
                            disabled={!!downloading}
                            className="flex items-center gap-1.5 rounded-full border border-[#606c38]/20 px-3 py-1.5 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5 disabled:opacity-50"
                          >
                            {downloading === "pdf"
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Download className="h-3.5 w-3.5" />
                            }
                            PDF
                          </button>
                          <button
                            onClick={() => handleDownload("docx")}
                            disabled={!!downloading}
                            className="flex items-center gap-1.5 rounded-full border border-[#606c38]/20 px-3 py-1.5 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5 disabled:opacity-50"
                          >
                            {downloading === "docx"
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Download className="h-3.5 w-3.5" />
                            }
                            DOCX
                          </button>
                          <Link
                            href="/dashboard/jobs"
                            className="flex items-center gap-1.5 rounded-full bg-[#dda15e] px-3 py-1.5 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                          >
                            Link to application →
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ── TAB: Before / After ── */}
              {activeTab === "before-after" && (
                <motion.div
                  key="before-after"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-auto max-w-3xl"
                >
                  {!generated ? (
                    <div className="rounded-2xl border border-[#606c38]/15 bg-white p-10 text-center">
                      <p className="text-sm text-[#606c38]/60">Generate a cover letter first to see the before/after comparison.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Before */}
                        <div className="rounded-2xl border border-[#606c38]/15 bg-white p-6">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#bc6c25]" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#bc6c25]">Before</span>
                          </div>
                          {originalParagraphs.length > 0 ? (
                            <div className="space-y-3 text-sm leading-relaxed text-[#283618]/60">
                              {originalParagraphs.slice(0, 4).map((p, i) => <p key={i}>{p}</p>)}
                            </div>
                          ) : (
                            <p className="text-sm text-[#283618]/40 italic">No previous version — this was the first generation.</p>
                          )}
                        </div>
                        {/* After */}
                        <div className="rounded-2xl border border-[#606c38]/15 bg-white p-6">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#606c38]" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">After (AI-enhanced)</span>
                          </div>
                          <div className="space-y-3 text-sm leading-relaxed text-[#283618]">
                            {paragraphs.slice(0, 4).map((p, i) => <p key={i}>{p}</p>)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 rounded-xl bg-[#606c38]/5 p-4 text-center">
                        <p className="text-xs text-[#606c38]">
                          <span className="font-semibold text-[#283618]">AI improvements:</span>{" "}
                          Added quantified achievements, matched job keywords, improved flow and professional tone.
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ── TAB: Versions ── */}
              {activeTab === "versions" && (
                <motion.div
                  key="versions"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-auto max-w-2xl"
                >
                  {versions.length === 0 ? (
                    <div className="rounded-2xl border border-[#606c38]/15 bg-white p-10 text-center">
                      <Clock className="mx-auto h-8 w-8 text-[#606c38]/30" />
                      <p className="mt-3 text-sm text-[#606c38]/60">
                        No saved versions yet. Click "Save version" in the top bar after generating.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {versions.map((v, idx) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-2xl border border-[#606c38]/15 bg-white p-5 transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#606c38]/10">
                              <FileText className="h-5 w-5 text-[#606c38]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#283618]">
                                v{versions.length - idx} — {v.tone}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-[#606c38]">
                                <Clock className="h-3 w-3" />
                                {new Date(v.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* ═══════ RIGHT PREVIEW PANEL ═══════ */}
        <aside className="hidden w-[300px] shrink-0 flex-col overflow-y-auto border-l border-[#606c38]/10 bg-white p-6 xl:flex">
          <p className="border-b border-[#606c38]/10 pb-3 text-sm font-semibold text-[#283618]">
            Preview
          </p>

          {/* A4 paper preview */}
          <div className="mt-4 rounded-lg bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.08)] ring-1 ring-[#606c38]/10">
            <div className="aspect-[210/297] overflow-hidden">
              <div className="origin-top-left scale-[0.38]" style={{ width: "264%" }}>
                <div className="p-10">
                  {paragraphs.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-lg text-[#606c38]/30">Generate to preview</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paragraphs.map((p, i) => (
                        <p
                          key={i}
                          className={`text-sm leading-relaxed ${
                            i === 0 || i === paragraphs.length - 1
                              ? "font-semibold text-[#283618]"
                              : "text-[#283618]/80"
                          }`}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ATS note */}
          <p className="mt-4 text-xs italic text-[#606c38]">
            Cover letters are not ATS-scored — this is for human recruiters.
          </p>

          {/* Quick download */}
          {generated && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold text-[#283618]">Download:</p>
              <button
                onClick={() => handleDownload("pdf")}
                disabled={!!downloading}
                className="flex w-full items-center gap-2 rounded-lg border border-[#606c38]/20 px-3 py-2 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5 disabled:opacity-50"
              >
                {downloading === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download PDF
              </button>
              <button
                onClick={() => handleDownload("docx")}
                disabled={!!downloading}
                className="flex w-full items-center gap-2 rounded-lg border border-[#606c38]/20 px-3 py-2 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5 disabled:opacity-50"
              >
                {downloading === "docx" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download DOCX
              </button>
            </div>
          )}

          {/* Saved versions sidebar */}
          {versions.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-[#283618]">Saved versions:</p>
              <div className="mt-2 space-y-2">
                {versions.slice(0, 3).map((v, idx) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border border-[#606c38]/10 bg-[#fefae0] p-2.5"
                  >
                    <div>
                      <p className="text-xs font-medium text-[#283618]">
                        v{versions.length - idx} — {v.tone}
                      </p>
                      <p className="text-[10px] text-[#606c38]">
                        {new Date(v.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
