"use client";

const steps = [
  {
    icon: "upload_file",
    title: "Upload Your CV",
    description:
      "Upload your current CV. Our AI parser extracts your experience and skills instantly.",
  },
  {
    icon: "auto_fix_high",
    title: "AI Optimization",
    description:
      "Our AI scans for keywords and ensures 100% ATS compatibility for your target job role.",
  },
  {
    icon: "track_changes",
    title: "Send, Track & Follow Up",
    description:
      "Send your optimized CV and track when recruiters open your application to follow up at the perfect time.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 lg:px-40 py-20 bg-primary/5" id="how-it-works">
      <div className="max-w-[960px] mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">How it works</h2>

        <div className="grid grid-cols-[40px_1fr] gap-x-6">
          {steps.map((step, index) => (
            <div key={step.title} className="contents">
              {/* Timeline */}
              <div className="flex flex-col items-center gap-1">
                {index > 0 && (
                  <div className="w-[2px] bg-primary/20 h-4" />
                )}
                <div className="text-primary bg-white dark:bg-background-dark p-2 rounded-full border-2 border-primary">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-[2px] bg-primary/20 h-24 grow" />
                )}
              </div>

              {/* Content */}
              <div className={`flex flex-1 flex-col py-3 ${index === 0 ? "pt-3" : ""}`}>
                <p className="text-xl font-bold mb-2">{step.title}</p>
                <p className="text-[#4d6599] dark:text-gray-400 text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
