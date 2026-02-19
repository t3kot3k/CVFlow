"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Crown,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react"
import { logOut } from "@/lib/firebase"
import { usersApi, billingApi } from "@/lib/api"
import type { UserProfile, UserPreferences } from "@/lib/api/users"
import type { CurrentPlan, Invoice } from "@/lib/api/billing"

/* ──────────── NAVIGATION ──────────── */
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

const comparisonRows = [
  { feature: "AI Tailorings", starter: "5/mo", pro: "Unlimited" },
  { feature: "ATS Score", starter: "Basic", pro: "Detailed + Keywords" },
  { feature: "Interview Sim", starter: "3 sessions", pro: "Unlimited" },
  { feature: "LinkedIn Optimizer", starter: false, pro: true },
  { feature: "Auto-apply", starter: false, pro: "50/mo" },
  { feature: "Templates", starter: "4 basic", pro: "All premium" },
  { feature: "Cover Letters", starter: "3/mo", pro: "Unlimited" },
]

const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

/* ──────────── MAIN PAGE ──────────── */
export default function SettingsPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState("profile")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    Promise.all([usersApi.getProfile(), usersApi.getPreferences()])
      .then(([p, pr]) => {
        setProfile(p)
        setPrefs(pr)
      })
      .catch(() => {/* backend may not be running */})
      .finally(() => setLoadingData(false))
  }, [])

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await usersApi.deleteAccount()
    } catch {
      /* best effort */
    }
    await logOut()
    router.push("/login")
  }

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
          {activeView === "profile" && (
            <ProfileView
              key="profile"
              profile={profile}
              loading={loadingData}
              onProfileUpdate={setProfile}
              onDeleteClick={() => setShowDeleteModal(true)}
            />
          )}
          {activeView === "language" && (
            <LanguageView
              key="language"
              prefs={prefs}
              loading={loadingData}
              onPrefsUpdate={setPrefs}
            />
          )}
          {activeView === "preferences" && (
            <PreferencesView
              key="preferences"
              prefs={prefs}
              loading={loadingData}
              onPrefsUpdate={setPrefs}
            />
          )}
          {activeView === "privacy" && <PrivacyView key="privacy" />}
          {activeView === "delete" && (
            <DeleteView key="delete" onDeleteClick={() => setShowDeleteModal(true)} />
          )}
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
            onClick={() => !deleting && setShowDeleteModal(false)}
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
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-full border-2 border-[#283618] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#bc6c25] px-4 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#bc6c25]/90 disabled:opacity-70"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
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

/* ──────────── PROFILE VIEW ──────────── */
function ProfileView({
  profile,
  loading,
  onProfileUpdate,
  onDeleteClick,
}: {
  profile: UserProfile | null
  loading: boolean
  onProfileUpdate: (p: UserProfile) => void
  onDeleteClick: () => void
}) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync from loaded profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "")
      setPhone(profile.phone ?? "")
      setCountry(profile.country ?? "")
      setCity(profile.city ?? "")
    }
  }, [profile])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await usersApi.updateProfile({ full_name: fullName, phone, country, city })
      onProfileUpdate(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {/* ignore */} finally {
      setSaving(false)
    }
  }

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Profile</h2>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#283618] text-2xl font-bold text-[#fefae0]">
            {loading ? "?" : initials}
          </div>
          <div>
            <button className="text-sm font-medium text-[#dda15e] transition-colors hover:text-[#bc6c25]">
              Change photo
            </button>
            <p className="text-xs text-[#606c38]">JPG, PNG. Max 2MB.</p>
          </div>
        </div>

        {/* Form */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-[#606c38]/10" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#283618]">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#283618]">Email</label>
                <input
                  type="email"
                  value={profile?.email ?? ""}
                  readOnly
                  className="w-full rounded-lg border border-[#606c38]/10 bg-[#606c38]/5 px-3 py-2 text-sm text-[#606c38] cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#283618]">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 123 4567"
                  className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#283618]">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Sénégal"
                  className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#283618]">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dakar"
                className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none sm:max-w-xs"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-[#606c38]">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
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

/* ──────────── PREFERENCES VIEW ──────────── */
function PreferencesView({
  prefs,
  loading,
  onPrefsUpdate,
}: {
  prefs: UserPreferences | null
  loading: boolean
  onPrefsUpdate: (p: UserPreferences) => void
}) {
  const [autoSave, setAutoSave] = useState(true)
  const [atsTips, setAtsTips] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (prefs) {
      setAutoSave(prefs.auto_save)
      setAtsTips(prefs.ats_tips)
      setAiSuggestions(prefs.ai_suggestions)
    }
  }, [prefs])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await usersApi.updatePreferences({
        auto_save: autoSave,
        ats_tips: atsTips,
        ai_suggestions: aiSuggestions,
      })
      onPrefsUpdate(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {/* ignore */} finally {
      setSaving(false)
    }
  }

  const prefItems = [
    { label: "Auto-save CVs every 30 seconds", value: autoSave, set: setAutoSave },
    { label: "Show ATS tips while editing", value: atsTips, set: setAtsTips },
    { label: "Enable AI writing suggestions", value: aiSuggestions, set: setAiSuggestions },
  ]

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Preferences</h2>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-[#606c38]/10" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {prefItems.map((p) => (
              <div key={p.label} className="flex items-center justify-between gap-4">
                <span className="text-sm text-[#283618]">{p.label}</span>
                <ToggleSwitch on={p.value} onChange={p.set} />
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 opacity-50">
              <span className="text-sm text-[#283618]">Dark mode (coming soon)</span>
              <ToggleSwitch on={false} onChange={() => {}} disabled />
            </div>
          </div>
        )}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save preferences
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-[#606c38]">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────── LANGUAGE VIEW ──────────── */
const LANGUAGES = ["English", "Français", "Español", "Português", "العربية", "Deutsch", "中文", "日本語", "한국어", "Kiswahili"]
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]
const CURRENCIES = ["USD ($)", "EUR (€)", "XOF (CFA)", "MAD (DH)", "GBP (£)"]

