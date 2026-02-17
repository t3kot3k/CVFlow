"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Smartphone } from "lucide-react"

const stats = [
  { value: "40+", label: "Countries with localized pricing" },
  { value: "10+", label: "Languages supported (incl. Arabic RTL)" },
  { value: "60+", label: "CV templates by region" },
]

const cities: { name: string; x: number; y: number }[] = [
  { name: "Toronto", x: 23, y: 32 },
  { name: "S\u00e3o Paulo", x: 32, y: 68 },
  { name: "Dakar", x: 43, y: 48 },
  { name: "Abidjan", x: 44, y: 53 },
  { name: "Casablanca", x: 45, y: 38 },
  { name: "Paris", x: 49, y: 32 },
  { name: "London", x: 48, y: 28 },
  { name: "Berlin", x: 52, y: 29 },
  { name: "Nairobi", x: 58, y: 55 },
  { name: "Mumbai", x: 68, y: 46 },
  { name: "Singapore", x: 76, y: 56 },
]

function useCountUp(target: number, trigger: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const duration = 1500
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [trigger, target])
  return count
}

function useInView() {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.2 }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref])

  return { setRef, inView }
}

function StatCard({ value, label, inView }: { value: string; label: string; inView: boolean }) {
  const numericValue = parseInt(value)
  const count = useCountUp(numericValue, inView)
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-3xl font-bold text-[#283618]">{count}+</p>
      <p className="mt-1 text-sm text-[#606c38]">{label}</p>
    </div>
  )
}

export function GlobalCoverage() {
  const { setRef, inView } = useInView()

  return (
    <section className="bg-[#fefae0] px-6 py-24" ref={setRef}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-[#606c38] uppercase">
            Global by design
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#283618] text-balance">
            Built for Dakar, Paris, Mumbai, and Toronto.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#606c38]">
            Not just translated — truly localized.
            CV formats, photo rules, job market standards, and pricing all adapt to your country.
          </p>
        </div>

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-2">
          {/* Left - World Map */}
          <div className="relative aspect-[16/10] w-full rounded-xl bg-[#283618]/5 overflow-hidden">
            {/* Simple world map outline using an SVG */}
            <svg viewBox="0 0 100 70" className="h-full w-full" fill="none">
              {/* Continent outlines (simplified) */}
              <path d="M15,20 Q20,15 30,18 Q35,22 28,30 Q22,35 18,28 Z" fill="#606c38" opacity="0.1" />
              <path d="M25,45 Q30,40 35,50 Q33,65 28,60 Q23,55 25,45 Z" fill="#606c38" opacity="0.1" />
              <path d="M40,20 Q55,15 60,25 Q58,40 50,35 Q42,30 40,20 Z" fill="#606c38" opacity="0.1" />
              <path d="M42,38 Q48,35 55,40 Q58,55 52,60 Q45,58 42,45 Z" fill="#606c38" opacity="0.1" />
              <path d="M62,25 Q75,20 85,30 Q82,45 75,50 Q68,45 65,35 Z" fill="#606c38" opacity="0.1" />
              <path d="M72,52 Q80,48 85,55 Q82,65 75,62 Z" fill="#606c38" opacity="0.1" />
            </svg>
            {/* City dots */}
            {cities.map((city) => (
              <motion.div
                key={city.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: Math.random() * 0.5 }}
                className="absolute"
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#dda15e] opacity-40" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#dda15e]" />
                </span>
              </motion.div>
            ))}
          </div>

          {/* Right - Stats */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} inView={inView} />
              ))}
              {/* Mobile Money card */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <Smartphone className="h-8 w-8 text-[#dda15e] mb-2" />
                <p className="text-sm font-bold text-[#283618]">Mobile Money accepted</p>
                <p className="mt-1 text-xs text-[#606c38]">{"Wave \u00B7 Orange Money \u00B7 MTN MoMo"}</p>
              </div>
            </div>

            {/* Region cards */}
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border-l-4 border-l-[#dda15e] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {["SN", "CI", "MA", "DZ", "NG", "KE"].map((code) => (
                    <span key={code} className="inline-flex h-6 w-8 items-center justify-center rounded bg-[#dda15e]/15 text-[10px] font-bold text-[#bc6c25]">
                      {code}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-[#283618] mb-1">Africa & MENA</p>
                <p className="text-sm text-[#283618] leading-relaxed">
                  CV with professional photo. Formal cover letter.
                  A4 format. Mobile Money payment. Pro from $5/month.
                </p>
              </div>
              <div className="rounded-xl border-l-4 border-l-[#606c38] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {["FR", "DE", "GB", "US", "CA"].map((code) => (
                    <span key={code} className="inline-flex h-6 w-8 items-center justify-center rounded bg-[#606c38]/10 text-[10px] font-bold text-[#606c38]">
                      {code}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-[#283618] mb-1">Europe & North America</p>
                <p className="text-sm text-[#283618] leading-relaxed">
                  ATS-first. 1-page US or 2-page Europass.
                  No photo for US/Canada. LinkedIn optimization included.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
