"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LinkIcon,
  ClipboardPaste,
  CheckCircle,
  XCircle,
  Sparkles,
  Copy,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  ArrowRight,
  Check,
} from "lucide-react"

/* ──────────── Section Data ──────────── */
const sections = [
  {
    id: "headline",
    label: "Headline",
    score: 45,
    borderColor: "border-[#bc6c25]",
    scoreColor: "text-[#bc6c25]",
    current: "Marketing Manager at Orange",
    weaknesses: [
      "No keywords recruiters search for",
      "Doesn't show your value proposition",
      "No industry signals",
    ],
    suggestions: [
      {
        text: 'Senior Marketing Manager | Orange Money \u00B7 2.3M users | Growth & Digital Strategy | Afrique de l\'Ouest',
        boost: "+38",
      },
      {
        text: 'Marketing Leader | Ex-Orange | Brand, Data & Campaign Strategy | 6Y exp | Open to Europe',
        boost: "+32",
      },
      {
        text: 'Growth Marketing | Telco & Fintech | Orange Money | B2C at Scale',
        boost: "+29",
      },
    ],
  },
  {
    id: "about",
    label: "About",
    score: 62,
    borderColor: "border-[#dda15e]",
    scoreColor: "text-[#dda15e]",
    current:
      "Experienced marketing professional with passion for digital campaigns and brand strategy. I love helping companies grow and connecting with audiences through innovative marketing solutions.",
    weaknesses: [
      "No quantified achievements or metrics",
      "Generic language that could apply to anyone",
      "Missing call-to-action and contact info",
    ],
    suggestions: [
      {
        text: 'Marketing leader with 6+ years driving growth for Orange Money across West Africa. Scaled user acquisition from 800K to 2.3M active users. Led a 12-person team executing 40+ campaigns/year with avg. 3.2x ROAS. Specialties: growth marketing, data-driven campaigns, B2C fintech. Open to senior roles in Europe & Africa. Let\'s connect: amara@email.com',
        boost: "+30",
      },
      {
        text: 'I help telcos and fintechs acquire millions of users through data-driven marketing. At Orange Money, I grew the active user base by 187% in 2 years while reducing CAC by 34%. My team of 12 runs campaigns across 5 West African markets. Currently exploring senior marketing opportunities in Europe.',
        boost: "+27",
      },
      {
        text: '6 years in marketing. 2.3M users acquired. 40+ campaigns per year. That\'s my track record at Orange Money. I combine brand storytelling with hard analytics to drive growth in emerging markets. Looking for my next challenge in a global fintech or tech company.',
        boost: "+25",
      },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    score: 78,
    borderColor: "border-[#606c38]",
    scoreColor: "text-[#606c38]",
    current: "Good start! 2 bullet points could be stronger.",
    weaknesses: [
      "Some bullets lack quantified results",
      "Missing action verbs at the start of bullets",
    ],
    suggestions: [
      {
        text: '"Managed marketing campaigns" \u2192 "Led 40+ multi-channel campaigns across 5 markets, achieving 3.2x average ROAS and 187% user growth"',
        boost: "+12",
      },
      {
        text: '"Worked on brand strategy" \u2192 "Developed and executed brand positioning strategy that increased brand awareness by 45% in under-30 demographic"',
        boost: "+10",
      },
      {
        text: '"Responsible for team management" \u2192 "Recruited, mentored, and led a high-performing team of 12 marketers across digital, brand, and analytics functions"',
        boost: "+8",
      },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    score: 55,
    borderColor: "border-[#bc6c25]",
    scoreColor: "text-[#bc6c25]",
    current: "You have 12 skills listed.",
    weaknesses: [
      "Missing 6 key skills recruiters in your field search for",
      "Skills not ordered by relevance",
    ],
    suggestions: [],
    missingSkills: [
      "Product Analytics",
      "Agile",
      "Tableau",
      "Growth Marketing",
      "SEO",
      "HubSpot",
    ],
  },
  {
    id: "photo",
    label: "Photo & Banner",
    score: null,
    borderColor: "border-[#606c38]",
    scoreColor: "text-[#606c38]",
    current: null,
    weaknesses: [],
    suggestions: [],
    isGuide: true,
  },
]

/* ──────────── Score Ring SVG ──────────── */
function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? "#606c38" : score >= 60 ? "#dda15e" : "#bc6c25"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#606c38"
          strokeOpacity={0.1}
          strokeWidth={8}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#283618]">{score}</span>
        <span className="text-xs text-[#283618]/50">/100</span>
      </div>
    </div>
  )
}