function LanguageView({
  prefs,
  loading,
  onPrefsUpdate,
}: {
  prefs: UserPreferences | null
  loading: boolean
  onPrefsUpdate: (p: UserPreferences) => void
}) {
  const [language, setLanguage] = useState("English")
  const [cvLanguage, setCvLanguage] = useState("English")
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY")
  const [currency, setCurrency] = useState("USD ($)")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (prefs) {
      setLanguage(prefs.language || "English")
      setCvLanguage(prefs.cv_language || "English")
      setDateFormat(prefs.date_format || "DD/MM/YYYY")
      setCurrency(prefs.currency || "USD ($)")
    }
  }, [prefs])

  async function handleApply() {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await usersApi.updatePreferences({
        language,
        cv_language: cvLanguage,
        date_format: dateFormat,
        currency,
      })
      onPrefsUpdate(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {/* ignore */} finally {
      setSaving(false)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">{"Language & Region"}</h2>

      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-[#606c38]/10" />
            ))}
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#283618]">Interface language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none sm:max-w-xs"
              >
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#283618]">Default CV language</label>
              <select
                value={cvLanguage}
                onChange={(e) => setCvLanguage(e.target.value)}
                className="w-full rounded-lg border border-[#606c38]/20 bg-[#fefae0] px-3 py-2 text-sm text-[#283618] focus:border-[#dda15e] focus:ring-2 focus:ring-[#dda15e]/20 focus:outline-none sm:max-w-xs"
              >
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#283618]">Date format</label>
              <div className="flex flex-wrap gap-2">
                {DATE_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setDateFormat(fmt)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      dateFormat === fmt
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
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      currency === c
                        ? "bg-[#283618] text-[#fefae0]"
                        : "border border-[#606c38]/20 text-[#606c38] hover:border-[#283618] hover:text-[#283618]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleApply}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-[#606c38]">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────── PLAN VIEW ──────────── */
function PlanView() {
  const [planData, setPlanData] = useState<CurrentPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    billingApi.getPlan()
      .then(setPlanData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function openCheckout(plan: "starter" | "pro", cycle: "monthly" | "yearly" = "monthly") {
    const key = `checkout-${plan}-${cycle}`
    setActionLoading(key)
    try {
      const { checkout_url } = await billingApi.createCheckout(plan, cycle)
      window.open(checkout_url, "_blank")
    } catch {/* ignore */} finally {
      setActionLoading(null)
    }
  }

  async function openPortal() {
    setActionLoading("portal")
    try {
      const { portal_url } = await billingApi.createPortal()
      window.open(portal_url, "_blank")
    } catch {/* ignore */} finally {
      setActionLoading(null)
    }
  }

  const planName = planData?.plan ? planData.plan.charAt(0).toUpperCase() + planData.plan.slice(1) : "…"
  const nextBilling = planData?.next_billing_date
    ? new Date(planData.next_billing_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—"

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">My Plan</h2>

      {/* Current plan card */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 w-40 rounded bg-[#606c38]/10" />
            <div className="h-12 w-32 rounded bg-[#606c38]/10" />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-6 rounded bg-[#606c38]/10" />)}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-[#283618]">{planName} Plan</h3>
                <span className="rounded-full bg-[#606c38] px-3 py-0.5 text-xs font-semibold text-[#fefae0]">
                  Active
                </span>
              </div>
              <p className="text-sm text-[#606c38]">Next billing: {nextBilling}</p>
            </div>

            <p className="mt-3 text-3xl font-bold text-[#283618]">
              ${planData?.price ?? 0}
              <span className="text-base font-normal text-[#606c38]">/{planData?.billing_cycle ?? "month"}</span>
            </p>
            <p className="text-sm text-[#606c38]">{"Billed monthly \u00B7 Cancel anytime"}</p>

            {planData?.features && planData.features.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {planData.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#606c38]" />
                    <span className="text-sm text-[#283618]">{f}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#606c38]/10 pt-4">
              {planData?.plan !== "pro" && (
                <button
                  onClick={() => openCheckout("pro", "yearly")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 text-sm text-[#606c38] transition-colors hover:text-[#283618] disabled:opacity-60"
                >
                  {actionLoading === "checkout-pro-yearly" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {"Upgrade to Pro ($15/mo annual \u00B7 save 32%)"}
                </button>
              )}
              <button
                onClick={openPortal}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 text-sm text-[#bc6c25] transition-colors hover:text-[#bc6c25]/80 disabled:opacity-60"
              >
                {actionLoading === "portal" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {planData?.plan === "free" ? "Upgrade" : "Cancel plan"}
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Usage this month */}
      {planData?.usage && planData.usage.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-bold text-[#283618]">Usage this month</h3>
          <div className="mt-4 space-y-4">
            {planData.usage.map((u) => (
              <div key={u.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-[#283618]">{u.label}: {u.used} / {u.limit}</span>
                  <span className="text-xs text-[#606c38]">
                    {u.remaining !== undefined ? `${u.remaining} remaining` : `${u.used} used`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#fefae0]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(u.pct, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-2 rounded-full ${u.pct >= 80 ? "bg-[#bc6c25]" : "bg-[#606c38]"}`}
                  />
                </div>
              </div>
            ))}
          </div>
          {planData.usage_reset_date && (
            <p className="mt-4 text-xs text-gray-400">
              Usage resets on {new Date(planData.usage_reset_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      )}

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
                    <div className="text-xs font-normal text-[#fefae0]/70">$22/mo</div>
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
        {planData?.plan === "pro" && (
          <div className="mt-4 text-center">
            <button
              onClick={() => openCheckout("starter")}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 mx-auto rounded-full border border-[#606c38] px-4 py-2 text-sm text-[#606c38] transition-colors hover:bg-[#606c38] hover:text-[#fefae0] disabled:opacity-60"
            >
              {actionLoading === "checkout-starter-monthly" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Downgrade to Starter
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ──────────── PAYMENT VIEW ──────────── */
function PaymentView() {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const { portal_url } = await billingApi.createPortal()
      window.open(portal_url, "_blank")
    } catch {/* ignore */} finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Payment Methods</h2>

      <div className="rounded-2xl border border-[#dda15e]/20 bg-[#dda15e]/5 p-5">
        <p className="text-sm text-[#283618] leading-relaxed">
          Payment methods are managed securely via the Stripe Customer Portal. Click below to add, remove, or update your payment methods.
        </p>
        <button
          onClick={openPortal}
          disabled={loading}
          className="mt-4 flex items-center gap-2 rounded-full bg-[#283618] px-5 py-2 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#283618]/90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          Manage payment methods
        </button>
      </div>

      {/* Mobile Money info */}
      <div className="rounded-xl border border-[#dda15e]/30 bg-[#dda15e]/10 p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex gap-1">
            {["Wave", "OM", "MoMo"].map((m) => (
              <span key={m} className="rounded-md bg-[#dda15e]/20 px-2 py-0.5 text-[10px] font-bold text-[#bc6c25]">{m}</span>
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-[#283618]">Mobile Money available for African users</h4>
            <p className="mt-1 text-sm text-[#283618]/70 leading-relaxed">
              {"Pay with Wave, Orange Money (S\u00e9n\u00e9gal, C\u00f4te d'Ivoire, Mali), or MTN MoMo (Cameroun, Ghana, Uganda)."}
            </p>
            <button
              onClick={openPortal}
              disabled={loading}
              className="mt-3 flex items-center gap-1.5 rounded-full bg-[#dda15e] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    billingApi.getHistory()
      .then(setInvoices)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-[#283618]">Billing History</h2>
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 rounded bg-[#606c38]/10" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#606c38]">
            No billing history yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#606c38]/10">
                <th className="px-5 py-3 text-left font-medium text-[#606c38]">Date</th>
                <th className="px-5 py-3 text-left font-medium text-[#606c38]">Amount</th>
                <th className="px-5 py-3 text-right font-medium text-[#606c38]">Status</th>
                <th className="px-5 py-3 text-right font-medium text-[#606c38]">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#606c38]/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#fefae0]/50 transition-colors">
                  <td className="px-5 py-3 text-[#283618]">{formatDate(inv.date)}</td>
                  <td className="px-5 py-3 font-medium text-[#283618]">
                    {inv.currency.toUpperCase()} {inv.amount.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="rounded-full bg-[#606c38]/10 px-2.5 py-0.5 text-xs font-medium text-[#606c38]">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {inv.pdf_url ? (
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#dda15e] hover:text-[#bc6c25]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    ) : (
                      <span className="text-xs text-[#606c38]/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  )
}

/* ──────────── PRIVACY VIEW ──────────── */
function PrivacyView() {
  const [downloading, setDownloading] = useState(false)

  async function handleExportData() {
    setDownloading(true)
    try {
      const data = await usersApi.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "cvflow-my-data.json"
      a.click()
      URL.revokeObjectURL(url)
    } catch {/* ignore */} finally {
      setDownloading(false)
    }
  }

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
          <button
            onClick={handleExportData}
            disabled={downloading}
            className="flex items-center gap-2 rounded-full border-2 border-[#283618] px-4 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0] disabled:opacity-60"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download my data
          </button>
        </div>
        <div>
          <h3 className="font-semibold text-[#283618]">Cookies & analytics</h3>
          <div className="mt-2 space-y-2">
            <LocalToggle label="Allow anonymous usage analytics" defaultOn={true} />
            <LocalToggle label="Allow marketing cookies" defaultOn={false} />
          </div>
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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 500)
  }

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
            <LocalToggle key={e.label} label={e.label} defaultOn={e.defaultOn} />
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save preferences
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-[#606c38]">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────── REMINDERS VIEW ──────────── */
function RemindersView() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 500)
  }

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
            <LocalToggle key={r.label} label={r.label} defaultOn={r.defaultOn} />
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save reminders
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-[#606c38]">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────── HELPERS ──────────── */

/** Controlled toggle with external state */
function ToggleSwitch({
  on,
  onChange,
  disabled = false,
}: {
  on: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onChange(!on)}
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

/** Self-contained toggle (local state) for sections without API */
function LocalToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[#283618]">{label}</span>
      <ToggleSwitch on={on} onChange={setOn} />
    </div>
  )
}
