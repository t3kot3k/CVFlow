"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CREDIT_PACKS = [
  { credits: 5, price: "$4.99", perCredit: "$1.00" },
  { credits: 15, price: "$12.99", perCredit: "$0.87" },
  { credits: 40, price: "$29.99", perCredit: "$0.75" },
];

export function Pricing() {
  return (
    <section className="px-6 lg:px-40 py-20" id="pricing">
      <div className="max-w-[1280px] mx-auto text-center">
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
          Pricing
        </p>
        <h2 className="text-3xl font-bold mb-4">Simple, flexible pricing</h2>
        <p className="text-[#4d6599] dark:text-gray-400 mb-12">
          Pay per use with credits, or go unlimited with Pro. Mix and match to fit your pace.
        </p>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto mb-16">
          {/* Free */}
          <div className="p-10 bg-white dark:bg-[#1c2231] rounded-2xl flex flex-col items-center relative border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-2">Free</h3>
            <p className="text-[#4d6599] dark:text-gray-400 text-sm mb-4">
              Get started with 3 welcome credits
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">$0</span>
              <span className="text-gray-400">forever</span>
            </div>

            <ul className="text-left space-y-3 mb-10 w-full">
              {[
                { text: "3 welcome credits on signup", included: true },
                { text: "Free ATS CV analysis (unlimited)", included: true },
                { text: "Free email tracking", included: true },
                { text: "Pay-per-use for AI actions", included: true },
                { text: "Credits never expire", included: true },
                { text: "Unlimited Pro features", included: false },
              ].map((feature) => (
                <li
                  key={feature.text}
                  className={`flex items-center gap-3 text-sm ${
                    feature.included
                      ? "text-[#0e121b] dark:text-gray-200"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-sm ${
                      feature.included
                        ? "text-green-500"
                        : "text-gray-300 dark:text-gray-700"
                    }`}
                  >
                    {feature.included ? "check_circle" : "cancel"}
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>

            <Button variant="secondary" className="w-full h-12" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>

          {/* Pro */}
          <div className="p-10 bg-white dark:bg-[#1c2231] rounded-2xl flex flex-col items-center relative border-2 border-primary shadow-xl shadow-primary/10 md:scale-105">
            <span className="absolute -top-4 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
              Most Popular
            </span>

            <h3 className="text-lg font-bold mb-2">Recruit AI Pro</h3>
            <p className="text-[#4d6599] dark:text-gray-400 text-sm mb-4">
              Unlimited access to most AI features
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">$19</span>
              <span className="text-gray-400">/mo</span>
            </div>

            <ul className="text-left space-y-3 mb-10 w-full">
              {[
                { text: "Everything in Free", included: true },
                { text: "Unlimited CV optimization & downloads", included: true },
                { text: "Unlimited cover letter generation", included: true },
                { text: "Unlimited CV email sending", included: true },
                { text: "AI headshots use credits (2 each)", included: true },
                { text: "Cancel anytime", included: true },
              ].map((feature) => (
                <li
                  key={feature.text}
                  className="flex items-center gap-3 text-sm text-[#0e121b] dark:text-gray-200"
                >
                  <span className="material-symbols-outlined text-sm text-green-500">
                    check_circle
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>

            <Button variant="primary" className="w-full h-12" asChild>
              <Link href="/signup?plan=premium">Upgrade to Premium</Link>
            </Button>
          </div>
        </div>

        {/* Credit Packs */}
        <div className="max-w-[800px] mx-auto">
          <Badge variant="info" className="mb-4">PAY AS YOU GO</Badge>
          <h3 className="text-xl font-bold mb-2">Credit Packs</h3>
          <p className="text-[#4d6599] dark:text-gray-400 text-sm mb-8">
            Buy credits for AI-powered actions. Credits never expire.
          </p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className="p-6 bg-white dark:bg-[#1c2231] rounded-xl border border-gray-200 dark:border-gray-800 text-center hover:border-primary transition-colors"
              >
                <p className="text-3xl font-black mb-1">{pack.credits}</p>
                <p className="text-xs text-[#4d6599] mb-2">credits</p>
                <p className="text-lg font-bold text-primary">{pack.price}</p>
                <p className="text-[10px] text-gray-400">{pack.perCredit}/credit</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-[#4d6599] dark:text-gray-400 mt-8 flex items-center justify-center gap-2">
          <span
            className="material-symbols-outlined text-green-500 text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          30-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
