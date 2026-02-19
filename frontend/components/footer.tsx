"use client"

import Link from "next/link"
import { Leaf, ArrowRight } from "lucide-react"
import { useState } from "react"

const footerLinks = {
  Support: [
    { label: "Contact us", href: "/help" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Help Center", href: "/help" },
  ],
}

const languages = [
  { code: "FR", name: "French" },
  { code: "EN", name: "English" },
  { code: "AR", name: "Arabic", rtl: true },
  { code: "ES", name: "Spanish" },
  { code: "PT", name: "Portuguese" },
  { code: "SW", name: "Swahili — East Africa", tooltip: true },
  { code: "HI", name: "Hindi — India", tooltip: true },
]

export function Footer() {
  const [hoveredLang, setHoveredLang] = useState<string | null>(null)

  return (
    <footer className="bg-[#283618] text-[#fefae0]">
      <div className="mx-auto max-w-5xl px-8 py-12">
        <div className="flex items-start justify-between gap-12">
          {/* Left — Brand */}
          <div>
            <a href="#" className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-[#606c38]" />
              <span className="text-xl font-bold text-[#fefae0]">CVFlow</span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-[#fefae0]/60">
              The CV builder built for the whole world.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {languages.map((lang) => (
                <div key={lang.code} className="relative">
                  <button
                    onMouseEnter={() => setHoveredLang(lang.code)}
                    onMouseLeave={() => setHoveredLang(null)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
                  >
                    {lang.code}
                    {lang.rtl && <ArrowRight className="h-2.5 w-2.5 opacity-50 rotate-180" />}
                  </button>
                  {lang.tooltip && hoveredLang === lang.code && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded bg-[#606c38] px-2 py-1 text-[10px] text-white whitespace-nowrap pointer-events-none">
                      {lang.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#fefae0]/40">Available in 7 languages · More coming soon</p>
          </div>

          {/* Right — Support */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#fefae0]/40">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.Support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#fefae0]/70 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-[#fefae0]/60">
            {"\u00A9"} 2026 CVFlow. All rights reserved.
          </p>
          <p className="text-sm text-[#fefae0]/60">
            Made for job seekers worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
