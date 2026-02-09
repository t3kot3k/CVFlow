"use client";

const features = [
  {
    icon: "query_stats",
    title: "ATS Optimization",
    description:
      "Scan your CV against job descriptions to find keyword gaps, formatting errors, and get a detailed ATS compatibility score.",
  },
  {
    icon: "mail",
    title: "Cover Letter Gen",
    description:
      "Automatically generate professional, tailored cover letters that match the job role. Choose between 3 tones: professional, friendly, or bold.",
  },
  {
    icon: "photo_camera",
    title: "Photo Enhancement",
    description:
      "Transform casual selfies into professional LinkedIn-ready headshots using our AI engine. Perfect lighting, background, and composition.",
  },
  {
    icon: "notifications_active",
    title: "Application Tracking",
    description:
      "Get insights into recruiter engagement with real-time tracking for CV views, email opens, and follow-up reminders.",
  },
];

export function Features() {
  return (
    <section className="px-6 lg:px-40 py-20" id="features">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to get hired faster
          </h2>
          <p className="text-[#4d6599] dark:text-gray-400 max-w-[600px] mx-auto">
            Powerful AI tools designed to give you an unfair advantage in your
            job search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-8 bg-white dark:bg-[#1c2231] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary hover:shadow-md transition-all duration-300"
            >
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center text-primary mb-6">
                <span
                  className="material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
                >
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-[#4d6599] dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
