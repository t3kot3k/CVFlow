"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Rocket,
  FileText,
  Target,
  LayoutGrid,
  CreditCard,
  User,
  ArrowRight,
  MessageCircle,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const categories = [
  {
    slug: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    count: 12,
    description: "Set up your account and create your first CV in minutes.",
  },
  {
    slug: "cv-builder",
    title: "CV Builder",
    icon: FileText,
    count: 18,
    description: "Master the editor, sections, formatting, and exports.",
  },
  {
    slug: "ats-tailoring",
    title: "ATS & Tailoring",
    icon: Target,
    count: 9,
    description: "Optimize your CV to pass Applicant Tracking Systems.",
  },
  {
    slug: "templates",
    title: "Templates",
    icon: LayoutGrid,
    count: 14,
    description: "Browse, customize, and switch between CV templates.",
  },
  {
    slug: "billing-plans",
    title: "Billing & Plans",
    icon: CreditCard,
    count: 7,
    description: "Manage subscriptions, invoices, and payment methods.",
  },
  {
    slug: "account",
    title: "Account",
    icon: User,
    count: 10,
    description: "Profile settings, security, and data privacy.",
  },
]

const popularArticles = [
  { slug: "how-to-create-your-first-cv", title: "How to create your first CV with CVFlow" },
  { slug: "export-cv-as-pdf", title: "How to export your CV as a PDF" },
  { slug: "improve-ats-score", title: "How to improve your ATS compatibility score" },
  { slug: "change-cv-template", title: "How to change your CV template without losing content" },
  { slug: "upgrade-to-pro", title: "How to upgrade to the Pro plan" },
  { slug: "add-custom-sections", title: "Adding custom sections to your CV" },
  { slug: "reset-password", title: "How to reset your password" },
  { slug: "cancel-subscription", title: "How to cancel or pause your subscription" },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredArticles = searchQuery
    ? popularArticles.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularArticles

  return (
    <div className="flex min-h-screen flex-col bg-[#fefae0]">
      <Navbar />

      <main className="flex-1">
        {/* Hero + Search */}
        <section className="px-6 pb-16 pt-20 text-center">
          <h1 className="text-4xl font-bold text-[#283618] sm:text-5xl text-balance">
            How can we help?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[#606c38]">
            Search our knowledge base or browse categories below.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#606c38]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles, topics, or questions..."
                className="w-full rounded-full border border-[#606c38]/15 bg-white py-4 pl-12 pr-6 text-[#283618] shadow-sm placeholder:text-[#606c38]/40 focus:border-[#dda15e] focus:outline-none focus:ring-2 focus:ring-[#dda15e]/20 transition-all"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 pb-24">
          {/* Category Cards */}
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/help/${cat.slug}`}
                  className="group flex flex-col rounded-2xl border border-[#606c38]/10 bg-white p-6 transition-all duration-200 hover:border-[#dda15e]/30 hover:shadow-lg hover:shadow-[#283618]/5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#606c38]/10 transition-colors group-hover:bg-[#dda15e]/15">
                    <cat.icon className="h-6 w-6 text-[#606c38] transition-colors group-hover:text-[#dda15e]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#283618]">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#606c38]/70 leading-relaxed">
                    {cat.description}
                  </p>
                  <span className="mt-auto pt-4 text-xs font-medium text-[#606c38]/50">
                    {cat.count} articles
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular Articles */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-[#283618]">Popular articles</h2>
            <div className="mt-6 divide-y divide-[#606c38]/10 rounded-2xl border border-[#606c38]/10 bg-white">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/help/${article.slug}`}
                    className="group flex items-center justify-between px-6 py-4 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-[#dda15e]/5"
                  >
                    <span className="text-sm font-medium text-[#283618] group-hover:text-[#606c38]">
                      {article.title}
                    </span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#606c38]/30 transition-all group-hover:text-[#dda15e] group-hover:translate-x-0.5" />
                  </Link>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm text-[#606c38]/60">
                    No articles found for &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Still need help CTA */}
          <section className="mt-20 text-center">
            <div className="mx-auto max-w-lg rounded-2xl bg-[#283618] px-8 py-12">
              <MessageCircle className="mx-auto h-10 w-10 text-[#dda15e]" />
              <h2 className="mt-4 text-2xl font-bold text-[#fefae0]">
                Still need help?
              </h2>
              <p className="mt-2 text-sm text-[#fefae0]/70 leading-relaxed">
                Our support team is available Monday to Friday, 9am - 6pm CET.
              </p>
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).Intercom) {
                    ;(window as any).Intercom("show")
                  }
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#dda15e] px-8 py-3 text-sm font-bold text-[#283618] transition-all hover:bg-[#bc6c25] hover:shadow-md active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with us
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
