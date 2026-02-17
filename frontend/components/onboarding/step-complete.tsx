"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
}

function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([])

  const generateParticles = useCallback(() => {
    const colors = ["#dda15e", "#606c38", "#bc6c25", "#283618"]
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5,
    }))
  }, [])

  useEffect(() => {
    setParticles(generateParticles())
  }, [generateParticles])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            rotate: 360 + Math.random() * 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: p.size > 7 ? "50%" : "1px",
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

interface StepCompleteProps {
  userName: string
  country: string
  countryFlag: string
  industry: string
  goal: string
  importMethod: string
}

export function StepComplete({
  userName,
  country,
  countryFlag,
  industry,
  goal,
  importMethod,
}: StepCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center relative"
    >
      <Confetti />

      {/* Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="flex items-center justify-center w-20 h-20 rounded-full bg-[#606c38] mb-6"
      >
        <Check className="w-10 h-10 text-white" strokeWidth={3} />
      </motion.div>

      <h2 className="text-3xl font-bold text-[#283618] text-center text-balance">
        Your CVFlow account is ready, {userName}!
      </h2>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-md p-6 mt-8 w-full max-w-sm"
      >
        <p className="text-sm font-semibold text-[#283618] mb-3">Your setup:</p>
        <ul className="flex flex-col gap-2 text-sm text-[#283618]">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#606c38] shrink-0" />
            Country: {countryFlag} {country}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#606c38] shrink-0" />
            Industry: {industry}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#606c38] shrink-0" />
            Goal: {goal}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#606c38] shrink-0" />
            CV: {importMethod}
          </li>
        </ul>
      </motion.div>

      {/* CTAs */}
      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center bg-[#dda15e] text-[#283618] font-bold rounded-full px-10 py-4 text-lg hover:bg-[#bc6c25] transition-colors"
      >
        {"Go to my dashboard \u2192"}
      </Link>
      <Link
        href="/dashboard"
        className="mt-3 text-sm text-[#606c38] hover:text-[#283618] transition-colors"
      >
        {"Or explore templates first \u2192"}
      </Link>
    </motion.div>
  )
}
