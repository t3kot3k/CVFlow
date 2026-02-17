"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  ArrowLeft,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Palette,
  Eye,
  ArrowRight,
} from "lucide-react"

/* ──────────── Template Data ──────────── */
const templates = [
  {
    id: "olive",
    name: "Olive",
    region: "International",
    regionFlag: "🌍",
    style: "Minimal",
    layout: "Single column",
    features: ["ATS-first"],
    industry: "Technology",
    uses: 4821,
    atsCompatible: true,
    description: "Perfect for tech professionals who want clean, scannable layouts that pass every ATS.",
    colors: ["#606c38", "#283618", "#dda15e", "#3b82f6", "#6b7280"],
    preview: {
      accent: "#606c38",
      hasSidebar: false,
      hasPhoto: false,
      headerStyle: "band" as const,
    },
  },
  {
    id: "forest",
    name: "Forest",
    region: "International",
    regionFlag: "🌍",
    style: "Executive",
    layout: "Two columns",
    features: ["Color accent"],
    industry: "Finance",
    uses: 3204,
    atsCompatible: true,
    description: "Perfect for senior executives and C-suite candidates who want a commanding presence on paper.",
    colors: ["#283618", "#606c38", "#1e3a5f", "#7c3aed", "#374151"],
    preview: {
      accent: "#283618",
      hasSidebar: true,
      hasPhoto: false,
      headerStyle: "sidebar" as const,
    },
  },
  {
    id: "clay",
    name: "Clay",
    region: "International",
    regionFlag: "🌍",
    style: "Creative",
    layout: "Two columns",
    features: ["Color accent", "Photo ready"],
    industry: "Marketing",
    uses: 2987,
    atsCompatible: true,
    description: "Perfect for marketers and creatives who want to show personality while staying professional.",
    colors: ["#dda15e", "#bc6c25", "#e74c3c", "#8b5cf6", "#059669"],
    preview: {
      accent: "#dda15e",
      hasSidebar: true,
      hasPhoto: true,
      headerStyle: "modern" as const,
    },
  },
  {
    id: "europass",
    name: "Europass",
    region: "Western Europe",
    regionFlag: "🇪🇺",
    style: "Classic",
    layout: "Single column",
    features: ["Multiple pages"],
    industry: "Academic",
    uses: 6102,
    atsCompatible: true,
    description: "Perfect for EU job applications, academic positions, and government roles across Europe.",
    colors: ["#003399", "#0056b3", "#283618", "#606c38", "#6b7280"],
    preview: {
      accent: "#003399",
      hasSidebar: false,
      hasPhoto: true,
      headerStyle: "classic" as const,
    },
  },
  {
    id: "sahel",
    name: "Sahel",
    region: "Africa",
    regionFlag: "🌍",
    style: "Modern",
    layout: "Sidebar layout",
    features: ["Photo ready", "Color accent"],
    industry: "Technology",
    uses: 1854,
    atsCompatible: true,
    description: "Perfect for African professionals entering global markets, with photo-top layout and clear structure.",
    colors: ["#d97706", "#283618", "#606c38", "#0891b2", "#6b7280"],
    preview: {
      accent: "#d97706",
      hasSidebar: true,
      hasPhoto: true,
      headerStyle: "photo-top" as const,
    },
  },
  {
    id: "manhattan",
    name: "Manhattan",
    region: "North America",
    regionFlag: "🇺🇸",
    style: "Minimal",
    layout: "Single column",
    features: ["No photo (US/Canada)", "ATS-first"],
    industry: "Finance",
    uses: 5431,
    atsCompatible: true,
    description: "Perfect for US and Canada job markets where photo-free, ultra-clean resumes are the standard.",
    colors: ["#1f2937", "#283618", "#0284c7", "#7c3aed", "#dc2626"],
    preview: {
      accent: "#1f2937",
      hasSidebar: false,
      hasPhoto: false,
      headerStyle: "clean" as const,
    },
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "Asia",
    regionFlag: "🇮🇳",
    style: "Classic",
    layout: "Two columns",
    features: ["Multiple pages", "Photo ready"],
    industry: "Technology",
    uses: 2340,
    atsCompatible: true,
    description: "Perfect for Indian job markets with detailed sections, certifications, and comprehensive formatting.",
    colors: ["#9333ea", "#283618", "#0891b2", "#dc2626", "#d97706"],
    preview: {
      accent: "#9333ea",
      hasSidebar: true,
      hasPhoto: true,
      headerStyle: "detailed" as const,
    },
  },
  {
    id: "nordic",
    name: "Nordic",
    region: "Western Europe",
    regionFlag: "🇸🇪",
    style: "Minimal",
    layout: "Single column",
    features: ["ATS-first", "Color accent"],
    industry: "Technology",
    uses: 1920,
    atsCompatible: true,
    description: "Perfect for Scandinavian and German markets with ultra-minimal design and clean typography.",
    colors: ["#475569", "#283618", "#0284c7", "#059669", "#6b7280"],
    preview: {
      accent: "#475569",
      hasSidebar: false,
      hasPhoto: false,
      headerStyle: "lines" as const,
    },
  },
]

