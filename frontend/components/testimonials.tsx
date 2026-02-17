"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    quote: "I applied to 40 jobs with a generic CV \u2014 zero responses. CVFlow tailored my CV to each offer and I had 3 interviews in 2 weeks. The ATS score feature is a game-changer.",
    name: "Nadia B.",
    role: "Marketing Manager",
    location: "\u{1F1F2}\u{1F1E6} Casablanca",
    company: "Joined Deloitte",
    color: "#dda15e",
    initials: "NB",
  },
  {
    quote: "As a student with no experience, I didn\u2019t know how to write a CV. The AI wrote everything for me \u2014 even quantified my internship results. I got my first job offer 10 days later.",
    name: "Kofi A.",
    role: "Junior Developer",
    location: "\u{1F1EC}\u{1F1ED} Accra",
    company: "Joined Orange Digital Center",
    color: "#606c38",
    initials: "KA",
  },
  {
    quote: "I was switching from finance to product management. CVFlow helped me reframe my entire experience around transferable skills. The interview simulator prepared me for every question.",
    name: "L\u00e9a M.",
    role: "Product Manager",
    location: "\u{1F1EB}\u{1F1F7} Paris",
    company: "Joined a Series B startup",
    color: "#bc6c25",
    initials: "LM",
  },
  {
    quote: "The pricing adapted to my country automatically. I paid with Orange Money \u2014 no credit card needed. Finally a tool that remembers Africa exists.",
    name: "Mamadou D.",
    role: "Civil Engineer",
    location: "\u{1F1F8}\u{1F1F3} Dakar",
    company: "Joined Total Energies",
    color: "#283618",
    initials: "MD",
  },
]

const statItems = [
  { value: "28,000+", label: "Users worldwide" },
  { value: "87%", label: "Report more interview callbacks" },
  { value: "4.8/5", label: "Average satisfaction rating" },
]

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

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const { setRef, inView } = useInView()

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  }, [])

  // Get visible testimonials (show 3 on desktop)
  const getVisible = () => {
    const arr = []
    for (let i = 0; i < 3; i++) {
      arr.push(testimonials[(current + i) % testimonials.length])
    }
    return arr
  }

  return (
    <section className="bg-[#fefae0] px-6 py-24" ref={setRef}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-[#606c38] uppercase">
            They got hired
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#283618] text-balance">
            Real job seekers. Real results.
          </h2>
        </div>

        {/* Stats Row */}
        <div className="mt-12 mb-12 grid grid-cols-3 gap-6 text-center">
          {statItems.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-[#283618] md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-[#606c38]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Desktop: Show 3 cards */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {getVisible().map((t, i) => (
                <motion.div
                  key={t.name + current}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl bg-white p-6 shadow-md"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-[#dda15e] text-[#dda15e]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#283618] leading-relaxed mb-6">
                    {"\u201C"}{t.quote}{"\u201D"}
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#283618]">{t.name}</p>
                      <p className="text-xs text-[#606c38]">{t.role} {"\u00B7"} {t.location}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs italic text-[#606c38]">{t.company + " \u2192"}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile: Show 1 card */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-white p-6 shadow-md"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#dda15e] text-[#dda15e]" />
                  ))}
                </div>
                <p className="text-sm text-[#283618] leading-relaxed mb-6">
                  {"\u201C"}{testimonials[current].quote}{"\u201D"}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: testimonials[current].color }}
                  >
                    {testimonials[current].initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#283618]">{testimonials[current].name}</p>
                    <p className="text-xs text-[#606c38]">{testimonials[current].role} {"\u00B7"} {testimonials[current].location}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs italic text-[#606c38]">{testimonials[current].company + " \u2192"}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#283618] text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i === current ? "bg-[#dda15e]" : "bg-[#283618]/20"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#283618] text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0]"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
