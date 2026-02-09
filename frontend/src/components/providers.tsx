"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { CreditsProvider } from "@/contexts/credits-context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CreditsProvider>{children}</CreditsProvider>
    </AuthProvider>
  );
}
