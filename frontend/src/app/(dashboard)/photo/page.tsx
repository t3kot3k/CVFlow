"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const backgrounds = [
  { id: "original", label: "Original", icon: "image" },
  { id: "blur", label: "Soft Blur", icon: "blur_on" },
  { id: "office", label: "Office", icon: "corporate_fare" },
  { id: "solid", label: "Solid Color", icon: "format_color_fill" },
];

export default function PhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedBackground, setSelectedBackground] = useState("blur");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
    }
  };

  const handleEnhance = async () => {
    if (!file) return;
    setIsProcessing(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsProcessing(false);
  };

  return (
    <>
      {/* Page Heading */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          AI Photo Enhancement
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Transform your casual photos into professional LinkedIn-ready headshots.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">photo_camera</span>
              Upload Your Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer aspect-square",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary/50",
                file && "border-green-500 bg-green-50 dark:bg-green-900/10"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("photo-input")?.click()}
            >
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4 overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Click to change photo</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">JPEG, PNG (Max 10MB)</p>
                  </div>
                </>
              )}
            </div>

            {/* Background Selection */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Background Style</p>
              <div className="grid grid-cols-4 gap-3">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      selectedBackground === bg.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                    )}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {bg.icon}
                    </span>
                    <span className="text-xs font-medium">{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!file || isProcessing}
              onClick={handleEnhance}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_fix_high</span>
                  Enhance Photo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">compare</span>
                Preview
              </span>
              <Badge variant="success">LinkedIn Ready</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center">
              {file ? (
                <div className="w-3/4 aspect-square rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Enhanced preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4">
                    person
                  </span>
                  <p className="text-sm">Upload a photo to see preview</p>
                </div>
              )}
            </div>
            {file && (
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" className="flex-1">
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  Reset
                </Button>
                <Button className="flex-1">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
