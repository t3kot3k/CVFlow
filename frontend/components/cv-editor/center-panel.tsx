"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  User, FileText, Briefcase, GraduationCap, Wrench, Globe,
  Award, Link as LinkIcon, Sparkles, Trash2, Plus,
  ChevronLeft, ChevronRight, Info, Loader2, X,
} from "lucide-react"
import { cvAiApi, type CVContent } from "@/lib/api/cv"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: "contact", label: "Contact Info", icon: User },
  { id: "summary", label: "Professional Summary", icon: FileText },
  { id: "experience", label: "Work Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "languages", label: "Languages", icon: Globe },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "projects", label: "Projects", icon: LinkIcon },
]

// Shared input style
const INPUT = "w-full rounded-lg border border-[#606c38]/20 px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CenterPanelProps {
  content: CVContent
  activeSection: string
  onContentChange: (content: CVContent) => void
  onSectionChange: (id: string) => void
  onImprove: (text: string, onApply: (improved: string) => void) => void
  cvId: string
  cvLanguage?: string
}

// ---------------------------------------------------------------------------
// Contact Form
// ---------------------------------------------------------------------------

function ContactForm({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const ci = content.contact_info ?? {}
  const set = (field: string, value: string) =>
    onChange({ ...content, contact_info: { ...ci, [field]: value } })

  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#283618]">
        <User className="h-5 w-5" /> Contact Info
      </h2>
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#283618]">Full name <span className="text-[#bc6c25]">*</span></label>
            <input type="text" value={ci.name ?? ""} onChange={e => set("name", e.target.value)} placeholder="Bamba Sigui" className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#283618]">Email <span className="text-[#bc6c25]">*</span></label>
            <input type="email" value={ci.email ?? ""} onChange={e => set("email", e.target.value)} placeholder="you@example.com" className={INPUT} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#283618]">Phone</label>
            <input type="tel" value={ci.phone ?? ""} onChange={e => set("phone", e.target.value)} placeholder="+33 6 00 00 00 00" className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#283618]">Location</label>
            <input type="text" value={ci.location ?? ""} onChange={e => set("location", e.target.value)} placeholder="Paris, France" className={INPUT} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#283618]">LinkedIn URL</label>
            <input type="url" value={ci.linkedin ?? ""} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/username" className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#283618]">Website / Portfolio</label>
            <input type="url" value={ci.website ?? ""} onChange={e => set("website", e.target.value)} placeholder="yoursite.com" className={INPUT} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary Form
// ---------------------------------------------------------------------------

function SummaryForm({ content, onChange, cvId, language = "en" }: { content: CVContent; onChange: (c: CVContent) => void; cvId: string; language?: string }) {
  const [targetRole, setTargetRole] = useState("")
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!targetRole.trim()) return
    setGenerating(true)
    setGenError(null)
    try {
      const { summary } = await cvAiApi.generateSummary(cvId, targetRole, language)
      onChange({ ...content, summary })
    } catch {
      setGenError("AI service unavailable. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-[#283618]">
          <FileText className="h-5 w-5" /> Professional Summary
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl border border-[#dda15e]/30 bg-[#dda15e]/10 p-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#dda15e]" />
          <p className="text-sm font-semibold text-[#283618]">Generate with AI</p>
        </div>
        <p className="mt-1 text-sm text-[#283618]/70">Tell me your target role — I'll write a compelling summary.</p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
            placeholder="e.g. Senior Product Manager"
            className="flex-1 rounded-lg border border-[#dda15e]/30 bg-white px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
          />
          <button
            onClick={handleGenerate}
            disabled={!targetRole.trim() || generating}
            className="shrink-0 flex items-center gap-2 rounded-lg bg-[#dda15e] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {generating ? "Generating…" : "Generate →"}
          </button>
        </div>
        {genError && <p className="mt-2 text-xs text-red-600">{genError}</p>}
      </motion.div>

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium text-[#283618]">Summary text</label>
        <textarea
          value={content.summary ?? ""}
          onChange={e => onChange({ ...content, summary: e.target.value })}
          rows={6}
          placeholder="Write a compelling 2-3 sentence summary of your professional background, key skills, and what you bring to your next role..."
          className={`${INPUT} resize-none`}
        />
        <p className="mt-1 text-xs text-[#606c38]/60">
          Tip: 3-5 sentences. Use first person and strong action verbs.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Experience Form
// ---------------------------------------------------------------------------

type ExpEntry = NonNullable<CVContent["experience"]>[number]

function ExperienceForm({
  content,
  onChange,
  onImprove,
  language = "en",
}: {
  content: CVContent
  onChange: (c: CVContent) => void
  onImprove: (text: string, onApply: (t: string) => void) => void
  language?: string
}) {
  const entries = content.experience ?? []
  const [aiPrompt, setAiPrompt] = useState("")
  const [generatingFor, setGeneratingFor] = useState<number | null>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [bannerGenerating, setBannerGenerating] = useState(false)

  const updateEntries = (newEntries: ExpEntry[]) =>
    onChange({ ...content, experience: newEntries })

  const updateEntry = (idx: number, field: keyof ExpEntry, value: unknown) => {
    const next = entries.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    updateEntries(next)
  }

  const updateBullet = (entryIdx: number, bulletIdx: number, text: string) => {
    const next = entries.map((e, i) => {
      if (i !== entryIdx) return e
      const bullets = [...(e.bullets ?? [])]
      bullets[bulletIdx] = text
      return { ...e, bullets }
    })
    updateEntries(next)
  }

  const addBullet = (entryIdx: number) => {
    const next = entries.map((e, i) =>
      i === entryIdx ? { ...e, bullets: [...(e.bullets ?? []), ""] } : e
    )
    updateEntries(next)
  }

  const removeBullet = (entryIdx: number, bulletIdx: number) => {
    const next = entries.map((e, i) => {
      if (i !== entryIdx) return e
      const bullets = (e.bullets ?? []).filter((_, bi) => bi !== bulletIdx)
      return { ...e, bullets }
    })
    updateEntries(next)
  }

  const removeEntry = (idx: number) => updateEntries(entries.filter((_, i) => i !== idx))

  const addEntry = () => {
    updateEntries([...entries, {
      job_title: "", company: "", location: "", start_date: "",
      end_date: "", current: false, bullets: [""],
    }])
  }

  const generateBullets = async (idx: number) => {
    const entry = entries[idx]
    if (!entry.job_title) return
    setGeneratingFor(idx)
    setGenError(null)
    try {
      const { bullets } = await cvAiApi.suggestBullets(entry.job_title, entry.company)
      const next = entries.map((e, i) =>
        i === idx ? { ...e, bullets: [...(e.bullets ?? []).filter(b => b), ...bullets] } : e
      )
      updateEntries(next)
    } catch {
      setGenError("AI unavailable. Make sure the backend is running.")
    } finally {
      setGeneratingFor(null)
    }
  }

  const handleBannerGenerate = async () => {
    if (!aiPrompt.trim()) return
    setBannerGenerating(true)
    setGenError(null)
    try {
      const { bullets } = await cvAiApi.suggestBullets(aiPrompt)
      const newEntry: ExpEntry = {
        job_title: aiPrompt, company: "", location: "", start_date: "",
        end_date: "", current: false, bullets,
      }
      updateEntries([...entries, newEntry])
      setAiPrompt("")
    } catch {
      setGenError("AI unavailable. Make sure the backend is running.")
    } finally {
      setBannerGenerating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-[#283618]">
          <Briefcase className="h-5 w-5" /> Work Experience
        </h2>
        <button
          onClick={() => entries[0] && generateBullets(0)}
          disabled={entries.length === 0 || generatingFor !== null}
          className="flex items-center gap-2 rounded-full bg-[#606c38] px-4 py-1.5 text-sm font-medium text-[#fefae0] transition-colors hover:bg-[#283618] disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate all with AI
        </button>
      </div>

      {/* AI banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl border border-[#dda15e]/30 bg-[#dda15e]/10 p-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#dda15e]" />
          <p className="text-sm font-semibold text-[#283618]">Let AI write your experience section</p>
        </div>
        <p className="mt-1 text-sm text-[#283618]/70">Tell me your job title and company — I'll write the bullet points.</p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleBannerGenerate()}
            placeholder="e.g. Marketing Manager at Orange Telecom, 2021-2024"
            className="flex-1 rounded-lg border border-[#dda15e]/30 bg-white px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
          />
          <button
            onClick={handleBannerGenerate}
            disabled={!aiPrompt.trim() || bannerGenerating}
            className="shrink-0 flex items-center gap-2 rounded-lg bg-[#dda15e] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-50"
          >
            {bannerGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {bannerGenerating ? "…" : "Generate →"}
          </button>
        </div>
        {genError && <p className="mt-2 text-xs text-red-600">{genError}</p>}
      </motion.div>

      {/* Entries */}
      <div className="mt-6 space-y-6">
        {entries.map((entry, entryIdx) => (
          <motion.div
            key={entryIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: entryIdx * 0.05 }}
            className={`rounded-2xl bg-white p-5 shadow-sm border-l-4 ${entryIdx === 0 ? "border-l-[#dda15e]" : "border-l-[#606c38]"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">
                Experience {entryIdx + 1}
              </span>
              <button
                onClick={() => removeEntry(entryIdx)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:text-[#bc6c25] hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#283618]">Job title <span className="text-[#bc6c25]">*</span></label>
                <input type="text" value={entry.job_title} onChange={e => updateEntry(entryIdx, "job_title", e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#283618]">Company <span className="text-[#bc6c25]">*</span></label>
                <input type="text" value={entry.company} onChange={e => updateEntry(entryIdx, "company", e.target.value)} className={INPUT} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#283618]">Start date</label>
                <input type="text" value={entry.start_date ?? ""} onChange={e => updateEntry(entryIdx, "start_date", e.target.value)} placeholder="e.g. March 2021" className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#283618]">End date</label>
                <input
                  type="text"
                  value={entry.current ? "Present" : (entry.end_date ?? "")}
                  onChange={e => updateEntry(entryIdx, "end_date", e.target.value)}
                  disabled={!!entry.current}
                  placeholder="e.g. Present"
                  className={`${INPUT} disabled:bg-[#fefae0] disabled:text-[#606c38]`}
                />
                <label className="mt-1.5 flex items-center gap-1.5 text-xs text-[#606c38] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!entry.current}
                    onChange={e => {
                      updateEntry(entryIdx, "current", e.target.checked)
                      if (e.target.checked) updateEntry(entryIdx, "end_date", "Present")
                    }}
                    className="h-3.5 w-3.5 rounded border-[#606c38]/30 accent-[#dda15e]"
                  />
                  Current job
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-[#283618]">Location</label>
              <input type="text" value={entry.location ?? ""} onChange={e => updateEntry(entryIdx, "location", e.target.value)} placeholder="City, Country" className={INPUT} />
            </div>

            {/* Bullets */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <label className="text-xs font-medium text-[#283618]">Key achievements</label>
                <div className="group relative">
                  <Info className="h-3 w-3 text-[#606c38]/40 cursor-help" />
                  <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#283618] px-3 py-1.5 text-xs text-[#fefae0] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-10">
                    Use action verbs + numbers for best ATS results
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {(entry.bullets ?? []).map((bullet, bi) => (
                  <div key={bi} className="group flex items-start gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#606c38]/30" />
                    <textarea
                      value={bullet}
                      onChange={e => updateBullet(entryIdx, bi, e.target.value)}
                      rows={2}
                      placeholder="Add an achievement..."
                      className="flex-1 resize-none rounded-lg border border-[#606c38]/15 px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
                    />
                    <div className="flex flex-col gap-1 mt-1">
                      {bullet.trim().length > 0 && (
                        <button
                          onClick={() => onImprove(bullet, (improved) => updateBullet(entryIdx, bi, improved))}
                          className="shrink-0 rounded-full bg-[#dda15e]/15 px-2.5 py-1 text-xs font-semibold text-[#dda15e] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#dda15e]/25"
                        >
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Improve
                          </span>
                        </button>
                      )}
                      {(entry.bullets ?? []).length > 1 && (
                        <button
                          onClick={() => removeBullet(entryIdx, bi)}
                          className="shrink-0 flex items-center justify-center rounded-full p-1 text-[#606c38]/30 opacity-0 group-hover:opacity-100 transition-all hover:text-[#bc6c25]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => generateBullets(entryIdx)}
                disabled={!entry.job_title || generatingFor === entryIdx}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#606c38]/30 bg-[#606c38]/5 px-3 py-2 text-sm text-[#606c38] transition-colors hover:border-[#dda15e]/50 hover:bg-[#dda15e]/10 hover:text-[#dda15e] disabled:opacity-50"
              >
                {generatingFor === entryIdx ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {generatingFor === entryIdx ? "Generating bullets…" : "Generate bullets with AI"}
              </button>
              <button
                onClick={() => addBullet(entryIdx)}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-[#606c38] transition-colors hover:text-[#283618]"
              >
                <Plus className="h-3.5 w-3.5" /> Add bullet
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={addEntry}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 p-6 text-[#606c38] transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Add work experience</span>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Education Form
// ---------------------------------------------------------------------------

type EduEntry = NonNullable<CVContent["education"]>[number]

function EducationForm({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const entries = content.education ?? []

  const update = (idx: number, field: keyof EduEntry, value: string) => {
    const next = entries.map((e, i) => i === idx ? { ...e, [field]: value } : e)
    onChange({ ...content, education: next })
  }

  const remove = (idx: number) =>
    onChange({ ...content, education: entries.filter((_, i) => i !== idx) })

  const add = () =>
    onChange({ ...content, education: [...entries, { school: "", degree: "", field: "", graduation_date: "", gpa: "" }] })

  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#283618]">
        <GraduationCap className="h-5 w-5" /> Education
      </h2>

      <div className="mt-6 space-y-4">
        {entries.map((edu, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-5 shadow-sm border-l-4 border-l-[#606c38]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">Education {idx + 1}</span>
              <button onClick={() => remove(idx)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:text-[#bc6c25] hover:bg-red-50 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#283618]">School / University <span className="text-[#bc6c25]">*</span></label>
                <input type="text" value={edu.school} onChange={e => update(idx, "school", e.target.value)} placeholder="MIT" className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#283618]">Degree <span className="text-[#bc6c25]">*</span></label>
                <input type="text" value={edu.degree} onChange={e => update(idx, "degree", e.target.value)} placeholder="Bachelor of Science" className={INPUT} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#283618]">Field of study</label>
                <input type="text" value={edu.field ?? ""} onChange={e => update(idx, "field", e.target.value)} placeholder="Computer Science" className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#283618]">Graduation year</label>
                <input type="text" value={edu.graduation_date ?? ""} onChange={e => update(idx, "graduation_date", e.target.value)} placeholder="2022" className={INPUT} />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-[#283618]">GPA (optional)</label>
              <input type="text" value={edu.gpa ?? ""} onChange={e => update(idx, "gpa", e.target.value)} placeholder="3.8/4.0" className={`${INPUT} max-w-[140px]`} />
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={add}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 p-6 text-[#606c38] transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5">
        <Plus className="h-5 w-5" /> <span className="font-medium">Add education</span>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tag Input (shared by Skills + Languages)
// ---------------------------------------------------------------------------

function TagInput({
  title, icon: Icon, items, placeholder, emptyMessage,
  onChange,
}: {
  title: string
  icon: React.ElementType
  items: string[]
  placeholder: string
  emptyMessage: string
  onChange: (items: string[]) => void
}) {
  const [input, setInput] = useState("")

  const add = () => {
    const val = input.trim()
    if (val && !items.includes(val)) {
      onChange([...items, val])
    }
    setInput("")
  }

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#283618]">
        <Icon className="h-5 w-5" /> {title}
      </h2>

      <div className="mt-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add() } }}
            placeholder={placeholder}
            className={INPUT}
          />
          <button
            onClick={add}
            disabled={!input.trim()}
            className="shrink-0 rounded-lg bg-[#283618] px-4 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38] disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <p className="mt-1.5 text-xs text-[#606c38]/60">Press Enter or click Add to insert</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {items.length === 0 && (
            <p className="text-sm text-[#606c38]/50 italic">{emptyMessage}</p>
          )}
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-full border border-[#606c38]/20 bg-white px-3 py-1 text-sm text-[#283618]">
              {item}
              <button onClick={() => remove(i)} className="text-[#606c38]/40 hover:text-[#bc6c25] transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skills Form
// ---------------------------------------------------------------------------

function SkillsForm({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  return (
    <TagInput
      title="Skills"
      icon={Wrench}
      items={content.skills ?? []}
      placeholder="e.g. Python, Project Management…"
      emptyMessage="No skills added yet. Add your first skill above."
      onChange={items => onChange({ ...content, skills: items })}
    />
  )
}

// ---------------------------------------------------------------------------
// Languages Form
// ---------------------------------------------------------------------------

function LanguagesForm({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  return (
    <TagInput
      title="Languages"
      icon={Globe}
      items={content.languages ?? []}
      placeholder="e.g. French (Native), English (Fluent)…"
      emptyMessage="No languages added yet."
      onChange={items => onChange({ ...content, languages: items })}
    />
  )
}

// ---------------------------------------------------------------------------
// Certifications Form
// ---------------------------------------------------------------------------

function CertificationsForm({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const certs = content.certifications ?? []
  const [input, setInput] = useState("")

  const add = () => {
    const val = input.trim()
    if (val) { onChange({ ...content, certifications: [...certs, val] }); setInput("") }
  }

  const update = (i: number, val: string) => {
    const next = [...certs]; next[i] = val
    onChange({ ...content, certifications: next })
  }

  const remove = (i: number) =>
    onChange({ ...content, certifications: certs.filter((_, idx) => idx !== i) })

  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#283618]">
        <Award className="h-5 w-5" /> Certifications
      </h2>

      <div className="mt-6 space-y-3">
        {certs.map((cert, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={cert}
              onChange={e => update(i, e.target.value)}
              placeholder="Certification name"
              className={INPUT}
            />
            <button onClick={() => remove(i)} className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 hover:text-[#bc6c25] hover:bg-red-50 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          placeholder="e.g. AWS Certified Solutions Architect"
          className={INPUT}
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="shrink-0 rounded-lg bg-[#283618] px-4 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38] disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Projects Form
// ---------------------------------------------------------------------------

type Project = { name?: string; description?: string; url?: string }

function ProjectsForm({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const projects = (content.projects ?? []) as Project[]

  const update = (idx: number, field: keyof Project, val: string) => {
    const next = projects.map((p, i) => i === idx ? { ...p, [field]: val } : p)
    onChange({ ...content, projects: next as Record<string, unknown>[] })
  }

  const remove = (idx: number) =>
    onChange({ ...content, projects: projects.filter((_, i) => i !== idx) as Record<string, unknown>[] })

  const add = () =>
    onChange({ ...content, projects: [...projects, { name: "", description: "", url: "" }] as Record<string, unknown>[] })

  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#283618]">
        <LinkIcon className="h-5 w-5" /> Projects
      </h2>

      <div className="mt-6 space-y-4">
        {projects.map((proj, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-5 shadow-sm border-l-4 border-l-[#606c38]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">Project {idx + 1}</span>
              <button onClick={() => remove(idx)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:text-[#bc6c25] hover:bg-red-50 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#283618]">Project name <span className="text-[#bc6c25]">*</span></label>
              <input type="text" value={proj.name ?? ""} onChange={e => update(idx, "name", e.target.value)} placeholder="e.g. CVFlow" className={INPUT} />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-[#283618]">Description</label>
              <textarea
                value={proj.description ?? ""}
                onChange={e => update(idx, "description", e.target.value)}
                rows={3}
                placeholder="Describe the project, your role, technologies used..."
                className={`${INPUT} resize-none`}
              />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-[#283618]">URL (optional)</label>
              <input type="url" value={proj.url ?? ""} onChange={e => update(idx, "url", e.target.value)} placeholder="https://github.com/you/project" className={INPUT} />
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={add}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 p-6 text-[#606c38] transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5">
        <Plus className="h-5 w-5" /> <span className="font-medium">Add project</span>
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main CenterPanel
// ---------------------------------------------------------------------------

export function CenterPanel({
  content,
  activeSection,
  onContentChange,
  onSectionChange,
  onImprove,
  cvId,
  cvLanguage = "en",
}: CenterPanelProps) {
  const currentIndex = SECTIONS.findIndex(s => s.id === activeSection)
  const prevSection = SECTIONS[currentIndex - 1]
  const nextSection = SECTIONS[currentIndex + 1]

  const renderSection = useCallback(() => {
    switch (activeSection) {
      case "contact":
        return <ContactForm content={content} onChange={onContentChange} />
      case "summary":
        return <SummaryForm content={content} onChange={onContentChange} cvId={cvId} language={cvLanguage} />
      case "experience":
        return <ExperienceForm content={content} onChange={onContentChange} onImprove={onImprove} language={cvLanguage} />
      case "education":
        return <EducationForm content={content} onChange={onContentChange} />
      case "skills":
        return <SkillsForm content={content} onChange={onContentChange} />
      case "languages":
        return <LanguagesForm content={content} onChange={onContentChange} />
      case "certifications":
        return <CertificationsForm content={content} onChange={onContentChange} />
      case "projects":
        return <ProjectsForm content={content} onChange={onContentChange} />
      default:
        return <ContactForm content={content} onChange={onContentChange} />
    }
  }, [activeSection, content, onContentChange, onImprove, cvId])

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable form area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-2xl">
          {renderSection()}
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="sticky bottom-0 flex items-center justify-between border-t border-[#606c38]/10 bg-white px-8 py-4">
        {prevSection ? (
          <button
            onClick={() => onSectionChange(prevSection.id)}
            className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618]"
          >
            <ChevronLeft className="h-4 w-4" />
            {prevSection.label}
          </button>
        ) : <div />}

        <span className="text-sm text-[#606c38]">
          Section {currentIndex + 1} of {SECTIONS.length}
        </span>

        {nextSection ? (
          <button
            onClick={() => onSectionChange(nextSection.id)}
            className="flex items-center gap-1.5 rounded-full bg-[#283618] px-5 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38]"
          >
            {nextSection.label}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button className="flex items-center gap-1.5 rounded-full bg-[#606c38] px-5 py-2 text-sm font-semibold text-[#fefae0]">
            Done ✓
          </button>
        )}
      </div>
    </div>
  )
}
