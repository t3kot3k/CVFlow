"use client"

import { useState } from "react"
import { Minus, Plus, Maximize2 } from "lucide-react"

function ATSGauge({ score }: { score: number }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? "#606c38" : score >= 60 ? "#dda15e" : "#bc6c25"

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#606c38"
          strokeWidth="6"
          opacity={0.15}
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
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

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-xs text-[#606c38]">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[#606c38]/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#606c38] transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-[#283618]">{value}%</span>
    </div>
  )
}

export function PreviewPanel() {
  const [zoom, setZoom] = useState(100)

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
              <div className="text-[7px] font-bold text-[#283618]">Amara Diallo</div>
              <div className="text-[4px] text-[#283618]/70">Senior Marketing Manager</div>
            </div>

            {/* Two column layout */}
            <div className="mt-1.5 flex gap-1.5">
              {/* Main column */}
              <div className="flex-1 space-y-1.5">
                {/* Summary */}
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

                {/* Work Experience - highlighted */}
                <div className="rounded-sm bg-[#dda15e]/10 p-0.5 -mx-0.5">
                  <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                    WORK EXPERIENCE
                  </div>
                  <div className="space-y-1">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-[4.5px] font-bold text-[#283618]">Senior Marketing Manager</span>
                        <span className="text-[3.5px] text-[#606c38]">2021 - Present</span>
                      </div>
                      <div className="text-[3.5px] text-[#606c38]">Orange Telecom - Dakar</div>
                      <div className="mt-0.5 space-y-px pl-1">
                        <div className="flex gap-0.5">
                          <span className="mt-[1px] h-[1.5px] w-[1.5px] shrink-0 rounded-full bg-[#283618]/40" />
                          <div className="h-[2px] w-full rounded-full bg-[#283618]/12" />
                        </div>
                        <div className="flex gap-0.5">
                          <span className="mt-[1px] h-[1.5px] w-[1.5px] shrink-0 rounded-full bg-[#283618]/40" />
                          <div className="h-[2px] w-11/12 rounded-full bg-[#283618]/12" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-[4.5px] font-bold text-[#283618]">Marketing Coordinator</span>
                        <span className="text-[3.5px] text-[#606c38]">2018 - 2021</span>
                      </div>
                      <div className="text-[3.5px] text-[#606c38]">Sonatel - Dakar</div>
                      <div className="mt-0.5 space-y-px pl-1">
                        <div className="flex gap-0.5">
                          <span className="mt-[1px] h-[1.5px] w-[1.5px] shrink-0 rounded-full bg-[#283618]/40" />
                          <div className="h-[2px] w-full rounded-full bg-[#283618]/12" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                    EDUCATION
                  </div>
                  <div className="space-y-px">
                    <div className="h-[2px] w-3/4 rounded-full bg-[#283618]/15" />
                    <div className="h-[2px] w-1/2 rounded-full bg-[#283618]/10" />
                  </div>
                </div>
              </div>

              {/* Sidebar column */}
              <div className="w-[55px] space-y-1.5">
                {/* Contact */}
                <div>
                  <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                    CONTACT
                  </div>
                  <div className="space-y-px">
                    <div className="h-[2px] w-full rounded-full bg-[#283618]/12" />
                    <div className="h-[2px] w-3/4 rounded-full bg-[#283618]/12" />
                    <div className="h-[2px] w-full rounded-full bg-[#283618]/12" />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                    SKILLS
                  </div>
                  <div className="space-y-0.5">
                    {["Digital Marketing", "Team Leadership", "Analytics", "Content Strategy"].map((skill) => (
                      <div key={skill} className="flex items-center gap-0.5">
                        <div className="h-1 w-1 rounded-full bg-[#dda15e]" />
                        <span className="text-[3.5px] text-[#283618]">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <div className="text-[5px] font-bold text-[#283618] border-b border-[#283618]/20 pb-0.5 mb-0.5">
                    LANGUAGES
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { lang: "French", level: "Native" },
                      { lang: "English", level: "Fluent" },
                      { lang: "Wolof", level: "Native" },
                    ].map((l) => (
                      <div key={l.lang} className="flex justify-between">
                        <span className="text-[3.5px] text-[#283618]">{l.lang}</span>
                        <span className="text-[3px] text-[#606c38]">{l.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ATS Score panel */}
      <div className="border-t border-[#606c38]/10 px-4 py-4">
        <h4 className="text-sm font-semibold text-[#283618]">ATS Score</h4>
        <div className="mt-3 flex items-start gap-4">
          <ATSGauge score={87} />
          <div className="flex-1 space-y-2 pt-1">
            <ScoreBar label="Keywords" value={78} />
            <ScoreBar label="Structure" value={95} />
            <ScoreBar label="Format" value={100} />
          </div>
        </div>
        <button className="mt-3 text-xs font-medium text-[#dda15e] transition-colors hover:text-[#bc6c25]">
          {"3 keywords missing \u2192"}
        </button>
      </div>
    </aside>
  )
}
