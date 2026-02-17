"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react"

export function DashboardTopBar() {
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#606c38]/10 bg-[#fefae0]/80 px-4 sm:px-6 backdrop-blur-md gap-4">
      {/* Left: Welcome + Search */}
      <div className="flex items-center gap-6">
        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-[#283618]">
            Welcome back, Amara
          </h1>
          <p className="text-xs text-[#606c38]">
            {"Let\u2019s land your next role."}
          </p>
        </div>

        {/* Search bar */}
        <div
          className={`relative flex items-center rounded-full border bg-white px-3 py-2 transition-all ${
            searchFocused
              ? "border-[#dda15e] ring-2 ring-[#dda15e]/20 w-full sm:w-72"
              : "border-[#606c38]/20 w-full sm:w-56"
          }`}
        >
          <Search className="h-4 w-4 shrink-0 text-[#606c38]/50" />
          <input
            type="text"
            placeholder="Search CVs, jobs..."
            className="ml-2 w-full bg-transparent text-sm text-[#283618] placeholder:text-[#606c38]/40 outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="ml-2 hidden rounded border border-[#606c38]/15 bg-[#fefae0] px-1.5 py-0.5 text-[10px] font-medium text-[#606c38]/60 md:inline">
            {"\u2318K"}
          </kbd>
        </div>
      </div>

      {/* Right: AI CTA + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* AI Quick action */}
        <Link
          href="/dashboard/cvs/new"
          className="hidden items-center gap-1.5 rounded-full bg-[#dda15e]/10 px-3 py-1.5 text-xs font-semibold text-[#dda15e] transition-colors hover:bg-[#dda15e]/20 md:flex"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-build a CV
        </Link>

        {/* Notifications */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#606c38]/15 bg-white text-[#283618] transition-colors hover:bg-[#606c38]/5"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#bc6c25] text-[9px] font-bold text-white">
            2
          </span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full border border-[#606c38]/15 bg-white py-1 pl-1 pr-3 transition-colors hover:bg-[#606c38]/5"
          >
            <Image
              src="/images/avatar-amara.jpg"
              alt="Amara Diallo"
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
            <span className="hidden text-sm font-medium text-[#283618] md:inline">
              Amara
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-[#606c38]/60 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-[#606c38]/15 bg-white shadow-xl"
                >
                  {/* Profile header */}
                  <div className="border-b border-[#606c38]/10 px-4 py-3">
                    <p className="text-sm font-semibold text-[#283618]">
                      Amara Diallo
                    </p>
                    <p className="text-xs text-[#606c38]">
                      amara.diallo@email.com
                    </p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#606c38]/10 px-2 py-0.5 text-[10px] font-semibold text-[#606c38]">
                      Free Plan
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#283618] transition-colors hover:bg-[#606c38]/5"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="h-4 w-4 text-[#606c38]" />
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#283618] transition-colors hover:bg-[#606c38]/5"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-[#606c38]" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[#606c38]/10 py-1">
                    <Link
                      href="/login"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#bc6c25] transition-colors hover:bg-red-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
