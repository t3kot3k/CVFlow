"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/contexts/credits-context";
import { creditsApi, subscriptionApi } from "@/lib/api/client";

type CreditPackId = "pack_5" | "pack_15" | "pack_40";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName: string;
  creditsRequired: number;
  coveredByPro: boolean;
}

const CREDIT_PACKS: {
  id: CreditPackId;
  credits: number;
  price: string;
  perCredit: string;
}[] = [
  { id: "pack_5", credits: 5, price: "$4.99", perCredit: "$1.00" },
  { id: "pack_15", credits: 15, price: "$12.99", perCredit: "$0.87" },
  { id: "pack_40", credits: 40, price: "$29.99", perCredit: "$0.75" },
];

export function PaywallModal({
  isOpen,
  onClose,
  actionName,
  creditsRequired,
  coveredByPro,
}: PaywallModalProps) {
  const { credits } = useCredits();
  const [purchasing, setPurchasing] = useState(false);

  if (!isOpen) return null;

  const handlePurchaseCredits = async (packId: CreditPackId) => {
    setPurchasing(true);
    try {
      const response = await creditsApi.purchase(
        packId,
        `${window.location.origin}/dashboard/settings?credits=success`,
        window.location.href
      );
      window.location.href = response.checkout_url;
    } catch {
      setPurchasing(false);
    }
  };

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      const response = await subscriptionApi.createCheckout(
        `${window.location.origin}/dashboard/settings?subscription=success`,
        window.location.href
      );
      window.location.href = response.checkout_url;
    } catch {
      setPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c2231] rounded-2xl max-w-lg w-full p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span
            className="material-symbols-outlined text-5xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            token
          </span>
          <h3 className="text-xl font-bold">Credits Required</h3>
          <p className="text-sm text-[#4d6599] dark:text-gray-400">
            <strong>{actionName}</strong> requires{" "}
            {creditsRequired} credit{creditsRequired > 1 ? "s" : ""}.
            You have <strong>{credits}</strong> remaining.
          </p>
        </div>

        {/* Option 1: Subscribe (if action is Pro-coverable) */}
        {coveredByPro && (
          <div className="border-2 border-primary rounded-xl p-6 text-center space-y-3">
            <Badge variant="info">BEST VALUE</Badge>
            <h4 className="font-bold text-lg">Recruit AI Pro - $19/month</h4>
            <p className="text-sm text-[#4d6599] dark:text-gray-400">
              Unlimited CV generation, cover letters, downloads, and email sending.
            </p>
            <Button
              className="w-full"
              onClick={handleSubscribe}
              disabled={purchasing}
              isLoading={purchasing}
            >
              Subscribe to Pro
            </Button>
          </div>
        )}

        {/* Option 2: Buy credits */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-center text-[#4d6599] dark:text-gray-400">
            {coveredByPro ? "Or buy credit packs:" : "Buy credit packs:"}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {CREDIT_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handlePurchaseCredits(pack.id)}
                disabled={purchasing}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary transition-colors text-center space-y-1 disabled:opacity-50"
              >
                <p className="text-2xl font-black">{pack.credits}</p>
                <p className="text-xs text-[#4d6599] dark:text-gray-400">credits</p>
                <p className="text-sm font-bold text-primary">{pack.price}</p>
                <p className="text-[10px] text-gray-400">{pack.perCredit}/credit</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
