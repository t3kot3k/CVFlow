import { create } from "zustand";
import type { CVAnalysisResult } from "@/lib/api/client";

interface CVStore {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  cvFile: File | null;
  analysisResult: CVAnalysisResult | null;

  setJobTitle: (v: string) => void;
  setCompanyName: (v: string) => void;
  setJobDescription: (v: string) => void;
  setCvFile: (f: File | null) => void;
  setAnalysisResult: (r: CVAnalysisResult | null) => void;
  reset: () => void;
}

export const useCVStore = create<CVStore>((set) => ({
  jobTitle: "",
  companyName: "",
  jobDescription: "",
  cvFile: null,
  analysisResult: null,

  setJobTitle: (v) => set({ jobTitle: v }),
  setCompanyName: (v) => set({ companyName: v }),
  setJobDescription: (v) => set({ jobDescription: v }),
  setCvFile: (f) => set({ cvFile: f }),
  setAnalysisResult: (r) => set({ analysisResult: r }),
  reset: () =>
    set({
      jobTitle: "",
      companyName: "",
      jobDescription: "",
      cvFile: null,
      analysisResult: null,
    }),
}));
