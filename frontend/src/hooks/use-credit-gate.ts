"use client";

import { useState, useCallback } from "react";
import { useCredits } from "@/contexts/credits-context";

type ActionType =
  | "ats_cv_analysis"
  | "cv_optimization"
  | "cv_download"
  | "cv_regeneration"
  | "cover_letter"
  | "ai_headshot"
  | "send_cv_email"
  | "email_tracking";

interface CreditGateState {
  showPaywall: boolean;
  paywallProps: {
    actionName: string;
    creditsRequired: number;
    coveredByPro: boolean;
  };
  closePaywall: () => void;
  gateAction: (
    action: ActionType,
    actionLabel: string,
    onAllowed: () => void
  ) => Promise<void>;
}

export function useCreditGate(): CreditGateState {
  const { checkAction, refreshBalance } = useCredits();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallProps, setPaywallProps] = useState({
    actionName: "",
    creditsRequired: 0,
    coveredByPro: false,
  });

  const closePaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);

  const gateAction = useCallback(
    async (
      action: ActionType,
      actionLabel: string,
      onAllowed: () => void
    ) => {
      try {
        const result = await checkAction(action);

        if (result.allowed) {
          onAllowed();
          // Refresh balance after action (credits may have been deducted server-side)
          setTimeout(() => refreshBalance(), 1000);
        } else {
          setPaywallProps({
            actionName: actionLabel,
            creditsRequired: result.credits_required,
            coveredByPro: result.covered_by_pro,
          });
          setShowPaywall(true);
        }
      } catch {
        // On error, let the action proceed (fail-open for UX)
        onAllowed();
      }
    },
    [checkAction, refreshBalance]
  );

  return { showPaywall, paywallProps, closePaywall, gateAction };
}
