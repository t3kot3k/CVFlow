"use client"

import { useState } from "react"
import Link from "next/link"
import { Minus, Plus, Maximize2, BarChart3 } from "lucide-react"
import type { CVContent } from "@/lib/api/cv"

function ATSGauge({ score }: { score: number }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? "#606c38" : score >= 60 ? "#dda15e" : "#bc6c25"

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#606c38" strokeWidth="6" opacity={0.15} />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-[#283618]">{score}</span>
        <span className="text-xs text-[#606c38]">/100</span>
      </div>
    </div>
  )
}

interface PreviewPanelProps {
  content: CVContent
  atsScore: number | null
}

export function PreviewPanel({ content, atsScore }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100)

  const contact = content.contact_info ?? {}
  const name = contact.name || "Your Name"
  const firstJob = content.experience?.[0]
  const jobTitle = firstJob?.job_title ?? ""
  const experiences = content.experience?.slice(0, 2) ?? []
  const edu = content.education?.[0]
  const skills = content.skills?.slice(0, 5) ?? []
  const languages = content.languages?.slice(0, 3) ?? []
  const hasSummary = !!content.summary

  return (
    <aside className="fixed right-0 top-14 bottom-0 z-30 flex w-[320px] flex-col border-l border-[#606c38]/15 bg-white">
      {/* Preview header */}
      <div className="flex items-center justify-between border-b border-[#606c38]/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-[#283618]">Live Preview</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-[#606c38]/15 px-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="flex h-6 w-6 items-center justify-center text-[#606c38] transition-colors hover:text-[#283618]"
              aria-label="Zoom out"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[32px] text-center text-xs text-[#283618]">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="flex h-6 w-6 items-center justify-center text-[#606c38] transition-colors hover:text-[#283618]"
              aria-label="Zoom in"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button className="flex items-center gap-1 text-xs text-[#606c38] transition-colors hover:text-[#283618]">
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* CV preview */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div
          className="mx-auto origin-top rounded-sm bg-white shadow-lg ring-1 ring-[#606c38]/10"
          style={{
            width: 210 * (zoom / 100),
            minHeight: 297 * (zoom / 100),
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          {/* Mini CV render */}
          <div className="w-[210px] p-3" style={{ fontSize: "5px" }}>
            {/* Name header bar */}
            <div className="rounded-sm bg-[#dda15e] px-2 py-1.5">
              <div className="text-[7px] font-bold text-[#283618] truncate">{name}</div>
              {jobTitle && (
                <div className="text-[4px] text-[#283618]/70 truncate">{jobTitle}</div>
              )}
            </div>

            {/* Two column layout */}
            <div className="mt-1.5 flex gap-1.5">
              {/* Main column */}
              <div className="flex-1 space-y-1.5">
                {/* Summary */}
                {hasSummary && (
                  <div>
                    <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                      PROFESSIONAL SUMMARY
                    </div>
                    <div className="space-y-px">
                      <div className="h-[2px] w-full rounded-full bg-[#283618]/15" />
                      <div className="h-[2px] w-11/12 rounded-full bg-[#283618]/15" />
                      <div className="h-[2px] w-4/5 rounded-full bg-[#283618]/15" />
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {experiences.length > 0 && (
                  <div className="rounded-sm bg-[#dda15e]/10 p-0.5 -mx-0.5">
                    <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                      WORK EXPERIENCE
                    </div>
                    <div className="space-y-1">
                      {experiences.map((exp, i) => {
                        const start = exp.start_date ?? ""
                        const end = exp.current ? "Present" : (exp.end_date ?? "")
                        const dateRange = [start, end].filter(Boolean).join(" – ")
                        return (
                          <div key={i}>
                            <div className="flex justify-between">
                              <span className="text-[4.5px] font-bold text-[#283618] truncate max-w-[80px]">
                                {exp.job_title}
                              </span>
                              {dateRange && (
                                <span className="text-[3.5px] text-[#606c38] shrink-0">{dateRange}</span>
                              )}
                            </div>
                            {exp.company && (
                              <div className="text-[3.5px] text-[#606c38]">
                                {exp.company}{exp.location ? ` - ${exp.location}` : ""}
                              </div>
                            )}
                            <div className="mt-0.5 space-y-px pl-1">
                              {(exp.bullets ?? []).slice(0, 2).map((_, bi) => (
                                <div key={bi} className="flex gap-0.5">
                                  <span className="mt-[1px] h-[1.5px] w-[1.5px] shrink-0 rounded-full bg-[#283618]/40" />
                                  <div className="h-[2px] w-full rounded-full bg-[#283618]/12" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Education */}
                {edu && (
                  <div>
                    <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                      EDUCATION
                    </div>
                    <div className="text-[4px] font-semibold text-[#283618] truncate">{edu.school}</div>
                    <div className="h-[2px] w-1/2 rounded-full bg-[#283618]/10 mt-0.5" />
                  </div>
                )}

                {/* Empty state */}
                {!hasSummary && experiences.length === 0 && !edu && (
                  <div className="space-y-1.5">
                    {["PROFESSIONAL SUMMARY", "WORK EXPERIENCE", "EDUCATION"].map((label) => (
                      <div key={label}>
                        <div className="text-[5px] font-bold text-[#283618]/30 border-b border-[#283618]/10 pb-0.5 mb-0.5">
                          {label}
                        </div>
                        <div className="space-y-px">
                          <div className="h-[2px] w-full rounded-full bg-[#283618]/8" />
                          <div className="h-[2px] w-3/4 rounded-full bg-[#283618]/8" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar column */}
              <div className="w-[55px] space-y-1.5">
                {/* Contact */}
                <div>
                  <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                    CONTACT
                  </div>
                  <div className="space-y-px">
                    {[contact.email, contact.phone, contact.location].filter(Boolean).map((val, i) => (
                      <div key={i} className="h-[2px] w-full rounded-full bg-[#283618]/12" />
                    ))}
                    {!contact.email && !contact.phone && !contact.location && (
                      <>
                        <div className="h-[2px] w-full rounded-full bg-[#283618]/8" />
                        <div className="h-[2px] w-3/4 rounded-full bg-[#283618]/8" />
                      </>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div>
                    <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                      SKILLS
                    </div>
                    <div className="space-y-0.5">
                      {skills.map((skill) => (
                        <div key={skill} className="flex items-center gap-0.5">
                          <div className="h-1 w-1 rounded-full bg-[#dda15e]" />
                          <span className="text-[3.5px] text-[#283618] truncate">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                  <div>
                    <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                      LANGUAGES
                    </div>
                    <div className="space-y-0.5">
                      {languages.map((lang) => (
                        <div key={lang} className="flex justify-between">
                          <span className="text-[3.5px] text-[#283618] truncate">{lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ATS Score panel */}
      <div className="border-t border-[#606c38]/10 px-4 py-4">
        <h4 className="text-sm font-semibold text-[#283618]">ATS Score</h4>
        {atsScore !== null ? (
          <div className="mt-3 flex items-center gap-4">
            <ATSGauge score={atsScore} />
            <div className="flex-1">
              <p className="text-xs text-[#606c38]">Based on your last analysis</p>
              <Link
                href="/dashboard/ats"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#dda15e] transition-colors hover:text-[#bc6c25]"
              >
                <BarChart3 className="h-3 w-3" />
                Improve score →
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#606c38]/20 py-4 text-center">
            <BarChart3 className="h-6 w-6 text-[#606c38]/30" />
            <p className="text-xs text-[#606c38]">No ATS score yet</p>
            <Link
              href="/dashboard/ats"
              className="rounded-full bg-[#dda15e]/10 px-3 py-1 text-xs font-semibold text-[#dda15e] transition-colors hover:bg-[#dda15e]/20"
            >
              Run ATS analysis →
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
