"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Sparkles, Check, Loader2 } from "lucide-react"
import { cvAiApi } from "@/lib/api/cv"

interface AIDrawerProps {
  open: boolean
  onClose: () => void
  originalText: string
  onApply: (text: string) => void
  language?: string
}

export function AIDrawer({ open, onClose, originalText, onApply, language = "en" }: AIDrawerProps) {
  const [customPrompt, setCustomPrompt] = useState("")
  const [selected, setSelected] = useState<number | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-generate suggestion when drawer opens with text
  useEffect(() => {
    if (!open || !originalText) return
    setAiSuggestion(null)
    setSelected(null)
    setError(null)
    setCustomPrompt("")
    setIsGenerating(true)
    cvAiApi.improveText(originalText, "Improve this CV bullet point: make it more impactful, quantified, and action-oriented", language)
      .then((res) => {
        setAiSuggestion(res.improved_text)
      })
      .catch(() => {
        setError("AI service unavailable. Try a custom instruction below.")
      })
      .finally(() => setIsGenerating(false))
  }, [open, originalText])

  const handleApplyCustom = async () => {
    if (!customPrompt.trim()) return
    setIsApplying(true)
    setError(null)
    try {
      const res = await cvAiApi.improveText(originalText, customPrompt, language)
      setAiSuggestion(res.improved_text)
      setSelected(0)
    } catch {
      setError("AI service unavailable.")
    } finally {
      setIsApplying(false)
    }
  }

  const handleUse = () => {
    if (selected !== null && aiSuggestion) {
      onApply(aiSuggestion)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/20"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-[400px] max-w-[90vw] overflow-y-auto rounded-l-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#606c38]/10 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#dda15e]" />
            <h2 className="text-lg font-bold text-[#283618]">AI Writing Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#606c38] transition-colors hover:bg-[#606c38]/10 hover:text-[#283618]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Original text */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              Original text
            </p>
            <div className="rounded-xl bg-[#fefae0] p-4 text-sm text-[#283618]/70 leading-relaxed">
              {originalText || "Select a bullet point to improve it with AI."}
            </div>
          </div>

          {/* AI Suggestion */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              AI Suggestion
            </p>

            {isGenerating ? (
              <div className="flex items-center gap-3 rounded-xl border border-[#606c38]/15 p-4">
                <Loader2 className="h-4 w-4 animate-spin text-[#dda15e]" />
                <span className="text-sm text-[#606c38]">Generating suggestion…</span>
              </div>
            ) : error && !aiSuggestion ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            ) : aiSuggestion ? (
              <button
                onClick={() => setSelected(0)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selected === 0
                    ? "border-[#dda15e] bg-[#dda15e]/5 ring-2 ring-[#dda15e]/20"
                    : "border-[#606c38]/15 hover:border-[#dda15e]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#606c38]">AI Improved Version</span>
                  {selected === 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dda15e]">
                      <Check className="h-3 w-3 text-[#283618]" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#283618] leading-relaxed">{aiSuggestion}</p>
              </button>
            ) : (
              <div className="rounded-xl border border-dashed border-[#606c38]/20 p-4 text-center text-sm text-[#606c38]/60">
                Enter a custom instruction below to generate a suggestion
              </div>
            )}

            {selected === 0 && aiSuggestion && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleUse}
                className="mt-4 w-full rounded-full bg-[#dda15e] py-2.5 text-sm font-bold text-[#283618] transition-colors hover:bg-[#bc6c25]"
              >
                Use this suggestion
              </motion.button>
            )}
          </div>

          {/* Custom instruction */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              Custom instruction
            </p>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              placeholder="Make it more concise / add metrics / translate to English..."
              className="w-full resize-none rounded-xl border border-[#606c38]/15 p-4 text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none transition-colors focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20"
            />
            <button
              onClick={handleApplyCustom}
              disabled={!customPrompt.trim() || isApplying}
              className="mt-2 flex items-center gap-2 rounded-full bg-[#283618] px-5 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isApplying ? "Generating…" : "Apply →"}
            </button>
            {error && aiSuggestion && (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
