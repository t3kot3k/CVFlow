"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="px-6 lg:px-40 py-20">
      <div className="max-w-[1280px] mx-auto bg-primary rounded-3xl p-12 text-center text-white">
        <h2 className="text-4xl font-black mb-6">Ready to land your next job?</h2>
        <p className="text-white/80 text-lg mb-10 max-w-[600px] mx-auto">
          Join thousands of job seekers who use Recruit AI to track their
          applications and get hired faster.
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
