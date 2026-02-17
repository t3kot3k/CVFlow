"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Columns3, ShieldCheck, MessageCircle, Check } from "lucide-react"

const tabs = [
  {
    id: "ai-cv",
    label: "AI CV Builder",
    icon: Sparkles,
    title: "Build a perfect CV in minutes, not hours.",
    description:
      "Import your LinkedIn or existing CV. Our AI writes compelling bullet points, adapts the format to your target country, and exports a flawless PDF.",
    features: [
      "60+ templates by region (US, Europass, African, Asian)",
      "AI bullet points that quantify your impact",
      "Auto photo/no-photo rule by country",
      "Export PDF, DOCX, TXT \u2014 A4 or US Letter",
    ],
    cta: "Start building",
  },
  {
    id: "job-tracker",
    label: "Job Tracker",
    icon: Columns3,
    title: "One place for every application.",
    description:
      "Save jobs from LinkedIn, Indeed, JobInAfrica, Rekrute and 40+ boards. Track every stage. Never miss a follow-up.",
    features: [
      "Kanban board: Saved \u2192 Applied \u2192 Interview \u2192 Offer",
      "Chrome Extension for 40+ job boards",
      "Automated follow-up reminders",
      "Response rate analytics",
    ],
    cta: "Try the tracker",
  },
  {
    id: "ats",
    label: "ATS & Tailoring",
    icon: ShieldCheck,
    title: "Know exactly why your CV gets rejected.",
    description:
      "Paste a job offer and get instant keyword analysis. AI rewrites your CV to match the role with a before/after diff view.",
    features: [
      "ATS score 0-100 with full breakdown",
      "Paste a job offer \u2192 instant keyword analysis",
      "AI rewrites your CV to match the role",
      "Before/after diff view of all changes",
    ],
    cta: "Check your score",
  },
  {
    id: "interview",
    label: "Interview Prep",
    icon: MessageCircle,
    title: "Practice until you\u2019re unbeatable.",
    description:
      "Get personalized questions from your CV and job offer, practice with audio or text, and receive instant AI coaching.",
    features: [
      "Questions generated from YOUR CV + the job offer",
      "Record audio or type your answers",
      "AI coach gives instant feedback (STAR method)",
      "Industry-specific technical questions",
    ],
    cta: "Start practicing",
  },
]

