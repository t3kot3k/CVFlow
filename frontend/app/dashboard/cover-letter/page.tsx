"use client"

import { useState } from "react"
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
} from "lucide-react"

/* ──────────── Types ──────────── */
type Tone = "Professional" | "Enthusiastic" | "Concise" | "Creative"
type Format = "us" | "french" | "international"
type Tab = "edit" | "before-after" | "versions"

/* ──────────── Mock CVs ──────────── */
const cvOptions = [
  { id: 1, title: "Senior Marketing Manager CV", template: "Olive" },
  { id: 2, title: "UX Researcher Resume", template: "Classic" },
  { id: 3, title: "Product Designer CV", template: "Modern" },
]

/* ──────────── Initial Letter ──────────── */
const initialParagraphs = [
  "Objet : Candidature au poste de Senior Marketing Manager",
  "Madame, Monsieur,",
  "Fort de 6 ann\u00e9es d\u2019exp\u00e9rience en marketing digital chez Orange Telecom, o\u00f9 j\u2019ai dirig\u00e9 des campagnes touchant 2,3 millions d\u2019utilisateurs, je souhaite aujourd\u2019hui apporter mon expertise \u00e0 votre entreprise. Mon parcours m\u2019a permis de d\u00e9velopper une vision strat\u00e9gique centr\u00e9e sur la performance et l\u2019innovation.",
  "Au cours de mon parcours, j\u2019ai d\u00e9velopp\u00e9 une solide ma\u00eetrise des outils d\u2019analytics produit et de la gestion de projets cross-fonctionnels, comp\u00e9tences directement align\u00e9es avec les besoins d\u00e9crits dans votre offre. J\u2019ai notamment pilot\u00e9 le lancement de 3 produits digitaux g\u00e9n\u00e9rant un chiffre d\u2019affaires cumul\u00e9 de 1,2 million d\u2019euros.",
  "Je serais ravi(e) de vous rencontrer pour discuter de la valeur que je pourrais apporter \u00e0 votre \u00e9quipe. Je reste disponible pour un entretien \u00e0 votre convenance.",
  "Cordialement,",
  "Amara Diallo",
]

/* ──────────── Saved Versions ──────────── */
const savedVersions = [
  { id: 1, tone: "Professional", date: "15 f\u00e9v 2026, 14:30" },
  { id: 2, tone: "Concise", date: "15 f\u00e9v 2026, 14:45" },
  { id: 3, tone: "Enthusiastic", date: "15 f\u00e9v 2026, 15:00" },
]

