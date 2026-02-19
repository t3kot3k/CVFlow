import { request, download } from "./client";

export interface CVSummary {
  id: string;
  title: string;
  template_id: string;
  ats_score: number | null;
  status: "draft" | "complete";
  created_at: string;
  updated_at: string;
}

export interface CVContent {
  contact_info?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    job_title: string;
    company: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    current?: boolean;
    bullets: string[];
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field?: string;
    graduation_date?: string;
    gpa?: string;
  }>;
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  projects?: Record<string, unknown>[];
  publications?: Record<string, unknown>[];
  volunteer?: Record<string, unknown>[];
  custom_sections?: Record<string, unknown>[];
}

export interface CVDetail extends CVSummary {
  content: CVContent;
}

export const cvApi = {
  list: () => request<CVSummary[]>("/cv/"),

  get: (id: string) => request<CVDetail>(`/cv/${id}`),

  create: (title = "Untitled CV", templateId = "olive") =>
    request<CVDetail>("/cv/", {
      method: "POST",
      body: JSON.stringify({ title, template_id: templateId }),
    }),

  update: (id: string, data: { title?: string; template_id?: string; content?: CVContent }) =>
    request<CVDetail>(`/cv/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  autoSave: (id: string, content: CVContent) =>
    request<{ saved: boolean }>(`/cv/${id}/auto-save`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  duplicate: (id: string) =>
    request<CVDetail>(`/cv/${id}/duplicate`, { method: "POST" }),

  delete: (id: string) =>
    request<void>(`/cv/${id}`, { method: "DELETE" }),

  downloadPreview: (id: string) =>
    download(`/cv/${id}/preview`),
};

export const cvAiApi = {
  improveText: (text: string, context: string, language = "en") =>
    request<{ improved_text: string }>("/cv/ai/improve-text", {
      method: "POST",
      body: JSON.stringify({ text, context, language }),
    }),

  generateSummary: (cvId: string, targetRole: string, language = "en") =>
    request<{ summary: string }>("/cv/ai/generate-summary", {
      method: "POST",
      body: JSON.stringify({ cv_id: cvId, target_role: targetRole, language }),
    }),

  suggestBullets: (jobTitle: string, company?: string, industry?: string) =>
    request<{ bullets: string[] }>("/cv/ai/suggest-bullets", {
      method: "POST",
      body: JSON.stringify({ job_title: jobTitle, company, industry }),
    }),
};
