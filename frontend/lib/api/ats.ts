import { request, download, ApiError } from "./client";
import { getIdToken } from "@/lib/firebase";

export interface ScoreBreakdown {
  label: string;
  score: number;
  icon: string;
}

export interface DiffChange {
  section: string;
  before: string;
  after: string;
}

export interface ComparisonItem {
  requirement: string;
  cv_value: string;
  status: "match" | "missing" | "partial";
}

export interface ATSAnalysisResult {
  overall_score: number;
  breakdown: ScoreBreakdown[];
  missing_keywords: string[];
  present_keywords: string[];
  suggestions: string[];
  diff_changes: DiffChange[];
  keyword_match_pct: number;
  comparison: ComparisonItem[];
}

export interface JobPostingData {
  title?: string;
  company?: string;
  location?: string;
  description: string;
  requirements: string[];
}

export const atsApi = {
  /**
   * Calls the Next.js Route Handler at /api/ats-analyze (not the rewrites proxy)
   * to avoid ECONNRESET / socket hang-up during long Gemini AI calls.
   */
  analyze: async (cvId: string, jobDescription: string): Promise<ATSAnalysisResult> => {
    const token = await getIdToken();
    const res = await fetch("/api/ats-analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ cv_id: cvId, job_description: jobDescription }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const detail = data?.detail;
      const message =
        typeof detail === "string" ? detail
        : Array.isArray(detail) ? detail.map((e: { msg?: string }) => e?.msg ?? JSON.stringify(e)).join("; ")
        : detail ? JSON.stringify(detail)
        : "ATS analysis failed";
      throw new ApiError(message, res.status, data);
    }
    return data as ATSAnalysisResult;
  },

  applyChanges: (cvId: string, acceptedChanges: number[], addedKeywords: string[]) =>
    request<{ message: string; cv: unknown }>("/ats/apply-changes", {
      method: "POST",
      body: JSON.stringify({
        cv_id: cvId,
        accepted_changes: acceptedChanges,
        added_keywords: addedKeywords,
      }),
    }),

  fetchJob: (url: string) =>
    request<JobPostingData>("/ats/fetch-job", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),

  downloadTailored: (cvId: string) =>
    download(`/ats/download-tailored?cv_id=${encodeURIComponent(cvId)}`),

  downloadOptimized: (
    cvId: string,
    diffChanges: DiffChange[],
    acceptedChanges: number[],
    addedKeywords: string[],
  ) =>
    download("/ats/download-optimized", {
      method: "POST",
      body: JSON.stringify({
        cv_id: cvId,
        diff_changes: diffChanges,
        accepted_changes: acceptedChanges,
        added_keywords: addedKeywords,
      }),
    }),
};
