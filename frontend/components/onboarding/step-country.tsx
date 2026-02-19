"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const allCountries = [
  // ── Europe francophone ──────────────────────────────────────────────────
  { code: "fr", flag: "🇫🇷", name: "France",          format: "Photo optionnelle · A4 · 1–2 pages · Lettre de motivation attendue" },
  { code: "be", flag: "🇧🇪", name: "Belgique",         format: "Photo optionnelle · A4 · 1–2 pages · Français ou néerlandais" },
  { code: "ch", flag: "🇨🇭", name: "Suisse",           format: "Photo courante · A4 · 1–2 pages · Très soigné, détaillé" },
  { code: "lu", flag: "🇱🇺", name: "Luxembourg",       format: "Photo optionnelle · A4 · 1–2 pages · Français / Anglais" },
  { code: "mc", flag: "🇲🇨", name: "Monaco",           format: "Photo optionnelle · A4 · 1 page · Format français" },

  // ── Afrique du Nord ────────────────────────────────────────────────────
  { code: "ma", flag: "🇲🇦", name: "Maroc",            format: "Photo courante · A4 · 1–2 pages · Français ou arabe" },
  { code: "dz", flag: "🇩🇿", name: "Algérie",          format: "Photo courante · A4 · 1–2 pages · Français ou arabe" },
  { code: "tn", flag: "🇹🇳", name: "Tunisie",          format: "Photo courante · A4 · 1–2 pages · Français ou arabe" },
  { code: "mr", flag: "🇲🇷", name: "Mauritanie",       format: "Photo courante · A4 · 1–2 pages · Arabe / Français" },

  // ── Afrique de l'Ouest ─────────────────────────────────────────────────
  { code: "sn", flag: "🇸🇳", name: "Sénégal",          format: "Photo courante · A4 · 2 pages · Français" },
  { code: "ci", flag: "🇨🇮", name: "Côte d'Ivoire",    format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "ml", flag: "🇲🇱", name: "Mali",             format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "bf", flag: "🇧🇫", name: "Burkina Faso",     format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "ne", flag: "🇳🇪", name: "Niger",            format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "tg", flag: "🇹🇬", name: "Togo",             format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "bj", flag: "🇧🇯", name: "Bénin",            format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "gn", flag: "🇬🇳", name: "Guinée",           format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "gw", flag: "🇬🇼", name: "Guinée-Bissau",    format: "Photo courante · A4 · 1–2 pages · Portugais / Français" },

  // ── Afrique centrale ───────────────────────────────────────────────────
  { code: "cm", flag: "🇨🇲", name: "Cameroun",         format: "Photo courante · A4 · 1–2 pages · Français / Anglais" },
  { code: "ga", flag: "🇬🇦", name: "Gabon",            format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "cg", flag: "🇨🇬", name: "Congo-Brazzaville", format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "cd", flag: "🇨🇩", name: "RD Congo",         format: "Photo courante · A4 · 1–2 pages · Français" },
  { code: "cf", flag: "🇨🇫", name: "Centrafrique",     format: "Photo courante · A4 · 1–2 pages · Français / Sango" },
  { code: "td", flag: "🇹🇩", name: "Tchad",            format: "Photo courante · A4 · 1–2 pages · Français / Arabe" },
  { code: "gq", flag: "🇬🇶", name: "Guinée équatoriale", format: "Photo courante · A4 · 1–2 pages · Espagnol / Français" },

  // ── Afrique de l'Est ───────────────────────────────────────────────────
  { code: "mg", flag: "🇲🇬", name: "Madagascar",       format: "Photo courante · A4 · 1–2 pages · Malgache / Français" },
  { code: "rw", flag: "🇷🇼", name: "Rwanda",           format: "Photo optionnelle · A4 · 1–2 pages · Français / Anglais" },
  { code: "bi", flag: "🇧🇮", name: "Burundi",          format: "Photo courante · A4 · 1–2 pages · Français / Kirundi" },
  { code: "dj", flag: "🇩🇯", name: "Djibouti",         format: "Photo courante · A4 · 1–2 pages · Français / Arabe" },
  { code: "km", flag: "🇰🇲", name: "Comores",          format: "Photo courante · A4 · 1–2 pages · Français / Arabe" },
  { code: "sc", flag: "🇸🇨", name: "Seychelles",       format: "Photo optionnelle · A4 · 1–2 pages · Français / Anglais" },
  { code: "mu", flag: "🇲🇺", name: "Maurice",          format: "Photo optionnelle · A4 · 1–2 pages · Anglais / Français" },

  // ── Amérique & Caraïbes ────────────────────────────────────────────────
  { code: "ca", flag: "🇨🇦", name: "Canada",           format: "Pas de photo · Letter · 1–2 pages · Bilingue possible" },
  { code: "ht", flag: "🇭🇹", name: "Haïti",            format: "Photo courante · A4 · 1–2 pages · Français / Créole" },

  // ── Moyen-Orient ───────────────────────────────────────────────────────
  { code: "lb", flag: "🇱🇧", name: "Liban",            format: "Photo courante · A4 · 1–2 pages · Français / Arabe" },

  // ── Autres (non-francophones mais très demandés) ────────────────────────
  { code: "de", flag: "🇩🇪", name: "Germany",          format: "Photo expected · A4 · 1–2 pages · Europass accepted" },
  { code: "us", flag: "🇺🇸", name: "USA",              format: "No photo · Letter size · 1 page · Concise bullet points" },
  { code: "gb", flag: "🇬🇧", name: "UK",               format: "No photo · A4 · 2 pages max · Skills-focused" },
  { code: "in", flag: "🇮🇳", name: "India",            format: "Photo optional · A4 · 2–3 pages · Detailed experience" },
  { code: "gh", flag: "🇬🇭", name: "Ghana",            format: "Photo optional · A4 · 2 pages · English" },
  { code: "ng", flag: "🇳🇬", name: "Nigeria",          format: "Photo optional · A4 · 2 pages · English" },
  { code: "ke", flag: "🇰🇪", name: "Kenya",            format: "Photo optional · A4 · 2 pages · English" },
  { code: "za", flag: "🇿🇦", name: "South Africa",     format: "No photo · A4 · 2–3 pages · English" },
  { code: "br", flag: "🇧🇷", name: "Brazil",           format: "Photo common · A4 · 1–2 pages · Portuguese" },
  { code: "ae", flag: "🇦🇪", name: "UAE",              format: "Photo expected · A4 · 1–2 pages · English preferred" },
  { code: "eg", flag: "🇪🇬", name: "Egypt",            format: "Photo common · A4 · 1–2 pages · Arabic or English" },
]

