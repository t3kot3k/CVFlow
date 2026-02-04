"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="px-6 lg:px-40 py-12 md:py-24">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col gap-10 lg:flex-row items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-8 flex-1">
            <div className="flex flex-col gap-4">
              <Badge className="w-fit uppercase tracking-wider text-xs px-3 py-1">
                New: CV & Email Tracking Analytics
              </Badge>
              <h1 className="text-[#0e121b] dark:text-white text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em]">
                Optimize your CV.{" "}
                <br />
                <span className="text-primary">Get more interviews.</span>
              </h1>
              <p className="text-[#4d6599] dark:text-gray-400 text-lg md:text-xl font-normal max-w-[540px]">
                Optimize your application with AI and see exactly when recruiters
                open your CV or read your emails in real-time.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="xl" asChild>
                <Link href="/free-test">Test my CV for free</Link>
              </Button>
              <Button size="xl" variant="secondary" asChild>
                <Link href="#how-it-works">See Demo</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-primary/30 to-primary/10"
                  />
                ))}
              </div>
              <p className="text-sm text-[#4d6599] dark:text-gray-400 font-medium">
                Joined by 10,000+ job seekers this month
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-sm mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl font-black text-primary">92%</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#0e121b] dark:text-white">ATS Score</p>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">trending_up</span>
                          +15% from last version
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#4d6599]">Keywords Match</span>
                        <span className="text-green-500 font-bold">18/20</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[90%] rounded-full" />
                      </div>
                    </div>
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
