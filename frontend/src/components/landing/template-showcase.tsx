"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const templates = [
  {
    name: "Executive",
    description: "Clean and authoritative for senior roles",
    image: "https://cvboost.co/images/cv-template-b-1.png",
    tag: "Popular",
  },
  {
    name: "Modern",
    description: "Contemporary design for tech and creative fields",
    image: "https://cvboost.co/images/cv-template-b-2.png",
    tag: "New",
  },
  {
    name: "Minimal",
    description: "Simple and elegant for any industry",
    image: "https://cvboost.co/images/cv-template-b-3.png",
    tag: null,
  },
  {
    name: "Professional",
    description: "Traditional layout trusted by Fortune 500 recruiters",
    image: "https://cvboost.co/images/cv-template-b-4.png",
    tag: "Classic",
  },
];

export function TemplateShowcase() {
  return (
    <section className="px-6 lg:px-40 py-20" id="templates">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-4">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Recruiter-approved templates
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose your professional CV template
          </h2>
          <p className="text-[#4d6599] dark:text-gray-400 max-w-[600px] mx-auto">
            Every template is designed and tested to pass Applicant Tracking
            Systems used by top employers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {templates.map((template) => (
            <div
              key={template.name}
              className="group relative bg-white dark:bg-[#1c2231] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Real CV template image */}
              <div className="aspect-[3/4] relative bg-gray-50 dark:bg-gray-900">
                <Image
                  src={template.image}
                  alt={`${template.name} CV template`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {template.tag && (
                  <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    {template.tag}
                  </span>
                )}
              </div>

              {/* Template info */}
              <div className="p-4">
                <h3 className="font-bold text-sm mb-1">{template.name}</h3>
                <p className="text-xs text-[#4d6599] dark:text-gray-400">
                  {template.description}
                </p>
              </div>

              {/* Hover overlay CTA */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  className="bg-white text-[#0e121b] hover:bg-gray-100 font-bold"
                  asChild
                >
                  <Link href="/free-test">Use this template</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/templates">
              View all templates
              <span className="material-symbols-outlined text-sm ml-1">
                arrow_forward
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
