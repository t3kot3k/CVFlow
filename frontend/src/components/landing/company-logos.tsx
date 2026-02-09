"use client";

const companies = ["GOOGLE", "AMAZON", "DELOITTE", "MICROSOFT", "TESLA", "APPLE"];

export function CompanyLogos() {
  return (
    <section className="bg-white dark:bg-background-dark/50 py-10 border-y border-gray-100 dark:border-gray-800">
      <div className="px-6 lg:px-40 max-w-[1280px] mx-auto">
        <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
          Our users have been hired by*
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale">
          {companies.map((company) => (
            <span key={company} className="text-xl md:text-2xl font-black italic">
              {company}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-6">
          *Based on self-reported data from Recruit AI users
        </p>
      </div>
    </section>
  );
}
