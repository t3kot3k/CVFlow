"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Smartphone } from "lucide-react"

const stats = [
  { value: "40+", label: "Countries with localized pricing" },
  { value: "10+", label: "Languages supported (incl. Arabic RTL)" },
  { value: "60+", label: "CV templates by region" },
]

const markers = [
  { name: "Dakar", left: "44%", top: "42%", delay: "0s" },
  { name: "Paris", left: "47%", top: "26%", delay: "0.4s" },
  { name: "Mumbai", left: "63%", top: "42%", delay: "0.8s" },
  { name: "Toronto", left: "20%", top: "30%", delay: "1.2s" },
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
          {/* Left - World Map with markers */}
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "380px" }}>
            {/* Static SVG world map */}
            <img
              src="/world.svg"
              alt="World map"
              className="h-full w-full object-contain opacity-80"
              draggable={false}
            />

            {/* Absolute-positioned pulse markers */}
            {markers.map((marker) => (
              <div
                key={marker.name}
                className="absolute flex flex-col items-center"
                style={{ left: marker.left, top: marker.top, transform: "translate(-50%, -50%)" }}
              >
                {/* Ripple ring */}
                <span
                  className="absolute h-6 w-6 rounded-full border-2 border-[#dda15e] opacity-0"
                  style={{
                    animation: `mapPulse 2s ease-out infinite`,
                    animationDelay: marker.delay,
                  }}
                />
                {/* Outer glow */}
                <span
                  className="absolute h-4 w-4 rounded-full bg-[#dda15e]/20"
                  style={{
                    animation: `mapPulse 2s ease-out infinite`,
                    animationDelay: marker.delay,
                  }}
                />
                {/* Dot */}
                <span className="relative z-10 h-2.5 w-2.5 rounded-full bg-[#dda15e] shadow-[0_0_8px_rgba(221,161,94,0.6)]" />
                {/* City label */}
                <span className="mt-1.5 whitespace-nowrap rounded-full bg-[#283618]/80 px-2 py-0.5 text-[10px] font-medium text-[#fefae0]">
                  {marker.name}
                </span>
              </div>
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
