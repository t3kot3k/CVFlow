import { Leaf } from "lucide-react"

const footerLinks = {
  Product: [
    "CV Builder", "ATS Score", "Job Tracker", "Interview Prep",
    "LinkedIn Optimizer", "Templates", "Pricing",
  ],
  Company: [
    "About", "Blog", "Research", "Press", "Careers",
    "For Universities", "For Agencies",
  ],
  Support: [
    "Help Center", "Contact us", "Privacy Policy", "Terms",
    "Status page", "GDPR",
  ],
}

const languages = [
  "\u{1F1EB}\u{1F1F7}", "\u{1F1EC}\u{1F1E7}", "\u{1F1F8}\u{1F1F3}", "\u{1F1F2}\u{1F1E6}",
  "\u{1F1E9}\u{1F1FF}", "\u{1F1EE}\u{1F1F3}", "\u{1F1E7}\u{1F1F7}", "\u{1F1E9}\u{1F1EA}", "\u{1F1EF}\u{1F1F5}",
]

export function Footer() {
  return (
    <footer className="bg-[#283618] px-6 pb-8 pt-16 text-[#fefae0]">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-[#606c38]" />
              <span className="text-xl font-bold text-[#fefae0]">CVFlow</span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-[#fefae0]/60">
              The CV builder built for the whole world.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {languages.map((flag, i) => (
                <span key={i} className="text-lg" aria-hidden="true">{flag}</span>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#fefae0]/40">Available in 10+ languages</p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-[#fefae0]">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#fefae0]/60 transition-colors hover:text-[#fefae0]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-[#fefae0]/60">
            {"\u00A9"} 2026 CVFlow. All rights reserved.
          </p>
          <p className="text-sm text-[#fefae0]/60">
            Made for job seekers worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
