"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basic",
    price: "$0",
    description: "Perfect for trying out our platform",
    features: [
      { text: "1 CV Analysis per month", included: true },
      { text: "Basic ATS Score", included: true },
      { text: "Application Tracking", included: false },
    ],
    cta: "Get Started",
    href: "/signup",
    popular: false,
  },
  {
    name: "Premium Pro",
    price: "$19",
    description: "Everything you need to land your dream job",
    features: [
      { text: "Unlimited CV & Email Tracking", included: true },
      { text: "Unlimited AI Cover Letters", included: true },
      { text: "10 AI Headshots per month", included: true },
      { text: "Priority Email Support", included: true },
    ],
    cta: "Upgrade to Premium",
    href: "/signup?plan=premium",
    popular: true,
  },
];

export function Pricing() {
  return (
    <section className="px-6 lg:px-40 py-20" id="pricing">
      <div className="max-w-[1280px] mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-[#4d6599] mb-12">
          Start for free, upgrade when you&apos;re ready to scale your job hunt.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-10 bg-white dark:bg-[#1c2231] rounded-2xl flex flex-col items-center relative ${
                plan.popular
                  ? "border-2 border-primary shadow-xl shadow-primary/10 scale-105"
                  : "border border-gray-200 dark:border-gray-800"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-gray-400">/mo</span>
              </div>

              <ul className="text-left space-y-4 mb-10 w-full">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className={`flex items-center gap-3 text-sm ${
                      feature.included ? "" : "opacity-40"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${
                        feature.included ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {feature.included ? "check_circle" : "cancel"}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "primary" : "secondary"}
                className="w-full h-12"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
