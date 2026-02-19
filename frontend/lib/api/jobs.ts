import { request } from "./client";

export type JobStage = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface JobDetail {
  id: string;
  company: string;
  role: string;
  location?: string;
  job_url?: string;
  stage: JobStage;
  salary?: string;
  tags: string[];
  interview_date?: string;
  interview_type?: string;
  cv_id?: string;
  ats_match?: number;
  days_waiting?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface JobStats {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  response_rate: number;
}

export interface TimelineEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
}

export const jobsApi = {
  list: () =>
    request<{ jobs: JobDetail[]; stats: JobStats }>("/jobs/"),

  create: (data: {
    company: string;
    role: string;
    location?: string;
    job_url?: string;
    stage?: JobStage;
    salary?: string;
    tags?: string[];
  }) =>
    request<JobDetail>("/jobs/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  importUrl: (url: string) =>
    request<JobDetail>("/jobs/import-url", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),

  get: (id: string) => request<JobDetail>(`/jobs/${id}`),

  update: (id: string, data: Partial<JobDetail>) =>
    request<JobDetail>(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/jobs/${id}`, { method: "DELETE" }),

  updateStage: (id: string, stage: JobStage) =>
    request<JobDetail>(`/jobs/${id}/stage`, {
      method: "PUT",
      body: JSON.stringify({ stage }),
    }),

  getNotes: (id: string) =>
    request<{ notes: string }>(`/jobs/${id}/notes`),

  updateNotes: (id: string, notes: string) =>
    request<{ notes: string }>(`/jobs/${id}/notes`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    }),

  getTimeline: (id: string) =>
    request<TimelineEvent[]>(`/jobs/${id}/timeline`),

  logActivity: (id: string, eventType: string, description: string) =>
    request<TimelineEvent>(`/jobs/${id}/timeline`, {
      method: "POST",
      body: JSON.stringify({ event_type: eventType, description }),
    }),
};
