"use client"

import { motion } from "framer-motion"

const industries = [
  "Technology",
  "Marketing",
  "Finance",
  "Engineering",
  "HR",
  "Sales",
  "Healthcare",
  "Education",
  "Legal",
  "Design",
  "Consulting",
  "Operations",
  "Product",
  "Data & AI",
  "Logistics",
  "Media",
  "NGO / Social",
  "Other",
]

interface StepIndustryProps {
  selected: string[]
  onToggle: (value: string) => void
}

export function StepIndustry({ selected, onToggle }: StepIndustryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <h2 className="text-3xl font-bold text-[#283618] text-center text-balance">
        What industry are you in?
      </h2>
      <p className="text-center text-[#606c38] mt-2 max-w-md">
        Select up to 3 to help us tailor your experience.
      </p>

      <div className="flex flex-wrap justify-center gap-2.5 mt-10 max-w-lg">
        {industries.map((industry) => {
          const isSelected = selected.includes(industry)
          return (
            <button
              key={industry}
              type="button"
              onClick={() => onToggle(industry)}
              disabled={selected.length >= 3 && !isSelected}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "bg-[#283618] text-[#fefae0]"
                  : "border border-[#606c38]/30 text-[#283618] hover:border-[#606c38] disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {industry}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-[#606c38] mt-4">
          {selected.length}/3 selected
        </p>
      )}
    </motion.div>
  )
}
