"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { AuthLeftPanel } from "@/components/auth-left-panel"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const countries = [
  { value: "ma", code: "MA", name: "Morocco" },
  { value: "sn", code: "SN", name: "Senegal" },
  { value: "gh", code: "GH", name: "Ghana" },
  { value: "ng", code: "NG", name: "Nigeria" },
  { value: "fr", code: "FR", name: "France" },
  { value: "de", code: "DE", name: "Germany" },
  { value: "gb", code: "GB", name: "United Kingdom" },
  { value: "us", code: "US", name: "United States" },
  { value: "in", code: "IN", name: "India" },
  { value: "ke", code: "KE", name: "Kenya" },
  { value: "za", code: "ZA", name: "South Africa" },
  { value: "eg", code: "EG", name: "Egypt" },
  { value: "ca", code: "CA", name: "Canada" },
  { value: "br", code: "BR", name: "Brazil" },
  { value: "ae", code: "AE", name: "UAE" },
]

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [country, setCountry] = useState("")
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push("/onboarding")
  }

  return (
    <div className="flex min-h-screen">
      <AuthLeftPanel
        quote="I sent 60 applications with no answer. CVFlow tailored each CV and I got 4 interviews in 10 days."
        authorName="Nadia Benali"
        authorRole="Marketing Manager, Casablanca, Morocco"
        authorImage="/images/avatar-nadia.jpg"
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

          <h1 className="text-3xl font-bold text-[#283618] text-balance">
            Create your free account
          </h1>
          <p className="text-[#606c38] text-sm mt-1">
            Start building smarter CVs in 30 seconds.
          </p>

          {/* OAuth buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-3 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[#283618] font-medium hover:border-[#dda15e] transition-colors"
            >
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
              Continue with Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-3 w-full bg-[#0A66C2] text-white rounded-xl px-4 py-3 font-medium hover:bg-[#004182] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Continue with LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullname" className="text-[#283618]">
                Full name
              </Label>
              <Input
                id="fullname"
                placeholder="Amara Diallo"
                className="rounded-xl bg-white border-gray-200 h-11 text-[#283618] placeholder:text-gray-400 focus-visible:border-[#606c38] focus-visible:ring-[#606c38]/20"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-[#283618]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="amara@example.com"
                className="rounded-xl bg-white border-gray-200 h-11 text-[#283618] placeholder:text-gray-400 focus-visible:border-[#606c38] focus-visible:ring-[#606c38]/20"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-[#283618]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  className="rounded-xl bg-white border-gray-200 h-11 pr-11 text-[#283618] placeholder:text-gray-400 focus-visible:border-[#606c38] focus-visible:ring-[#606c38]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#283618] transition-colors"
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

            <div className="flex flex-col gap-1.5">
              <Label className="text-[#283618]">Your country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="rounded-xl bg-white border-gray-200 h-11 w-full text-[#283618] focus:border-[#606c38] focus:ring-[#606c38]/20">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-gray-200">
                  {countries.map((c) => (
                    <SelectItem
                      key={c.value}
                      value={c.value}
                      className="text-[#283618] focus:bg-[#dda15e]/10 focus:text-[#283618]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-[#606c38]/10 text-[10px] font-bold text-[#606c38]">
                          {c.code}
                        </span>
                        <span>{c.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#606c38]">
                We use this to adapt pricing and CV format for you.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#dda15e] text-[#283618] font-bold rounded-xl py-3 mt-2 hover:bg-[#bc6c25] transition-colors text-sm"
            >
              {"Create my account \u2192"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-1">
              By signing up you agree to our{" "}
              <Link href="#" className="underline hover:text-[#606c38]">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="#" className="underline hover:text-[#606c38]">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <p className="text-sm text-center text-[#606c38] mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold hover:text-[#283618] transition-colors"
            >
              {"Log in \u2192"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
