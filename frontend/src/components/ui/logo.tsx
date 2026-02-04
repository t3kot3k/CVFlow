"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: "size-6", text: "text-lg" },
    md: { icon: "size-8", text: "text-xl" },
    lg: { icon: "size-10", text: "text-2xl" },
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2 text-primary", className)}>
      <div className={sizes[size].icon}>
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {showText && (
        <h2
          className={cn(
            "text-[#0e121b] dark:text-white font-bold leading-tight tracking-tight",
            sizes[size].text
          )}
        >
          Recruit AI
        </h2>
      )}
    </Link>
  );
}
