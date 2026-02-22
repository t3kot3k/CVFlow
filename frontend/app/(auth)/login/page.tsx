"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { AuthLeftPanel } from "@/components/auth-left-panel"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  signIn,
  signInWithGoogle,
  signInWithLinkedIn,
  signInWithGoogleRedirect,
  signInWithLinkedInRedirect,
  getAuthRedirectResult,
} from "@/lib/firebase"
import { request, ApiError } from "@/lib/api/client"

interface AuthResponse {
  uid: string
  email: string
  full_name: string
  token: string
  is_new_user: boolean
}

function getFirebaseError(code: string): string {
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return ""
    case "auth/popup-blocked":
      return "Popup blocked — redirecting to Google sign-in…"
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again."
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again."
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password."
    case "auth/invalid-email":
      return "Invalid email address."
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled. Please contact support."
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in. Please contact support."
    default:
      return `Sign-in failed (${code}). Please try again.`
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
  const [isRedirectLoading, setIsRedirectLoading] = useState(false)
  const [noAccount, setNoAccount] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Handle result when Firebase redirects back after signInWithRedirect.
  // Do NOT set loading=true before the result — getAuthRedirectResult()
  // returns null on normal page loads, causing a flash on every visit.
  useEffect(() => {
    getAuthRedirectResult()
      .then(async (result) => {
        if (!result) return // no redirect pending — nothing to do
        setIsRedirectLoading(true)
        const idToken = await result.user.getIdToken()
        const isLinkedIn = result.providerId?.includes("oidc")
        const endpoint = isLinkedIn ? "/auth/linkedin" : "/auth/google"
        const data = await request<AuthResponse>(endpoint, {
          method: "POST",
          body: JSON.stringify({ id_token: idToken }),
          authenticated: false,
        })
        router.push(data.is_new_user ? "/onboarding" : "/dashboard")
      })
      .catch((err) => {
        setIsRedirectLoading(false)
        if (err instanceof ApiError) {
          setError(err.message)
        } else if (err?.code) {
          const msg = getFirebaseError(err.code)
          if (msg) setError(msg)
        }
      })
  }, [router])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setIsFormLoading(true)
    setError("")
    setNoAccount(false)
    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (err) {
      if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: string }).code
        if (code === "auth/user-not-found") {
          setNoAccount(true)
        } else {
          setError(getFirebaseError(code))
        }
      } else {
        setError("Login failed. Please try again.")
      }
      setIsFormLoading(false)
    }
  }

  async function handleOAuth(
    provider: "google" | "linkedin",
    signInFn: () => Promise<{ user: { getIdToken(): Promise<string> } }>,
    redirectFn: () => Promise<void>
  ) {
    const setLoading =
      provider === "google" ? setIsGoogleLoading : setIsLinkedInLoading
    setLoading(true)
    setError("")
    try {
      const result = await signInFn()
      const idToken = await result.user.getIdToken()
      const data = await request<AuthResponse>(`/auth/${provider}`, {
        method: "POST",
        body: JSON.stringify({ id_token: idToken }),
        authenticated: false,
      })
      router.push(data.is_new_user ? "/onboarding" : "/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setLoading(false)
      } else if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: string }).code
        if (code === "auth/popup-blocked") {
          // Auto-fallback to redirect sign-in
          setError("Popup blocked — redirecting…")
          await redirectFn()
          // Page will navigate away, no need to setLoading(false)
          return
        }
        const msg = getFirebaseError(code)
        if (msg) setError(msg)
        setLoading(false)
      } else {
        setError("Sign-in failed. Please try again.")
        setLoading(false)
      }
    }
  }

  const handleGoogleAuth = () =>
    handleOAuth("google", signInWithGoogle, signInWithGoogleRedirect)
  const handleLinkedInAuth = () =>
    handleOAuth("linkedin", signInWithLinkedIn, signInWithLinkedInRedirect)

  const isAnyLoading = isGoogleLoading || isLinkedInLoading || isRedirectLoading || isFormLoading

  return (
    <div className="flex min-h-screen">
      <AuthLeftPanel
        quote="The ATS score showed me exactly what was wrong. Fixed it in 5 minutes. Got called the next day."
        authorName="Kofi Asante"
        authorRole="Junior Dev, Accra, Ghana"
        authorImage="/images/avatar-kofi.jpg"
      />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-[#fefae0] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#dda15e]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#283618"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2.5-.8 6.5" />
                <path d="M11 20v-9a4 4 0 0 1 4-4h.6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#283618]">CVFlow</span>
          </div>

          <h1 className="text-3xl font-bold text-[#283618]">Welcome back</h1>
          <p className="text-[#606c38] text-sm mt-1">
            Log in to continue building your CVs.
          </p>

          {/* Redirect loading state */}
          {isRedirectLoading && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#dda15e]/10 border border-[#dda15e]/20 text-sm text-[#283618]">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Completing sign-in…
            </div>
          )}

          {/* No account found */}
          {noAccount && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center justify-between gap-3">
              <span>No account found with this email.</span>
              <Link href="/signup" className="font-semibold whitespace-nowrap hover:underline">
                {"Sign up \u2192"}
              </Link>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isAnyLoading}
              className="flex items-center justify-center gap-3 w-full bg-white border border-[#606c38]/15 rounded-xl px-4 py-3 text-[#283618] font-medium hover:border-[#dda15e] hover:shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {isGoogleLoading ? "Signing in…" : "Continue with Google"}
            </button>
            <button
              type="button"
              onClick={handleLinkedInAuth}
              disabled={isAnyLoading}
              className="flex items-center justify-center gap-3 w-full bg-[#0A66C2] text-white rounded-xl px-4 py-3 font-medium hover:bg-[#004182] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLinkedInLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              )}
              {isLinkedInLoading ? "Signing in…" : "Continue with LinkedIn"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#283618]/10" />
            <span className="text-xs text-[#606c38]/60">or log in with email</span>
            <div className="flex-1 h-px bg-[#283618]/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-[#283618]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="amara@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl bg-white border-[#606c38]/15 h-11 text-[#283618] placeholder:text-[#606c38]/40 focus-visible:border-[#606c38] focus-visible:ring-[#606c38]/20 transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#283618]">
                  Password
                </Label>
                <Link
                  href="#"
                  className="text-sm text-[#606c38] hover:text-[#283618] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={"•".repeat(8)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl bg-white border-[#606c38]/15 h-11 pr-11 text-[#283618] placeholder:text-[#606c38]/40 focus-visible:border-[#606c38] focus-visible:ring-[#606c38]/20 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606c38]/40 hover:text-[#283618] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnyLoading}
              className="w-full bg-[#dda15e] text-[#283618] font-bold rounded-full py-3 mt-2 hover:bg-[#bc6c25] transition-all hover:shadow-md active:scale-[0.98] text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isFormLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isFormLoading ? "Logging in…" : "Log in →"}
            </button>
          </form>

          <p className="text-sm text-center text-[#606c38] mt-6">
            {"Don't have an account? "}
            <Link
              href="/signup"
              className="font-semibold hover:text-[#283618] transition-colors"
            >
              {"Sign up free \u2192"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
