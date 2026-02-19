import { request } from "./client";

export type InterviewType = "behavioral" | "technical" | "case" | "cultural";

export interface ChatMessage {
  id: number;
  role: "system" | "ai-question" | "user" | "ai-feedback" | "next-prompt";
  content: string;
  question_number?: number;
  question_type?: string;
  scores?: { overall: number; content: number; clarity: number };
  strengths?: string[];
  improvements?: string[];
  model_answer?: string;
  star_tip?: boolean;
}

export interface InterviewSession {
  id: string;
  cv_id: string;
  job_title?: string;
  company?: string;
  interview_type: InterviewType;
  difficulty: number;
  total_questions: number;
  current_question: number;
  status: "active" | "ended";
  messages: ChatMessage[];
  created_at: string;
}

export interface SessionSummary {
  id: string;
  job_title?: string;
  company?: string;
  interview_type: InterviewType;
  score?: number;
  created_at: string;
}

export interface SessionReport {
  session_id: string;
  overall_score: number;
  performance: Record<string, number>;
  best_answer?: string;
  areas_for_improvement: string[];
  total_questions: number;
  answered_questions: number;
}

export const interviewApi = {
  start: (data: {
    cv_id: string;
    job_title?: string;
    company?: string;
    interview_type?: InterviewType;
    difficulty?: number;
    session_length?: number;
    language?: string;
  }) =>
    request<InterviewSession>("/interview/start", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  answer: (sessionId: string, answer: string) =>
    request<ChatMessage>(`/interview/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  end: (sessionId: string) =>
    request<SessionReport>(`/interview/${sessionId}/end`, { method: "POST" }),

  listSessions: () => request<SessionSummary[]>("/interview/sessions"),

  getReport: (sessionId: string) =>
    request<SessionReport>(`/interview/${sessionId}/report`),
};
