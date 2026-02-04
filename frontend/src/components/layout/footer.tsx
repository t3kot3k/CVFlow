"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const footerLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact Us" },
];

export function Footer() {
  return (
    <footer className="px-6 lg:px-40 py-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-background-dark">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <Logo size="sm" />

        <div className="flex gap-8 text-sm text-[#4d6599] font-medium">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="size-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Twitter"
          >
            <span className="material-symbols-outlined text-sm">public</span>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="size-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="LinkedIn"
          >
            <span className="material-symbols-outlined text-sm">share</span>
          </a>
        </div>
      </div>

      <div className="text-center mt-12 text-xs text-gray-400">
        © {new Date().getFullYear()} Recruit AI Inc. All rights reserved.
      </div>
    </footer>
  );
}
