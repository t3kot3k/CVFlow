"use client"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopBar } from "@/components/dashboard/top-bar"
import { SidebarProvider, useSidebar } from "@/components/dashboard/sidebar-context"

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const pathname = usePathname()

  // Full-screen pages get no dashboard shell (CV editor, ATS workspace)
  const isEditor = /^\/dashboard\/cvs\/[^/]+$/.test(pathname)
  const isAts = pathname === "/dashboard/ats"
  const isCoverLetter = pathname === "/dashboard/cover-letter"
  const isJobs = pathname === "/dashboard/jobs"
  const isLinkedIn = pathname === "/dashboard/linkedin"
  const isInterview = pathname === "/dashboard/interview"
  const isMarket = pathname === "/dashboard/market"
  const isTemplates = pathname === "/dashboard/templates"
  const isFullScreen = isEditor || isAts || isCoverLetter || isJobs || isLinkedIn || isInterview || isMarket || isTemplates

  if (isFullScreen) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-[#fefae0]">
      {/* Sidebar hidden on mobile, shown on lg+ */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        }`}
      >
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  )
}
