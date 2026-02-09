"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";

interface MonetizationStatus {
  plan: "free" | "premium";
  subscription_status: string;
  credits: number;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface ActionCheckResponse {
  allowed: boolean;
  reason: string;
  credits_required: number;
  credits_remaining: number;
  covered_by_pro: boolean;
}

type ActionType =
  | "ats_cv_analysis"
  | "cv_optimization"
  | "cv_download"
  | "cv_regeneration"
  | "cover_letter"
  | "ai_headshot"
  | "send_cv_email"
  | "email_tracking";

interface CreditsContextType {
  credits: number;
  plan: "free" | "premium";
  isPremium: boolean;
  loading: boolean;
  refreshBalance: () => Promise<void>;
  checkAction: (action: ActionType) => Promise<ActionCheckResponse>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile } = useAuth();
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(true);

  const refreshBalance = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { monetizationApi } = await import("@/lib/api/client");
      const status: MonetizationStatus = await monetizationApi.getStatus();
      setCredits(status.credits);
      setPlan(status.plan);
    } catch (error) {
      console.error("Failed to fetch monetization status:", error);
    }
  }, [isAuthenticated]);

  // Sync from Firestore profile snapshot (immediate, real-time)
  useEffect(() => {
    if (profile) {
      setCredits(profile.credits ?? 0);
      setPlan(profile.plan ?? "free");
      setLoading(false);
    } else if (!isAuthenticated) {
      setCredits(0);
      setPlan("free");
      setLoading(false);
    }
  }, [profile, isAuthenticated]);

  // Also fetch from API for authoritative data
  useEffect(() => {
    if (isAuthenticated) {
      refreshBalance().finally(() => setLoading(false));
    }
  }, [isAuthenticated, refreshBalance]);

  const checkAction = useCallback(
    async (action: ActionType): Promise<ActionCheckResponse> => {
      const { creditsApi } = await import("@/lib/api/client");
      return creditsApi.checkAction(action);
    },
    []
  );

  const value: CreditsContextType = {
    credits,
    plan,
    isPremium: plan === "premium",
    loading,
    refreshBalance,
    checkAction,
  };

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
}