function CVBuilderMockup() {
  return (
    <div className="rounded-xl border border-[#606c38]/15 bg-white shadow-lg shadow-[#283618]/5 overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-[#606c38]/10 bg-[#fefae0] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-[#bc6c25]" />
        <div className="h-2 w-2 rounded-full bg-[#dda15e]" />
        <div className="h-2 w-2 rounded-full bg-[#606c38]" />
      </div>
      <div className="grid grid-cols-3 min-h-[240px]">
        <div className="bg-[#283618] p-3 text-[#fefae0]">
          <div className="mb-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#606c38] mx-auto text-[8px] font-bold">FA</div>
          {["Contact", "Summary", "Experience", "Skills"].map((s, i) => (
            <div key={s} className={`mb-2 rounded px-2 py-1 text-[10px] transition-colors ${i === 2 ? "bg-[#606c38]" : "hover:bg-[#606c38]/30"}`}>{s}</div>
          ))}
        </div>
        <div className="bg-[#fefae0] p-3">
          <p className="mb-1 text-[10px] font-bold text-[#283618]">Fatima Al-Hassan</p>
          <p className="mb-3 text-[9px] text-[#606c38]">Marketing Manager</p>
          <div className="space-y-2">
            <p className="text-[8px] text-[#283618]/70">Led brand strategy across 3 markets, growing awareness by 45%...</p>
            <div className="flex items-center gap-1 mt-2">
              <Sparkles className="h-3 w-3 text-[#dda15e]" />
              <span className="text-[8px] text-[#dda15e] font-medium">AI writing...</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 border-l border-[#606c38]/10">
          <p className="text-[9px] font-bold text-[#283618] mb-1">Fatima Al-Hassan</p>
          <p className="text-[7px] text-[#606c38] mb-2">Marketing Manager</p>
          <div className="h-px bg-[#606c38]/10 mb-1.5" />
          <p className="text-[7px] text-[#283618]/60">Led brand strategy across 3 markets...</p>
          <p className="mt-1 text-[7px] text-[#283618]/60">Managed $2M annual budget...</p>
          <div className="mt-2 flex gap-0.5">
            {["SEO", "GA4", "HubSpot"].map((s) => (
              <span key={s} className="rounded bg-[#fefae0] px-1 py-0.5 text-[7px] text-[#283618]">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KanbanMockup() {
  const columns = [
    { name: "Saved", color: "bg-[#fefae0]", cards: ["Google PM", "Deloitte Analyst", "MTN Lead"] },
    { name: "Applied", color: "bg-[#dda15e]/10", cards: ["Spotify PM", "Orange Dev", "PwC Senior", "Amazon PM", "Total Eng"] },
    { name: "Interview", color: "bg-[#606c38]/10", cards: ["Capgemini PM", "Nestl\u00e9 Mkt"] },
    { name: "Offer", color: "bg-[#606c38]/20", cards: ["Airbus Lead"] },
  ]
  return (
    <div className="rounded-xl border border-[#606c38]/15 bg-white shadow-lg shadow-[#283618]/5 overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-[#606c38]/10 bg-[#fefae0] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-[#bc6c25]" />
        <div className="h-2 w-2 rounded-full bg-[#dda15e]" />
        <div className="h-2 w-2 rounded-full bg-[#606c38]" />
      </div>
      <div className="grid grid-cols-4 gap-2 p-3 min-h-[240px]">
        {columns.map((col) => (
          <div key={col.name} className="flex flex-col gap-2">
            <div className="rounded bg-[#283618] px-2 py-1 text-[10px] font-bold text-[#fefae0] text-center">{col.name}</div>
            {col.cards.map((card) => (
              <div key={card} className={`rounded-md p-2 ${col.color} border border-[#606c38]/10`}>
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#283618] text-[6px] font-bold text-[#fefae0] mb-1">{card.charAt(0)}</div>
                <p className="text-[8px] font-medium text-[#283618]">{card}</p>
                <p className="text-[7px] text-[#606c38] mt-0.5">3d ago</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ATSMockup() {
  return (
    <div className="rounded-xl border border-[#606c38]/15 bg-white shadow-lg shadow-[#283618]/5 overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-[#606c38]/10 bg-[#fefae0] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-[#bc6c25]" />
        <div className="h-2 w-2 rounded-full bg-[#dda15e]" />
        <div className="h-2 w-2 rounded-full bg-[#606c38]" />
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 min-h-[240px]">
        <div className="flex flex-col items-center justify-center">
          <p className="mb-2 text-[10px] text-[#606c38] font-medium">ATS Score</p>
          <div className="relative h-24 w-24">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#f0edd0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#dda15e" strokeWidth="3" strokeDasharray="94.2" strokeDashoffset="20.7" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#283618]">
              <span className="line-through text-[#bc6c25]/50 mr-1">78</span>94
            </span>
          </div>
          <p className="mt-1 text-[9px] text-[#606c38]">+16 points improvement</p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[#283618] mb-2">Missing keywords</p>
          {["Project Management", "Stakeholder", "KPI Tracking", "Agile"].map((kw) => (
            <div key={kw} className="flex items-center justify-between rounded bg-[#fefae0] px-2 py-1">
              <span className="text-[9px] text-[#283618]">{kw}</span>
              <button className="text-[8px] font-medium text-[#606c38] bg-white rounded px-1.5 py-0.5">Add</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InterviewMockup() {
  return (
    <div className="rounded-xl border border-[#606c38]/15 bg-white shadow-lg shadow-[#283618]/5 overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-[#606c38]/10 bg-[#fefae0] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-[#bc6c25]" />
        <div className="h-2 w-2 rounded-full bg-[#dda15e]" />
        <div className="h-2 w-2 rounded-full bg-[#606c38]" />
      </div>
      <div className="p-4 space-y-3 min-h-[240px]">
        <div className="rounded-lg bg-[#283618] p-3 max-w-[85%]">
          <p className="text-[10px] text-[#fefae0]">Tell me about a time you led a cross-functional project...</p>
        </div>
        <div className="rounded-lg bg-[#dda15e] p-3 max-w-[85%] ml-auto">
          <p className="text-[10px] text-[#283618]">At Orange, I coordinated a team of 8 across marketing and engineering...</p>
        </div>
        <div className="rounded-lg border border-[#606c38] bg-[#fefae0] p-3">
          <p className="text-[9px] font-medium text-[#606c38] mb-1">AI Feedback</p>
          <p className="text-[10px] text-[#283618]">
            Good structure. Add a quantified result. Try: {"\""}which resulted in 30% faster delivery{"\""}
          </p>
        </div>
      </div>
    </div>
  )
}

const mockups: Record<string, React.FC> = {
  "ai-cv": CVBuilderMockup,
  "job-tracker": KanbanMockup,
  "ats": ATSMockup,
  "interview": InterviewMockup,
}

export function FeatureTabs() {
  const [activeTab, setActiveTab] = useState("ai-cv")
  const activeData = tabs.find((t) => t.id === activeTab)!
  const MockupComponent = mockups[activeTab]

  return (
    <section id="features" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-[#606c38] uppercase">
            Built for every step
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#283618] text-balance">
            Everything you need to land interviews
          </h2>
        </div>

        {/* Tab Row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#283618] text-[#fefae0] shadow-md"
                  : "border border-[#606c38]/30 bg-[#fefae0] text-[#283618] hover:bg-[#dda15e]/20 hover:border-[#dda15e]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-10 grid items-center gap-10 lg:grid-cols-2"
          >
            {/* Left - Description */}
            <div>
              <h3 className="text-2xl font-bold text-[#283618]">{activeData.title}</h3>
              <p className="mt-3 text-[#606c38] leading-relaxed">{activeData.description}</p>
              <ul className="mt-6 space-y-3">
                {activeData.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#dda15e]" />
                    <span className="text-sm text-[#283618]">{feat}</span>
                  </li>
                ))}
              </ul>
              <a href="#get-started" className="mt-6 inline-block text-sm font-semibold text-[#bc6c25] underline underline-offset-4">
                {activeData.cta + " \u2192"}
              </a>
            </div>

            {/* Right - Mockup */}
            <div>
              <MockupComponent />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
