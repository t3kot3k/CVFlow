"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { cvApi, subscriptionApi } from "@/lib/api/client";
import type { CVAnalysisResult, OptimizedCV } from "@/lib/api/client";
import { useCVStore } from "@/stores/cv-store";

/* ------------------------------------------------------------------ */
/*  Templates                                                          */
/* ------------------------------------------------------------------ */
const templates = [
  { id: "classic", label: "Classic", icon: "article" },
  { id: "minimalist", label: "Minimalist", icon: "view_agenda" },
  { id: "executive", label: "Executive", icon: "workspace_premium" },
] as const;

/* ------------------------------------------------------------------ */
/*  Score helpers                                                      */
/* ------------------------------------------------------------------ */
const strokeColor = (s: number) =>
  s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444";
const scoreTxt = (s: number) =>
  s >= 80 ? "text-green-600" : s >= 60 ? "text-amber-500" : "text-red-500";
const scoreBg = (s: number) =>
  s >= 80 ? "bg-green-50" : s >= 60 ? "bg-amber-50" : "bg-red-50";
const priorityColor = (p: string) => {
  const l = p.toLowerCase();
  if (l === "high") return "bg-red-100 text-red-700";
  if (l === "medium") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
};

/* ------------------------------------------------------------------ */
/*  Tabs for analysis sections                                         */
/* ------------------------------------------------------------------ */
type AnalysisTab =
  | "overview"
  | "keywords"
  | "experience"
  | "skills"
  | "formatting"
  | "suggestions";

const analysisTabs: { id: AnalysisTab; label: string; icon: string }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: "dashboard" },
  { id: "keywords", label: "Mots-clés", icon: "key" },
  { id: "experience", label: "Expérience", icon: "work" },
  { id: "skills", label: "Compétences", icon: "psychology" },
  { id: "formatting", label: "Formatage ATS", icon: "format_list_bulleted" },
  { id: "suggestions", label: "Optimisations", icon: "auto_fix_high" },
];

/* ------------------------------------------------------------------ */
/*  Three-step navigation                                              */
/* ------------------------------------------------------------------ */
type Step = "input" | "result" | "optimization";

