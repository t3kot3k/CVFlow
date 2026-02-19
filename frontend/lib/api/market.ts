import { request } from "./client";

export interface SalaryData {
  min_salary: number;
  max_salary: number;
  median: number;
  p25: number;
  p75: number;
  user_low?: number;
  user_high?: number;
  currency: string;
}

export interface SkillDemand {
  name: string;
  demand: number;
  have: boolean;
}

export interface CompetitionData {
  competition_pct: number;
  avg_applications: number;
  top_pct_interviews: number;
  estimated_rank_before?: number;
  estimated_rank_after?: number;
}

export interface CountryComparison {
  name: string;
  salary: string;
  demand: string;
  cost_adjusted: string;
  tip: string;
}

export interface MarketInsight {
  title: string;
  description: string;
  category: string;
}

export const marketApi = {
  getSalary: (role: string, country: string, city?: string, experience?: string) => {
    const params = new URLSearchParams({ role, country });
    if (city) params.set("city", city);
    if (experience) params.set("experience", experience);
    return request<SalaryData>(`/market/salary?${params}`);
  },

  getSkills: (role: string, country?: string) => {
    const params = new URLSearchParams({ role });
    if (country) params.set("country", country);
    return request<SkillDemand[]>(`/market/skills?${params}`);
  },

  getCompetition: (role: string, country: string) =>
    request<CompetitionData>(`/market/competition?role=${role}&country=${country}`),

  getCountries: (role: string) =>
    request<CountryComparison[]>(`/market/countries?role=${role}`),

  getInsights: () => request<MarketInsight[]>("/market/insights"),
};
