"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Leaf } from "lucide-react"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "For Universities", href: "#universities" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-[#fefae0]/95 backdrop-blur-md shadow-md border-b border-[#606c38]/10" : "bg-[#fefae0]"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-[#606c38]" />
          <span className="text-xl font-bold text-[#283618]">CVFlow</span>
        </a>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="relative text-sm text-[#283618] transition-colors hover:text-[#606c38] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-[#dda15e] after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-[#283618] transition-colors hover:text-[#bc6c25] md:inline-block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-[#dda15e] px-5 py-2 text-sm font-semibold text-[#283618] transition-all hover:bg-[#bc6c25] hover:scale-105 md:inline-block"
          >
            {"Get started free \u2192"}
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-[#283618] md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-[#606c38]/10 bg-[#fefae0] px-6 pb-6 md:hidden">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="block text-sm text-[#283618] transition-colors hover:text-[#606c38]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/login" className="text-sm font-medium text-[#283618]" onClick={() => setMobileOpen(false)}>
              Log in
            </Link>
            <Link
              href="/signup"
              className="block rounded-full bg-[#dda15e] px-5 py-2 text-center text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]"
              onClick={() => setMobileOpen(false)}
            >
              {"Get started free \u2192"}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