/* ------------------------------------------------------------------ */
/*  Progression panel steps config                                     */
/* ------------------------------------------------------------------ */
interface ProgressionStep {
  icon: string;
  doneIcon: string;
  label: string;
  key: string;
}
const progressionSteps: ProgressionStep[] = [
  { icon: "upload_file", doneIcon: "check_circle", label: "Télécharger le CV", key: "upload" },
  { icon: "edit_note", doneIcon: "check_circle", label: "Description du poste", key: "jobdesc" },
  { icon: "analytics", doneIcon: "check_circle", label: "Analyse ATS", key: "analysis" },
  { icon: "auto_fix_high", doneIcon: "auto_fix_high", label: "Optimisation IA", key: "optimization" },
  { icon: "history", doneIcon: "history", label: "Analyse précédente", key: "previous" },
];

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function CVOptimizerPage() {
  const { isPremium, freeUsesRemaining } = useAuth();
  const setStoreJobDescription = useCVStore((s) => s.setJobDescription);
  const setStoreAnalysisResult = useCVStore((s) => s.setAnalysisResult);

  /* ---- navigation ---- */
  const [step, setStep] = useState<Step>("input");

  /* ---- core state ---- */
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysis, setAnalysis] = useState<CVAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");

  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState("");
  const [optimizedCV, setOptimizedCV] = useState<OptimizedCV | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [exporting, setExporting] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  /* ---- drag & drop ---- */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setFileName(f.name);
      setAnalysis(null);
      setOptimizedCV(null);
    }
  }, []);
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      setFile(f);
      if (f) {
        setFileName(f.name);
        setAnalysis(null);
        setOptimizedCV(null);
      }
    },
    []
  );
  const removeFile = useCallback(() => {
    setFile(null);
    setFileName("");
    setAnalysis(null);
    setOptimizedCV(null);
  }, []);

  /* ---- analyze ---- */
  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim()) {
      setAnalysisError("Veuillez télécharger un CV et coller une description de poste.");
      return;
    }
    if (jobDescription.trim().length < 50) {
      setAnalysisError("La description du poste doit contenir au moins 50 caractères.");
      return;
    }
    setAnalysisError("");
    setAnalyzing(true);
    setOptimizedCV(null);
    setAnalysis(null);

    try {
      const res = await cvApi.analyze(file, jobDescription);
      console.log("Gemini analysis result:", res);

      let fullResult: CVAnalysisResult;
      if ("id" in res && res.id) {
        fullResult = res as CVAnalysisResult;
      } else {
        fullResult = {
          id: "",
          user_id: "",
          matchScore: res.matchScore,
          scoreBreakdown: res.scoreBreakdown,
          matchedKeywords: res.matchedKeywords,
          missingKeywords: ("missingKeywords" in res ? res.missingKeywords : []) as CVAnalysisResult["missingKeywords"],
          experienceAlignment: ("experienceAlignment" in res ? res.experienceAlignment : { strongMatches: [], partialMatches: [], gaps: [] }) as CVAnalysisResult["experienceAlignment"],
          technicalSkillsAnalysis: ("technicalSkillsAnalysis" in res ? res.technicalSkillsAnalysis : { alignedSkills: [], missingCriticalSkills: [], recommendedAdditions: [] }) as CVAnalysisResult["technicalSkillsAnalysis"],
          softSkillsAnalysis: ("softSkillsAnalysis" in res ? res.softSkillsAnalysis : { alignedSoftSkills: [], missingSoftSkills: [] }) as CVAnalysisResult["softSkillsAnalysis"],
          atsFormattingCheck: ("atsFormattingCheck" in res ? res.atsFormattingCheck : { formatScore: 0, issuesDetected: [], recommendations: [] }) as CVAnalysisResult["atsFormattingCheck"],
          optimizationSuggestions: ("optimizationSuggestions" in res ? res.optimizationSuggestions : []) as CVAnalysisResult["optimizationSuggestions"],
          summary: res.summary,
          created_at: "",
        };
      }

      if (
        fullResult.matchScore === 0 &&
        fullResult.matchedKeywords.length === 0 &&
        fullResult.missingKeywords.length === 0 &&
        (!fullResult.summary || fullResult.summary === "Unable to analyze content.")
      ) {
        setAnalysisError(
          "L'analyse n'a pas pu extraire de données exploitables. " +
          "Vérifiez que le CV n'est pas une image scannée et que la description du poste est complète."
        );
        return;
      }

      setAnalysis(fullResult);
      setStoreJobDescription(jobDescription);
      setStoreAnalysisResult(fullResult);
      setActiveTab("overview");
      setStep("result");
    } catch (err: unknown) {
      console.error("CV analysis error:", err);
      const apiErr = err as { status?: number; message?: string; data?: { detail?: string } };
      const detail = apiErr?.data?.detail ?? apiErr?.message ?? "";

      if (apiErr?.status === 400 && /unable to read|file/i.test(detail)) {
        setAnalysisError("Impossible de lire le fichier CV. Assurez-vous qu\u2019il s\u2019agit d\u2019un PDF ou DOCX valide.");
      } else if (apiErr?.status === 400 && /too short/i.test(detail)) {
        setAnalysisError("Le texte extrait du CV est trop court. Le fichier est peut-être une image scannée.");
      } else if (apiErr?.status === 400) {
        setAnalysisError(detail || "Requête invalide. Vérifiez le fichier et la description du poste.");
      } else if (apiErr?.status === 422) {
        setAnalysisError(detail || "L'IA n'a pas pu analyser la réponse. Veuillez réessayer.");
      } else if (apiErr?.status === 504) {
        setAnalysisError("L\u2019analyse prend plus de temps que prévu. Veuillez réessayer.");
      } else if (apiErr?.status === 502) {
        setAnalysisError("Erreur du service IA. Veuillez réessayer dans un instant.");
      } else {
        setAnalysisError("Échec de l\u2019analyse. Vérifiez votre connexion et réessayez.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  /* ---- optimize ---- */
  const handleOptimize = async () => {
    if (!isPremium && freeUsesRemaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }
    if (!file) return;
    setOptimizing(true);
    setOptimizeError("");
    try {
      const res = await cvApi.optimize(file, jobDescription, analysis?.id);
      setOptimizedCV(res);
      setStep("optimization");
    } catch (err: unknown) {
      console.error("CV optimize error:", err);
      const apiErr = err as { status?: number; message?: string; data?: { detail?: string | { message?: string } } };
      const status = apiErr?.status;
      const detail =
        typeof apiErr?.data?.detail === "string"
          ? apiErr.data.detail
          : (apiErr?.data?.detail as { message?: string })?.message ?? apiErr?.message ?? "";

      if (status === 402) {
        setShowUpgradeModal(true);
      } else if (status === 401 || status === 403) {
        setOptimizeError("Vous devez être connecté pour optimiser votre CV.");
      } else if (status === 400) {
        setOptimizeError(detail || "Le fichier CV ou la description du poste est invalide.");
      } else if (status === 422) {
        setOptimizeError("L'IA n'a pas pu générer l'optimisation. Veuillez réessayer.");
      } else if (status === 504 || status === 408) {
        setOptimizeError("L'optimisation prend trop de temps. Veuillez réessayer.");
      } else {
        setOptimizeError(detail || "Échec de l'optimisation. Vérifiez votre connexion et réessayez.");
      }
    } finally {
      setOptimizing(false);
    }
  };

  /* ---- export ---- */
  const handleExportPdf = async () => {
    if (!optimizedCV) return;
    setExporting(true);
    try {
      const blob = await cvApi.exportPdf(optimizedCV, selectedTemplate);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName ? fileName.replace(/\.[^.]+$/, "") : "cv"}_optimized.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* silent */
    } finally {
      setExporting(false);
    }
  };

  /* ---- subscribe ---- */
  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const r = await subscriptionApi.createCheckout(
        `${window.location.origin}/cv-optimizer?subscription=success`,
        window.location.href
      );
      window.location.href = r.checkout_url;
    } catch {
      setSubscribing(false);
    }
  };

  /* ---- navigation helpers ---- */
  const handleBackToInput = () => {
    setStep("input");
  };
  const handleNewAnalysis = () => {
    setFile(null);
    setFileName("");
    setJobDescription("");
    setAnalysis(null);
    setOptimizedCV(null);
    setAnalysisError("");
    setActiveTab("overview");
    setStep("input");
  };

  const canAnalyze = !!file && jobDescription.trim().length >= 50;

  /* ---- progression state ---- */
  const getStepState = (key: string): "done" | "active" | "upcoming" => {
    switch (key) {
      case "upload":
        return file ? "done" : step === "input" ? "active" : "upcoming";
      case "jobdesc":
        return jobDescription.trim().length >= 50 ? "done" : step === "input" ? "active" : "upcoming";
      case "analysis":
        if (analysis) return "done";
        if (step === "input" && file && jobDescription.trim().length >= 50) return "active";
        return "upcoming";
      case "optimization":
        if (optimizedCV) return "done";
        if (step === "result") return "active";
        if (step === "optimization") return "done";
        return "upcoming";
      case "previous":
        return analysis ? "done" : "upcoming";
      default:
        return "upcoming";
    }
  };

  /* ================================================================ */
  /*  PROGRESSION PANEL (shared between result & optimization views)   */
  /* ================================================================ */
  const ProgressionPanel = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">route</span>
            Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {progressionSteps.map((s, i) => {
              const state = getStepState(s.key);
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    state === "active" && "bg-primary/5",
                    state === "done" && s.key === "previous" && analysis && "cursor-pointer hover:bg-gray-50"
                  )}
                  onClick={() => {
                    if (s.key === "previous" && analysis) setStep("result");
                  }}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      state === "done" && "bg-green-100 text-green-600",
                      state === "active" && "bg-primary/10 text-primary",
                      state === "upcoming" && "bg-gray-100 text-gray-300"
                    )}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {state === "done" ? s.doneIcon : s.icon}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      state === "done" && "text-gray-900",
                      state === "active" && "text-primary font-semibold",
                      state === "upcoming" && "text-gray-400"
                    )}
                  >
                    {s.label}
                  </span>
                  {state === "active" && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* New analysis button */}
      <Button variant="outline" className="w-full" onClick={handleNewAnalysis}>
        <span className="material-symbols-outlined text-sm">add_circle</span>
        Nouvelle analyse
      </Button>
    </div>
  );

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <>
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">description</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">CV Optimizer</h2>
          <p className="text-sm text-gray-500">Analysez et optimisez votre CV pour les systèmes ATS</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  STEP 1 — INPUT VIEW                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {step === "input" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ──── Left column ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">upload_file</span>
                  <div>
                    <CardTitle className="text-base">Télécharger votre CV</CardTitle>
                    <CardDescription>Formats acceptés : PDF, DOCX (Max 10 MB)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Drop zone */}
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer group",
                    isDragging && "border-primary bg-blue-50 scale-[1.01]",
                    !isDragging && !file && "border-gray-200 hover:border-primary/40 hover:bg-gray-50",
                    file && "border-green-400 bg-green-50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !file && document.getElementById("cv-upload")?.click()}
                >
                  <input id="cv-upload" type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
                  {file ? (
                    <div className="flex items-center gap-4 w-full">
                      <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                        isDragging ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400 group-hover:text-primary group-hover:bg-primary/5"
                      )}>
                        <span className="material-symbols-outlined text-3xl">{isDragging ? "file_download" : "cloud_upload"}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          <span className="text-primary font-semibold">Cliquez pour parcourir</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX — 10 MB maximum</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Job description */}
                <Textarea
                  label="Description du poste"
                  placeholder="Collez ici l&#39;annonce complète du poste (minimum 50 caractères)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[160px]"
                />

                {/* Counter + error */}
                <div className="flex items-center justify-between">
                  <div>
                    {analysisError && (
                      <p className="text-sm text-red-600 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {analysisError}
                      </p>
                    )}
                  </div>
                  <span className={cn("text-xs", jobDescription.trim().length >= 50 ? "text-green-500" : "text-gray-400")}>
                    {jobDescription.trim().length} / 50 min
                  </span>
                </div>

                {/* CTA */}
                <Button className="w-full" size="lg" onClick={handleAnalyze} disabled={!canAnalyze || analyzing} isLoading={analyzing}>
                  <span className="material-symbols-outlined">analytics</span>
                  Analyser le CV
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ──── Right column ─────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Progress tracker */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">route</span>
                  Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {progressionSteps.map((s, i) => {
                    const state = getStepState(s.key);
                    return (
                      <div key={i} className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        state === "active" && "bg-primary/5"
                      )}>
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          state === "done" && "bg-green-100 text-green-600",
                          state === "active" && "bg-primary/10 text-primary",
                          state === "upcoming" && "bg-gray-100 text-gray-300"
                        )}>
                          <span className="material-symbols-outlined text-lg">
                            {state === "done" ? s.doneIcon : s.icon}
                          </span>
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          state === "done" && "text-gray-900",
                          state === "active" && "text-primary font-semibold",
                          state === "upcoming" && "text-gray-400"
                        )}>
                          {s.label}
                        </span>
                        {state === "active" && <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick-access: if a previous analysis exists */}
            {analysis && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <span className="material-symbols-outlined">analytics</span>
                    <span className="text-sm font-bold">Analyse précédente</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Score : {analysis.matchScore}% — {fileName}
                  </p>
                  <Button variant="outline" className="w-full" size="sm" onClick={() => setStep("result")}>
                    Voir les résultats
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  STEP 2 — RESULT VIEW                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {step === "result" && analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ──── Left column: analysis results ────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Top bar: back + file info ─────────────────────────── */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleBackToInput}
                className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600">arrow_back</span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{fileName || "CV analysé"}</p>
                <p className="text-xs text-gray-400 truncate">
                  {jobDescription.slice(0, 80)}{jobDescription.length > 80 ? "..." : ""}
                </p>
              </div>
              <Badge
                variant={analysis.matchScore >= 80 ? "success" : analysis.matchScore >= 60 ? "warning" : "error"}
                className="text-sm px-3 py-1"
              >
                {analysis.matchScore}% Match
              </Badge>
            </div>

            {/* ── Tab navigation ──────────────────────────────────── */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {analysisTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB: Vue d'ensemble ───────────────────────────────── */}
            {activeTab === "overview" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">dashboard</span>
                      <CardTitle className="text-base">Vue d&apos;ensemble</CardTitle>
                    </div>
                    <Badge variant={analysis.matchScore >= 80 ? "success" : analysis.matchScore >= 60 ? "warning" : "error"}>
                      Score : {analysis.matchScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="shrink-0">
                      <div className="relative inline-flex">
                        <svg className="h-28 w-28 -rotate-90">
                          <circle cx="56" cy="56" r="48" fill="transparent" stroke="#e5e7eb" strokeWidth="8" />
                          <circle cx="56" cy="56" r="48" fill="transparent" stroke={strokeColor(analysis.matchScore)} strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 * (1 - analysis.matchScore / 100)} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={cn("text-2xl font-black", scoreTxt(analysis.matchScore))}>{analysis.matchScore}%</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Match</span>
                        </div>
                      </div>
                    </div>
                    <p className="flex-1 text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Détail du score</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([
                        { label: "Compétences", value: analysis.scoreBreakdown.skillsMatch },
                        { label: "Expérience", value: analysis.scoreBreakdown.experienceMatch },
                        { label: "Formation", value: analysis.scoreBreakdown.educationMatch },
                        { label: "Mots-clés", value: analysis.scoreBreakdown.keywordsMatch },
                        { label: "Pertinence globale", value: analysis.scoreBreakdown.overallRelevance },
                      ] as const).map((item) => (
                        <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            <span className={cn("text-sm font-bold", scoreTxt(item.value))}>{item.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${item.value}%`, backgroundColor: strokeColor(item.value) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {analysis.matchedKeywords.length > 0 && (
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-2xl font-black text-green-600">{analysis.matchedKeywords.length}</p>
                        <p className="text-xs text-gray-500">Mots-clés trouvés</p>
                      </div>
                    )}
                    {analysis.missingKeywords.length > 0 && (
                      <div className="text-center p-3 bg-red-50 rounded-xl">
                        <p className="text-2xl font-black text-red-500">{analysis.missingKeywords.length}</p>
                        <p className="text-xs text-gray-500">Mots-clés manquants</p>
                      </div>
                    )}
                    {analysis.technicalSkillsAnalysis.alignedSkills.length > 0 && (
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-black text-blue-600">{analysis.technicalSkillsAnalysis.alignedSkills.length}</p>
                        <p className="text-xs text-gray-500">Skills alignées</p>
                      </div>
                    )}
                    {analysis.atsFormattingCheck.formatScore > 0 && (
                      <div className={cn("text-center p-3 rounded-xl", scoreBg(analysis.atsFormattingCheck.formatScore))}>
                        <p className={cn("text-2xl font-black", scoreTxt(analysis.atsFormattingCheck.formatScore))}>{analysis.atsFormattingCheck.formatScore}%</p>
                        <p className="text-xs text-gray-500">Format ATS</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    {optimizeError && (
                      <p className="text-sm text-red-600 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {optimizeError}
                      </p>
                    )}
                    <Button className="w-full" size="lg" onClick={handleOptimize} disabled={optimizing} isLoading={optimizing}>
                      <span className="material-symbols-outlined">auto_fix_high</span>
                      Optimiser le CV avec l&apos;IA
                      {!isPremium && <span className="text-xs opacity-75 ml-1">({freeUsesRemaining} restants)</span>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── TAB: Mots-clés ───────────────────────────────────── */}
            {activeTab === "keywords" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">key</span>
                    <CardTitle className="text-base">Analyse des mots-clés</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysis.matchedKeywords.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                        Mots-clés trouvés ({analysis.matchedKeywords.length})
                      </p>
                      <div className="space-y-2">
                        {analysis.matchedKeywords.map((mk, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                            <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{mk.keyword}</p>
                              {mk.context && <p className="text-xs text-gray-500 mt-0.5">{mk.context}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.missingKeywords.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>
                        Mots-clés manquants ({analysis.missingKeywords.length})
                      </p>
                      <div className="space-y-2">
                        {analysis.missingKeywords.map((mk, i) => (
                          <div key={i} className="p-3 bg-red-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">{mk.keyword}</span>
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase", priorityColor(mk.importance))}>{mk.importance}</span>
                            </div>
                            {mk.suggestion && (
                              <p className="text-xs text-gray-600 flex items-start gap-1.5">
                                <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5 shrink-0">lightbulb</span>
                                {mk.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.matchedKeywords.length === 0 && analysis.missingKeywords.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Aucune donnée de mots-clés disponible.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── TAB: Expérience ──────────────────────────────────── */}
            {activeTab === "experience" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">work</span>
                    <CardTitle className="text-base">Alignement de l&apos;expérience</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysis.experienceAlignment.strongMatches.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Correspondances fortes
                      </p>
                      <ul className="space-y-1.5">
                        {analysis.experienceAlignment.strongMatches.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2.5 bg-green-50 rounded-lg">
                            <span className="material-symbols-outlined text-green-500 text-base mt-0.5 shrink-0">check_circle</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.experienceAlignment.partialMatches.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">remove_circle</span>
                        Correspondances partielles
                      </p>
                      <ul className="space-y-1.5">
                        {analysis.experienceAlignment.partialMatches.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2.5 bg-amber-50 rounded-lg">
                            <span className="material-symbols-outlined text-amber-500 text-base mt-0.5 shrink-0">info</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.experienceAlignment.gaps.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">error</span>
                        Lacunes identifiées
                      </p>
                      <ul className="space-y-1.5">
                        {analysis.experienceAlignment.gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2.5 bg-red-50 rounded-lg">
                            <span className="material-symbols-outlined text-red-500 text-base mt-0.5 shrink-0">warning</span>
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.experienceAlignment.strongMatches.length === 0 &&
                    analysis.experienceAlignment.partialMatches.length === 0 &&
                    analysis.experienceAlignment.gaps.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">Aucune donnée d&apos;expérience disponible.</p>
                    )}
                </CardContent>
              </Card>
            )}

            {/* ── TAB: Compétences ─────────────────────────────────── */}
            {activeTab === "skills" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                    <CardTitle className="text-base">Analyse des compétences</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(analysis.technicalSkillsAnalysis.alignedSkills.length > 0 ||
                    analysis.technicalSkillsAnalysis.missingCriticalSkills.length > 0 ||
                    analysis.technicalSkillsAnalysis.recommendedAdditions.length > 0) && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Compétences techniques</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {analysis.technicalSkillsAnalysis.alignedSkills.length > 0 && (
                          <div className="p-3 bg-green-50 rounded-xl">
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2">Alignées</p>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.technicalSkillsAnalysis.alignedSkills.map((s) => (
                                <Badge key={s} variant="success" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.technicalSkillsAnalysis.missingCriticalSkills.length > 0 && (
                          <div className="p-3 bg-red-50 rounded-xl">
                            <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2">Critiques manquantes</p>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.technicalSkillsAnalysis.missingCriticalSkills.map((s) => (
                                <Badge key={s} variant="error" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.technicalSkillsAnalysis.recommendedAdditions.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">Recommandées</p>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.technicalSkillsAnalysis.recommendedAdditions.map((s) => (
                                <Badge key={s} variant="info" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {(analysis.softSkillsAnalysis.alignedSoftSkills.length > 0 ||
                    analysis.softSkillsAnalysis.missingSoftSkills.length > 0) && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Soft skills</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {analysis.softSkillsAnalysis.alignedSoftSkills.length > 0 && (
                          <div className="p-3 bg-green-50 rounded-xl">
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2">Présentes</p>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.softSkillsAnalysis.alignedSoftSkills.map((s) => (
                                <Badge key={s} variant="success" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.softSkillsAnalysis.missingSoftSkills.length > 0 && (
                          <div className="p-3 bg-amber-50 rounded-xl">
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Manquantes</p>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.softSkillsAnalysis.missingSoftSkills.map((s) => (
                                <Badge key={s} variant="warning" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {analysis.technicalSkillsAnalysis.alignedSkills.length === 0 &&
                    analysis.technicalSkillsAnalysis.missingCriticalSkills.length === 0 &&
                    analysis.softSkillsAnalysis.alignedSoftSkills.length === 0 &&
                    analysis.softSkillsAnalysis.missingSoftSkills.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">Aucune donnée de compétences disponible.</p>
                    )}
                </CardContent>
              </Card>
            )}

            {/* ── TAB: Formatage ATS ───────────────────────────────── */}
            {activeTab === "formatting" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">format_list_bulleted</span>
                      <CardTitle className="text-base">Compatibilité ATS</CardTitle>
                    </div>
                    {analysis.atsFormattingCheck.formatScore > 0 && (
                      <Badge variant={analysis.atsFormattingCheck.formatScore >= 80 ? "success" : analysis.atsFormattingCheck.formatScore >= 60 ? "warning" : "error"}>
                        {analysis.atsFormattingCheck.formatScore}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysis.atsFormattingCheck.formatScore > 0 && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Score de compatibilité ATS</span>
                        <span className={cn("text-lg font-black", scoreTxt(analysis.atsFormattingCheck.formatScore))}>{analysis.atsFormattingCheck.formatScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${analysis.atsFormattingCheck.formatScore}%`, backgroundColor: strokeColor(analysis.atsFormattingCheck.formatScore) }} />
                      </div>
                    </div>
                  )}
                  {analysis.atsFormattingCheck.issuesDetected.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">error</span>
                        Problèmes détectés ({analysis.atsFormattingCheck.issuesDetected.length})
                      </p>
                      <ul className="space-y-1.5">
                        {analysis.atsFormattingCheck.issuesDetected.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2.5 bg-red-50 rounded-lg">
                            <span className="material-symbols-outlined text-red-500 text-base mt-0.5 shrink-0">close</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.atsFormattingCheck.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                        Recommandations
                      </p>
                      <ul className="space-y-1.5">
                        {analysis.atsFormattingCheck.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 p-2.5 bg-blue-50 rounded-lg">
                            <span className="material-symbols-outlined text-blue-500 text-base mt-0.5 shrink-0">lightbulb</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.atsFormattingCheck.formatScore === 0 &&
                    analysis.atsFormattingCheck.issuesDetected.length === 0 &&
                    analysis.atsFormattingCheck.recommendations.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">Aucune donnée ATS disponible.</p>
                    )}
                </CardContent>
              </Card>
            )}

            {/* ── TAB: Suggestions d'optimisation ──────────────────── */}
            {activeTab === "suggestions" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">auto_fix_high</span>
                    <CardTitle className="text-base">
                      Suggestions d&apos;optimisation
                      {analysis.optimizationSuggestions.length > 0 && (
                        <span className="text-gray-400 font-normal ml-1">({analysis.optimizationSuggestions.length})</span>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.optimizationSuggestions.length > 0 ? (
                    analysis.optimizationSuggestions.map((sug, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-xl hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", priorityColor(sug.priority))}>{sug.priority}</span>
                          <h4 className="text-sm font-semibold text-gray-900">{sug.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{sug.description}</p>
                        {sug.exampleRewrite && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Exemple de réécriture</p>
                            <p className="text-sm text-gray-800 italic leading-relaxed">&ldquo;{sug.exampleRewrite}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Aucune suggestion d&apos;optimisation disponible.</p>
                  )}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    {optimizeError && (
                      <p className="text-sm text-red-600 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {optimizeError}
                      </p>
                    )}
                    <Button className="w-full" size="lg" onClick={handleOptimize} disabled={optimizing} isLoading={optimizing}>
                      <span className="material-symbols-outlined">auto_fix_high</span>
                      Optimiser le CV avec l&apos;IA
                      {!isPremium && <span className="text-xs opacity-75 ml-1">({freeUsesRemaining} restants)</span>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ──── Right column: progression panel ──────────────────── */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ProgressionPanel />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  STEP 3 — OPTIMIZATION VIEW                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {step === "optimization" && optimizedCV && analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ──── Left column: optimization details ────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Top bar ──────────────────────────────────────────── */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setStep("result")}
                className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600">arrow_back</span>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">CV Optimisé</p>
                <p className="text-xs text-gray-400 truncate">{fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={analysis.matchScore >= 60 ? "warning" : "error"} className="text-xs">
                  Avant : {analysis.matchScore}%
                </Badge>
                <span className="material-symbols-outlined text-gray-300 text-sm">arrow_forward</span>
                <Badge variant="success" className="text-xs">
                  Après : {optimizedCV.estimated_score}%
                </Badge>
              </div>
            </div>

            {/* ── Score comparison ──────────────────────────────────── */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">compare_arrows</span>
                  <CardTitle className="text-base">Résumé de l&apos;optimisation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score before/after */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Score avant</p>
                    <div className="relative inline-flex">
                      <svg className="h-20 w-20 -rotate-90">
                        <circle cx="40" cy="40" r="34" fill="transparent" stroke="#e5e7eb" strokeWidth="6" />
                        <circle cx="40" cy="40" r="34" fill="transparent" stroke={strokeColor(analysis.matchScore)} strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - analysis.matchScore / 100)} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn("text-lg font-black", scoreTxt(analysis.matchScore))}>{analysis.matchScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Score estimé après</p>
                    <div className="relative inline-flex">
                      <svg className="h-20 w-20 -rotate-90">
                        <circle cx="40" cy="40" r="34" fill="transparent" stroke="#e5e7eb" strokeWidth="6" />
                        <circle cx="40" cy="40" r="34" fill="transparent" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - optimizedCV.estimated_score / 100)} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-black text-green-600">{optimizedCV.estimated_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improvement delta */}
                {optimizedCV.estimated_score > analysis.matchScore && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-xl">
                    <span className="material-symbols-outlined text-green-600">trending_up</span>
                    <span className="text-sm font-semibold text-green-700">
                      +{optimizedCV.estimated_score - analysis.matchScore} points d&apos;amélioration
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Optimized sections with before/after ─────────────── */}

            {/* Professional Summary */}
            {optimizedCV.summary && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                    <CardTitle className="text-base">Résumé professionnel optimisé</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                      Nouveau résumé
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed">{optimizedCV.summary}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Added Keywords */}
            {analysis.missingKeywords.length > 0 && optimizedCV.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">label</span>
                    <CardTitle className="text-base">Mots-clés ajoutés</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">Mots-clés manquants (avant)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingKeywords.map((mk) => (
                        <span key={mk.keyword} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-200 line-through">{mk.keyword}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    <div className="flex-1 border-t border-gray-200" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-2">Compétences optimisées (après)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {optimizedCV.skills.map((skill) => {
                        const wasMissing = analysis.missingKeywords.some(
                          (mk) => skill.toLowerCase().includes(mk.keyword.toLowerCase()) || mk.keyword.toLowerCase().includes(skill.toLowerCase())
                        );
                        return (
                          <span
                            key={skill}
                            className={cn(
                              "text-xs px-2 py-1 rounded-full border",
                              wasMissing
                                ? "bg-green-100 text-green-700 border-green-300 font-semibold"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            )}
                          >
                            {wasMissing && <span className="mr-1">✓</span>}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Improved Experience */}
            {optimizedCV.experience.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">work</span>
                    <CardTitle className="text-base">Expérience optimisée</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {optimizedCV.experience.map((exp, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-baseline justify-between mb-2">
                        <p className="font-semibold text-sm text-gray-900">
                          {exp.title}
                          {exp.organization && <span className="text-gray-500"> — {exp.organization}</span>}
                        </p>
                        {exp.period && <span className="text-xs text-gray-400 shrink-0 ml-2">{exp.period}</span>}
                      </div>
                      <ul className="space-y-1.5">
                        {exp.bullets.map((b, j) => (
                          <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-500 text-sm mt-0.5 shrink-0">check_circle</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {optimizedCV.education.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                    <CardTitle className="text-base">Formation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {optimizedCV.education.map((edu, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl">
                      <p className="font-semibold text-sm text-gray-900">
                        {edu.title}
                        {edu.organization && <span className="text-gray-500"> — {edu.organization}</span>}
                      </p>
                      {edu.period && <p className="text-xs text-gray-400">{edu.period}</p>}
                      {edu.details && <p className="text-xs text-gray-500 mt-1">{edu.details}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {optimizedCV.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">verified</span>
                    <CardTitle className="text-base">Certifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {optimizedCV.certifications.map((cert, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="material-symbols-outlined text-primary text-sm">verified</span>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* ── Download CTA ─────────────────────────────────────── */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-primary text-2xl">download</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Télécharger le CV optimisé</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Le CV conserve la structure et le format de votre document original.
                  </p>
                </div>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Template</p>
                <div className="space-y-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t.id)}
                      className={cn(
                        "w-full p-3 rounded-xl border text-left text-sm font-medium transition-all flex items-center gap-3",
                        selectedTemplate === t.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 hover:border-primary/40 text-gray-700"
                      )}
                    >
                      <span className="material-symbols-outlined text-lg">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                <Button className="w-full" size="lg" onClick={handleExportPdf} disabled={exporting} isLoading={exporting}>
                  <span className="material-symbols-outlined">download</span>
                  Télécharger le CV optimisé
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ──── Right column: progression panel ──────────────────── */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ProgressionPanel />
          </div>
        </div>
      )}

      {/* ── Upgrade modal ─────────────────────────────────────────── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Passez à Pro</h3>
              <p className="text-sm text-gray-500">
                Vous avez utilisé toutes vos utilisations gratuites. Passez à Pro pour une optimisation illimitée.
              </p>
              <p className="text-3xl font-black text-gray-900">
                $19<span className="text-base font-normal text-gray-400">/mois</span>
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeModal(false)}>Plus tard</Button>
                <Button className="flex-1" onClick={handleSubscribe} disabled={subscribing} isLoading={subscribing}>Go Pro</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