/* ──────────── Main Page ──────────── */
export default function LinkedInOptimizerPage() {
  const [expanded, setExpanded] = useState<string | null>("headline")
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [showAfter, setShowAfter] = useState(false)
  const [addedSkills, setAddedSkills] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [importUrl, setImportUrl] = useState("")
  const [importText, setImportText] = useState("")

  // Compute the "after" score
  const baseScore = 64
  const totalBoost = Object.entries(selected).reduce((acc, [sectionId, idx]) => {
    const section = sections.find((s) => s.id === sectionId)
    if (section && section.suggestions[idx]) {
      return acc + parseInt(section.suggestions[idx].boost.replace("+", ""))
    }
    return acc
  }, 0)
  const skillBoost = addedSkills.length > 0 ? Math.min(addedSkills.length * 3, 15) : 0
  const afterScore = Math.min(baseScore + totalBoost + skillBoost, 100)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const scoreLabel =
    afterScore >= 90
      ? "Excellent"
      : afterScore >= 80
      ? "Strong profile"
      : afterScore >= 70
      ? "Good, keep improving"
      : "Room for improvement"

  const scoreLabelColor =
    afterScore >= 80 ? "text-[#606c38]" : afterScore >= 70 ? "text-[#dda15e]" : "text-[#bc6c25]"

  return (
    <div className="min-h-screen bg-[#fefae0]">
      {/* ── Page Header ── */}
      <header className="sticky top-0 z-30 border-b border-[#606c38]/10 bg-white px-4 py-4 sm:px-8 sm:py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#606c38]/15 text-[#283618] transition-colors hover:bg-[#606c38]/5"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#283618] sm:text-2xl">
                LinkedIn Profile Optimizer
              </h1>
              <p className="text-xs text-[#606c38] sm:text-sm">
                The only CV builder that also optimizes your LinkedIn -- no competitor offers this.
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="rounded-full border border-[#dda15e] bg-[#dda15e]/20 px-4 py-1.5 text-sm font-semibold text-[#283618]">
              Your LinkedIn Score: {showAfter ? afterScore : baseScore}/100
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        {/* Import Row */}
        <div className="mb-8 rounded-2xl border border-[#606c38]/10 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-bold text-[#283618]">
            1. Import your LinkedIn profile
          </h3>
          <div className="mt-4 flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
            {/* Option A */}
            <div className="flex-1 rounded-xl border-2 border-dashed border-[#606c38]/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#283618]">
                <LinkIcon className="h-4 w-4 text-[#606c38]" />
                Paste your LinkedIn URL
              </div>
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="mt-2 w-full rounded-lg border border-[#606c38]/15 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 focus:border-[#dda15e] focus:outline-none focus:ring-2 focus:ring-[#dda15e]/20"
              />
              <button className="mt-3 rounded-full bg-[#dda15e] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
                {"Import \u2192"}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center lg:flex-col lg:self-stretch">
              <div className="h-px flex-1 bg-[#606c38]/15 lg:h-auto lg:w-px lg:flex-1" />
              <span className="px-3 text-xs font-medium text-[#606c38]/50 lg:py-3 lg:px-0">
                or
              </span>
              <div className="h-px flex-1 bg-[#606c38]/15 lg:h-auto lg:w-px lg:flex-1" />
            </div>

            {/* Option B */}
            <div className="flex-1 rounded-xl border-2 border-dashed border-[#606c38]/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#283618]">
                <ClipboardPaste className="h-4 w-4 text-[#606c38]" />
                Paste your profile text
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Copy your About section, headline, experience from LinkedIn and paste here..."
                className="mt-2 h-24 w-full resize-none rounded-lg border border-[#606c38]/15 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 focus:border-[#dda15e] focus:outline-none focus:ring-2 focus:ring-[#dda15e]/20"
              />
              <button className="mt-3 rounded-full bg-[#dda15e] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
                {"Analyze \u2192"}
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col gap-8 xl:flex-row">
          {/* ── Left Column ── */}
          <div className="flex-1 min-w-0">
            {/* Score Overview */}
            <div className="mb-6 rounded-2xl border border-[#606c38]/10 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#283618]">
                Your Profile Score
              </h3>
              <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
                <ScoreRing score={showAfter ? afterScore : baseScore} />
                <div className="flex-1 space-y-3">
                  {/* Comparison bars */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#283618]">
                      <span>Your industry average</span>
                      <span className="font-semibold">71/100</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#606c38]/10">
                      <div className="h-full rounded-full bg-[#606c38]/30" style={{ width: "71%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#283618]">
                      <span>Top 10% of profiles</span>
                      <span className="font-semibold">90+</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#606c38]/10">
                      <div className="h-full rounded-full bg-[#dda15e]/50" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${scoreLabelColor}`}>
                    {scoreLabel}
                  </p>
                  {/* Quick wins */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2 text-xs text-[#606c38]">
                      <CheckCircle className="h-3.5 w-3.5 text-[#606c38]" />
                      Photo present
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#606c38]">
                      <CheckCircle className="h-3.5 w-3.5 text-[#606c38]" />
                      500+ connections
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#bc6c25]">
                      <XCircle className="h-3.5 w-3.5 text-[#bc6c25]" />
                      Headline not optimized
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Cards */}
            <div className="space-y-4">
              {sections.map((section) => {
                const isOpen = expanded === section.id
                const selectedIdx = selected[section.id]

                return (
                  <motion.div
                    key={section.id}
                    layout
                    className={`rounded-2xl border-l-4 ${section.borderColor} border border-[#606c38]/10 bg-white shadow-sm overflow-hidden`}
                  >
                    {/* Header row */}
                    <button
                      onClick={() =>
                        setExpanded(isOpen ? null : section.id)
                      }
                      className="flex w-full items-center justify-between p-5 text-left"
                    >
                      <span className="text-sm font-semibold text-[#283618]">
                        {section.label}
                      </span>
                      <div className="flex items-center gap-3">
                        {section.score !== null && (
                          <span
                            className={`text-xs font-semibold ${section.scoreColor}`}
                          >
                            Score: {section.score}/100
                          </span>
                        )}
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-[#606c38]/50" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-[#606c38]/50" />
                        )}
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[#606c38]/10 p-5 space-y-4">
                            {/* Photo & Banner guide */}
                            {section.isGuide && (
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-[#606c38]/10 p-4">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-[#283618]">
                                    <Camera className="h-4 w-4 text-[#606c38]" />
                                    Profile photo tips
                                  </div>
                                  <ul className="mt-2 space-y-1.5 text-xs text-[#283618]/70 leading-relaxed">
                                    <li>Use a high-resolution headshot (400x400px min)</li>
                                    <li>Professional attire, neutral background</li>
                                    <li>Face fills 60% of the frame</li>
                                    <li>Warm, genuine smile</li>
                                  </ul>
                                </div>
                                <div className="rounded-xl border border-[#606c38]/10 p-4">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-[#283618]">
                                    <ImageIcon className="h-4 w-4 text-[#606c38]" />
                                    Banner image ideas
                                  </div>
                                  <ul className="mt-2 space-y-1.5 text-xs text-[#283618]/70 leading-relaxed">
                                    <li>Showcase your industry (marketing: data dashboards)</li>
                                    <li>Add your title + key expertise as text overlay</li>
                                    <li>Use brand colors for consistency</li>
                                    <li>1584x396px recommended size</li>
                                  </ul>
                                </div>
                              </div>
                            )}

                            {/* Skills section */}
                            {section.missingSkills && (
                              <>
                                <p className="text-sm text-[#283618]/70">
                                  {section.current} Recruiters in your field search for these {section.missingSkills.length} that you{"'"}re missing:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {section.missingSkills.map((skill) => {
                                    const isAdded = addedSkills.includes(skill)
                                    return (
                                      <button
                                        key={skill}
                                        onClick={() => {
                                          if (isAdded) {
                                            setAddedSkills(addedSkills.filter((s) => s !== skill))
                                          } else {
                                            setAddedSkills([...addedSkills, skill])
                                          }
                                        }}
                                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                          isAdded
                                            ? "border-[#606c38] bg-[#606c38]/10 text-[#606c38]"
                                            : "border-[#bc6c25]/30 bg-[#bc6c25]/5 text-[#bc6c25] hover:border-[#dda15e] hover:bg-[#dda15e]/10 hover:text-[#283618]"
                                        }`}
                                      >
                                        {isAdded && <Check className="h-3 w-3" />}
                                        {skill}
                                      </button>
                                    )
                                  })}
                                </div>
                                <button
                                  onClick={() => setAddedSkills(section.missingSkills!)}
                                  className="rounded-full bg-[#dda15e] px-4 py-2 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                                >
                                  Add all missing skills
                                </button>
                              </>
                            )}

                            {/* Regular section: current + weaknesses + suggestions */}
                            {section.current && !section.missingSkills && !section.isGuide && (
                              <>
                                {/* Current */}
                                <div>
                                  <p className="text-xs font-medium text-[#606c38] mb-1">
                                    Current:
                                  </p>
                                  <div className="rounded-lg bg-[#fefae0] p-3 text-sm italic text-[#606c38]">
                                    {section.current}
                                  </div>
                                </div>

                                {/* Why it's weak */}
                                {section.weaknesses.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-[#bc6c25] mb-1">
                                      {"Why it's weak:"}
                                    </p>
                                    <ul className="space-y-1">
                                      {section.weaknesses.map((w, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-1.5 text-xs text-[#283618]/70"
                                        >
                                          <span className="mt-0.5 text-[#bc6c25]">{"•"}</span>
                                          {w}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* AI Suggestions */}
                                {section.suggestions.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="flex items-center gap-1.5 text-xs font-medium text-[#283618]">
                                      <Sparkles className="h-3.5 w-3.5 text-[#dda15e]" />
                                      AI Suggestions
                                    </p>
                                    {section.suggestions.map((s, idx) => {
                                      const isSelected = selectedIdx === idx
                                      return (
                                        <button
                                          key={idx}
                                          onClick={() =>
                                            setSelected({
                                              ...selected,
                                              [section.id]: isSelected ? -1 : idx,
                                            })
                                          }
                                          className={`block w-full rounded-xl border p-3 text-left text-sm transition-all ${
                                            isSelected
                                              ? "border-[#dda15e] bg-[#dda15e]/5 shadow-sm"
                                              : "border-[#606c38]/10 hover:border-[#dda15e]/50"
                                          }`}
                                        >
                                          <p className="text-[#283618] leading-relaxed">
                                            {s.text}
                                          </p>
                                          <div className="mt-2 flex items-center justify-between">
                                            <span className="rounded-full bg-[#606c38]/10 px-2 py-0.5 text-[10px] font-semibold text-[#606c38]">
                                              {s.boost} points
                                            </span>
                                            <div className="flex items-center gap-2">
                                              <span
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleCopy(s.text, `${section.id}-${idx}`)
                                                }}
                                                className="flex items-center gap-1 text-[10px] font-medium text-[#606c38] hover:text-[#283618] cursor-pointer"
                                              >
                                                {copied === `${section.id}-${idx}` ? (
                                                  <>
                                                    <Check className="h-3 w-3" /> Copied
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="h-3 w-3" /> Copy
                                                  </>
                                                )}
                                              </span>
                                              {isSelected ? (
                                                <span className="text-[10px] font-semibold text-[#dda15e]">
                                                  Selected
                                                </span>
                                              ) : (
                                                <span className="text-[10px] font-medium text-[#dda15e] hover:text-[#bc6c25]">
                                                  Use this
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </button>
                                      )
                                    })}

                                    {/* Custom instruction */}
                                    <div className="flex items-center gap-2 pt-1">
                                      <input
                                        type="text"
                                        placeholder="Write a custom instruction..."
                                        className="flex-1 rounded-lg border border-[#606c38]/15 bg-[#fefae0] px-3 py-2 text-xs text-[#283618] placeholder:text-[#606c38]/40 focus:border-[#dda15e] focus:outline-none focus:ring-2 focus:ring-[#dda15e]/20"
                                      />
                                      <button className="shrink-0 rounded-full bg-[#dda15e] px-3 py-2 text-xs font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
                                        {"Generate \u2192"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── Right Column: LinkedIn Preview ── */}
          <div className="w-full xl:w-[380px] shrink-0">
            <div className="sticky top-28">
              <div className="rounded-2xl border border-[#606c38]/10 bg-white shadow-md overflow-hidden">
                <div className="border-b border-[#606c38]/10 px-4 py-3">
                  <p className="text-xs font-semibold text-[#283618]">
                    Profile Preview
                  </p>
                </div>

                {/* Banner */}
                <div className="h-20 bg-gradient-to-r from-[#283618] to-[#606c38]" />

                {/* Avatar + info */}
                <div className="relative px-4 pb-4">
                  <div className="relative -mt-10 mb-3">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white">
                      <Image
                        src="/images/avatar-linkedin.jpg"
                        alt="Amara Diallo"
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-[#283618]">
                    Amara Diallo
                  </h4>

                  {/* Headline */}
                  <p className={`mt-0.5 text-xs leading-relaxed ${showAfter ? "text-[#283618]" : "text-[#606c38]"}`}>
                    {showAfter && selected.headline !== undefined && selected.headline >= 0
                      ? sections[0].suggestions[selected.headline]?.text || sections[0].current
                      : sections[0].current}
                  </p>

                  <p className="mt-1 text-[10px] text-[#606c38]/60">
                    {"Dakar, S\u00E9n\u00E9gal \u00B7 500+ connections"}
                  </p>

                  {/* Decorative buttons */}
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-[#606c38]/10 px-4 py-1 text-[10px] font-medium text-[#606c38]/50">
                      Connect
                    </span>
                    <span className="rounded-full border border-[#606c38]/15 px-4 py-1 text-[10px] font-medium text-[#606c38]/40">
                      Message
                    </span>
                  </div>

                  {/* About preview */}
                  <div className="mt-4 border-t border-[#606c38]/10 pt-3">
                    <p className="text-[10px] font-semibold text-[#283618] mb-1">
                      About
                    </p>
                    <p className="text-[10px] leading-relaxed text-[#283618]/70 line-clamp-3">
                      {showAfter && selected.about !== undefined && selected.about >= 0
                        ? sections[1].suggestions[selected.about]?.text || sections[1].current
                        : sections[1].current}
                    </p>
                    <span className="text-[10px] text-[#606c38]/50">
                      ...see more
                    </span>
                  </div>

                  {/* Experience preview */}
                  <div className="mt-3 border-t border-[#606c38]/10 pt-3">
                    <p className="text-[10px] font-semibold text-[#283618] mb-2">
                      Experience
                    </p>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#dda15e]/10 text-[10px] font-bold text-[#dda15e]">
                          OM
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-[#283618]">
                            Marketing Manager
                          </p>
                          <p className="text-[9px] text-[#606c38]/60">
                            {"Orange Money \u00B7 2020 \u2013 Present"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#606c38]/10 text-[10px] font-bold text-[#606c38]">
                          OR
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-[#283618]">
                            Marketing Coordinator
                          </p>
                          <p className="text-[9px] text-[#606c38]/60">
                            {"Orange Telecom \u00B7 2018 \u2013 2020"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Before/After toggle + score + export */}
                <div className="border-t border-[#606c38]/10 p-4 space-y-3">
                  {/* Toggle */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center rounded-full border border-[#606c38]/15 p-0.5">
                      <button
                        onClick={() => setShowAfter(false)}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                          !showAfter
                            ? "bg-[#283618] text-[#fefae0]"
                            : "text-[#606c38] hover:text-[#283618]"
                        }`}
                      >
                        Before
                      </button>
                      <button
                        onClick={() => setShowAfter(true)}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                          showAfter
                            ? "bg-[#283618] text-[#fefae0]"
                            : "text-[#606c38] hover:text-[#283618]"
                        }`}
                      >
                        After
                      </button>
                    </div>
                  </div>

                  {/* Score change */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="font-semibold text-[#bc6c25]">
                      {baseScore}
                    </span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="h-4 w-4 text-[#dda15e]" />
                    </motion.div>
                    <span className="font-bold text-[#606c38]">
                      {afterScore}
                    </span>
                  </div>

                  {/* Export button */}
                  <button className="w-full rounded-full bg-[#283618] px-5 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38]">
                    {"Export optimized content \u2192"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
