"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Sparkles, Check } from "lucide-react"

interface AIDrawerProps {
  open: boolean
  onClose: () => void
  originalText: string
}

const suggestions = [
  {
    label: "Option A -- More quantified",
    text: "Spearheaded an 8-person marketing team to launch the Orange Money campaign, acquiring **2.3M new users** in 6 months and driving a **42% increase** in mobile transaction volume across S\u00e9n\u00e9gal.",
  },
  {
    label: "Option B -- More concise",
    text: "Led Orange Money campaign launch reaching 2.3M users in 6 months; managed team of 8 across digital, content, and field marketing channels.",
  },
  {
    label: "Option C -- Action-focused",
    text: "Directed cross-functional team of 8 to execute go-to-market strategy for Orange Money, resulting in 2.3M user sign-ups and 38% market share growth within the first two quarters.",
  },
]

export function AIDrawer({ open, onClose, originalText }: AIDrawerProps) {
  const [customPrompt, setCustomPrompt] = useState("")
  const [selected, setSelected] = useState<number | null>(null)

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

          {/* Suggestions */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#606c38]">
              Suggestions
            </p>
            <div className="space-y-3">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selected === i
                      ? "border-[#dda15e] bg-[#dda15e]/5 ring-2 ring-[#dda15e]/20"
                      : "border-[#606c38]/15 hover:border-[#dda15e]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#606c38]">{sug.label}</span>
                    {selected === i && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dda15e]">
                        <Check className="h-3 w-3 text-[#283618]" />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[#283618] leading-relaxed">{sug.text}</p>
                </button>
              ))}
            </div>
            {selected !== null && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onClose}
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
            <button className="mt-2 rounded-full bg-[#283618] px-5 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38]">
              {"Apply \u2192"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
