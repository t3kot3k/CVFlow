"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

export function ProtectedRoute({ children, requirePremium = false }: ProtectedRouteProps) {
  const { user, loading, isPremium } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && requirePremium && !isPremium) {
      router.push("/pricing");
    }
  }, [user, loading, isPremium, requirePremium, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requirePremium && !isPremium) {
    return null;
  }

  return <>{children}</>;
}
