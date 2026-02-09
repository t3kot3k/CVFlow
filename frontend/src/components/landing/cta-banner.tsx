"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="px-6 lg:px-40 py-20">
      <div className="max-w-[1280px] mx-auto bg-primary rounded-3xl p-12 text-center text-white">
        <h2 className="text-4xl font-black mb-4">Ready to land your next job?</h2>
        <p className="text-white/80 text-lg mb-4 max-w-[600px] mx-auto">
          Join 10,000+ job seekers who use Recruit AI to optimize their
          applications and get hired faster.
        </p>
        <p className="text-white/60 text-sm mb-10 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          Users report 3x more interview callbacks on average
        </p>
        <Button
          variant="secondary"
          size="xl"
          className="bg-white text-primary hover:bg-gray-100"
          asChild
        >
          <Link href="/free-test">Start for free today</Link>
        </Button>
      </div>
    </section>
  );
}
