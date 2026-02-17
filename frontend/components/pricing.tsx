"use client"

import Link from "next/link"
import { Check, X, ChevronDown } from "lucide-react"

export function Pricing() {
  return (
    <section id="pricing" className="bg-[#283618] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-[#dda15e] uppercase">
            Pricing
          </p>
          <h2 className="mt-3 text-4xl font-bold text-[#fefae0] text-balance">
            Fair pricing for every wallet.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#fefae0]/80">
            We use Purchasing Power Parity.
            Your price adapts to your country. Same features, same quality.
          </p>
        </div>

        {/* Region Selector */}
        <div className="mt-6 flex justify-center">
          <button className="inline-flex items-center gap-2 rounded-full bg-[#606c38] px-4 py-2 text-sm text-[#fefae0]">
            Showing prices for: North America
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
            <h3 className="text-2xl font-bold text-[#fefae0]">Free</h3>
            <p className="mt-2">
              <span className="text-4xl font-bold text-[#fefae0]">$0</span>
              <span className="text-sm text-[#fefae0]/70"> / month</span>
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { text: "1 CV \u00B7 basic template", included: true },
                { text: "ATS score (overview)", included: true },
                { text: "3 AI tailorings/month", included: true },
                { text: "1 cover letter/month", included: true },
                { text: "Detailed ATS suggestions", included: false },
                { text: "LinkedIn optimizer", included: false },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  {item.included ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dda15e]" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[#fefae0]/30" />
                  )}
                  <span className={`text-sm ${item.included ? "text-[#fefae0]" : "text-[#fefae0]/40"}`}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-6 block rounded-full border border-[#fefae0] py-2 text-center text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#fefae0] hover:text-[#283618]"
            >
              Start free
            </Link>
          </div>

          {/* Starter - Highlighted */}
          <div className="relative rounded-2xl bg-[#dda15e] p-6">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#283618] px-3 py-0.5 text-xs font-semibold text-[#fefae0]">
              Most popular
            </span>
            <h3 className="text-2xl font-bold text-[#283618]">Starter</h3>
            <p className="mt-2">
              <span className="text-4xl font-bold text-[#283618]">$11</span>
              <span className="text-sm text-[#283618]/70"> / month</span>
            </p>
            <p className="mt-1 text-xs text-[#283618]/70">from $2/month in Sub-Saharan Africa</p>
            <ul className="mt-6 space-y-3">
              {[
                { text: "Unlimited CVs + all templates", included: true },
                { text: "Full ATS score + suggestions", included: true },
                { text: "Unlimited AI tailoring", included: true },
                { text: "Unlimited cover letters", included: true },
                { text: "Job application tracker", included: true },
                { text: "PDF + DOCX export", included: true },
                { text: "Basic LinkedIn optimizer", included: true },
                { text: "Interview simulator", included: false },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  {item.included ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#283618]" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[#283618]/30" />
                  )}
                  <span className={`text-sm ${item.included ? "text-[#283618]" : "text-[#283618]/40"}`}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-6 block rounded-full bg-[#283618] py-2 text-center text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#283618]/90"
            >
              Start Starter
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-[#dda15e] bg-white/10 p-6 backdrop-blur">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[#dda15e] px-3 py-0.5 text-xs font-semibold text-[#dda15e]">
              Full power
            </span>
            <h3 className="text-2xl font-bold text-[#fefae0]">Pro</h3>
            <p className="mt-2">
              <span className="text-4xl font-bold text-[#fefae0]">$22</span>
              <span className="text-sm text-[#fefae0]/70"> / month</span>
            </p>
            <p className="mt-1 text-xs text-[#fefae0]/70">from $5/month in Sub-Saharan Africa</p>
            <ul className="mt-6 space-y-3">
              {[
                "Everything in Starter",
                "High-quality AI (GPT-4o / Gemini Pro)",
                "Interview simulator (unlimited)",
                "Advanced LinkedIn optimizer",
                "Salary intelligence by country",
                "Auto-apply (50 jobs/month)",
                "Batch tailoring",
                "Priority support",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dda15e]" />
                  <span className="text-sm text-[#fefae0]">{text}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-6 block rounded-full bg-[#dda15e] py-2 text-center text-sm font-bold text-[#283618] transition-colors hover:bg-[#bc6c25]"
            >
              Go Pro
            </Link>
          </div>
        </div>

        {/* Below cards text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#fefae0]/70">
            In Africa: pay with Wave, Orange Money or MTN MoMo — no credit card needed.
          </p>
          <a href="#pricing" className="mt-2 inline-block text-sm font-semibold text-[#dda15e]">
            {"See full pricing \u2192"}
          </a>
        </div>
      </div>
    </section>
  )
}
