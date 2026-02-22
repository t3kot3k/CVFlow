"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useSidebar } from "./sidebar-context"
import {
  Leaf,
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Mail,
  Linkedin,
  Mic,
  TrendingUp,
  Palette,
  Settings,
  HelpCircle,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Crown,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My CVs", href: "/dashboard/cvs", icon: FileText },
  { label: "ATS Score", href: "/dashboard/ats", icon: BarChart3 },
  { label: "Cover Letter", href: "/dashboard/cover-letter", icon: Mail },
  { label: "Job Tracker", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Templates", href: "/dashboard/templates", icon: Palette },
  { label: "LinkedIn", href: "/dashboard/linkedin", icon: Linkedin },
  { label: "Interview", href: "/dashboard/interview", icon: Mic },
  { label: "Market Intel", href: "/dashboard/market", icon: TrendingUp },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#606c38]/10 bg-[#283618] transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[#606c38]/20 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dda15e]">
          <Leaf className="h-5 w-5 text-[#283618]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap text-lg font-bold text-[#fefae0]"
            >
              CVFlow
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* New CV button */}
      <div className="px-3 pt-4">
        <Link
          href="/dashboard/cvs/new"
          className={`flex items-center justify-center gap-2 rounded-full bg-[#dda15e] font-semibold text-[#283618] transition-all hover:bg-[#bc6c25] hover:scale-[1.02] ${
            collapsed ? "h-10 w-10 mx-auto p-0" : "px-4 py-2.5 w-full"
          }`}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap text-sm"
              >
                New CV
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Scrollable middle: nav + upgrade */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#606c38]/30 text-[#dda15e]"
                    : "text-[#fefae0]/70 hover:bg-[#606c38]/20 hover:text-[#fefae0]"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#dda15e]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-[#283618] px-2 py-1 text-xs text-[#fefae0] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 border border-[#606c38]/30">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Upgrade banner */}
        {!collapsed && (
          <div className="mx-3 mt-4 mb-3 rounded-xl bg-gradient-to-br from-[#606c38]/30 to-[#606c38]/10 p-3">
            <div className="flex items-center gap-2 text-[#dda15e]">
              <Crown className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide">
                Upgrade to Pro
              </span>
            </div>
            <p className="mt-1 text-xs text-[#fefae0]/60 leading-relaxed">
              Unlimited CVs, advanced ATS, priority support.
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-2 block rounded-full bg-[#dda15e]/20 py-1.5 text-center text-xs font-semibold text-[#dda15e] transition-colors hover:bg-[#dda15e]/30"
            >
              See plans
            </Link>
          </div>
        )}
      </div>

      {/* Pinned bottom section */}
      <div className="shrink-0 border-t border-[#606c38]/20 px-3 py-2 space-y-0.5">
        <Link
          href="/dashboard/help"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#fefae0]/60 transition-colors hover:bg-[#606c38]/20 hover:text-[#fefae0] ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </Link>
        <Link
          href="/login"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#fefae0]/60 transition-colors hover:bg-red-500/10 hover:text-red-400 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex h-9 shrink-0 items-center justify-center border-t border-[#606c38]/20 text-[#fefae0]/40 transition-colors hover:bg-[#606c38]/20 hover:text-[#fefae0]"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronsRight className="h-4 w-4" />
        ) : (
          <ChevronsLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  )
}
