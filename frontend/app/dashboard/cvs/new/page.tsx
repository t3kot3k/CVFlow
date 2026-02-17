"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewCVPage() {
  const router = useRouter()

  useEffect(() => {
    // Generate a simple unique ID and redirect to the editor
    const newId = `cv-${Date.now()}`
    router.replace(`/dashboard/cvs/${newId}`)
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-[#fefae0]">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dda15e] border-t-transparent" />
        <span className="text-sm text-[#606c38]">Creating your new CV...</span>
      </div>
    </div>
  )
}
