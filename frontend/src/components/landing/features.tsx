"use client";

const features = [
  {
    icon: "psychology",
    title: "ATS Optimization",
    description:
      "Scan your CV against job descriptions to find keyword gaps and formatting errors.",
  },
  {
    icon: "edit_note",
    title: "Cover Letter Gen",
    description:
      "Automatically generate professional, tailored cover letters that match the job role perfectly.",
  },
  {
    icon: "face",
    title: "Photo Enhancement",
    description:
      "Transform casual selfies into professional LinkedIn-ready headshots using our AI engine.",
  },
  {
    icon: "monitoring",
    title: "Application Tracking",
    description:
      "Get insights into recruiter engagement with real-time tracking for CV views and email opens.",
  },
];

export function Features() {
  return (
    <section className="px-6 lg:px-40 py-20" id="features">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Benefits</h2>
          <p className="text-[#4d6599] dark:text-gray-400">
            Everything you need to land your dream job in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-8 bg-white dark:bg-[#1c2231] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary transition-colors"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-[#4d6599] dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
