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
  Loader2,
  Save,
} from "lucide-react"

interface EditorTopBarProps {
  title: string
  onTitleChange: (title: string) => void
  onSave: () => void
  onDownload: () => void
  saveStatus: "saved" | "saving" | "unsaved"
  isSaving: boolean
}

export function EditorTopBar({
  title,
  onTitleChange,
  onSave,
  onDownload,
  saveStatus,
  isSaving,
}: EditorTopBarProps) {
  const [localTitle, setLocalTitle] = useState(title)
  const [editing, setEditing] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external title changes
  useEffect(() => {
    if (!editing) setLocalTitle(title)
  }, [title, editing])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commitTitle = () => {
    setEditing(false)
    if (localTitle.trim() && localTitle.trim() !== title) {
      onTitleChange(localTitle.trim())
    } else {
      setLocalTitle(title)
    }
  }

  const saveIndicator = () => {
    if (saveStatus === "saving" || isSaving) {
      return (
        <span className="flex items-center gap-1 text-xs text-[#606c38]/60">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving…
        </span>
      )
    }
    if (saveStatus === "unsaved") {
      return (
        <button
          onClick={onSave}
          className="flex items-center gap-1 text-xs text-[#dda15e] hover:text-[#bc6c25] transition-colors"
        >
          <Save className="h-3 w-3" />
          Unsaved
        </button>
      )
    }
    return (
      <span className="flex items-center gap-1 text-xs text-[#606c38]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#606c38]" />
        Saved
      </span>
    )
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#606c38]/15 bg-white px-4">
      {/* Left cluster */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/dashboard/cvs"
          className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618] shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">My CVs</span>
        </Link>

        <div className="h-5 w-px bg-[#606c38]/15" />

        {/* Editable CV name */}
        {editing ? (
          <input
            ref={inputRef}
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle()
              if (e.key === "Escape") { setLocalTitle(title); setEditing(false) }
            }}
            className="min-w-[120px] max-w-[240px] rounded-md border border-[#dda15e] bg-[#fefae0] px-2 py-1 text-sm font-semibold text-[#283618] outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            title="Click to rename"
            className="max-w-[200px] truncate text-sm font-semibold text-[#283618] underline-offset-2 hover:underline"
          >
            {localTitle}
          </button>
        )}

        {/* Save indicator */}
        {saveIndicator()}
      </div>

      {/* Center cluster */}
      <div className="hidden items-center gap-2 md:flex">
        <button className="flex items-center gap-1.5 rounded-full border border-[#606c38]/30 px-3 py-1 text-sm text-[#283618] transition-colors hover:border-[#606c38]">
          Olive Template
          <ChevronDown className="h-3.5 w-3.5 text-[#606c38]" />
        </button>
        <button className="flex items-center gap-1.5 rounded-full border border-[#606c38]/30 px-3 py-1 text-sm text-[#283618] transition-colors hover:border-[#606c38]">
          English
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
          Tailor to job offer
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
                  className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-lg"
                >
                  <button
                    onClick={() => { setDownloadOpen(false); onDownload() }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[#283618] transition-colors hover:bg-[#fefae0]"
                  >
                    <span className="font-medium">PDF</span>
                    <span className="text-xs text-[#606c38]">Recommended</span>
                  </button>
                  <button
                    onClick={() => setDownloadOpen(false)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[#283618] transition-colors hover:bg-[#fefae0]"
                  >
                    <span className="font-medium">DOCX</span>
                    <span className="text-xs text-[#606c38]">Editable</span>
                  </button>
                  <button
                    onClick={() => setDownloadOpen(false)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[#283618] transition-colors hover:bg-[#fefae0]"
                  >
                    <span className="font-medium">TXT (ATS)</span>
                    <span className="text-xs text-[#606c38]">Plain text</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Save button (keyboard shortcut hint) */}
        <button
          onClick={onSave}
          disabled={saveStatus === "saved"}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#606c38]/20 text-[#606c38] transition-colors hover:bg-[#606c38]/5 disabled:opacity-30"
          aria-label="Save"
          title="Save (Ctrl+S)"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>

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
