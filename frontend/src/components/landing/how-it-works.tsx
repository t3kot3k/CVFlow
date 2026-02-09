"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: 1,
    image: "https://cvboost.co/images/step-1-choose-template.png",
    title: "Upload Your CV",
    description:
      "Upload your current CV in PDF or DOCX format. Our AI parser extracts your experience, skills, and qualifications instantly.",
  },
  {
    step: 2,
    image: "https://cvboost.co/images/step-2-complete-cv.png",
    title: "AI Analysis & Optimization",
    description:
      "Our AI scans for missing keywords, formatting issues, and ATS compatibility. Get a detailed score with actionable suggestions.",
  },
  {
    step: 3,
    image: "https://cvboost.co/images/step-3-personalize.png",
    title: "Generate Cover Letter",
    description:
      "Automatically generate a tailored cover letter matching the job description. Choose from professional, friendly, or bold tones.",
  },
  {
    step: 4,
    image: "https://cvboost.co/images/step-4-download.png",
    title: "Apply & Track Results",
    description:
      "Send your optimized application and track when recruiters open your CV or read your emails in real-time.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 lg:px-40 py-20 bg-primary/5" id="how-it-works">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Simple process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-[#4d6599] dark:text-gray-400 max-w-[600px] mx-auto">
            From upload to interview &mdash; four simple steps to optimize your
            job application with AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.step}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number badge */}
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mb-4 shadow-md">
                {step.step}
              </div>
              {/* Step image */}
              <div className="bg-white dark:bg-[#1c2231] w-full aspect-[4/3] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6 shadow-sm">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Text */}
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-[#4d6599] dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="xl" asChild>
            <Link href="/free-test">Start optimizing my CV</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
