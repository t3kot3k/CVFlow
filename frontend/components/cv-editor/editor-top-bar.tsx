"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Share2,
  Check,
} from "lucide-react"

export function EditorTopBar() {
  const [cvName, setCvName] = useState("Senior Marketing Manager CV")
  const [editing, setEditing] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#606c38]/15 bg-white px-4">
      {/* Left cluster */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-5 w-px bg-[#606c38]/15" />

        {/* Editable CV name */}
        {editing ? (
          <input
            ref={inputRef}
            value={cvName}
            onChange={(e) => setCvName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => { if (e.key === "Enter") setEditing(false) }}
            className="min-w-[120px] max-w-[240px] rounded-md border border-[#dda15e] bg-[#fefae0] px-2 py-1 text-sm font-semibold text-[#283618] outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="max-w-[240px] truncate text-sm font-semibold text-[#283618] underline-offset-2 hover:underline"
          >
            {cvName}
          </button>
        )}

        {/* Saved indicator */}
        <span className="flex items-center gap-1 text-xs text-[#606c38]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#606c38]" />
          Saved
        </span>
      </div>

      {/* Center cluster */}
      <div className="hidden items-center gap-2 md:flex">
        <button className="flex items-center gap-1.5 rounded-full border border-[#606c38]/30 px-3 py-1 text-sm text-[#283618] transition-colors hover:border-[#606c38]">
          Olive Template
          <ChevronDown className="h-3.5 w-3.5 text-[#606c38]" />
        </button>
        <button className="flex items-center gap-1.5 rounded-full border border-[#606c38]/30 px-3 py-1 text-sm text-[#283618] transition-colors hover:border-[#606c38]">
          <span>French</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#606c38]" />
        </button>
        <button className="flex items-center gap-1.5 rounded-full border border-[#606c38]/30 px-3 py-1 text-sm text-[#283618] transition-colors hover:border-[#606c38]">
          {"A4 \u00B7 1 page"}
          <ChevronDown className="h-3.5 w-3.5 text-[#606c38]" />
        </button>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/ats"
          className="hidden items-center gap-1.5 rounded-full bg-[#dda15e] px-4 py-1.5 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] sm:flex"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Tailor to a job offer
        </Link>

        {/* Download dropdown */}
        <div className="relative">
          <button
            onClick={() => setDownloadOpen(!downloadOpen)}
            className="flex items-center gap-1.5 rounded-full border border-[#283618] px-4 py-1.5 text-sm text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0]"
          >
            Download
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${downloadOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {downloadOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDownloadOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                >
                  {[
                    { label: "PDF", desc: "Recommended" },
                    { label: "DOCX", desc: "Editable" },
                    { label: "TXT (ATS)", desc: "Plain text" },
                  ].map((fmt) => (
                    <button
                      key={fmt.label}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[#283618] transition-colors hover:bg-[#fefae0]"
                      onClick={() => setDownloadOpen(false)}
                    >
                      <span className="font-medium">{fmt.label}</span>
                      <span className="text-xs text-[#606c38]">{fmt.desc}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#606c38]/20 text-[#606c38] transition-colors hover:bg-[#606c38]/5"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
