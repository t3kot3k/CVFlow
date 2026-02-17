"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Briefcase,
  Sparkles,
  Trash2,
  Edit3,
  Plus,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface BulletPoint {
  id: number
  text: string
}

interface ExperienceEntry {
  id: number
  jobTitle: string
  company: string
  startDate: string
  endDate: string
  currentJob: boolean
  location: string
  bullets: BulletPoint[]
}

const initialEntries: ExperienceEntry[] = [
  {
    id: 1,
    jobTitle: "Senior Marketing Manager",
    company: "Orange Telecom",
    startDate: "March 2021",
    endDate: "Present",
    currentJob: true,
    location: "Dakar, S\u00e9n\u00e9gal",
    bullets: [
      {
        id: 1,
        text: "Led a team of 8 marketers to launch Orange Money campaign, reaching 2.3M users across S\u00e9n\u00e9gal within 6 months.",
      },
      {
        id: 2,
        text: "Increased social media engagement by 340% through targeted content strategy and influencer partnerships.",
      },
      { id: 3, text: "" },
    ],
  },
  {
    id: 2,
    jobTitle: "Marketing Coordinator",
    company: "Sonatel",
    startDate: "June 2018",
    endDate: "February 2021",
    currentJob: false,
    location: "Dakar, S\u00e9n\u00e9gal",
    bullets: [
      {
        id: 1,
        text: "Coordinated multi-channel campaigns across 4 West African markets, increasing brand awareness by 28%.",
      },
      {
        id: 2,
        text: "Managed a $120K annual budget for digital advertising with consistent 4.2x ROAS.",
      },
    ],
  },
]

interface CenterPanelProps {
  onImprove: (text: string) => void
}

