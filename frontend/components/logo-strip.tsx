"use client"

const companies = [
  "Google", "Deloitte", "Orange Telecom", "MTN", "Soci\u00e9t\u00e9 G\u00e9n\u00e9rale",
  "Amazon", "Total Energies", "Capgemini", "PwC", "Huawei", "Nestl\u00e9", "Airbus",
]

export function LogoStrip() {
  return (
    <section className="border-y border-[#606c38]/10 bg-white py-8 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-6 text-sm font-medium text-[#606c38]">
          Our users got hired at:
        </p>
      </div>
      <div className="relative">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {[...companies, ...companies].map((company, i) => (
            <span
              key={i}
              className="text-lg font-bold tracking-wide text-[#283618]/25 select-none transition-colors hover:text-[#283618]/50"
            >
              {company}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
