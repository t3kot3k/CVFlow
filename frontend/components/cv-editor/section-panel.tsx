"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GripVertical,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Globe,
  Award,
  Link as LinkIcon,
  Check,
  Plus,
  ChevronRight,
} from "lucide-react"

interface SectionItem {
  id: string
  label: string
  icon: React.ElementType
  status: "completed" | "active" | "pending"
}

const defaultSections: SectionItem[] = [
  { id: "contact", label: "Contact Info", icon: User, status: "completed" },
  { id: "summary", label: "Professional Summary", icon: FileText, status: "completed" },
  { id: "experience", label: "Work Experience", icon: Briefcase, status: "active" },
  { id: "education", label: "Education", icon: GraduationCap, status: "pending" },
  { id: "skills", label: "Skills", icon: Wrench, status: "pending" },
  { id: "languages", label: "Languages", icon: Globe, status: "pending" },
  { id: "certifications", label: "Certifications", icon: Award, status: "pending" },
  { id: "projects", label: "Projects", icon: LinkIcon, status: "pending" },
]

const addSectionOptions = ["Publications", "Awards", "Volunteer", "References", "Custom..."]

interface SectionPanelProps {
  activeSection: string
  onSectionChange: (id: string) => void
}

export function SectionPanel({ activeSection, onSectionChange }: SectionPanelProps) {
  const [sections] = useState<SectionItem[]>(defaultSections)
  const [addOpen, setAddOpen] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState(0)

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-30 flex w-[200px] flex-col bg-[#283618] overflow-y-auto">
      {/* Section title */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#fefae0]">
          Sections
        </h2>
      </div>

      {/* Section list */}
      <nav className="flex-1 space-y-1 px-2">
        {sections.map((section) => {
          const isActive = section.id === activeSection
          const isCompleted = section.status === "completed"
          const isPending = section.status === "pending" && !isActive

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`relative flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-[#dda15e] font-semibold text-[#283618]"
                  : isCompleted
                  ? "bg-[#606c38]/40 text-[#fefae0]"
                  : "text-[#fefae0]/60 hover:bg-[#606c38]/20 hover:text-[#fefae0]"
              }`}
            >
              <GripVertical className={`h-3.5 w-3.5 shrink-0 cursor-grab ${
                isActive ? "text-[#283618]/40" : "text-[#fefae0]/30"
              }`} />
              <section.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{section.label}</span>
              {isCompleted && !isActive && (
                <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-[#dda15e]" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Add section button */}
      <div className="relative px-2 pb-2">
        <button
          onClick={() => setAddOpen(!addOpen)}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#dda15e] transition-colors hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Add a section
        </button>
        <AnimatePresence>
          {addOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute bottom-full left-2 right-2 mb-1 overflow-hidden rounded-xl border border-[#606c38]/30 bg-[#283618] shadow-xl"
            >
              {addSectionOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAddOpen(false)}
                  className="flex w-full items-center px-3 py-2 text-sm text-[#fefae0]/80 transition-colors hover:bg-[#606c38]/30 hover:text-[#fefae0]"
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom template strip */}
      <div className="mt-auto border-t border-white/10 p-3">
        <p className="mb-2 text-xs text-[#fefae0]/60">Template</p>
        <div className="flex items-center gap-2">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => setActiveTemplate(i)}
              className={`h-[40px] w-[30px] rounded border-2 transition-colors ${
                activeTemplate === i
                  ? "border-[#dda15e]"
                  : "border-[#fefae0]/20 hover:border-[#fefae0]/40"
              } overflow-hidden bg-white`}
            >
              {/* Mini template preview */}
              <div className="h-full w-full p-0.5">
                <div className={`h-[6px] w-full rounded-sm ${i === 0 ? "bg-[#dda15e]" : "bg-[#283618]"}`} />
                <div className="mt-0.5 space-y-0.5">
                  <div className="h-[2px] w-3/4 rounded-full bg-[#283618]/20" />
                  <div className="h-[2px] w-1/2 rounded-full bg-[#283618]/10" />
                  <div className="h-[2px] w-2/3 rounded-full bg-[#283618]/10" />
                </div>
              </div>
            </button>
          ))}
          <button className="ml-auto text-xs text-[#dda15e] transition-colors hover:text-[#fefae0]">
            {"See all \u2192"}
          </button>
        </div>
      </div>
    </aside>
  )
}
