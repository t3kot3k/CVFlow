"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Search,
  ChevronDown,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Lightbulb,
  CalendarDays,
  Globe,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react"

/* ────────────── Fade-up animation ────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45 },
  }),
}

/* ────────────── Skills data ────────────── */
const skills = [
  { name: "Data Analytics", demand: 94, have: true },
  { name: "Paid Social Ads", demand: 87, have: true },
  { name: "Marketing Automation", demand: 82, have: false },
  { name: "HubSpot", demand: 71, have: true },
  { name: "SEO/SEM", demand: 68, have: false },
  { name: "Product Marketing", demand: 61, have: true },
  { name: "Brand Strategy", demand: 58, have: false },
]

/* ────────────── City salary data ────────────── */
const citySalaries = [
  { city: "Remote", salary: 55 },
  { city: "Paris", salary: 52 },
  { city: "Lyon", salary: 46 },
  { city: "Bordeaux", salary: 43 },
]

/* ────────────── Demand trend data (monthly postings) ────────────── */
const demandData = [320, 380, 520, 460, 440, 490, 410, 380, 540, 480, 510, 560]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/* ────────────── World comparison data ────────────── */
const countries = [
  { flag: "\uD83C\uDDEB\uD83C\uDDF7", name: "France", salary: "\u20AC52K", demand: "High", demandIcon: "\u25B2", adj: "\u20AC52K", tip: "Photo optional, Europass" },
  { flag: "\uD83C\uDDE9\uD83C\uDDEA", name: "Germany", salary: "\u20AC56K", demand: "Very High", demandIcon: "\u25B2\u25B2", adj: "\u20AC48K adj", tip: "Lebenslauf format, photo req." },
  { flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "UK", salary: "\u00A354K", demand: "High", demandIcon: "\u25B2", adj: "\u00A347K adj", tip: "1 page max, no photo" },
  { flag: "\uD83C\uDDF8\uD83C\uDDF3", name: "Senegal", salary: "FCFA 14M", demand: "Medium", demandIcon: "\u2192", adj: "equiv \u20AC55K PPP", tip: "Lettre de motivation required" },
  { flag: "\uD83C\uDDF2\uD83C\uDDE6", name: "Morocco", salary: "MAD 240K", demand: "Growing", demandIcon: "\u25B2", adj: "equiv \u20AC32K", tip: "Arabic + French CV" },
  { flag: "\uD83C\uDDE8\uD83C\uDDE6", name: "Canada", salary: "CAD 72K", demand: "Very High", demandIcon: "\u25B2\u25B2", adj: "\u20AC48K adj", tip: "1 page, ATS-first" },
]

