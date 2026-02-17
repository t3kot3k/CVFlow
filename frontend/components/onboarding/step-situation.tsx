"use client"

import { motion } from "framer-motion"
import { GraduationCap, Search, RefreshCcw, TrendingUp } from "lucide-react"

const options = [
  {
    icon: GraduationCap,
    label: "Student / New graduate",
    subtitle: "First job or internship",
    value: "student",
  },
  {
    icon: Search,
    label: "Actively job hunting",
    subtitle: "Looking for a new position",
    value: "hunting",
  },
  {
    icon: RefreshCcw,
    label: "Career transition",
    subtitle: "Changing industry or role",
    value: "transition",
  },
  {
    icon: TrendingUp,
    label: "Exploring opportunities",
    subtitle: "Open to the right offer",
    value: "exploring",
  },
]

interface StepSituationProps {
  selected: string
  onSelect: (value: string) => void
}

export function StepSituation({ selected, onSelect }: StepSituationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <h2 className="text-3xl font-bold text-[#283618] text-center text-balance">
        {"Let\u2019s personalize your experience."}
      </h2>
      <p className="text-center text-[#606c38] mt-2 max-w-md">
        {"We\u2019ll adapt your templates, AI suggestions, and tips."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 w-full max-w-lg">
        {options.map((opt) => {
          const isSelected = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all ${
                isSelected
                  ? "border-[#dda15e] bg-[#dda15e]/10"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <opt.icon
                className={`w-8 h-8 mb-3 ${isSelected ? "text-[#dda15e]" : "text-[#606c38]"}`}
              />
              <span className="font-semibold text-[#283618] text-sm">
                {opt.label}
              </span>
              <span className="text-xs text-[#606c38] mt-1">{opt.subtitle}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
