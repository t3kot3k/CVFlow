"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FreeTestPage() {
  const [step, setStep] = useState<"upload" | "analyzing" | "results">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    missingKeywords: string[];
    foundKeywords: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".docx"))) {
      setFile(droppedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) return;

    setStep("analyzing");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock results
    setAnalysisResult({
      score: 72,
      missingKeywords: ["Cloud Architecture", "Stakeholder Management", "Agile", "Data Analysis"],
      foundKeywords: ["Project Management", "Leadership", "Communication", "Problem Solving", "Team Collaboration"],
    });

    setStep("results");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 px-6 lg:px-40 py-12">
        <div className="max-w-[900px] mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <Badge className="mb-4">Free Analysis</Badge>
            <h1 className="text-3xl md:text-4xl font-black mb-4">
              Test Your CV&apos;s ATS Compatibility
            </h1>
            <p className="text-[#4d6599] dark:text-gray-400 text-lg max-w-xl mx-auto">
              Upload your CV and paste a job description to see how well your resume matches the role.
            </p>
          </div>

          {step === "upload" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">upload_file</span>
                    Upload Your CV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50",
                      file && "border-green-500 bg-green-50 dark:bg-green-900/10"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center",
                        file
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      )}
                    >
                      <span className="material-symbols-outlined text-3xl">
                        {file ? "check_circle" : "cloud_upload"}
                      </span>
                    </div>
                    {file ? (
                      <div className="text-center">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF or DOCX (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Job Description Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste the job advertisement here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>

              {/* Analyze Button */}
              <div className="lg:col-span-2">
                <Button
                  size="xl"
                  className="w-full"
                  disabled={!file || !jobDescription}
                  onClick={handleAnalyze}
                >
                  <span className="material-symbols-outlined">psychology</span>
                  Analyze My CV
                </Button>
              </div>
            </div>
          )}

          {step === "analyzing" && (
            <Card className="max-w-md mx-auto text-center py-16">
              <CardContent>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-bold mb-2">Analyzing Your CV...</h2>
                <p className="text-[#4d6599] dark:text-gray-400">
                  Our AI is scanning your CV against the job description. This may take a moment.
                </p>
              </CardContent>
            </Card>
          )}

          {step === "results" && analysisResult && (
            <div className="space-y-8">
              {/* Score Card */}
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Score Circle */}
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          className="text-gray-100 dark:text-gray-800"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          strokeDasharray={`${(analysisResult.score / 100) * 352} 352`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black">{analysisResult.score}%</span>
                        <span className="text-xs text-gray-500 uppercase font-bold">ATS Score</span>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-bold mb-2">Good Match!</h3>
                      <p className="text-[#4d6599] dark:text-gray-400 mb-4">
                        Your profile has a strong foundation for this role. We identified{" "}
                        <span className="font-semibold text-red-500">
                          {analysisResult.missingKeywords.length} missing critical keywords
                        </span>{" "}
                        that could boost your score.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.missingKeywords.slice(0, 2).map((keyword) => (
                          <Badge key={keyword} variant="error" className="uppercase text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        <Badge variant="secondary" className="uppercase text-xs">
                          +{analysisResult.missingKeywords.length - 2} more
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blurred Results Preview */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-background-dark z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="text-center bg-white dark:bg-background-dark p-8 rounded-xl shadow-xl">
                    <span className="material-symbols-outlined text-5xl text-primary mb-4">lock</span>
                    <h3 className="text-xl font-bold mb-2">Unlock Full Analysis</h3>
                    <p className="text-[#4d6599] dark:text-gray-400 mb-6 max-w-sm">
                      Create a free account to see detailed recommendations, optimized CV suggestions, and more.
                    </p>
                    <Button size="lg" asChild>
                      <Link href="/signup">Create Free Account</Link>
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>Detailed Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="blur-sm select-none pointer-events-none">
                  <div className="space-y-4 opacity-50">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Experience Section</h4>
                      <p className="text-sm text-gray-600">Add quantifiable achievements to your work experience. Consider adding metrics like...</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Skills Section</h4>
                      <p className="text-sm text-gray-600">Include technical skills mentioned in the job description such as...</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Education Section</h4>
                      <p className="text-sm text-gray-600">Highlight relevant coursework or certifications that align with...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center">
                <Button variant="secondary" onClick={() => setStep("upload")}>
                  <span className="material-symbols-outlined">refresh</span>
                  Analyze Another CV
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
