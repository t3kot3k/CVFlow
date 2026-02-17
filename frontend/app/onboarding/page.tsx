"use client"

import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Leaf } from "lucide-react"
import { StepSituation } from "@/components/onboarding/step-situation"
import { StepCountry } from "@/components/onboarding/step-country"
import { StepIndustry } from "@/components/onboarding/step-industry"
import { StepImport } from "@/components/onboarding/step-import"
import { StepComplete } from "@/components/onboarding/step-complete"

const stepLabels = [
  "Your situation",
  "Your goals",
  "Your field",
  "Your CV",
  "All set!",
]

const countryMap: Record<string, { name: string; flag: string }> = {
  fr: { name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
  sn: { name: "S\u00e9n\u00e9gal", flag: "\u{1F1F8}\u{1F1F3}" },
  de: { name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  us: { name: "USA", flag: "\u{1F1FA}\u{1F1F8}" },
  gb: { name: "UK", flag: "\u{1F1EC}\u{1F1E7}" },
  in: { name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  ma: { name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}" },
  gh: { name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}" },
  ng: { name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}" },
  ke: { name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}" },
  za: { name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" },
  ca: { name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  br: { name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  ae: { name: "UAE", flag: "\u{1F1E6}\u{1F1EA}" },
  eg: { name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },
}

const goalLabels: Record<string, string> = {
  student: "Student / New graduate",
  hunting: "Actively job hunting",
  transition: "Career transition",
  exploring: "Exploring opportunities",
}

const importLabels: Record<string, string> = {
  upload: "Uploaded CV",
  linkedin: "Imported from LinkedIn",
  scratch: "Starting from scratch",
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [situation, setSituation] = useState("")
  const [country, setCountry] = useState("")
  const [industries, setIndustries] = useState<string[]>([])
  const [importMethod, setImportMethod] = useState<
    "upload" | "linkedin" | "scratch" | null
  >(null)

  function canContinue() {
    switch (step) {
      case 0:
        return situation !== ""
      case 1:
        return country !== ""
      case 2:
        return industries.length > 0
      case 3:
        return importMethod !== null
      default:
        return false
    }
  }

  function handleNext() {
    if (step < 4 && canContinue()) {
      setStep(step + 1)
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  function toggleIndustry(value: string) {
    setIndustries((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : prev.length < 3
          ? [...prev, value]
          : prev
    )
  }

  const isLastStep = step === 4

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top bar */}
      {!isLastStep && (
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#dda15e]">
              <Leaf className="w-4 h-4 text-[#283618]" />
            </div>
            <span className="text-lg font-bold text-[#283618]">CVFlow</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-[#283618] transition-colors"
          >
            {"Skip for now \u2192"}
          </Link>
        </div>
      )}

      {/* Progress dots */}
      {!isLastStep && (
        <div className="flex flex-col items-center px-6 pt-4 pb-2">
          <div className="flex items-center gap-0">
            {stepLabels.map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < step
                      ? "bg-[#606c38]"
                      : i === step
                        ? "bg-[#dda15e]"
                        : "bg-gray-200"
                  }`}
                />
                {i < stepLabels.length - 1 && (
                  <div
                    className={`w-12 h-0.5 transition-all ${
                      i < step ? "bg-[#606c38]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-[#606c38] mt-3">
            Step {step + 1} of 5 {"\u2014"} {stepLabels[step]}
          </p>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepSituation
                key="step-0"
                selected={situation}
                onSelect={setSituation}
              />
            )}
            {step === 1 && (
              <StepCountry
                key="step-1"
                selected={country}
                onSelect={setCountry}
              />
            )}
            {step === 2 && (
              <StepIndustry
                key="step-2"
                selected={industries}
                onToggle={toggleIndustry}
              />
            )}
            {step === 3 && (
              <StepImport
                key="step-3"
                selected={importMethod}
                onSelect={setImportMethod}
              />
            )}
            {step === 4 && (
              <StepComplete
                key="step-4"
                userName="Amara"
                country={countryMap[country]?.name || country}
                countryFlag={countryMap[country]?.flag || ""}
                industry={industries.join(", ")}
                goal={goalLabels[situation] || situation}
                importMethod={importLabels[importMethod || ""] || "None"}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      {!isLastStep && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between px-6 py-5 border-t border-gray-100"
        >
          <button
            type="button"
            onClick={handleBack}
            className={`text-sm font-medium transition-colors ${
              step === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#606c38] hover:text-[#283618]"
            }`}
            disabled={step === 0}
          >
            {"\u2190 Back"}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canContinue()}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
              canContinue()
                ? "bg-[#dda15e] text-[#283618] hover:bg-[#bc6c25]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {step === 3 ? "Finish setup \u2192" : "Continue \u2192"}
          </button>
        </motion.div>
      )}
    </div>
  )
}
