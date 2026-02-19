"use client"

import { useState } from "react"

const filters = ["All", "North America", "Europe", "Africa", "Asia", "Creative", "Executive"]

const templates = [
  { name: "Olive", style: "Minimal sidebar", color: "#606c38", region: "Africa/Europe", filter: ["All", "Africa", "Europe"] },
  { name: "Forest", style: "Two-column", color: "#283618", region: "Executive", filter: ["All", "Executive"] },
  { name: "Clay", style: "Warm single column", color: "#dda15e", region: "Creative", filter: ["All", "Creative"] },
  { name: "Europass", style: "Official European format", color: "#606c38", region: "Europe", filter: ["All", "Europe"] },
  { name: "Sahel", style: "Photo-ready, A4", color: "#bc6c25", region: "Africa", filter: ["All", "Africa"] },
  { name: "Manhattan", style: "ATS-first, no photo", color: "#283618", region: "North America", filter: ["All", "North America"] },
  { name: "Mumbai", style: "Detailed certifications", color: "#dda15e", region: "Asia", filter: ["All", "Asia"] },
  { name: "Nordic", style: "Minimalist", color: "#606c38", region: "Europe", filter: ["All", "Europe"] },
]

function MiniCV({ color, name }: { color: string; name: string }) {
  const tmpl = templates.find((t) => t.name === name)
  return (
    <div className="p-3">
      {/* Header */}
      <div className="rounded-t-md p-3 mb-3" style={{ backgroundColor: color }}>
        <p className="text-[10px] font-bold text-white/90">John Doe</p>
        <p className="mt-0.5 text-[8px] text-white/60">Software Engineer</p>
      </div>
      {/* Content */}
      <div className="space-y-1.5 px-1">
        <p className="text-[7px] font-bold text-[#283618]">Summary</p>
        <p className="text-[6px] leading-relaxed text-[#283618]/50">Experienced engineer with 5+ years building scalable web applications.</p>
        <div className="h-px bg-[#606c38]/10 my-1" />
        <p className="text-[7px] font-bold text-[#283618]">Experience</p>
        <p className="text-[6px] text-[#606c38]">{"Google \u00B7 2021 - Present"}</p>
        <p className="text-[6px] text-[#283618]/50">Led migration of core services...</p>
        <p className="text-[6px] text-[#606c38]">{"Meta \u00B7 2018 - 2021"}</p>
        <p className="text-[6px] text-[#283618]/50">Built internal tooling platform...</p>
        <div className="h-px bg-[#606c38]/10 my-1" />
        <div className="flex flex-wrap gap-0.5">
          {["React", "Node", "AWS"].map((s) => (
            <span key={s} className="rounded px-1 py-0.5 text-[6px]" style={{ backgroundColor: `${color}20`, color }}>
              {s}
            </span>
          ))}
        </div>
      </div>
      {/* Footer info */}
      <div className="mt-4 flex items-center justify-between border-t border-[#606c38]/10 pt-3">
        <div>
          <p className="text-xs font-semibold text-[#283618]">{name}</p>
          <p className="text-[10px] text-[#606c38]">{tmpl?.region}</p>
        </div>
        <span className="text-[10px] font-semibold text-[#dda15e] transition-colors group-hover:text-[#bc6c25]">{"\u2192 Use this"}</span>
      </div>
    </div>
  )
}

export function TemplatesGallery() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filtered = templates.filter((t) => t.filter.includes(activeFilter))

  return (
    <section id="templates" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-[#606c38] uppercase">
            Templates
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#283618] text-balance">
            60+ templates. One for every country and industry.
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                activeFilter === f
                  ? "bg-[#283618] text-[#fefae0] font-semibold shadow-md"
                  : "border border-[#606c38]/20 text-[#283618] hover:bg-[#dda15e]/10 hover:border-[#dda15e]/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((template) => (
            <div
              key={template.name}
              className="group cursor-pointer overflow-hidden rounded-xl border border-[#606c38]/10 bg-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:border-[#dda15e]/40 hover:shadow-xl hover:shadow-[#283618]/5"
            >
              <MiniCV color={template.color} name={template.name} />
            </div>
          ))}
        </div>

        {/* Browse All Button */}
        <div className="mt-10 text-center">
          <a
            href="#templates"
            className="inline-block rounded-full border-2 border-[#283618] px-8 py-3 text-sm font-semibold text-[#283618] transition-all hover:bg-[#283618] hover:text-[#fefae0]"
          >
            {"Browse all 60+ templates \u2192"}
          </a>
        </div>
      </div>
    </section>
  )
}
