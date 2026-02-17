"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { EditorTopBar } from "@/components/cv-editor/editor-top-bar"
import { SectionPanel } from "@/components/cv-editor/section-panel"
import { CenterPanel } from "@/components/cv-editor/center-panel"
import { PreviewPanel } from "@/components/cv-editor/preview-panel"
import { AIDrawer } from "@/components/cv-editor/ai-drawer"

export default function CVEditorPage() {
  const [activeSection, setActiveSection] = useState("experience")
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const [improveText, setImproveText] = useState("")

  const handleImprove = (text: string) => {
    setImproveText(text)
    setAiDrawerOpen(true)
  }

  return (
    <>
      <EditorTopBar />

      <div className="flex h-[calc(100vh-56px)] pt-14">
        {/* Left: Section panel (200px fixed) */}
        <SectionPanel
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Center: Form panel (flexible, between left 200px and right 320px) */}
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
