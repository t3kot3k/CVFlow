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
import { getCurrentUser } from "@/lib/firebase"

const stepLabels = [
  "Your situation",
  "Your goals",
  "Your field",
  "Your CV",
  "All set!",
]

const countryMap: Record<string, { name: string; flag: string }> = {
  // Europe francophone
  fr: { name: "France",             flag: "🇫🇷" },
  be: { name: "Belgique",           flag: "🇧🇪" },
  ch: { name: "Suisse",             flag: "🇨🇭" },
  lu: { name: "Luxembourg",         flag: "🇱🇺" },
  mc: { name: "Monaco",             flag: "🇲🇨" },
  // Afrique du Nord
  ma: { name: "Maroc",              flag: "🇲🇦" },
  dz: { name: "Algérie",            flag: "🇩🇿" },
  tn: { name: "Tunisie",            flag: "🇹🇳" },
  mr: { name: "Mauritanie",         flag: "🇲🇷" },
  // Afrique de l'Ouest
  sn: { name: "Sénégal",            flag: "🇸🇳" },
  ci: { name: "Côte d'Ivoire",      flag: "🇨🇮" },
  ml: { name: "Mali",               flag: "🇲🇱" },
  bf: { name: "Burkina Faso",       flag: "🇧🇫" },
  ne: { name: "Niger",              flag: "🇳🇪" },
  tg: { name: "Togo",               flag: "🇹🇬" },
  bj: { name: "Bénin",              flag: "🇧🇯" },
  gn: { name: "Guinée",             flag: "🇬🇳" },
  gw: { name: "Guinée-Bissau",      flag: "🇬🇼" },
  // Afrique centrale
  cm: { name: "Cameroun",           flag: "🇨🇲" },
  ga: { name: "Gabon",              flag: "🇬🇦" },
  cg: { name: "Congo-Brazzaville",  flag: "🇨🇬" },
  cd: { name: "RD Congo",           flag: "🇨🇩" },
  cf: { name: "Centrafrique",       flag: "🇨🇫" },
  td: { name: "Tchad",              flag: "🇹🇩" },
  gq: { name: "Guinée équatoriale", flag: "🇬🇶" },
  // Afrique de l'Est & îles
  mg: { name: "Madagascar",         flag: "🇲🇬" },
  rw: { name: "Rwanda",             flag: "🇷🇼" },
  bi: { name: "Burundi",            flag: "🇧🇮" },
  dj: { name: "Djibouti",           flag: "🇩🇯" },
  km: { name: "Comores",            flag: "🇰🇲" },
  sc: { name: "Seychelles",         flag: "🇸🇨" },
  mu: { name: "Maurice",            flag: "🇲🇺" },
  // Amérique & Caraïbes
  ca: { name: "Canada",             flag: "🇨🇦" },
  ht: { name: "Haïti",              flag: "🇭🇹" },
  // Moyen-Orient
  lb: { name: "Liban",              flag: "🇱🇧" },
  // Autres
  de: { name: "Germany",            flag: "🇩🇪" },
  us: { name: "USA",                flag: "🇺🇸" },
  gb: { name: "UK",                 flag: "🇬🇧" },
  in: { name: "India",              flag: "🇮🇳" },
  gh: { name: "Ghana",              flag: "🇬🇭" },
  ng: { name: "Nigeria",            flag: "🇳🇬" },
  ke: { name: "Kenya",              flag: "🇰🇪" },
  za: { name: "South Africa",       flag: "🇿🇦" },
  br: { name: "Brazil",             flag: "🇧🇷" },
  ae: { name: "UAE",                flag: "🇦🇪" },
  eg: { name: "Egypt",              flag: "🇪🇬" },
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
                userName={getCurrentUser()?.displayName?.split(" ")[0] ?? ""}
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
