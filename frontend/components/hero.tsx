"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Star, CheckCircle, Flag, Globe, Sparkles } from "lucide-react"

const avatarColors = ["#dda15e", "#606c38", "#bc6c25", "#283618", "#dda15e"]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fefae0] px-6 pb-20 pt-16 lg:pb-32 lg:pt-24">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #606c38 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.04,
        }}
      />
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, rgba(254,250,224,0) 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          {/* Badge Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#606c38] bg-white px-4 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#606c38] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#606c38]" />
            </span>
            <span className="text-sm font-medium text-[#606c38]">
              The first truly global CV builder — 40+ countries
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-balance text-5xl font-bold leading-tight tracking-tight text-[#283618] md:text-7xl"
          >
            Land your dream job,
            <br />
            <span className="relative inline-block">
              anywhere
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 8 C50 2, 150 2, 198 8" stroke="#dda15e" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>{" "}
            in the world.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-[#606c38]"
          >
            AI tailors your CV to every job offer. ATS-optimized.
            Available in 10+ languages. Pricing adapted to your country{"'"}s economy.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="rounded-full bg-[#dda15e] px-8 py-4 text-lg font-bold text-[#283618] shadow-lg transition-all hover:bg-[#bc6c25] hover:shadow-xl hover:scale-105"
            >
              {"Build my CV \u2014 it\u2019s free"}
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border-2 border-[#283618] px-8 py-4 text-lg font-semibold text-[#283618] transition-all hover:bg-[#283618] hover:text-[#fefae0]"
            >
              {"See how it works \u2193"}
            </a>
          </motion.div>

          {/* Social Proof Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
          >
            <div className="flex -space-x-2">
              {avatarColors.map((color, i) => (
                <div
                  key={i}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#fefae0] text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-[#606c38]">
              Trusted by <span className="font-semibold text-[#283618]">28,000+</span> job seekers
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#dda15e] text-[#dda15e]" />
              ))}
            </div>
            <span className="text-sm text-[#283618]">4.8/5 from 2,300 reviews</span>
          </motion.div>

          {/* Hero Product Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative mt-12 w-full max-w-6xl"
          >
            {/* Browser frame */}
            <div className="overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-2xl shadow-[#283618]/10">
              {/* Browser top bar */}
              <div className="flex items-center gap-2 border-b border-[#606c38]/10 bg-[#fefae0] px-4 py-2">
                <div className="h-3 w-3 rounded-full bg-[#bc6c25]" />
                <div className="h-3 w-3 rounded-full bg-[#dda15e]" />
                <div className="h-3 w-3 rounded-full bg-[#606c38]" />
                <div className="ml-4 flex-1 rounded-md bg-[#283618]/5 px-3 py-1 text-xs text-[#606c38]">cvflow.app/editor</div>
              </div>

              {/* 3-Panel Layout */}
              <div className="grid grid-cols-12 min-h-[320px] md:min-h-[380px]">
                {/* Left Sidebar */}
                <div className="col-span-3 bg-[#283618] p-4 text-[#fefae0]">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#606c38] flex items-center justify-center text-xs font-bold text-white">AD</div>
                    <span className="text-xs font-medium hidden lg:block">Amara Diallo</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Contact", done: true },
                      { label: "Summary", done: true },
                      { label: "Experience", active: true },
                      { label: "Education", done: false },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${item.active ? "bg-[#606c38]" : ""}`}>
                        <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${item.done ? "bg-[#606c38] text-white" : item.active ? "bg-[#dda15e] text-[#283618]" : "border border-[#606c38]"}`}>
                          {item.done ? "\u2713" : item.active ? "\u2192" : ""}
                        </span>
                        <span className="hidden sm:block">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Panel */}
                <div className="col-span-5 bg-[#fefae0] p-4 lg:p-6">
                  <h4 className="mb-4 text-sm font-bold text-[#283618]">Work Experience</h4>
                  <div className="space-y-3">
                    <div className="rounded-md bg-white p-2 shadow-sm">
                      <div className="text-xs font-medium text-[#283618]">Product Manager</div>
                      <div className="text-[10px] text-[#606c38]">{"Spotify \u00B7 2022 - Present"}</div>
                    </div>
                    <div className="rounded-md bg-white p-2 shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#283618]" />
                        <span className="text-[11px] text-[#283618]">Led cross-functional team of 12 to deliver new feature...</span>
                      </div>
                      <button className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#dda15e] px-2 py-0.5 text-[10px] font-medium text-[#283618]">
                        <Sparkles className="h-3 w-3" />
                        Improve with AI
                      </button>
                    </div>
                    <div className="rounded-md bg-white p-2 shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#283618]" />
                        <span className="text-[11px] text-[#606c38]">
                          {"Increased user retention by"}
                          <span className="inline-block w-px h-3 bg-[#283618] animate-pulse mx-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel - CV Preview */}
                <div className="col-span-4 bg-white p-4 shadow-inner">
                  <div className="border border-[#606c38]/10 rounded-md p-3 text-left">
                    <h5 className="text-xs font-bold text-[#283618]">Amara Diallo</h5>
                    <p className="text-[10px] text-[#606c38]">Product Manager</p>
                    <div className="mt-2 h-px bg-[#606c38]/10" />
                    <p className="mt-2 text-[8px] leading-relaxed text-[#283618]/70">Results-driven PM with 5+ years experience in agile product development and cross-functional leadership.</p>
                    <div className="mt-2">
                      <p className="text-[8px] font-bold text-[#283618]">Experience</p>
                      <p className="text-[7px] text-[#606c38]">{"Spotify \u00B7 2022 - Present"}</p>
                      <p className="mt-0.5 text-[7px] text-[#283618]/60">Led team of 12 to ship 3 features</p>
                    </div>
                    <div className="mt-1.5">
                      <p className="text-[7px] text-[#606c38]">{"Orange \u00B7 2019 - 2022"}</p>
                      <p className="mt-0.5 text-[7px] text-[#283618]/60">Increased retention by 34%</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                      {["PM", "Agile", "SQL", "A/B"].map((s) => (
                        <span key={s} className="rounded bg-[#fefae0] px-1 py-0.5 text-[8px] text-[#283618]">{s}</span>
                      ))}
                    </div>
                  </div>
                  {/* ATS Score */}
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <div className="relative h-12 w-12">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#f0edd0" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#606c38" strokeWidth="3" strokeDasharray="94.2" strokeDashoffset="8.5" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#283618]">91</span>
                    </div>
                    <span className="text-[10px] text-[#606c38]">ATS Score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card 1 - Top Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -left-4 top-16 hidden rounded-xl bg-white p-3 shadow-xl md:block"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#606c38]" />
                <div>
                  <p className="text-xs text-[#283618]">ATS Score improved</p>
                  <p className="text-lg font-bold text-[#606c38]">+23 points</p>
                  <p className="text-[10px] text-[#606c38]">3 missing keywords added</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 2 - Top Right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="absolute -right-4 top-16 hidden rounded-xl bg-white p-3 shadow-xl md:block"
            >
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-[#dda15e]" />
                <div>
                  <p className="text-xs font-medium text-[#283618]">Tailored for this job</p>
                  <p className="text-[11px] text-[#606c38]">Senior PM role at Spotify</p>
                  <p className="text-[10px] text-[#606c38]">{"\u2713 12 changes applied"}</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Card 3 - Bottom Right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="absolute -right-4 bottom-8 hidden rounded-xl bg-white p-3 shadow-xl md:block"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#dda15e]" />
                <div>
                  <p className="text-xs text-[#283618]">{"Pricing for Dakar, S\u00e9n\u00e9gal"}</p>
                  <p className="text-sm font-bold text-[#283618]">Pro plan: $5/month</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
