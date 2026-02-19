"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const regions = ["All", "North America", "Europe", "Africa", "Asia", "Creative", "Executive"]

const allTemplates = [
  {
    name: "Olive",
    region: "Africa",
    color: "#606c38",
    person: "Ama Mensah",
    title: "UX Designer",
    exp: [
      { company: "Jumia", role: "Senior Designer", years: "2022 - Present" },
      { company: "Andela", role: "UI Designer", years: "2019 - 2022" },
    ],
    skills: ["Figma", "Research", "Prototyping"],
  },
  {
    name: "Forest",
    region: "Executive",
    color: "#283618",
    person: "James Whitfield",
    title: "VP of Operations",
    exp: [
      { company: "Deloitte", role: "Director", years: "2020 - Present" },
      { company: "McKinsey", role: "Senior Manager", years: "2016 - 2020" },
    ],
    skills: ["Strategy", "M&A", "P&L"],
  },
  {
    name: "Clay",
    region: "Creative",
    color: "#bc6c25",
    person: "Lina Moreau",
    title: "Art Director",
    exp: [
      { company: "Publicis", role: "Creative Lead", years: "2021 - Present" },
      { company: "BETC", role: "Designer", years: "2018 - 2021" },
    ],
    skills: ["Branding", "Motion", "Illustrator"],
  },
  {
    name: "Europass",
    region: "Europe",
    color: "#2d5a8e",
    person: "Karl Weber",
    title: "Data Analyst",
    exp: [
      { company: "SAP", role: "Senior Analyst", years: "2021 - Present" },
      { company: "Siemens", role: "Analyst", years: "2018 - 2021" },
    ],
    skills: ["Python", "SQL", "Tableau"],
  },
  {
    name: "Sahel",
    region: "Africa",
    color: "#8b7355",
    person: "Moussa Diop",
    title: "Project Manager",
    exp: [
      { company: "Orange", role: "Program Lead", years: "2021 - Present" },
      { company: "Total", role: "Coordinator", years: "2018 - 2021" },
    ],
    skills: ["Agile", "Budgets", "Teams"],
  },
  {
    name: "Manhattan",
    region: "North America",
    color: "#1a1a2e",
    person: "Sarah Chen",
    title: "Software Engineer",
    exp: [
      { company: "Google", role: "Staff Engineer", years: "2022 - Present" },
      { company: "Stripe", role: "Senior Dev", years: "2019 - 2022" },
    ],
    skills: ["React", "Go", "AWS"],
  },
  {
    name: "Mumbai",
    region: "Asia",
    color: "#7b2d8e",
    person: "Priya Sharma",
    title: "Marketing Lead",
    exp: [
      { company: "Flipkart", role: "Head of Growth", years: "2021 - Present" },
      { company: "Zomato", role: "Marketing Mgr", years: "2018 - 2021" },
    ],
    skills: ["SEO", "Analytics", "CRM"],
  },
  {
    name: "Nordic",
    region: "Europe",
    color: "#4a6741",
    person: "Erik Lindqvist",
    title: "Product Manager",
    exp: [
      { company: "Spotify", role: "Senior PM", years: "2022 - Present" },
      { company: "Klarna", role: "PM", years: "2019 - 2022" },
    ],
    skills: ["Roadmaps", "A/B Tests", "SQL"],
  },
  {
    name: "Olive",
    region: "Europe",
    color: "#606c38",
    person: "Fatima Benali",
    title: "HR Manager",
    exp: [
      { company: "L'Or\u00e9al", role: "HR Lead", years: "2021 - Present" },
      { company: "BNP Paribas", role: "HR Specialist", years: "2018 - 2021" },
    ],
    skills: ["Recruiting", "HRIS", "Training"],
  },
  {
    name: "Clay",
    region: "Creative",
    color: "#bc6c25",
    person: "Yuki Tanaka",
    title: "Graphic Designer",
    exp: [
      { company: "Sony", role: "Lead Designer", years: "2022 - Present" },
      { company: "Dentsu", role: "Designer", years: "2019 - 2022" },
    ],
    skills: ["InDesign", "After Effects", "UI"],
  },
  {
    name: "Manhattan",
    region: "North America",
    color: "#1a1a2e",
    person: "David Okafor",
    title: "Finance Analyst",
    exp: [
      { company: "Goldman Sachs", role: "VP", years: "2021 - Present" },
      { company: "JPMorgan", role: "Associate", years: "2018 - 2021" },
    ],
    skills: ["Excel", "Bloomberg", "Modeling"],
  },
  {
    name: "Sahel",
    region: "Africa",
    color: "#8b7355",
    person: "Aminata Traor\u00e9",
    title: "Supply Chain Mgr",
    exp: [
      { company: "Nestl\u00e9", role: "Regional Lead", years: "2020 - Present" },
      { company: "Dangote", role: "Logistics Mgr", years: "2017 - 2020" },
    ],
    skills: ["SAP", "Logistics", "Lean"],
  },
]