/* ═══════════════════ ANIMATED SALARY BAR ═══════════════════ */
function SalaryRangeBar() {
  const min = 38
  const max = 72
  const p25 = 42
  const median = 52
  const p75 = 64
  const userLow = 52
  const userHigh = 58
  const range = max - min

  const pct = (val: number) => ((val - min) / range) * 100

  return (
    <div className="mt-6">
      {/* Range bar */}
      <div className="relative">
        <div className="flex items-center justify-between text-xs font-semibold text-[#283618] mb-2">
          <span>{"\u20AC"}38K</span>
          <span>{"\u20AC"}72K</span>
        </div>
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-[#606c38]/10">
          <div
            className="absolute inset-y-0 rounded-full"
            style={{
              left: "0%",
              right: "0%",
              background: "linear-gradient(to right, #bc6c25, #dda15e, #606c38)",
            }}
          />
        </div>

        {/* User position marker */}
        <div
          className="absolute -top-1"
          style={{ left: `${pct((userLow + userHigh) / 2)}%`, transform: "translateX(-50%)" }}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-[#283618] mt-7" />
            <div className="mt-0.5 whitespace-nowrap rounded-lg bg-[#283618] px-3 py-1.5 text-xs font-semibold text-[#fefae0] shadow-lg">
              Your estimated value: {"\u20AC"}52-58K
            </div>
          </div>
        </div>

        {/* Percentile markers */}
        <div className="relative mt-12 flex text-[10px] text-[#606c38]/70 font-medium">
          <div className="absolute flex flex-col items-center" style={{ left: `${pct(p25)}%`, transform: "translateX(-50%)" }}>
            <div className="h-3 w-px bg-[#606c38]/30" />
            <span className="mt-0.5">25th: {"\u20AC"}42K</span>
          </div>
          <div className="absolute flex flex-col items-center" style={{ left: `${pct(median)}%`, transform: "translateX(-50%)" }}>
            <div className="h-3 w-px bg-[#283618]" />
            <span className="mt-0.5 font-semibold text-[#283618]">Median: {"\u20AC"}52K</span>
          </div>
          <div className="absolute flex flex-col items-center" style={{ left: `${pct(p75)}%`, transform: "translateX(-50%)" }}>
            <div className="h-3 w-px bg-[#606c38]/30" />
            <span className="mt-0.5">75th: {"\u20AC"}64K</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ DEMAND SPARKLINE ═══════════════════ */
function DemandChart() {
  const svgW = 320
  const svgH = 100
  const padding = 10
  const maxVal = Math.max(...demandData)
  const minVal = Math.min(...demandData)
  const range = maxVal - minVal || 1

  const points = demandData.map((v, i) => {
    const x = padding + (i / (demandData.length - 1)) * (svgW - padding * 2)
    const y = svgH - padding - ((v - minVal) / range) * (svgH - padding * 2)
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
  const areaPath = `${linePath} L${points[points.length - 1].x},${svgH - padding} L${points[0].x},${svgH - padding} Z`

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto mt-4" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dda15e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#dda15e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke="#dda15e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#dda15e" stroke="white" strokeWidth="1.5" />
      ))}
      {/* x-axis labels */}
      {points.map((p, i) => (
        <text key={`l-${i}`} x={p.x} y={svgH - 1} textAnchor="middle" className="text-[7px] fill-[#606c38]/60 font-sans">
          {months[i]}
        </text>
      ))}
    </svg>
  )
}

/* ═══════════════════ DONUT CHART ═══════════════════ */
function CompetitionDonut() {
  const pct = 68
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#606c38" strokeOpacity="0.1" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none" stroke="#bc6c25" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#283618]">High</span>
        <span className="text-xs text-[#606c38]">{pct}%</span>
      </div>
    </div>
  )
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function MarketIntelligencePage() {
  const [role, setRole] = useState("Marketing Manager")
  const [country, setCountry] = useState("France")
  const [city, setCity] = useState("Paris")
  const [experience, setExperience] = useState("5-8 years")

  const haveCount = skills.filter((s) => s.have).length
  const totalSkills = skills.length

  return (
    <div className="min-h-screen bg-[#fefae0]">
      {/* ═══ HEADER ═══ */}
      <header className="bg-[#283618] px-4 sm:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#606c38]/30 text-[#fefae0] transition-colors hover:bg-[#606c38]/50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#fefae0]">
                Market Intelligence
              </h1>
              <p className="mt-0.5 text-sm text-[#fefae0]/70">
                Know your market value before you negotiate.
              </p>
            </div>
          </div>

          {/* Filter row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606c38]" />
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-full bg-[#fefae0] py-2 pl-9 pr-4 text-sm text-[#283618] outline-none ring-1 ring-transparent focus:ring-[#dda15e] w-52"
                placeholder="Job title..."
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-full bg-[#606c38] px-4 py-2 text-sm font-medium text-[#fefae0] transition-colors hover:bg-[#606c38]/80">
              {"\uD83C\uDDEB\uD83C\uDDF7"} {country} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button className="flex items-center gap-1.5 rounded-full bg-[#606c38] px-4 py-2 text-sm font-medium text-[#fefae0] transition-colors hover:bg-[#606c38]/80">
              {city} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button className="flex items-center gap-1.5 rounded-full bg-[#606c38] px-4 py-2 text-sm font-medium text-[#fefae0] transition-colors hover:bg-[#606c38]/80">
              {experience} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
            <button className="rounded-full bg-[#dda15e] px-5 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
              {"Update \u2192"}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-8">

        {/* ── ROW 1: Salary + Demand ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Salary card (2/3) */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-md border border-[#606c38]/5"
          >
            <h2 className="text-lg font-bold text-[#283618]">
              Salary Range — {role} in {city}
            </h2>
            <p className="mt-0.5 text-xs text-[#606c38]">
              Based on 2,847 data points &middot; Updated Feb 2026
            </p>

            <SalaryRangeBar />

            {/* Breakdown grid */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#fefae0] p-4 text-center">
                <p className="text-2xl font-bold text-[#283618]">{"\u20AC"}52,000</p>
                <p className="text-xs text-[#606c38]">Median salary</p>
                <p className="text-[10px] text-[#606c38]/50">Paris 2026</p>
              </div>
              <div className="rounded-xl bg-[#fefae0] p-4 text-center">
                <p className="text-2xl font-bold text-[#283618]">{"\u20AC"}58,000</p>
                <p className="text-xs text-[#606c38]">Senior level (7Y+)</p>
              </div>
              <div className="rounded-xl bg-[#606c38]/10 p-4 text-center">
                <p className="text-2xl font-bold text-[#606c38]">+{"\u20AC"}8K</p>
                <p className="text-xs text-[#606c38]">LinkedIn vs non-LinkedIn profile</p>
              </div>
            </div>

            {/* City comparison bars */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#283618] mb-3">City comparison</h3>
              <div className="space-y-2">
                {citySalaries.map((c) => (
                  <div key={c.city} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium text-[#283618] text-right">{c.city}</span>
                    <div className="flex-1 h-5 rounded-full bg-[#606c38]/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#dda15e]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.salary / 60) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="w-12 text-xs font-bold text-[#283618]">{"\u20AC"}{c.salary}K</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Demand trend card (1/3) */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl bg-white p-6 shadow-md border border-[#606c38]/5"
          >
            <h2 className="text-lg font-bold text-[#283618]">
              Demand Trend
            </h2>
            <p className="mt-0.5 text-xs text-[#606c38]">{role} &middot; 2025</p>

            <DemandChart />

            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#606c38]/10 px-3 py-1 text-xs font-semibold text-[#606c38]">
                <TrendingUp className="h-3.5 w-3.5" /> +23% vs last year
              </span>
            </div>

            <p className="mt-4 text-sm text-[#606c38]">
              Most active hiring months: <span className="font-semibold text-[#283618]">March, September, November</span>
            </p>
          </motion.div>
        </div>

        {/* ── ROW 2: Skills + Competition ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Skills card (2/3) */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="xl:col-span-2 rounded-2xl bg-white p-6 shadow-md border border-[#606c38]/5"
          >
            <h2 className="text-lg font-bold text-[#283618]">
              Most In-Demand Skills — France 2026
            </h2>

            <div className="mt-5 space-y-3">
              {skills.map((skill) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className="w-40 sm:w-48 text-sm font-medium text-[#283618] truncate flex items-center gap-2">
                    {skill.have && <CheckCircle className="h-3.5 w-3.5 text-[#606c38] shrink-0" />}
                    {!skill.have && <AlertCircle className="h-3.5 w-3.5 text-[#606c38]/30 shrink-0" />}
                    {skill.name}
                  </span>
                  <div className="flex-1 h-5 rounded-full bg-[#606c38]/5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${skill.have ? "bg-[#606c38]" : "bg-[#606c38]/20"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.demand}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="w-10 text-xs font-bold text-[#283618] text-right">{skill.demand}%</span>
                  {!skill.have && (
                    <Link
                      href="/dashboard/cvs"
                      className="text-[10px] font-semibold text-[#dda15e] whitespace-nowrap hover:text-[#bc6c25] transition-colors"
                    >
                      {"Add to CV \u2192"}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Skills match banner */}
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#dda15e] bg-[#dda15e]/10 p-3">
              <Lightbulb className="h-4 w-4 text-[#dda15e] shrink-0" />
              <p className="text-sm text-[#283618]">
                Skills you have: <span className="font-bold">{haveCount}/{totalSkills}</span> &middot;{" "}
                <Link href="/dashboard/cvs" className="font-semibold text-[#dda15e] hover:text-[#bc6c25] transition-colors">
                  {"Add " + (totalSkills - haveCount) + " skills to match top profiles \u2192"}
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Competition card (1/3) */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-2xl bg-white p-6 shadow-md border border-[#606c38]/5"
          >
            <h2 className="text-lg font-bold text-[#283618]">
              Competition Level
            </h2>

            <div className="mt-4">
              <CompetitionDonut />
            </div>

            <div className="mt-5 space-y-2 text-sm text-[#283618]">
              <p>Average applications per job: <span className="font-bold">187</span></p>
              <p>Top 15% applications get interviews</p>
            </div>

            <div className="mt-4 space-y-1.5 rounded-xl bg-[#fefae0] p-3">
              <p className="text-sm font-semibold text-[#dda15e]">
                Your estimated rank: Top 28%
              </p>
              <p className="text-sm font-semibold text-[#606c38]">
                After tailoring: Top 12%
              </p>
              <Link
                href="/dashboard/ats"
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#dda15e] hover:text-[#bc6c25] transition-colors"
              >
                Tailor your CV now <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── ROW 3: World Comparison ── */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-2xl bg-white p-6 shadow-md border border-[#606c38]/5 overflow-x-auto"
        >
          <h2 className="text-lg font-bold text-[#283618]">
            Same Role, Different Markets — {role}
          </h2>

          <div className="mt-5 min-w-[640px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#606c38]/10 text-left">
                  <th className="pb-3 font-semibold text-[#606c38] text-xs uppercase tracking-wide">Country</th>
                  <th className="pb-3 font-semibold text-[#606c38] text-xs uppercase tracking-wide">Avg Salary</th>
                  <th className="pb-3 font-semibold text-[#606c38] text-xs uppercase tracking-wide">Demand</th>
                  <th className="pb-3 font-semibold text-[#606c38] text-xs uppercase tracking-wide">Cost of living adj.</th>
                  <th className="pb-3 font-semibold text-[#606c38] text-xs uppercase tracking-wide">CVFlow tips</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c) => (
                  <tr
                    key={c.name}
                    className="border-b border-[#606c38]/5 transition-colors hover:bg-[#dda15e]/5"
                  >
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2 font-medium text-[#283618]">
                        <span className="text-lg">{c.flag}</span> {c.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-[#283618]">{c.salary}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.demand.includes("Very")
                          ? "bg-[#606c38]/15 text-[#606c38]"
                          : c.demand === "High" || c.demand === "Growing"
                          ? "bg-[#dda15e]/15 text-[#dda15e]"
                          : "bg-[#606c38]/10 text-[#606c38]/70"
                      }`}>
                        {c.demandIcon} {c.demand}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#606c38]">{c.adj}</td>
                    <td className="py-3 pr-4 text-xs text-[#606c38]/80 italic">{c.tip}</td>
                    <td className="py-3">
                      <button className="flex items-center gap-1 text-xs font-semibold text-[#606c38] hover:text-[#dda15e] transition-colors whitespace-nowrap">
                        Explore <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── ROW 4: Personalized Insights ── */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-2xl bg-[#283618] p-6"
        >
          <h2 className="text-lg font-bold text-[#fefae0]">
            Personalized insights for your profile
          </h2>
          <p className="mt-0.5 text-sm text-[#fefae0]/60">
            Based on your CV, industry, and target country.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Insight 1 */}
            <div className="rounded-xl bg-white/10 p-4">
              <div className="flex items-center gap-2 text-[#dda15e]">
                <Lightbulb className="h-4 w-4 shrink-0" />
                <h3 className="text-sm font-bold">Salary negotiation tip</h3>
              </div>
              <p className="mt-2 text-sm text-[#fefae0]/80 leading-relaxed">
                {"Candidates with 'Data Analytics' in their skills earn 18% more in France. You're missing this keyword."}
              </p>
              <Link
                href="/dashboard/cvs"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#dda15e] hover:text-[#fefae0] transition-colors"
              >
                {"Add to CV \u2192"}
              </Link>
            </div>

            {/* Insight 2 */}
            <div className="rounded-xl bg-white/10 p-4">
              <div className="flex items-center gap-2 text-[#dda15e]">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <h3 className="text-sm font-bold">Best time to apply</h3>
              </div>
              <p className="mt-2 text-sm text-[#fefae0]/80 leading-relaxed">
                {"March is peak hiring month in France for Marketing roles. Start applying now \u2014 you're 3 weeks early."}
              </p>
              <Link
                href="/dashboard/jobs"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#dda15e] hover:text-[#fefae0] transition-colors"
              >
                {"Set reminder \u2192"}
              </Link>
            </div>

            {/* Insight 3 */}
            <div className="rounded-xl bg-white/10 p-4">
              <div className="flex items-center gap-2 text-[#dda15e]">
                <Globe className="h-4 w-4 shrink-0" />
                <h3 className="text-sm font-bold">Opportunity alert</h3>
              </div>
              <p className="mt-2 text-sm text-[#fefae0]/80 leading-relaxed">
                {"Morocco's marketing sector grew 34% in 2025. Your profile matches 89% of requirements there."}
              </p>
              <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#dda15e] hover:text-[#fefae0] transition-colors">
                {"Explore Moroccan market \u2192"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