// Quick picks: main francophone destinations
const quickPicks = ["fr", "be", "ch", "sn", "ci", "ma", "ca"]

interface StepCountryProps {
  selected: string
  onSelect: (value: string) => void
}

export function StepCountry({ selected, onSelect }: StepCountryProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase()
    return allCountries.filter((c) => c.name.toLowerCase().includes(q))
  }, [search])

  const selectedCountry = allCountries.find((c) => c.code === selected)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <h2 className="text-3xl font-bold text-[#283618] text-center text-balance">
        Where are you looking to work?
      </h2>
      <p className="text-center text-[#606c38] mt-2 max-w-md">
        {"We\u2019ll adapt the CV format to match local expectations."}
      </p>

      {/* Search */}
      <div className="relative mt-8 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search a country…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl bg-white border-gray-200 h-11 text-[#283618] placeholder:text-gray-400 focus-visible:border-[#606c38] focus-visible:ring-[#606c38]/20"
        />
        {/* Dropdown */}
        {search && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-56 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onSelect(c.code)
                  setSearch("")
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-[#dda15e]/10 transition-colors text-sm text-[#283618]"
              >
                <span className="text-lg">{c.flag}</span>
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-[#606c38] ml-auto truncate max-w-[180px]">
                  {c.format.split("·")[0].trim()}
                </span>
              </button>
            ))}
          </div>
        )}
        {search && filtered.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 px-4 py-3 text-sm text-gray-400">
            No country found for &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Quick picks — francophone highlights */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {quickPicks.map((code) => {
          const c = allCountries.find((x) => x.code === code)!
          const isSelected = selected === code
          return (
            <button
              key={code}
              type="button"
              onClick={() => onSelect(code)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "bg-[#dda15e] text-[#283618]"
                  : "border border-[#606c38]/30 text-[#283618] hover:border-[#dda15e]"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          )
        })}
      </div>

      {/* Info card */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-6 w-full max-w-md"
          >
            <div className="bg-white border-l-4 border-[#606c38] rounded-lg p-4">
              <p className="text-sm text-[#283618]">
                <span className="font-semibold">
                  Pour {selectedCountry.flag} {selectedCountry.name} :
                </span>{" "}
                {selectedCountry.format}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