export default function TemplatesPage() {
  const [activeRegion, setActiveRegion] = useState("All")
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(8)

  const filtered = allTemplates.filter((t) => {
    const matchesRegion = activeRegion === "All" || t.region === activeRegion
    const matchesSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.person.toLowerCase().includes(search.toLowerCase()) ||
      t.region.toLowerCase().includes(search.toLowerCase())
    return matchesRegion && matchesSearch
  })

  const visible = filtered.slice(0, visibleCount)

  return (
    <div className="flex min-h-screen flex-col bg-[#fefae0]">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="px-6 pt-20 pb-12">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="text-4xl font-bold text-[#283618] sm:text-5xl text-balance">
              60+ Templates
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[#606c38]">
              One for every country and industry.
            </p>
          </div>
        </section>

        {/* Filter bar */}
        <section className="px-6 pb-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center gap-2">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => { setActiveRegion(r); setVisibleCount(8) }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeRegion === r
                      ? "bg-[#606c38] text-[#fefae0] shadow-md"
                      : "border border-[#606c38]/20 text-[#283618] hover:bg-[#dda15e]/10 hover:border-[#dda15e]/40"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606c38]/50" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(8) }}
                className="w-full rounded-full border border-[#606c38]/15 bg-white py-2 pl-10 pr-4 text-sm text-[#283618] placeholder:text-[#606c38]/40 focus:border-[#606c38] focus:outline-none focus:ring-2 focus:ring-[#606c38]/20 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-7xl">
            {visible.length === 0 ? (
              <p className="py-20 text-center text-[#606c38]">No templates match your search.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {visible.map((t, i) => (
                  <div
                    key={`${t.name}-${i}`}
                    className="group relative overflow-hidden rounded-xl border border-[#606c38]/10 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#283618]/5 hover:border-[#dda15e]/30"
                  >
                    {/* Mini CV preview */}
                    <div className="p-4">
                      {/* Header band */}
                      <div className="rounded-t-md p-3 mb-3" style={{ backgroundColor: t.color }}>
                        <p className="text-[11px] font-bold text-white/90">{t.person}</p>
                        <p className="mt-0.5 text-[9px] text-white/60">{t.title}</p>
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5 px-1">
                        <p className="text-[8px] font-bold text-[#283618]">Experience</p>
                        {t.exp.map((e) => (
                          <div key={e.company}>
                            <p className="text-[7px] text-[#606c38]">
                              {e.company} {"\u00B7"} {e.years}
                            </p>
                            <p className="text-[7px] text-[#283618]/50">{e.role}</p>
                          </div>
                        ))}
                        <div className="h-px bg-[#606c38]/10 my-1" />
                        <div className="flex flex-wrap gap-1">
                          {t.skills.map((s) => (
                            <span
                              key={s}
                              className="rounded px-1.5 py-0.5 text-[7px] font-medium"
                              style={{ backgroundColor: `${t.color}15`, color: t.color }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom badges */}
                      <div className="mt-4 flex items-center justify-between border-t border-[#606c38]/10 pt-3">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: t.color }}
                        >
                          {t.name}
                        </span>
                        <span className="rounded-full border border-[#606c38]/20 px-2 py-0.5 text-[10px] text-[#606c38]">
                          {t.region}
                        </span>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <Link
                      href="/signup"
                      className="absolute inset-0 flex items-center justify-center bg-[#283618]/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <span className="flex items-center gap-2 rounded-full bg-[#dda15e] px-5 py-2.5 text-sm font-bold text-[#283618] shadow-lg transition-transform hover:scale-105 active:scale-95">
                        Use this template
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Load more */}
            {visibleCount < filtered.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 4)}
                  className="rounded-full border-2 border-[#606c38] px-8 py-3 text-sm font-semibold text-[#606c38] transition-all hover:bg-[#606c38] hover:text-[#fefae0] active:scale-[0.98]"
                >
                  Load more templates
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
