import { request } from "./client";

export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  country: string;
  city?: string;
  phone?: string;
  profile_image?: string;
  plan: "free" | "starter" | "pro";
  plan_expires?: string;
  created_at?: string;
}

export interface UserPreferences {
  auto_save: boolean;
  ats_tips: boolean;
  ai_suggestions: boolean;
  language: string;
  cv_language: string;
  date_format: string;
  currency: string;
}

export const usersApi = {
  getProfile: () => request<UserProfile>("/users/profile"),

  updateProfile: (data: Partial<Omit<UserProfile, "uid" | "email" | "plan">>) =>
    request<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getPreferences: () => request<UserPreferences>("/users/preferences"),

  updatePreferences: (data: Partial<UserPreferences>) =>
    request<UserPreferences>("/users/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  exportData: () =>
    request<Record<string, unknown>>("/users/export-data", { method: "POST" }),

  deleteAccount: () =>
    request<void>("/users/account", { method: "DELETE" }),
};

export const onboardingApi = {
  save: (data: { situation: string; country: string; industries: string[] }) =>
    request<{ saved: boolean }>("/onboarding/save", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getStatus: () =>
    request<{ completed: boolean; situation?: string; country?: string; industries?: string[] }>(
      "/onboarding/status"
    ),

  parsePdf: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ text: string; structured_data?: Record<string, unknown> }>(
      "/onboarding/parse-pdf",
      { method: "POST", body: formData }
    );
  },
};
