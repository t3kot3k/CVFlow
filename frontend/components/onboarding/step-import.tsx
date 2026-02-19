"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { FileText, Link2, Pencil, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"

type ImportMethod = "upload" | "linkedin" | "scratch" | null

interface StepImportProps {
  selected: ImportMethod
  onSelect: (value: ImportMethod) => void
}

export function StepImport({ selected, onSelect }: StepImportProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onSelect("upload")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <h2 className="text-3xl font-bold text-[#283618] text-center text-balance">
        Start from what you have.
      </h2>
      <p className="text-center text-[#606c38] mt-2 max-w-md">
        {"Or start from scratch \u2014 both work great."}
      </p>

      <div className="flex flex-col gap-4 mt-10 w-full max-w-md">
        {/* Upload */}
        <button
          type="button"
          onClick={() => {
            onSelect("upload")
            fileRef.current?.click()
          }}
          className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
            selected === "upload"
              ? "border-[#dda15e] bg-[#dda15e]/5"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload CV file"
          />
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#606c38]/10 shrink-0">
              <FileText className="w-5 h-5 text-[#606c38]" />
            </div>
            <div>
              <p className="font-semibold text-[#283618] text-sm">
                Upload my CV (PDF)
              </p>
              {fileName ? (
                <p className="text-xs text-[#606c38] mt-1 flex items-center gap-1.5">
                  <Upload className="w-3 h-3" />
                  {fileName}
                </p>
              ) : (
                <>
                  <p className="text-xs text-[#606c38] mt-1">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {"Supports PDF, DOCX \u00b7 Max 5MB"}
                  </p>
                </>
              )}
            </div>
          </div>
          {selected !== "upload" && (
            <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-transparent" />
          )}
        </button>

        {/* LinkedIn */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect("linkedin")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("linkedin")}
          className={`cursor-pointer text-left p-6 rounded-2xl border-2 transition-all ${
            selected === "linkedin"
              ? "border-[#dda15e] bg-[#dda15e]/5"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0A66C2]/10 shrink-0">
              <Link2 className="w-5 h-5 text-[#0A66C2]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#283618] text-sm">
                Import from LinkedIn
              </p>
              <p className="text-xs text-[#606c38] mt-1">
                Paste your LinkedIn profile URL
              </p>
              {selected === "linkedin" && (
                <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <Input
                    placeholder="https://linkedin.com/in/your-name"
                    className="rounded-lg bg-white border-gray-200 h-9 text-xs text-[#283618] placeholder:text-gray-400 focus-visible:border-[#606c38] focus-visible:ring-[#606c38]/20"
                  />
                  <button
                    type="button"
                    className="shrink-0 px-3 py-1.5 bg-[#dda15e] text-[#283618] font-semibold text-xs rounded-lg hover:bg-[#bc6c25] transition-colors"
                  >
                    {"Import \u2192"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* From scratch */}
        <button
          type="button"
          onClick={() => onSelect("scratch")}
          className={`text-left p-6 rounded-2xl border-2 transition-all ${
            selected === "scratch"
              ? "border-[#dda15e] bg-[#dda15e]/5"
              : "border-gray-100 bg-white hover:border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#dda15e]/10 shrink-0">
              <Pencil className="w-5 h-5 text-[#dda15e]" />
            </div>
            <div>
              <p className="font-semibold text-[#283618] text-sm">
                Start from scratch
              </p>
              <p className="text-xs text-[#606c38] mt-1">
                {"I\u2019ll fill in my details step by step"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Best for first CVs and students
              </p>
            </div>
          </div>
        </button>
      </div>
    </motion.div>
  )
}
