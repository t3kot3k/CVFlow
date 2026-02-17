"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  SlidersHorizontal,
  Globe,
  CreditCard,
  Receipt,
  Shield,
  Trash2,
  Bell,
  Clock,
  Check,
  X,
  ChevronDown,
  Upload,
  Smartphone,
  Crown,
} from "lucide-react"

const settingsNav = [
  {
    group: "ACCOUNT",
    items: [
      { id: "profile", label: "Profile", icon: User },
      { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
      { id: "language", label: "Language & Region", icon: Globe },
    ],
  },
  {
    group: "PLAN & BILLING",
    items: [
      { id: "plan", label: "My Plan", icon: Crown },
      { id: "payment", label: "Payment Methods", icon: CreditCard },
      { id: "billing", label: "Billing History", icon: Receipt },
    ],
  },
  {
    group: "PRIVACY",
    items: [
      { id: "privacy", label: "Data & Privacy", icon: Shield },
      { id: "delete", label: "Delete Account", icon: Trash2 },
    ],
  },
  {
    group: "NOTIFICATIONS",
    items: [
      { id: "emails", label: "Email preferences", icon: Bell },
      { id: "reminders", label: "Reminders", icon: Clock },
    ],
  },
]

const planFeatures = [
  "Unlimited CVs",
  "Interview Simulator",
  "All templates",
  "LinkedIn Optimizer",
  "ATS Score detailed",
  "Market Intelligence",
  "AI Tailoring Pro",
  "Auto-apply (50/mo)",
]

const usageData = [
  { label: "AI Tailorings", used: 28, limit: "Unlimited", pct: 28, color: "bg-[#606c38]" },
  { label: "Cover Letters", used: 6, limit: "Unlimited", pct: 6, color: "bg-[#606c38]" },
  { label: "Interview Sessions", used: 4, limit: "Unlimited", pct: 4, color: "bg-[#dda15e]" },
  { label: "Auto-Apply", used: 23, limit: "50", pct: 46, color: "bg-[#dda15e]", remaining: 27 },
]

const comparisonRows = [
  { feature: "AI Tailorings", starter: "5/mo", pro: "Unlimited" },
  { feature: "ATS Score", starter: "Basic", pro: "Detailed + Keywords" },
  { feature: "Interview Sim", starter: "3 sessions", pro: "Unlimited" },
  { feature: "LinkedIn Optimizer", starter: false, pro: true },
  { feature: "Auto-apply", starter: false, pro: "50/mo" },
  { feature: "Templates", starter: "4 basic", pro: "All premium" },
  { feature: "Cover Letters", starter: "3/mo", pro: "Unlimited" },
]

const billingHistory = [
  { date: "Feb 15, 2026", desc: "Pro Plan - Monthly", amount: "$22.00", status: "Paid" },
  { date: "Jan 15, 2026", desc: "Pro Plan - Monthly", amount: "$22.00", status: "Paid" },
  { date: "Dec 15, 2025", desc: "Pro Plan - Monthly", amount: "$22.00", status: "Paid" },
  { date: "Nov 15, 2025", desc: "Starter Plan - Monthly", amount: "$11.00", status: "Paid" },
  { date: "Oct 15, 2025", desc: "Starter Plan - Monthly", amount: "$11.00", status: "Paid" },
]

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function SettingsPage() {
  const [activeView, setActiveView] = useState("plan")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left settings nav */}
      <aside className="hidden w-[220px] shrink-0 border-r border-[#606c38]/10 bg-white p-5 md:block">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-[#283618]">
          Settings
        </h2>
        <nav className="space-y-5">
          {settingsNav.map((group) => (
            <div key={group.group}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#606c38]">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeView === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-l-xl px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "border-r-2 border-[#dda15e] bg-[#dda15e]/15 font-semibold text-[#283618]"
                          : "text-[#606c38] hover:text-[#283618] hover:bg-[#fefae0]/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="block w-full border-b border-[#606c38]/10 bg-white px-4 py-3 md:hidden">
        <select
          value={activeView}
          onChange={(e) => setActiveView(e.target.value)}
          className="w-full rounded-lg border border-[#606c38]/20 bg-white px-3 py-2 text-sm text-[#283618]"
        >
          {settingsNav.flatMap((g) =>
            g.items.map((item) => (
              <option key={item.id} value={item.id}>
                {g.group} - {item.label}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Right content area */}
      <div className="flex-1 overflow-y-auto bg-[#fefae0] p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {activeView === "plan" && <PlanView key="plan" />}
          {activeView === "payment" && <PaymentView key="payment" />}
          {activeView === "billing" && <BillingView key="billing" />}
          {activeView === "profile" && <ProfileView key="profile" onDeleteClick={() => setShowDeleteModal(true)} />}
          {activeView === "language" && <LanguageView key="language" />}
          {activeView === "preferences" && <PreferencesView key="preferences" />}
          {activeView === "privacy" && <PrivacyView key="privacy" />}
          {activeView === "delete" && <DeleteView key="delete" onDeleteClick={() => setShowDeleteModal(true)} />}
          {activeView === "emails" && <EmailPrefsView key="emails" />}
          {activeView === "reminders" && <RemindersView key="reminders" />}
        </AnimatePresence>
      </div>

      {/* Delete account modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#bc6c25]/10">
                <Trash2 className="h-6 w-6 text-[#bc6c25]" />
              </div>
              <h3 className="text-lg font-bold text-[#283618]">Delete your account?</h3>
              <p className="mt-2 text-sm text-[#606c38] leading-relaxed">
                This will permanently delete all your CVs, cover letters, and data. This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-full border-2 border-[#283618] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0]"
                >
                  Cancel
                </button>
                <button className="flex-1 rounded-full bg-[#bc6c25] px-4 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#bc6c25]/90">
                  Delete permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────── PLAN VIEW ──────────── */
function PlanView() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">My Plan</h2>

      {/* Current plan card */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-[#283618]">PRO Plan</h3>
            <span className="rounded-full bg-[#606c38] px-3 py-0.5 text-xs font-semibold text-[#fefae0]">
              Active
            </span>
          </div>
          <p className="text-sm text-[#606c38]">Next billing: March 15, 2026</p>
        </div>

        <p className="mt-3 text-3xl font-bold text-[#283618]">$22<span className="text-base font-normal text-[#606c38]">/month</span></p>
        <p className="text-sm text-[#606c38]">{"Billed monthly \u00B7 Cancel anytime"}</p>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {planFeatures.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-[#606c38]" />
              <span className="text-sm text-[#283618]">{f}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#606c38]/10 pt-4">
          <button className="text-sm text-[#606c38] transition-colors hover:text-[#283618]">
            {"Switch to Annual ($15/mo \u00B7 save 32%)"}
          </button>
          <button className="text-sm text-[#bc6c25] transition-colors hover:text-[#bc6c25]/80">
            Cancel plan
          </button>
        </div>
      </div>

      {/* Usage this month */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="font-bold text-[#283618]">Usage this month</h3>
        <div className="mt-4 space-y-4">
          {usageData.map((u) => (
            <div key={u.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm text-[#283618]">{u.label}: {u.used} / {u.limit}</span>
                <span className="text-xs text-[#606c38]">
                  {u.remaining ? `${u.remaining} remaining this month` : `${u.used} used`}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#fefae0]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(u.pct, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-2 rounded-full ${u.color}`}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">Usage resets on March 1, 2026</p>
      </div>

      {/* Plan comparison */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-bold text-[#283618]">Compare plans</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="pb-3 text-left font-medium text-[#606c38]">Feature</th>
                <th className="pb-3 text-center font-medium text-[#606c38]">
                  <div>Starter</div>
                  <div className="text-xs font-normal">$11/mo</div>
                </th>
                <th className="pb-3 text-center">
                  <div className="inline-block rounded-lg bg-[#283618] px-3 py-1 text-[#fefae0]">
                    <div className="font-semibold">Pro</div>
                    <div className="text-xs font-normal text-[#fefae0]/70">$22/mo - current</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#606c38]/10">
              {comparisonRows.map((row) => (
                <tr key={row.feature}>
                  <td className="py-3 text-[#283618]">{row.feature}</td>
                  <td className="py-3 text-center">
                    {typeof row.starter === "boolean" ? (
                      row.starter ? (
                        <Check className="mx-auto h-4 w-4 text-[#606c38]" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-gray-300" />
                      )
                    ) : (
                      <span className="text-[#606c38]">{row.starter}</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {typeof row.pro === "boolean" ? (
                      row.pro ? (
                        <Check className="mx-auto h-4 w-4 text-[#606c38]" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-gray-300" />
                      )
                    ) : (
                      <span className="font-medium text-[#283618]">{row.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <button className="rounded-full border border-[#606c38] px-4 py-2 text-sm text-[#606c38] transition-colors hover:bg-[#606c38] hover:text-[#fefae0]">
            Downgrade to Starter
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────── PAYMENT VIEW ──────────── */
function PaymentView() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Payment Methods</h2>

      {/* Card on file */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[#283618]/5">
            <span className="text-xs font-bold text-[#283618]">VISA</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#283618]">{"•••• •••• •••• 4242"}</p>
            <p className="text-xs text-[#606c38]">Expires 08/27</p>
          </div>
          <span className="rounded-full bg-[#606c38]/10 px-2.5 py-0.5 text-xs font-medium text-[#606c38]">
            Default
          </span>
          <button className="text-xs text-[#bc6c25] transition-colors hover:text-[#bc6c25]/80">
            Remove
          </button>
        </div>
      </div>

      {/* Add payment method */}
      <button className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#606c38]/20 bg-white/50 p-6 text-center transition-colors hover:border-[#dda15e]/40 hover:bg-white">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-[#283618]/5 px-2 py-1 text-[10px] font-bold text-[#283618]">VISA</span>
          <span className="rounded-md bg-[#283618]/5 px-2 py-1 text-[10px] font-bold text-[#283618]">MC</span>
          <span className="rounded-md bg-[#dda15e]/10 px-2 py-1 text-[10px] font-bold text-[#dda15e]">Wave</span>
          <span className="rounded-md bg-[#dda15e]/10 px-2 py-1 text-[10px] font-bold text-[#dda15e]">OM</span>
          <span className="rounded-md bg-[#dda15e]/10 px-2 py-1 text-[10px] font-bold text-[#dda15e]">MoMo</span>
        </div>
        <span className="text-sm font-medium text-[#606c38]">+ Add card or Mobile Money</span>
      </button>

      {/* Mobile Money info */}
      <div className="rounded-xl border border-[#dda15e]/30 bg-[#dda15e]/10 p-5">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#dda15e]" />
          <div>
            <h4 className="font-semibold text-[#283618]">Mobile Money available for African users</h4>
            <p className="mt-1 text-sm text-[#283618]/70 leading-relaxed">
              {"Pay with Wave, Orange Money (S\u00e9n\u00e9gal, C\u00f4te d'Ivoire, Mali), or MTN MoMo (Cameroun, Ghana, Uganda)."}
            </p>
            <button className="mt-3 rounded-full bg-[#dda15e] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
              {"Connect Mobile Money \u2192"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────── BILLING HISTORY VIEW ──────────── */
function BillingView() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Billing History</h2>
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#606c38]/10">
              <th className="px-5 py-3 text-left font-medium text-[#606c38]">Date</th>
              <th className="px-5 py-3 text-left font-medium text-[#606c38]">Description</th>
              <th className="px-5 py-3 text-right font-medium text-[#606c38]">Amount</th>
              <th className="px-5 py-3 text-right font-medium text-[#606c38]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#606c38]/5">
            {billingHistory.map((row, i) => (
              <tr key={i} className="hover:bg-[#fefae0]/50 transition-colors">
                <td className="px-5 py-3 text-[#283618]">{row.date}</td>
                <td className="px-5 py-3 text-[#283618]">{row.desc}</td>
                <td className="px-5 py-3 text-right font-medium text-[#283618]">{row.amount}</td>
                <td className="px-5 py-3 text-right">
                  <span className="rounded-full bg-[#606c38]/10 px-2.5 py-0.5 text-xs font-medium text-[#606c38]">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="text-sm text-[#606c38] transition-colors hover:text-[#283618]">
        {"Download all invoices (PDF) \u2192"}
      </button>
    </motion.div>
  )
}

/* ──────────── PROFILE VIEW ──────────── */
function ProfileView({ onDeleteClick }: { onDeleteClick: () => void }) {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Profile</h2>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#606c38]/10">
            <Image src="/images/avatar-amara.jpg" alt="Profile" fill className="object-cover" />
          </div>
          <div>
            <button className="text-sm font-medium text-[#dda15e] transition-colors hover:text-[#bc6c25]">
              Change photo
            </button>
            <p className="text-xs text-[#606c38]">JPG, PNG. Max 2MB.</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#283618]">Full name</label>
              <input
                type="text"
                defaultValue="Amara Diallo"
                className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#283618]">Email</label>
              <input
                type="email"
                defaultValue="amara@example.com"
                className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#283618]">Phone</label>
              <input
                type="tel"
                defaultValue="+221 77 123 4567"
                className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#283618]">Country</label>
              <select className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none">
                <option>{"S\u00e9n\u00e9gal"}</option>
                <option>France</option>
                <option>Morocco</option>
                <option>Ghana</option>
                <option>Nigeria</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#283618]">City</label>
            <input
              type="text"
              defaultValue="Dakar"
              className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none sm:max-w-xs"
            />
          </div>
        </div>

        <button className="mt-6 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
          Save changes
        </button>
      </div>

      {/* Danger zone */}
      <div className="border-t border-red-100 pt-6">
        <h3 className="text-sm font-semibold text-[#bc6c25]">Danger zone</h3>
        <p className="mt-1 text-sm text-[#606c38]">
          Once you delete your account, all data is permanently removed.
        </p>
        <button
          onClick={onDeleteClick}
          className="mt-3 rounded-full border-2 border-[#bc6c25] px-4 py-2 text-sm font-semibold text-[#bc6c25] transition-colors hover:bg-[#bc6c25] hover:text-[#fefae0]"
        >
          Delete my account
        </button>
      </div>
    </motion.div>
  )
}

/* ──────────── LANGUAGE VIEW ──────────── */
function LanguageView() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">{"Language & Region"}</h2>

      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#283618]">Interface language</label>
          <select className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none sm:max-w-xs">
            <option>{"English"}</option>
            <option>{"Fran\u00e7ais"}</option>
            <option>{"Espa\u00f1ol"}</option>
            <option>{"Portugu\u00eas"}</option>
            <option>{"العربية"}</option>
            <option>{"Deutsch"}</option>
            <option>{"中文"}</option>
            <option>{"日本語"}</option>
            <option>{"한국어"}</option>
            <option>{"Kiswahili"}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#283618]">Default CV language</label>
          <select className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none sm:max-w-xs">
            <option>English</option>
            <option>{"Fran\u00e7ais"}</option>
            <option>{"Espa\u00f1ol"}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#283618]">Country / Region</label>
          <select className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none sm:max-w-xs">
            <option>{"S\u00e9n\u00e9gal"}</option>
            <option>France</option>
            <option>Morocco</option>
            <option>Ghana</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>
          <p className="mt-1 text-xs text-[#606c38]">Affects pricing display and template suggestions.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#283618]">Date format</label>
          <div className="flex flex-wrap gap-2">
            {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((fmt, i) => (
              <button
                key={fmt}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-[#283618] text-[#fefae0]"
                    : "border border-[#606c38]/20 text-[#606c38] hover:border-[#283618] hover:text-[#283618]"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#283618]">Currency display</label>
          <div className="flex flex-wrap gap-2">
            {["USD ($)", "EUR (\u20ac)", "XOF (CFA)", "MAD (DH)", "GBP (\u00a3)"].map((c, i) => (
              <button
                key={c}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-[#283618] text-[#fefae0]"
                    : "border border-[#606c38]/20 text-[#606c38] hover:border-[#283618] hover:text-[#283618]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <button className="rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
          Apply
        </button>
      </div>
    </motion.div>
  )
}

/* ──────────── PREFERENCES VIEW ──────────── */
function PreferencesView() {
  const prefs = [
    { label: "Auto-save CVs every 30 seconds", defaultOn: true },
    { label: "Show ATS tips while editing", defaultOn: true },
    { label: "Enable AI writing suggestions", defaultOn: true },
    { label: "Compact sidebar by default", defaultOn: false },
    { label: "Dark mode (coming soon)", defaultOn: false, disabled: true },
  ]
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Preferences</h2>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {prefs.map((p) => (
            <label key={p.label} className={`flex items-center justify-between gap-4 ${p.disabled ? "opacity-50" : ""}`}>
              <span className="text-sm text-[#283618]">{p.label}</span>
              <ToggleSwitch defaultOn={p.defaultOn} disabled={p.disabled} />
            </label>
          ))}
        </div>
        <button className="mt-6 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
          Save preferences
        </button>
      </div>
    </motion.div>
  )
}

/* ──────────── PRIVACY VIEW ──────────── */
function PrivacyView() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">{"Data & Privacy"}</h2>
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-semibold text-[#283618]">Your data</h3>
          <p className="mt-1 text-sm text-[#606c38] leading-relaxed">
            CVFlow stores your CVs, cover letters, and profile data securely. We never share your data with third parties without your consent.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full border-2 border-[#283618] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0]">
            Download my data
          </button>
          <button className="rounded-full border border-[#606c38] px-4 py-2 text-sm text-[#606c38] transition-colors hover:bg-[#606c38] hover:text-[#fefae0]">
            Request data deletion
          </button>
        </div>
        <div>
          <h3 className="font-semibold text-[#283618]">Cookies & analytics</h3>
          <label className="mt-2 flex items-center justify-between gap-4">
            <span className="text-sm text-[#283618]">Allow anonymous usage analytics</span>
            <ToggleSwitch defaultOn={true} />
          </label>
          <label className="mt-2 flex items-center justify-between gap-4">
            <span className="text-sm text-[#283618]">Allow marketing cookies</span>
            <ToggleSwitch defaultOn={false} />
          </label>
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────── DELETE VIEW ──────────── */
function DeleteView({ onDeleteClick }: { onDeleteClick: () => void }) {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#bc6c25]">Delete Account</h2>
      <div className="rounded-2xl border border-[#bc6c25]/20 bg-white p-6 shadow-sm">
        <p className="text-sm text-[#283618] leading-relaxed">
          Deleting your account will permanently remove all your CVs, cover letters, job applications, interview sessions, and personal data. This action cannot be undone.
        </p>
        <button
          onClick={onDeleteClick}
          className="mt-4 rounded-full bg-[#bc6c25] px-6 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#bc6c25]/90"
        >
          Delete my account permanently
        </button>
      </div>
    </motion.div>
  )
}

/* ──────────── EMAIL PREFS VIEW ──────────── */
function EmailPrefsView() {
  const emails = [
    { label: "Weekly career tips & blog posts", defaultOn: true },
    { label: "New template announcements", defaultOn: true },
    { label: "Job match alerts", defaultOn: true },
    { label: "Plan and billing reminders", defaultOn: true },
    { label: "Product updates & new features", defaultOn: false },
    { label: "Promotional offers", defaultOn: false },
  ]
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Email preferences</h2>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {emails.map((e) => (
            <label key={e.label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-[#283618]">{e.label}</span>
              <ToggleSwitch defaultOn={e.defaultOn} />
            </label>
          ))}
        </div>
        <button className="mt-6 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
          Save preferences
        </button>
      </div>
    </motion.div>
  )
}

/* ──────────── REMINDERS VIEW ──────────── */
function RemindersView() {
  const reminders = [
    { label: "Daily: Continue editing your CV", defaultOn: false },
    { label: "Weekly: Application follow-up reminders", defaultOn: true },
    { label: "Before interview: Preparation reminder (1 day before)", defaultOn: true },
    { label: "Monthly: ATS score check-in", defaultOn: false },
    { label: "When inactive for 7+ days", defaultOn: true },
  ]
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Reminders</h2>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {reminders.map((r) => (
            <label key={r.label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-[#283618]">{r.label}</span>
              <ToggleSwitch defaultOn={r.defaultOn} />
            </label>
          ))}
        </div>
        <button className="mt-6 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
          Save reminders
        </button>
      </div>
    </motion.div>
  )
}

/* ──────────── TOGGLE SWITCH ──────────── */
function ToggleSwitch({ defaultOn = false, disabled = false }: { defaultOn?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      disabled={disabled}
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-[#606c38]" : "bg-gray-200"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <motion.span
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block h-5 w-5 rounded-full bg-white shadow-sm"
      />
    </button>
  )
}