export function CenterPanel({ onImprove }: CenterPanelProps) {
  const [entries, setEntries] = useState<ExperienceEntry[]>(initialEntries)
  const [aiPrompt, setAiPrompt] = useState("")

  const updateEntry = (id: number, field: keyof ExperienceEntry, value: string | boolean) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const updateBullet = (entryId: number, bulletId: number, text: string) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId
          ? {
              ...e,
              bullets: e.bullets.map((b) =>
                b.id === bulletId ? { ...b, text } : b
              ),
            }
          : e
      )
    )
  }

  const addBullet = (entryId: number) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId
          ? {
              ...e,
              bullets: [
                ...e.bullets,
                { id: Date.now(), text: "" },
              ],
            }
          : e
      )
    )
  }

  const removeEntry = (id: number) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now(),
        jobTitle: "",
        company: "",
        startDate: "",
        endDate: "",
        currentJob: false,
        location: "",
        bullets: [{ id: Date.now(), text: "" }],
      },
    ])
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable form area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-2xl">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-[#283618]">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </h2>
            <button className="flex items-center gap-2 rounded-full bg-[#606c38] px-4 py-1.5 text-sm font-medium text-[#fefae0] transition-colors hover:bg-[#283618]">
              <Sparkles className="h-3.5 w-3.5" />
              Generate all with AI
            </button>
          </div>

          {/* AI generation banner */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-[#dda15e]/30 bg-[#dda15e]/10 p-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#dda15e]" />
              <p className="text-sm font-semibold text-[#283618]">
                Let AI write your experience section
              </p>
            </div>
            <p className="mt-1 text-sm text-[#283618]/70">
              Tell me your job title and company -- I'll write the bullet points.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Marketing Manager at Orange Telecom, 2021-2024"
                className="flex-1 rounded-lg border border-[#dda15e]/30 bg-white px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
              />
              <button className="shrink-0 rounded-lg bg-[#dda15e] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
                {"Generate \u2192"}
              </button>
            </div>
          </motion.div>

          {/* Experience entries */}
          <div className="mt-6 space-y-6">
            {entries.map((entry, entryIndex) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: entryIndex * 0.1 }}
                className={`rounded-2xl bg-white p-5 shadow-sm border-l-4 ${
                  entryIndex === 0 ? "border-l-[#dda15e]" : "border-l-[#606c38]"
                }`}
              >
                {/* Entry header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#606c38]">
                    Experience {entryIndex + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:text-[#283618] hover:bg-[#fefae0]"
                      aria-label="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:text-[#bc6c25] hover:bg-red-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2-col grid: Job title + Company */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#283618]">
                      Job title <span className="text-[#bc6c25]">*</span>
                    </label>
                    <input
                      type="text"
                      value={entry.jobTitle}
                      onChange={(e) => updateEntry(entry.id, "jobTitle", e.target.value)}
                      className="w-full rounded-lg border border-[#606c38]/20 px-3 py-2 text-sm text-[#283618] outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#283618]">
                      Company <span className="text-[#bc6c25]">*</span>
                    </label>
                    <input
                      type="text"
                      value={entry.company}
                      onChange={(e) => updateEntry(entry.id, "company", e.target.value)}
                      className="w-full rounded-lg border border-[#606c38]/20 px-3 py-2 text-sm text-[#283618] outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
                    />
                  </div>
                </div>

                {/* 2-col grid: Start / End date */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#283618]">
                      Start date
                    </label>
                    <input
                      type="text"
                      value={entry.startDate}
                      onChange={(e) => updateEntry(entry.id, "startDate", e.target.value)}
                      placeholder="e.g. March 2021"
                      className="w-full rounded-lg border border-[#606c38]/20 px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#283618]">
                      End date
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={entry.endDate}
                        onChange={(e) => updateEntry(entry.id, "endDate", e.target.value)}
                        placeholder="e.g. Present"
                        disabled={entry.currentJob}
                        className="w-full rounded-lg border border-[#606c38]/20 px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 disabled:bg-[#fefae0] disabled:text-[#606c38]"
                      />
                    </div>
                    <label className="mt-1.5 flex items-center gap-1.5 text-xs text-[#606c38] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entry.currentJob}
                        onChange={(e) => {
                          updateEntry(entry.id, "currentJob", e.target.checked)
                          if (e.target.checked) updateEntry(entry.id, "endDate", "Present")
                        }}
                        className="h-3.5 w-3.5 rounded border-[#606c38]/30 text-[#dda15e] accent-[#dda15e]"
                      />
                      Current job
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-[#283618]">
                    Location
                  </label>
                  <input
                    type="text"
                    value={entry.location}
                    onChange={(e) => updateEntry(entry.id, "location", e.target.value)}
                    placeholder="City, Country"
                    className="w-full rounded-lg border border-[#606c38]/20 px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
                  />
                </div>

                {/* Bullet points */}
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-xs font-medium text-[#283618]">
                      Key achievements
                    </label>
                    <div className="group relative">
                      <Info className="h-3 w-3 text-[#606c38]/40 cursor-help" />
                      <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#283618] px-3 py-1.5 text-xs text-[#fefae0] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        Use action verbs + numbers for best ATS results
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {entry.bullets.map((bullet, bi) => (
                      <div key={bullet.id} className="group flex items-start gap-2">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#606c38]/30" />
                        <textarea
                          value={bullet.text}
                          onChange={(e) => updateBullet(entry.id, bullet.id, e.target.value)}
                          rows={2}
                          placeholder="Add another achievement..."
                          className="flex-1 resize-none rounded-lg border border-[#606c38]/15 px-3 py-2 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
                        />
                        {bullet.text.length > 0 && (
                          <button
                            onClick={() => onImprove(bullet.text)}
                            className="mt-1 shrink-0 rounded-full bg-[#dda15e]/15 px-2.5 py-1 text-xs font-semibold text-[#dda15e] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#dda15e]/25"
                          >
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Improve
                            </span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Generate bullet button */}
                  <button
                    onClick={() => addBullet(entry.id)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#606c38]/30 bg-[#606c38]/5 px-3 py-2 text-sm text-[#606c38] transition-colors hover:border-[#dda15e]/50 hover:bg-[#dda15e]/10 hover:text-[#dda15e]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate bullet
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add another experience */}
          <button
            onClick={addEntry}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 p-6 text-[#606c38] transition-all hover:border-[#dda15e] hover:text-[#dda15e] hover:bg-[#dda15e]/5"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add work experience</span>
          </button>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="sticky bottom-0 flex items-center justify-between border-t border-[#606c38]/10 bg-white px-8 py-4">
        <button className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618]">
          <ChevronLeft className="h-4 w-4" />
          Education
        </button>
        <span className="text-sm text-[#606c38]">
          Section 3 of 8
        </span>
        <button className="flex items-center gap-1.5 rounded-full bg-[#283618] px-5 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38]">
          Skills
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
