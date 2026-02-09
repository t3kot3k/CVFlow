"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const CREDIT_PACKS = [
  { credits: 5, price: "$4.99", perCredit: "$1.00" },
  { credits: 15, price: "$12.99", perCredit: "$0.87" },
  { credits: 40, price: "$29.99", perCredit: "$0.75" },
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewAccount = searchParams.get("new") === "true";

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Success Banner */}
        {isNewAccount && (
          <div className="w-full max-w-[900px] mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                check_circle
              </span>
              <div>
                <p className="text-green-800 dark:text-green-300 font-semibold text-sm">
                  Account created successfully! You have 3 welcome credits.
                </p>
                <p className="text-green-600 dark:text-green-400 text-xs">
                  Start for free or upgrade to Pro for unlimited access.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-[#0e121b] dark:text-white text-4xl font-bold tracking-tight mb-4">
            Simple, Flexible Pricing
          </h1>
          <p className="text-[#4d6599] dark:text-gray-400 text-lg max-w-lg mx-auto">
            Pay per use with credits, or go unlimited with Pro.
            Mix and match to fit your job search pace.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] w-full mb-16">
          {/* Free Plan */}
          <div className="p-10 bg-white dark:bg-[#1c2231] rounded-2xl flex flex-col border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-1">Free</h3>
            <p className="text-[#4d6599] dark:text-gray-400 text-sm mb-4">
              Get started with 3 welcome credits
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-[#0e121b] dark:text-white">
                $0
              </span>
              <span className="text-gray-400">forever</span>
            </div>

            <ul className="space-y-3 mb-10 flex-1">
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
                    className={`material-symbols-outlined text-base ${
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

            <Button
              variant="secondary"
              className="w-full h-12"
              onClick={() => router.push("/dashboard")}
            >
              Start Free
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="p-10 bg-white dark:bg-[#1c2231] rounded-2xl flex flex-col relative border-2 border-primary shadow-xl shadow-primary/10 md:scale-105">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
              Most Popular
            </span>

            <h3 className="text-lg font-bold mb-1">Recruit AI Pro</h3>
            <p className="text-[#4d6599] dark:text-gray-400 text-sm mb-4">
              Unlimited access to most AI features
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black text-[#0e121b] dark:text-white">
                $19
              </span>
              <span className="text-gray-400">/month</span>
            </div>

            <ul className="space-y-3 mb-10 flex-1">
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
                  <span className="material-symbols-outlined text-base text-green-500">
                    check_circle
                  </span>
                  {feature.text}
                </li>
              ))}
            </ul>

            <Button
              variant="primary"
              className="w-full h-12"
              onClick={() => router.push("/dashboard/settings#subscription")}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>

        {/* Credit Packs Section */}
        <div className="max-w-[900px] w-full text-center mb-12">
          <Badge variant="info" className="mb-4">PAY AS YOU GO</Badge>
          <h2 className="text-2xl font-bold mb-2">Credit Packs</h2>
          <p className="text-[#4d6599] dark:text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Buy credits for AI-powered actions. Credits never expire and work
            alongside your subscription.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className="p-8 bg-white dark:bg-[#1c2231] rounded-2xl border border-gray-200 dark:border-gray-800 text-center hover:border-primary transition-colors"
              >
                <p className="text-4xl font-black mb-1">{pack.credits}</p>
                <p className="text-sm text-[#4d6599] mb-3">credits</p>
                <p className="text-2xl font-bold text-primary mb-1">{pack.price}</p>
                <p className="text-xs text-gray-400">{pack.perCredit} per credit</p>
              </div>
            ))}
          </div>

          {/* Cost Table */}
          <div className="bg-white dark:bg-[#1c2231] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden text-left max-w-lg mx-auto">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-bold">Credit Costs per Action</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {[
                { action: "ATS CV Analysis", cost: "Free", pro: "Free" },
                { action: "CV Optimization", cost: "1 credit", pro: "Included" },
                { action: "CV Download", cost: "1 credit", pro: "Included" },
                { action: "Cover Letter", cost: "1 credit", pro: "Included" },
                { action: "Send CV by Email", cost: "1 credit", pro: "Included" },
                { action: "AI Headshot", cost: "2 credits", pro: "2 credits" },
                { action: "Email Tracking", cost: "Free", pro: "Free" },
              ].map((row) => (
                <div
                  key={row.action}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <span className="text-[#0e121b] dark:text-gray-200 font-medium">
                    {row.action}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-[#4d6599] text-xs w-20 text-right">
                      {row.cost}
                    </span>
                    <span
                      className={`text-xs w-20 text-right font-semibold ${
                        row.pro === "Included"
                          ? "text-green-600"
                          : "text-[#4d6599]"
                      }`}
                    >
                      {row.pro === "Included" ? (
                        <span className="flex items-center justify-end gap-1">
                          <span className="material-symbols-outlined text-xs text-green-500">
                            check
                          </span>
                          Pro
                        </span>
                      ) : (
                        row.pro
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-6 mt-4 text-xs text-[#4d6599] dark:text-gray-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">lock</span>
            Secure Checkout
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">credit_card</span>
            Powered by Stripe
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">event_available</span>
            Cancel Anytime
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}
