import { request } from "./client";

export interface TemplatePreview {
  accent: string;
  has_sidebar: boolean;
  has_photo: boolean;
  header_style: string;
}

export interface Template {
  id: string;
  name: string;
  region: string;
  style: string;
  layout: string;
  features: string[];
  industry: string;
  uses: number;
  ats_compatible: boolean;
  description: string;
  colors: string[];
  preview?: TemplatePreview;
}

export const templatesApi = {
  list: (filters?: {
    region?: string;
    style?: string;
    layout?: string;
    features?: string;
    industry?: string;
    search?: string;
    sort?: "popular" | "name";
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
    }
    const qs = params.toString();
    return request<{ templates: Template[]; total: number }>(
      `/templates/${qs ? `?${qs}` : ""}`,
      { authenticated: false }
    );
  },

  get: (id: string) =>
    request<Template>(`/templates/${id}`, { authenticated: false }),
};
