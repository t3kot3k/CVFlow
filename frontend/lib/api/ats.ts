import { request, download } from "./client";

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

export interface ATSAnalysisResult {
  overall_score: number;
  breakdown: ScoreBreakdown[];
  missing_keywords: string[];
  present_keywords: string[];
  suggestions: string[];
  diff_changes: DiffChange[];
  keyword_match_pct: number;
}

export interface JobPostingData {
  title?: string;
  company?: string;
  location?: string;
  description: string;
  requirements: string[];
}

export const atsApi = {
  analyze: (cvId: string, jobDescription: string) =>
    request<ATSAnalysisResult>("/ats/analyze", {
      method: "POST",
      body: JSON.stringify({ cv_id: cvId, job_description: jobDescription }),
    }),

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

  downloadTailored: (cvId: string, jobDescription: string) =>
    download("/ats/download-tailored", {
      method: "POST",
      body: JSON.stringify({ cv_id: cvId, job_description: jobDescription }),
    }),
};
