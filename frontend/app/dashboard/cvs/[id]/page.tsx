"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { EditorTopBar } from "@/components/cv-editor/editor-top-bar"
import { SectionPanel } from "@/components/cv-editor/section-panel"
import { CenterPanel } from "@/components/cv-editor/center-panel"
import { PreviewPanel } from "@/components/cv-editor/preview-panel"
import { AIDrawer } from "@/components/cv-editor/ai-drawer"
import { cvApi, type CVDetail, type CVContent } from "@/lib/api/cv"
import { Loader2 } from "lucide-react"

export default function CVEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [cv, setCv] = useState<CVDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [activeSection, setActiveSection] = useState("contact")
  const [cvLanguage, setCvLanguage] = useState("en")
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const [improveText, setImproveText] = useState("")
  const [improveCallback, setImproveCallback] = useState<((text: string) => void) | null>(null)

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize: create new CV or load existing
  useEffect(() => {
    if (id === "new") {
      cvApi.create()
        .then(newCv => {
          router.replace(`/dashboard/cvs/${newCv.id}`)
        })
        .catch(() => {
          router.replace("/dashboard/cvs")
        })
      return
    }

    setIsLoading(true)
    cvApi.get(id)
      .then(data => {
        setCv(data)
        const stored = localStorage.getItem(`cv-lang-${id}`)
        if (stored) setCvLanguage(stored)
        setIsLoading(false)
      })
      .catch(() => {
        router.replace("/dashboard/cvs")
      })
  }, [id, router])

  // Auto-save content changes (debounced 2s)
  const scheduleAutoSave = useCallback((content: CVContent) => {
    if (!cv) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setSaveStatus("unsaved")
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus("saving")
      setIsSaving(true)
      try {
        await cvApi.autoSave(cv.id, content)
        setSaveStatus("saved")
      } catch {
        setSaveStatus("unsaved")
      } finally {
        setIsSaving(false)
      }
    }, 2000)
  }, [cv])

  // Update content and schedule save
  const handleContentChange = useCallback((newContent: CVContent) => {
    setCv(prev => prev ? { ...prev, content: newContent } : prev)
    scheduleAutoSave(newContent)
  }, [scheduleAutoSave])

  // Save title change
  const handleTitleChange = useCallback(async (title: string) => {
    if (!cv) return
    setCv(prev => prev ? { ...prev, title } : prev)
    setSaveStatus("saving")
    setIsSaving(true)
    try {
      await cvApi.update(cv.id, { title })
      setSaveStatus("saved")
    } catch {
      setSaveStatus("unsaved")
    } finally {
      setIsSaving(false)
    }
  }, [cv])

  // Language change (persisted in localStorage per CV)
  const handleLanguageChange = useCallback((lang: string) => {
    setCvLanguage(lang)
    if (id) localStorage.setItem(`cv-lang-${id}`, lang)
  }, [id])

  // Template change
  const handleTemplateChange = useCallback((templateId: string) => {
    if (!cv) return
    setCv(prev => prev ? { ...prev, template_id: templateId } : prev)
    cvApi.update(cv.id, { template_id: templateId }).catch(() => {})
  }, [cv])

  // Manual save
  const handleSave = useCallback(async () => {
    if (!cv) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setSaveStatus("saving")
    setIsSaving(true)
    try {
      await cvApi.autoSave(cv.id, cv.content)
      setSaveStatus("saved")
    } catch {
      setSaveStatus("unsaved")
    } finally {
      setIsSaving(false)
    }
  }, [cv])

  // Download PDF (with proper blob handling)
  const handleDownload = useCallback(async () => {
    if (!cv) return
    try {
      const blob = await cvApi.downloadPreview(cv.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${cv.title}.pdf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch {}
  }, [cv])

  // Open AI drawer with text to improve + apply callback
  const handleImprove = useCallback((text: string, onApply: (improved: string) => void) => {
    setImproveText(text)
    setImproveCallback(() => onApply)
    setAiDrawerOpen(true)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  if (isLoading || id === "new") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fefae0]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#606c38]" />
          <p className="text-sm text-[#606c38]">
            {id === "new" ? "Creating your CV…" : "Loading CV…"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <EditorTopBar
        title={cv?.title ?? "Untitled CV"}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        onDownload={handleDownload}
        saveStatus={saveStatus}
        isSaving={isSaving}
        templateId={cv?.template_id}
        onTemplateChange={handleTemplateChange}
        cvLanguage={cvLanguage}
        onLanguageChange={handleLanguageChange}
      />

      <div className="flex h-[calc(100vh-56px)] pt-14">
        {/* Left: Section panel (200px fixed) */}
        <SectionPanel
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          content={cv?.content ?? {}}
        />

        {/* Center: Form panel */}
        <main
          className="flex-1 overflow-hidden"
          style={{ marginLeft: 200, marginRight: 320 }}
        >
          <CenterPanel
            content={cv?.content ?? {}}
            activeSection={activeSection}
            onContentChange={handleContentChange}
            onSectionChange={setActiveSection}
            onImprove={handleImprove}
            cvId={cv?.id ?? ""}
            cvLanguage={cvLanguage}
          />
        </main>

        {/* Right: Preview panel (320px fixed) */}
        <PreviewPanel
          content={cv?.content ?? {}}
          atsScore={cv?.ats_score ?? null}
        />
      </div>

      {/* AI Assist Drawer */}
      <AnimatePresence>
        {aiDrawerOpen && (
          <AIDrawer
            open={aiDrawerOpen}
            onClose={() => setAiDrawerOpen(false)}
            originalText={improveText}
            language={cvLanguage}
            onApply={(text) => {
              improveCallback?.(text)
              setAiDrawerOpen(false)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
