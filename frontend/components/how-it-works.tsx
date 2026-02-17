"use client"

import { motion } from "framer-motion"
import { UserPlus, FileEdit, Target, Briefcase, MoveRight } from "lucide-react"

const steps = [
  {
    num: 1,
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up in 10 seconds. Import from LinkedIn or upload your existing CV.",
  },
  {
    num: 2,
    icon: FileEdit,
    title: "Build or import your CV",
    description:
      "Our AI writes impactful bullet points and adapts the format to your country\u2019s standards \u2014 automatically.",
  },
  {
    num: 3,
    icon: Target,
    title: "Tailor for every job offer",
    description:
      "Paste any job offer. Get a fully tailored CV with matching keywords and an ATS score above 85.",
  },
  {
    num: 4,
    icon: Briefcase,
    title: "Apply and track everything",
    description:
      "Track applications, get follow-up reminders, and practice your interviews with AI coaching.",
  },
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

import { useState, useEffect } from "react"

export function HowItWorks() {
  const { setRef, inView } = useInView()

  return (
    <section id="how-it-works" className="bg-[#283618] px-6 py-24" ref={setRef}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-[#dda15e] uppercase">
            The process
          </p>
          <h2 className="mt-3 text-4xl font-bold text-[#fefae0] text-balance">
            From zero to hired in 4 steps.
          </h2>
        </div>

        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting arrows (desktop only) */}
          <div className="absolute top-12 left-0 right-0 hidden lg:flex items-center justify-between px-[15%]">
            {[0, 1, 2].map((i) => (
              <MoveRight key={i} className="h-6 w-6 text-[#606c38]" strokeDasharray="4 4" />
            ))}
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Number circle */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#dda15e] text-lg font-bold text-[#283618]">
                {step.num}
              </div>

              {/* Icon illustration box */}
              <div className="mb-4 flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#606c38]/20 to-[#283618]/10 border border-[#606c38]/20 backdrop-blur-sm transition-all group-hover:border-[#dda15e]/30">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#283618] shadow-lg shadow-[#283618]/20">
                  <step.icon className="h-8 w-8 text-[#dda15e]" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#fefae0]">{step.title}</h3>
              <p className="mt-2 text-sm text-[#fefae0]/70 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
