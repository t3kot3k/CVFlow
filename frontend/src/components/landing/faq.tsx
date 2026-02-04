"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does CV tracking work?",
    answer:
      "We provide a unique tracking link or invisible pixel for your application documents. When a recruiter opens your file or email, you receive an instant notification in your dashboard.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Absolutely. We encrypt all uploaded documents and tracking data. We never share your personal information or application history with third parties.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your Premium subscription at any time. You will retain access to your tracking dashboard until the end of your billing cycle.",
  },
  {
    question: "What file formats are supported?",
    answer:
      "We support PDF and DOCX files for CV uploads. For best results, we recommend using PDF format as it preserves formatting across all devices.",
  },
  {
    question: "How accurate is the ATS analysis?",
    answer:
      "Our AI has been trained on thousands of job descriptions and CVs. We achieve 95%+ accuracy in keyword matching and formatting checks used by major ATS systems.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="px-6 lg:px-40 py-20 bg-white dark:bg-background-dark"
      id="faq"
    >
      <div className="max-w-[800px] mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="border-b border-gray-100 dark:border-gray-800 pb-4"
            >
              <button
                className="w-full text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h4 className="text-lg font-bold mb-2 flex justify-between items-center cursor-pointer hover:text-primary transition-colors">
                  {faq.question}
                  <span
                    className={cn(
                      "material-symbols-outlined transition-transform duration-200",
                      openIndex === index && "rotate-180"
                    )}
                  >
                    expand_more
                  </span>
                </h4>
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <p className="text-[#4d6599] dark:text-gray-400">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
