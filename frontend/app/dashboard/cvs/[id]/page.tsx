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
  const [activeSection, setActiveSection] = useState("experience")
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const [improveText, setImproveText] = useState("")

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

  // Download PDF
  const handleDownload = useCallback(async () => {
    if (!cv) return
    try {
      await cvApi.downloadPreview(cv.id)
    } catch {}
  }, [cv])

  const handleImprove = (text: string) => {
    setImproveText(text)
    setAiDrawerOpen(true)
  }

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
      />

      <div className="flex h-[calc(100vh-56px)] pt-14">
        {/* Left: Section panel (200px fixed) */}
        <SectionPanel
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Center: Form panel */}
        <main
          className="flex-1 overflow-hidden"
          style={{ marginLeft: 200, marginRight: 320 }}
        >
          <CenterPanel onImprove={handleImprove} />
        </main>

        {/* Right: Preview panel (320px fixed) */}
        <PreviewPanel />
      </div>

      {/* AI Assist Drawer */}
      <AnimatePresence>
        {aiDrawerOpen && (
          <AIDrawer
            open={aiDrawerOpen}
            onClose={() => setAiDrawerOpen(false)}
            originalText={improveText}
          />
        )}
      </AnimatePresence>
    </>
  )
}