export default function CoverLetterPage() {
  /* ── Left panel state ── */
  const [selectedCV, setSelectedCV] = useState(cvOptions[0])
  const [cvDropOpen, setCvDropOpen] = useState(false)
  const [jobDesc, setJobDesc] = useState("")
  const [activeTone, setActiveTone] = useState<Tone>("Professional")
  const [activeFormat, setActiveFormat] = useState<Format>("international")
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState("French")
  const [customInstructions, setCustomInstructions] = useState("")
  const [generated, setGenerated] = useState(true)
  const [generating, setGenerating] = useState(false)

  /* ── Center panel state ── */
  const [activeTab, setActiveTab] = useState<Tab>("edit")
  const [paragraphs, setParagraphs] = useState(initialParagraphs)
  const [hoveredPara, setHoveredPara] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  /* ── Generate handler ── */
  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 2000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(paragraphs.join("\n\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = paragraphs.join(" ").split(/\s+/).filter(Boolean).length

  const tones: Tone[] = ["Professional", "Enthusiastic", "Concise", "Creative"]
  const languages = ["French", "English", "Spanish", "Arabic", "Portuguese"]
  const formats: { key: Format; label: string; desc: string }[] = [
    { key: "us", label: "US Cover Letter", desc: "3 paragraphs" },
    { key: "french", label: "French Lettre de Motivation", desc: "Formal" },
    { key: "international", label: "African / International", desc: "Selected" },
  ]

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
          <span className="flex items-center gap-1 text-xs text-[#606c38]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#606c38]" />
            Saved
          </span>
        </div>
      </header>

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
              <button
                onClick={() => setCvDropOpen(!cvDropOpen)}
                className="flex w-full items-center gap-3 rounded-xl border border-[#606c38]/20 bg-[#fefae0] p-3 text-left transition-colors hover:border-[#dda15e]"
              >
                <div className="flex h-9 w-7 shrink-0 items-center justify-center rounded bg-[#606c38]/10">
                  <FileText className="h-4 w-4 text-[#606c38]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#283618]">
                    {selectedCV.title}
                  </p>
                  <p className="text-[10px] text-[#606c38]">{selectedCV.template} template</p>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#606c38] transition-transform ${cvDropOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {cvDropOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCvDropOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                    >
                      {cvOptions.map((cv) => (
                        <button
                          key={cv.id}
                          onClick={() => { setSelectedCV(cv); setCvDropOpen(false) }}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#fefae0] ${
                            selectedCV.id === cv.id ? "bg-[#dda15e]/10" : ""
                          }`}
                        >
                          <div className="flex h-8 w-6 items-center justify-center rounded bg-[#606c38]/10">
                            <FileText className="h-3.5 w-3.5 text-[#606c38]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#283618]">{cv.title}</p>
                            <p className="text-[10px] text-[#606c38]">{cv.template}</p>
                          </div>
                          {selectedCV.id === cv.id && (
                            <Check className="ml-auto h-4 w-4 text-[#dda15e]" />
                          )}
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
                  key={tone}
                  onClick={() => setActiveTone(tone)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTone === tone
                      ? "bg-[#283618] text-[#fefae0]"
                      : "border border-[#606c38]/20 text-[#283618] hover:border-[#606c38]/40"
                  }`}
                >
                  {tone}
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
                      activeFormat === fmt.key
                        ? "border-[#dda15e]"
                        : "border-[#606c38]/30"
                    }`}
                  >
                    {activeFormat === fmt.key && (
                      <div className="h-2 w-2 rounded-full bg-[#dda15e]" />
                    )}
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
                <span>{selectedLang === "French" ? "\ud83c\uddeb\ud83c\uddf7" : selectedLang === "English" ? "\ud83c\uddec\ud83c\udde7" : selectedLang === "Spanish" ? "\ud83c\uddea\ud83c\uddf8" : selectedLang === "Arabic" ? "\ud83c\uddf8\ud83c\udde6" : "\ud83c\udde7\ud83c\uddf7"} {selectedLang}</span>
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
                          <span>{lang === "French" ? "\ud83c\uddeb\ud83c\uddf7" : lang === "English" ? "\ud83c\uddec\ud83c\udde7" : lang === "Spanish" ? "\ud83c\uddea\ud83c\uddf8" : lang === "Arabic" ? "\ud83c\uddf8\ud83c\udde6" : "\ud83c\udde7\ud83c\uddf7"}</span>
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
            disabled={generating}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#dda15e] py-3 text-sm font-bold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-60"
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
          {generated && !generating && (
            <button
              onClick={handleGenerate}
              className="mt-2 w-full text-center text-xs font-medium text-[#606c38] transition-colors hover:text-[#283618]"
            >
              Regenerate with different tone
            </button>
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
                { key: "versions" as Tab, label: `Versions (${savedVersions.length})` },
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
              {activeTab === "edit" && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-auto max-w-2xl"
                >
                  <div className="rounded-2xl bg-white p-8 shadow-sm">
                    {/* Date */}
                    <p className="text-right text-sm text-[#606c38]">
                      Dakar, le 15 f\u00e9vrier 2026
                    </p>

                    {/* Letter content */}
                    <div className="mt-6 space-y-5">
                      {paragraphs.map((para, i) => {
                        const isSubject = i === 0
                        const isSignature = i === paragraphs.length - 1
                        const isSalutation = i === 1 || i === paragraphs.length - 2

                        return (
                          <div
                            key={i}
                            className="group relative"
                            onMouseEnter={() => setHoveredPara(i)}
                            onMouseLeave={() => setHoveredPara(null)}
                          >
                            {isSubject ? (
                              <p
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const newParas = [...paragraphs]
                                  newParas[i] = e.currentTarget.textContent || para
                                  setParagraphs(newParas)
                                }}
                                className="text-sm font-semibold text-[#283618] outline-none focus:ring-2 focus:ring-[#dda15e]/20 rounded px-1 -mx-1"
                              >
                                {para}
                              </p>
                            ) : isSalutation ? (
                              <p className="text-sm text-[#283618]">{para}</p>
                            ) : isSignature ? (
                              <p className="text-sm font-semibold text-[#283618]">{para}</p>
                            ) : (
                              <>
                                <p
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => {
                                    const newParas = [...paragraphs]
                                    newParas[i] = e.currentTarget.textContent || para
                                    setParagraphs(newParas)
                                  }}
                                  className="text-sm leading-relaxed text-[#283618] outline-none focus:ring-2 focus:ring-[#dda15e]/20 rounded px-1 -mx-1"
                                >
                                  {para}
                                </p>
                                {/* Rewrite button */}
                                <AnimatePresence>
                                  {hoveredPara === i && (
                                    <motion.button
                                      initial={{ opacity: 0, x: -4 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -4 }}
                                      className="absolute -right-2 top-0 flex items-center gap-1 rounded-full bg-[#dda15e] px-3 py-1 text-xs font-semibold text-[#283618] shadow-md transition-colors hover:bg-[#bc6c25]"
                                    >
                                      <Sparkles className="h-3 w-3" />
                                      Rewrite
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bottom actions */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#606c38]">
                      {wordCount} words {"\u00B7"} ~1 page
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-full border border-[#606c38]/20 px-3 py-1.5 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-[#606c38]" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                      <button className="flex items-center gap-1.5 rounded-full border border-[#606c38]/20 px-3 py-1.5 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5">
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>
                      <button className="flex items-center gap-1.5 rounded-full border border-[#606c38]/20 px-3 py-1.5 text-xs font-medium text-[#283618] transition-colors hover:bg-[#606c38]/5">
                        <Download className="h-3.5 w-3.5" />
                        DOCX
                      </button>
                      <Link
                        href="/dashboard/jobs"
                        className="flex items-center gap-1.5 rounded-full bg-[#dda15e] px-3 py-1.5 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                      >
                        {"Link to application \u2192"}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "before-after" && (
                <motion.div
                  key="before-after"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-auto max-w-3xl"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Before */}
                    <div className="rounded-2xl border border-[#606c38]/15 bg-white p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#bc6c25]" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#bc6c25]">Before</span>
                      </div>
                      <div className="space-y-3 text-sm leading-relaxed text-[#283618]/60">
                        <p>{"Je suis int\u00e9ress\u00e9 par le poste de Marketing Manager. J\u2019ai travaill\u00e9 6 ans dans le marketing. J\u2019ai de l\u2019exp\u00e9rience avec les campagnes digitales."}</p>
                        <p>{"Je connais les outils d\u2019analytics et la gestion de projets. Je pense que je serais un bon candidat pour ce poste."}</p>
                        <p>{"Merci de consid\u00e9rer ma candidature."}</p>
                      </div>
                    </div>
                    {/* After */}
                    <div className="rounded-2xl border border-[#606c38]/15 bg-white p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#606c38]" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">After (AI-enhanced)</span>
                      </div>
                      <div className="space-y-3 text-sm leading-relaxed text-[#283618]">
                        <p>{paragraphs[2]}</p>
                        <p>{paragraphs[3]}</p>
                        <p>{paragraphs[4]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 rounded-xl bg-[#606c38]/5 p-4 text-center">
                    <p className="text-xs text-[#606c38]">
                      <span className="font-semibold text-[#283618]">AI improvements:</span>{" "}
                      Added quantified achievements, matched job keywords, improved flow and professional tone.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "versions" && (
                <motion.div
                  key="versions"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-auto max-w-2xl space-y-3"
                >
                  {savedVersions.map((v) => (
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
                            v{v.id} {"\u2014"} {v.tone}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-[#606c38]">
                            <Clock className="h-3 w-3" />
                            {v.date}
                          </p>
                        </div>
                      </div>
                      <button className="text-xs font-semibold text-[#606c38] transition-colors hover:text-[#283618]">
                        Restore
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* ═══════ RIGHT PREVIEW PANEL ═══════ */}
        <aside className="hidden w-[320px] shrink-0 flex-col overflow-y-auto border-l border-[#606c38]/10 bg-white p-6 xl:flex">
          <p className="border-b border-[#606c38]/10 pb-3 text-sm font-semibold text-[#283618]">
            Preview
          </p>

          {/* A4 paper preview */}
          <div className="mt-4 rounded-lg bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.08)] ring-1 ring-[#606c38]/10">
            <div className="aspect-[210/297] overflow-hidden">
              <div className="origin-top-left scale-[0.42]" style={{ width: "240%" }}>
                {/* Mini letter preview */}
                <div className="p-10">
                  <p className="text-right text-sm text-[#606c38]">Dakar, le 15 f\u00e9vrier 2026</p>
                  <div className="mt-8 space-y-4">
                    <p className="text-base font-semibold text-[#283618]">{paragraphs[0]}</p>
                    {paragraphs.slice(1).map((p, i) => (
                      <p
                        key={i}
                        className={`text-sm leading-relaxed ${
                          i === 0 || i === paragraphs.length - 3
                            ? "text-[#283618]"
                            : i === paragraphs.length - 2
                            ? "font-semibold text-[#283618]"
                            : "text-[#283618]/80"
                        }`}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                  {/* Footer */}
                  <div className="mt-12 border-t border-[#606c38]/10 pt-3">
                    <p className="text-xs text-[#606c38]">
                      {"Amara Diallo \u00B7 amara@email.com \u00B7 +221 XX XXX XXXX"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="mt-3 text-center text-xs font-semibold text-[#dda15e] transition-colors hover:text-[#bc6c25]">
            {"Full preview \u2192"}
          </button>

          {/* ATS note */}
          <p className="mt-4 text-xs italic text-[#606c38]">
            {"Cover letters are not ATS-scored \u2014 this is for human recruiters."}
          </p>

          {/* Saved versions */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-[#283618]">Saved versions:</p>
            <div className="mt-2 space-y-2">
              {savedVersions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-[#606c38]/10 bg-[#fefae0] p-2.5"
                >
                  <div>
                    <p className="text-xs font-medium text-[#283618]">
                      v{v.id} {"\u2014"} {v.tone}
                    </p>
                    <p className="text-[10px] text-[#606c38]">{v.date}</p>
                  </div>
                  <button className="text-[10px] font-semibold text-[#606c38] transition-colors hover:text-[#283618]">
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
