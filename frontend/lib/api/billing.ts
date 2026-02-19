import { request } from "./client";

export interface UsageItem {
  label: string;
  used: number;
  limit: string;
  pct: number;
  remaining?: number;
}

export interface CurrentPlan {
  plan: "free" | "starter" | "pro";
  price: number;
  billing_cycle: string;
  next_billing_date?: string;
  features: string[];
  usage: UsageItem[];
  usage_reset_date?: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  pdf_url?: string;
}

export const billingApi = {
  getPlan: () => request<CurrentPlan>("/billing/plan"),

  createCheckout: (plan: "starter" | "pro", billingCycle: "monthly" | "yearly" = "monthly") =>
    request<{ checkout_url: string; session_id: string }>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan, billing_cycle: billingCycle }),
    }),

  getHistory: () => request<Invoice[]>("/billing/history"),

  createPortal: () =>
    request<{ portal_url: string }>("/billing/portal", { method: "POST" }),
};
