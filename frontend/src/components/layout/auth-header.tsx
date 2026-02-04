"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function AuthHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <header className="w-full border-b border-solid border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-background-dark px-6 md:px-10 py-3">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
            {isLoginPage
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <Button asChild>
            <Link href={isLoginPage ? "/signup" : "/login"}>
              {isLoginPage ? "Sign up" : "Log in"}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
