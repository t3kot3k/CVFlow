"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const allCountries = [
  { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", name: "France", format: "Photo optional \u00b7 A4 \u00b7 1\u20132 pages \u00b7 Formal cover letter expected" },
  { code: "sn", flag: "\u{1F1F8}\u{1F1F3}", name: "S\u00e9n\u00e9gal", format: "Photo common \u00b7 A4 \u00b7 2 pages \u00b7 French language" },
  { code: "de", flag: "\u{1F1E9}\u{1F1EA}", name: "Germany", format: "Photo expected \u00b7 A4 \u00b7 1\u20132 pages \u00b7 Europass accepted" },
  { code: "us", flag: "\u{1F1FA}\u{1F1F8}", name: "USA", format: "No photo \u00b7 Letter size \u00b7 1 page \u00b7 Concise bullet points" },
  { code: "gb", flag: "\u{1F1EC}\u{1F1E7}", name: "UK", format: "No photo \u00b7 A4 \u00b7 2 pages max \u00b7 Skills-focused" },
  { code: "in", flag: "\u{1F1EE}\u{1F1F3}", name: "India", format: "Photo optional \u00b7 A4 \u00b7 2\u20133 pages \u00b7 Detailed experience" },
  { code: "ma", flag: "\u{1F1F2}\u{1F1E6}", name: "Morocco", format: "Photo common \u00b7 A4 \u00b7 1\u20132 pages \u00b7 French or Arabic" },
  { code: "gh", flag: "\u{1F1EC}\u{1F1ED}", name: "Ghana", format: "Photo optional \u00b7 A4 \u00b7 2 pages \u00b7 English" },
  { code: "ng", flag: "\u{1F1F3}\u{1F1EC}", name: "Nigeria", format: "Photo optional \u00b7 A4 \u00b7 2 pages \u00b7 English" },
  { code: "ke", flag: "\u{1F1F0}\u{1F1EA}", name: "Kenya", format: "Photo optional \u00b7 A4 \u00b7 2 pages \u00b7 English" },
  { code: "za", flag: "\u{1F1FF}\u{1F1E6}", name: "South Africa", format: "No photo \u00b7 A4 \u00b7 2\u20133 pages \u00b7 English" },
  { code: "ca", flag: "\u{1F1E8}\u{1F1E6}", name: "Canada", format: "No photo \u00b7 Letter size \u00b7 1\u20132 pages \u00b7 Bilingual options" },
  { code: "br", flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil", format: "Photo common \u00b7 A4 \u00b7 1\u20132 pages \u00b7 Portuguese" },
  { code: "ae", flag: "\u{1F1E6}\u{1F1EA}", name: "UAE", format: "Photo expected \u00b7 A4 \u00b7 1\u20132 pages \u00b7 English preferred" },
  { code: "eg", flag: "\u{1F1EA}\u{1F1EC}", name: "Egypt", format: "Photo common \u00b7 A4 \u00b7 1\u20132 pages \u00b7 Arabic or English" },
]

const quickPicks = ["fr", "sn", "de", "us", "gb", "in"]

interface StepCountryProps {
  selected: string
  onSelect: (value: string) => void
}

export function StepCountry({ selected, onSelect }: StepCountryProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return []
    return allCountries.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
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
          placeholder="Search a country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl bg-white border-gray-200 h-11 text-[#283618] placeholder:text-gray-400 focus-visible:border-[#606c38] focus-visible:ring-[#606c38]/20"
        />
        {/* Dropdown */}
        {search && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
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
                  {c.format.split("\u00b7")[0]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick picks */}
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
                  For {selectedCountry.flag} {selectedCountry.name}:
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
