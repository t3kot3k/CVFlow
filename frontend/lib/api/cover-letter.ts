import { request, download } from "./client";

export type CoverLetterTone = "professional" | "enthusiastic" | "concise" | "creative";
export type CoverLetterFormat = "us" | "french" | "international";

export interface CoverLetterContent {
  id?: string;
  cv_id: string;
  paragraphs: string[];
  tone: CoverLetterTone;
  format: CoverLetterFormat;
  language: string;
  word_count: number;
  created_at?: string;
}

export interface CoverLetterVersion {
  id: string;
  tone: string;
  created_at: string;
}

export const coverLetterApi = {
  generate: (data: {
    cv_id: string;
    job_description: string;
    tone?: CoverLetterTone;
    format?: CoverLetterFormat;
    language?: string;
    custom_instructions?: string;
  }) =>
    request<CoverLetterContent>("/cover-letter/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  rewriteParagraph: (paragraphIndex: number, currentText: string, tone = "professional", instructions?: string) =>
    request<{ rewritten_text: string }>("/cover-letter/rewrite-paragraph", {
      method: "POST",
      body: JSON.stringify({
        paragraph_index: paragraphIndex,
        current_text: currentText,
        tone,
        instructions,
      }),
    }),

  saveVersion: (clId: string) =>
    request<CoverLetterVersion>(`/cover-letter/${clId}/save-version`, {
      method: "POST",
    }),

  listVersions: (clId: string) =>
    request<CoverLetterVersion[]>(`/cover-letter/${clId}/versions`),

  download: (paragraphs: string[], format: "pdf" | "docx" = "pdf", tone = "professional", letterFormat = "us") =>
    download("/cover-letter/download", {
      method: "POST",
      body: JSON.stringify({ paragraphs, format, tone, letter_format: letterFormat }),
    }),
};
