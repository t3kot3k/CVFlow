"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const avatars = [
  { initials: "JD", from: "from-blue-400", to: "to-blue-600" },
  { initials: "SK", from: "from-green-400", to: "to-green-600" },
  { initials: "MA", from: "from-purple-400", to: "to-purple-600" },
  { initials: "LC", from: "from-orange-400", to: "to-orange-600" },
  { initials: "RB", from: "from-pink-400", to: "to-pink-600" },
];

export function Hero() {
  return (
    <section className="px-6 lg:px-40 py-12 md:py-24">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col gap-10 lg:flex-row items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-8 flex-1">
            {/* Social Proof - Above headline (CVBoost pattern) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex -space-x-3">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.initials}
                    className={`h-10 w-10 rounded-full border-2 border-white dark:border-background-dark bg-gradient-to-br ${avatar.from} ${avatar.to} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-[#0e121b] dark:text-white font-bold">
                  +10,000 job seekers this month
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-yellow-400 text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                  <span className="text-xs text-[#4d6599] dark:text-gray-400 ml-1">
                    4.9/5 rating
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <h1 className="text-[#0e121b] dark:text-white text-4xl md:text-[3.5rem] lg:text-6xl font-black leading-[1.1] tracking-[-0.033em]">
                Optimize your CV.{" "}
                <br />
                <span className="text-primary">Get more interviews.</span>
              </h1>
              <p className="text-[#4d6599] dark:text-gray-400 text-lg md:text-xl font-normal max-w-[540px] leading-relaxed">
                AI-powered CV analysis, cover letter generation, and real-time
                application tracking — all in one platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="xl" asChild>
                <Link href="/free-test">Test my CV for free</Link>
              </Button>
              <Button size="xl" variant="secondary" asChild>
                <Link href="#how-it-works">
                  See how it works
                  <span className="material-symbols-outlined text-base ml-1">
                    arrow_downward
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: CV Preview Image (like CVBoost) */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative">
              <Image
                src="https://cvboost.co/images/hero-b-cv-preview.png"
                alt="CV Preview - Recruit AI"
                width={600}
                height={750}
                className="rounded-2xl shadow-2xl"
                priority
              />
              {/* Floating ATS Score card */}
              <div className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-8 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-lg font-black text-green-600">92%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0e121b] dark:text-white">
                      ATS Score
                    </p>
                    <p className="text-[10px] text-green-500 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs">
                        trending_up
                      </span>
                      +15% optimized
                    </p>
                  </div>
                </div>
              </div>
              {/* Floating Keywords card */}
              <div className="absolute -top-2 -right-2 md:top-8 md:-right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-primary text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#0e121b] dark:text-white">
                      18/20 Keywords
                    </p>
                    <p className="text-[10px] text-[#4d6599] dark:text-gray-400">
                      Match found
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