const regions = ["All regions", "North America", "Western Europe", "Africa", "Asia", "International"]
const styles = ["Minimal", "Modern", "Classic", "Creative", "Executive", "Academic"]
const layouts = ["Single column", "Two columns", "Sidebar layout"]
const features = ["Photo ready", "No photo (US/Canada)", "Multiple pages", "Color accent", "ATS-first"]
const industries = ["Technology", "Finance", "Marketing", "Healthcare", "Legal", "Academic"]

function regionCount(r: string) {
  if (r === "All regions") return templates.length
  return templates.filter((t) => t.region === r).length
}

/* ──────────── Mini CV Preview Component ──────────── */
function MiniCVPreview({ template }: { template: (typeof templates)[0] }) {
  const { accent, hasSidebar, hasPhoto, headerStyle } = template.preview
  return (
    <div className="h-full w-full bg-white p-4 flex flex-col text-[6px] leading-[1.6] overflow-hidden select-none">
      {headerStyle === "band" && (
        <>
          <div className="rounded-sm px-3 py-2 mb-2" style={{ backgroundColor: accent }}>
            <div className="text-white font-bold text-[9px]">Amara Diallo</div>
            <div className="text-white/70 text-[6px]">Product Designer</div>
          </div>
          <div className="flex gap-2 text-[5px] text-gray-400 mb-2">
            <span>amara@email.com</span>
            <span>Lagos, Nigeria</span>
            <span>+234 812 345 6789</span>
          </div>
        </>
      )}
      {headerStyle === "sidebar" && (
        <div className="flex flex-1 gap-2">
          <div className="w-[35%] rounded-sm p-2 text-white text-[5px]" style={{ backgroundColor: accent }}>
            <div className="font-bold text-[8px] mb-1">Amara Diallo</div>
            <div className="text-white/70 mb-2">Executive Leader</div>
            <div className="space-y-1.5 text-white/60">
              <div className="font-semibold text-white/90 text-[5px]">Contact</div>
              <div>amara@email.com</div>
              <div>+234 812 345 6789</div>
              <div className="font-semibold text-white/90 text-[5px] mt-2">Skills</div>
              <div>Strategic Planning</div>
              <div>Team Leadership</div>
              <div>Financial Analysis</div>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="font-bold text-[7px]" style={{ color: accent }}>Experience</div>
            {[1, 2].map((n) => (
              <div key={n} className="mb-1">
                <div className="font-semibold text-[6px] text-gray-700">Senior Director at GlobalCorp</div>
                <div className="text-gray-400 text-[5px]">2019 - Present</div>
                <div className="text-gray-500 mt-0.5">Led cross-functional teams of 40+ members across 3 regions.</div>
              </div>
            ))}
            <div className="font-bold text-[7px] mt-1" style={{ color: accent }}>Education</div>
            <div className="text-gray-500">MBA, London Business School</div>
          </div>
        </div>
      )}
      {headerStyle === "modern" && (
        <div className="flex flex-1 gap-2">
          <div className="w-[35%] space-y-2">
            {hasPhoto && (
              <div className="w-8 h-8 rounded-full mx-auto" style={{ backgroundColor: `${accent}30` }}>
                <div className="w-full h-full rounded-full flex items-center justify-center text-[8px] font-bold" style={{ color: accent }}>A</div>
              </div>
            )}
            <div className="space-y-1 text-gray-500 text-[5px]">
              <div className="font-semibold text-[6px]" style={{ color: accent }}>Contact</div>
              <div>amara@email.com</div>
              <div>Paris, France</div>
              <div className="font-semibold text-[6px] mt-1.5" style={{ color: accent }}>Skills</div>
              <div>Content Strategy</div>
              <div>Brand Design</div>
              <div>Social Media</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-[9px] text-gray-800">Amara Diallo</div>
            <div className="text-[6px] mb-2" style={{ color: accent }}>Creative Director</div>
            <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>About</div>
            <div className="text-gray-500 mb-1.5">Award-winning creative with 8+ years in brand strategy and digital marketing.</div>
            <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Experience</div>
            <div className="font-semibold text-[6px] text-gray-700">Head of Creative, AgencyCo</div>
            <div className="text-gray-400 text-[5px]">2021 - Present</div>
            <div className="text-gray-500 mt-0.5">Led rebranding for 12 Fortune 500 clients.</div>
          </div>
        </div>
      )}
      {headerStyle === "classic" && (
        <>
          <div className="flex items-center gap-2 mb-2 pb-1.5" style={{ borderBottom: `1px solid ${accent}` }}>
            {hasPhoto && (
              <div className="w-7 h-7 rounded-sm flex items-center justify-center text-white text-[7px] font-bold" style={{ backgroundColor: accent }}>A</div>
            )}
            <div>
              <div className="font-bold text-[9px] text-gray-800">Amara Diallo</div>
              <div className="text-[5px] text-gray-400">Research Associate | amara@email.com | Berlin, Germany</div>
            </div>
          </div>
          <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Professional Experience</div>
          <div className="text-gray-500 mb-1">Research Associate at Max Planck Institute, 2020 - Present</div>
          <div className="text-gray-500 mb-1.5">Published 12 peer-reviewed papers in computational biology.</div>
          <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Education</div>
          <div className="text-gray-500 mb-1">Ph.D. Computational Biology, TU Munich</div>
          <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Publications</div>
          <div className="text-gray-500">Diallo et al. (2023) Nature Methods, Vol 20</div>
        </>
      )}
      {headerStyle === "photo-top" && (
        <>
          <div className="flex items-center gap-2 rounded-sm p-2 mb-2" style={{ backgroundColor: `${accent}15` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white" style={{ backgroundColor: accent }}>A</div>
            <div>
              <div className="font-bold text-[9px] text-gray-800">Amara Diallo</div>
              <div className="text-[6px]" style={{ color: accent }}>Software Engineer</div>
              <div className="text-[5px] text-gray-400">Lagos, Nigeria | amara@email.com</div>
            </div>
          </div>
          <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Summary</div>
          <div className="text-gray-500 mb-1.5">Full-stack developer with 5 years in fintech and mobile banking.</div>
          <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Experience</div>
          <div className="font-semibold text-[6px] text-gray-700">Lead Engineer, PayStack</div>
          <div className="text-gray-400 text-[5px]">2021 - Present</div>
          <div className="text-gray-500 mt-0.5">Built payment APIs serving 2M+ transactions/month.</div>
        </>
      )}
      {headerStyle === "clean" && (
        <>
          <div className="text-center mb-2 pb-1.5 border-b border-gray-200">
            <div className="font-bold text-[10px] text-gray-800 tracking-wide">AMARA DIALLO</div>
            <div className="text-[5px] text-gray-400 mt-0.5">New York, NY | amara@email.com | (212) 555-0142 | linkedin.com/in/amara</div>
          </div>
          <div className="font-bold text-[6px] text-gray-800 tracking-wider mb-0.5">EXPERIENCE</div>
          <div className="border-b border-gray-100 mb-1 pb-1">
            <div className="flex justify-between">
              <div className="font-semibold text-[6px] text-gray-700">Senior Analyst, Goldman Sachs</div>
              <div className="text-[5px] text-gray-400">2020 - Present</div>
            </div>
            <div className="text-gray-500 mt-0.5">Managed $2.4B portfolio across emerging markets.</div>
          </div>
          <div className="font-bold text-[6px] text-gray-800 tracking-wider mb-0.5">EDUCATION</div>
          <div className="text-gray-500">B.S. Finance, NYU Stern School of Business</div>
        </>
      )}
      {headerStyle === "detailed" && (
        <div className="flex flex-1 gap-2">
          <div className="w-[30%] space-y-1.5 pr-1.5 border-r border-gray-100">
            <div className="w-7 h-7 rounded-full mx-auto flex items-center justify-center text-white text-[7px] font-bold" style={{ backgroundColor: accent }}>A</div>
            <div className="text-center text-[5px] text-gray-400">amara@email.com</div>
            <div className="text-[5px]" style={{ color: accent }}>
              <div className="font-semibold">Certifications</div>
              <div className="text-gray-500">AWS Solutions Architect</div>
              <div className="text-gray-500">Google Cloud Professional</div>
            </div>
            <div className="text-[5px]" style={{ color: accent }}>
              <div className="font-semibold">Languages</div>
              <div className="text-gray-500">English, Hindi, Tamil</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-[9px] text-gray-800">Amara Diallo</div>
            <div className="text-[6px] mb-1.5" style={{ color: accent }}>Senior Cloud Architect</div>
            <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Experience</div>
            <div className="text-[6px] font-semibold text-gray-700">Cloud Architect, TCS</div>
            <div className="text-gray-400 text-[5px]">2019 - Present</div>
            <div className="text-gray-500 mt-0.5">Designed multi-cloud infrastructure for banking clients.</div>
          </div>
        </div>
      )}
      {headerStyle === "lines" && (
        <>
          <div className="mb-2">
            <div className="font-bold text-[10px] text-gray-800">Amara Diallo</div>
            <div className="text-[6px] text-gray-400">Senior Developer | Stockholm, Sweden</div>
            <div className="h-px mt-1.5" style={{ backgroundColor: accent }} />
          </div>
          <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Profile</div>
          <div className="text-gray-500 mb-1.5">10 years in backend systems, distributed architecture, and DevOps at scale.</div>
          <div className="font-semibold text-[6px] mb-0.5" style={{ color: accent }}>Experience</div>
          <div className="flex justify-between">
            <div className="font-semibold text-[6px] text-gray-700">Lead Backend Engineer, Spotify</div>
            <div className="text-[5px] text-gray-400">2020 - Present</div>
          </div>
          <div className="text-gray-500 mt-0.5">Scaled recommendation engine serving 500M+ users.</div>
          <div className="h-px mt-2" style={{ backgroundColor: `${accent}30` }} />
          <div className="font-semibold text-[6px] mt-1 mb-0.5" style={{ color: accent }}>Skills</div>
          <div className="text-gray-500">Go, Rust, Kubernetes, Kafka, PostgreSQL</div>
        </>
      )}
    </div>
  )
}

/* ──────────── Page ──────────── */
export default function TemplateGalleryPage() {
  const [search, setSearch] = useState("")
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["All regions"])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedLayouts, setSelectedLayouts] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [showMoreIndustries, setShowMoreIndustries] = useState(false)
  const [sortBy, setSortBy] = useState<"popular" | "name">("popular")
  const [previewTemplate, setPreviewTemplate] = useState<(typeof templates)[0] | null>(null)
  const [previewColor, setPreviewColor] = useState(0)

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    if (val === "All regions") {
      setter(["All regions"])
      return
    }
    const without = arr.filter((v) => v !== "All regions")
    setter(without.includes(val) ? without.filter((v) => v !== val) : [...without, val])
  }

  const clearAll = () => {
    setSelectedRegions(["All regions"])
    setSelectedStyles([])
    setSelectedLayouts([])
    setSelectedFeatures([])
    setSelectedIndustries([])
    setSearch("")
  }

  const filtered = useMemo(() => {
    let result = [...templates]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.region.toLowerCase().includes(q) ||
          t.style.toLowerCase().includes(q) ||
          t.industry.toLowerCase().includes(q)
      )
    }
    if (!selectedRegions.includes("All regions") && selectedRegions.length > 0) {
      result = result.filter((t) => selectedRegions.includes(t.region))
    }
    if (selectedStyles.length > 0) {
      result = result.filter((t) => selectedStyles.includes(t.style))
    }
    if (selectedLayouts.length > 0) {
      result = result.filter((t) => selectedLayouts.includes(t.layout))
    }
    if (selectedFeatures.length > 0) {
      result = result.filter((t) => selectedFeatures.some((f) => t.features.includes(f)))
    }
    if (selectedIndustries.length > 0) {
      result = result.filter((t) => selectedIndustries.includes(t.industry))
    }
    if (sortBy === "popular") result.sort((a, b) => b.uses - a.uses)
    else result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [search, selectedRegions, selectedStyles, selectedLayouts, selectedFeatures, selectedIndustries, sortBy])

  const hasFilters =
    !selectedRegions.includes("All regions") ||
    selectedStyles.length > 0 ||
    selectedLayouts.length > 0 ||
    selectedFeatures.length > 0 ||
    selectedIndustries.length > 0

  return (
    <div className="flex h-screen flex-col bg-[#fefae0]">
      {/* ── Header ── */}
      <header className="shrink-0 border-b border-[#606c38]/10 bg-[#fefae0] px-6 py-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#606c38]/20 text-[#606c38] transition-colors hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#dda15e]" />
                <h1 className="text-2xl font-bold text-[#283618] lg:text-3xl">
                  CV Templates
                </h1>
              </div>
              <p className="mt-0.5 text-sm text-[#606c38]">
                {"60+ templates \u00B7 ATS-optimized \u00B7 Adapted to every country and industry."}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606c38]/40" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-[#606c38]/20 bg-white py-2.5 pl-10 pr-5 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-all focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 sm:w-80"
            />
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Grid ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Filter Sidebar */}
        <aside className="hidden w-[240px] shrink-0 overflow-y-auto border-r border-[#606c38]/10 bg-white p-6 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#283618]">
            Filter by
          </p>

          {/* Region */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#283618]">Region</p>
            <div className="mt-2 space-y-1.5">
              {regions.map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-[#283618]">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      selectedRegions.includes(r)
                        ? "border-[#606c38] bg-[#606c38]"
                        : "border-[#606c38]/30 bg-white"
                    }`}
                    onClick={() => toggleFilter(selectedRegions, r, setSelectedRegions)}
                  >
                    {selectedRegions.includes(r) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="flex-1" onClick={() => toggleFilter(selectedRegions, r, setSelectedRegions)}>
                    {r}
                  </span>
                  <span className="text-[10px] text-[#606c38]/60">({regionCount(r)})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-[#283618]">Style</p>
            <div className="mt-2 space-y-1.5">
              {styles.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-[#283618]">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      selectedStyles.includes(s)
                        ? "border-[#606c38] bg-[#606c38]"
                        : "border-[#606c38]/30 bg-white"
                    }`}
                    onClick={() => toggleFilter(selectedStyles, s, setSelectedStyles)}
                  >
                    {selectedStyles.includes(s) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span onClick={() => toggleFilter(selectedStyles, s, setSelectedStyles)}>
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-[#283618]">Layout</p>
            <div className="mt-2 space-y-1.5">
              {layouts.map((l) => (
                <label key={l} className="flex cursor-pointer items-center gap-2 text-sm text-[#283618]">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      selectedLayouts.includes(l)
                        ? "border-[#606c38] bg-[#606c38]"
                        : "border-[#606c38]/30 bg-white"
                    }`}
                    onClick={() => toggleFilter(selectedLayouts, l, setSelectedLayouts)}
                  >
                    {selectedLayouts.includes(l) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span onClick={() => toggleFilter(selectedLayouts, l, setSelectedLayouts)}>
                    {l}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-[#283618]">Features</p>
            <div className="mt-2 space-y-1.5">
              {features.map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-[#283618]">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      selectedFeatures.includes(f)
                        ? "border-[#606c38] bg-[#606c38]"
                        : "border-[#606c38]/30 bg-white"
                    }`}
                    onClick={() => toggleFilter(selectedFeatures, f, setSelectedFeatures)}
                  >
                    {selectedFeatures.includes(f) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span onClick={() => toggleFilter(selectedFeatures, f, setSelectedFeatures)}>
                    {f}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="mt-6">
            <button
              onClick={() => setShowMoreIndustries(!showMoreIndustries)}
              className="flex w-full items-center justify-between text-xs font-semibold text-[#283618]"
            >
              Industry
              {showMoreIndustries ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            <AnimatePresence>
              {showMoreIndustries && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1.5">
                    {industries.map((ind) => (
                      <label key={ind} className="flex cursor-pointer items-center gap-2 text-sm text-[#283618]">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                            selectedIndustries.includes(ind)
                              ? "border-[#606c38] bg-[#606c38]"
                              : "border-[#606c38]/30 bg-white"
                          }`}
                          onClick={() => toggleFilter(selectedIndustries, ind, setSelectedIndustries)}
                        >
                          {selectedIndustries.includes(ind) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span onClick={() => toggleFilter(selectedIndustries, ind, setSelectedIndustries)}>
                          {ind}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="mt-4 text-xs font-medium text-[#bc6c25] transition-colors hover:text-[#283618]"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Right Grid */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Sort row */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#606c38]">
              {filtered.length} template{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606c38]/60">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "popular" | "name")}
                className="rounded-lg border border-[#606c38]/20 bg-white px-3 py-1.5 text-xs text-[#283618] outline-none focus:border-[#dda15e]"
              >
                <option value="popular">Popular</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-[#606c38]/10 bg-white shadow-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
              >
                {/* Preview area */}
                <div className="relative h-64 overflow-hidden border-b border-[#606c38]/5">
                  <MiniCVPreview template={t} />

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full bg-[#283618]/80 px-2 py-1 text-[10px] font-medium text-[#fefae0]">
                      {t.regionFlag} {t.region}
                    </span>
                    {t.features[0] && (
                      <span className="rounded-full bg-[#dda15e]/80 px-2 py-1 text-[10px] font-medium text-[#283618]">
                        {t.features[0]}
                      </span>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#283618]/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Link
                      href="/dashboard/cvs/new"
                      className="rounded-full bg-[#dda15e] px-5 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                    >
                      {"Use this template \u2192"}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewTemplate(t)
                        setPreviewColor(0)
                      }}
                      className="rounded-full border border-[#fefae0] px-5 py-2 text-sm text-[#fefae0] transition-colors hover:bg-[#fefae0]/10"
                    >
                      {"Preview full \u2192"}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#283618]">{t.name}</h3>
                    {t.atsCompatible && (
                      <span className="rounded-full bg-[#606c38]/10 px-2 py-0.5 text-[10px] font-semibold text-[#606c38]">
                        {"ATS \u2713"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#606c38]">
                    {t.style} {"\u00B7"} {t.layout} {"\u00B7"} {t.regionFlag} {t.region}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Used {t.uses.toLocaleString()} times
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load more */}
          {filtered.length > 0 && (
            <div className="mt-8 text-center">
              <button className="rounded-full border-2 border-[#283618] px-8 py-3 text-sm font-semibold text-[#283618] transition-all hover:bg-[#283618] hover:text-[#fefae0]">
                {"Load 52 more templates \u2193"}
              </button>
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Palette className="h-12 w-12 text-[#606c38]/20" />
              <p className="mt-4 text-lg font-semibold text-[#283618]">No templates found</p>
              <p className="mt-1 text-sm text-[#606c38]">Try adjusting your filters or search terms.</p>
              <button
                onClick={clearAll}
                className="mt-4 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="flex max-h-[90vh] w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Full preview */}
              <div className="flex-[3] overflow-y-auto border-r border-[#606c38]/10 bg-gray-50 p-6">
                <div className="mx-auto aspect-[210/297] w-full max-w-[400px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <MiniCVPreview
                    template={{
                      ...previewTemplate,
                      preview: {
                        ...previewTemplate.preview,
                        accent: previewTemplate.colors[previewColor],
                      },
                    }}
                  />
                </div>
              </div>

              {/* Right: Details */}
              <div className="flex flex-[2] flex-col overflow-y-auto p-6">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="mb-4 self-end flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38]/40 transition-colors hover:bg-[#606c38]/10 hover:text-[#606c38]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold text-[#283618]">{previewTemplate.name}</h2>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#283618]/10 px-2.5 py-1 text-xs font-medium text-[#283618]">
                    {previewTemplate.regionFlag} {previewTemplate.region}
                  </span>
                  <span className="rounded-full bg-[#606c38]/10 px-2.5 py-1 text-xs font-medium text-[#606c38]">
                    {previewTemplate.style}
                  </span>
                  <span className="rounded-full bg-[#606c38]/10 px-2.5 py-1 text-xs font-medium text-[#606c38]">
                    {previewTemplate.layout}
                  </span>
                  {previewTemplate.atsCompatible && (
                    <span className="rounded-full bg-[#606c38]/10 px-2.5 py-1 text-xs font-semibold text-[#606c38]">
                      {"ATS \u2713"}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#283618]/70">
                  {previewTemplate.description}
                </p>

                <div className="mt-6">
                  <p className="text-xs font-semibold text-[#283618]">ATS Compatibility</p>
                  <div className="mt-2 space-y-1.5">
                    {["Clean formatting for parsing", "Standard section headings", "No tables or complex layouts", "Readable by all major ATS systems"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-[#606c38]">
                        <Check className="h-3.5 w-3.5 text-[#606c38]" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold text-[#283618]">Color variants</p>
                  <div className="mt-2 flex gap-2">
                    {previewTemplate.colors.map((color, ci) => (
                      <button
                        key={ci}
                        onClick={() => setPreviewColor(ci)}
                        className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                          ci === previewColor ? "border-[#283618] scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color variant ${ci + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 space-y-3">
                  <Link
                    href="/dashboard/cvs/new"
                    className="flex items-center justify-center gap-2 rounded-full bg-[#dda15e] px-6 py-3 text-sm font-bold text-[#283618] transition-colors hover:bg-[#bc6c25]"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    {"Use this template"} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#283618] px-6 py-3 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
