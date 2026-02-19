import { request } from "./client";

export interface SectionSuggestion {
  text: string;
  boost: string;
}

export interface LinkedInSection {
  id: string;
  label: string;
  score: number;
  current: string;
  weaknesses: string[];
  suggestions: SectionSuggestion[];
}

export interface LinkedInAnalysis {
  base_score: number;
  sections: LinkedInSection[];
  missing_skills: string[];
  quick_wins: string[];
}

export const linkedinApi = {
  import: (data: { url?: string; text?: string }) =>
    request<Record<string, unknown>>("/linkedin/import", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  analyze: (profileData: Record<string, unknown>) =>
    request<LinkedInAnalysis>("/linkedin/analyze", {
      method: "POST",
      body: JSON.stringify(profileData),
    }),

  generateSuggestions: (sectionId: string, currentContent: string, targetRole?: string) =>
    request<SectionSuggestion[]>("/linkedin/generate-suggestions", {
      method: "POST",
      body: JSON.stringify({
        section_id: sectionId,
        current_content: currentContent,
        target_role: targetRole,
      }),
    }),
};
