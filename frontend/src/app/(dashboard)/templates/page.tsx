"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const templates = [
  { id: 1, name: "The Minimalist", category: "ATS Optimized", isSelected: true },
  { id: 2, name: "The Executive", category: "Modern", isSelected: false },
  { id: 3, name: "Startup Hero", category: "Creative", isSelected: false },
  { id: 4, name: "Classic Professional", category: "ATS Optimized", isSelected: false },
  { id: 5, name: "Tech Forward", category: "Modern", isSelected: false },
  { id: 6, name: "Bold Statement", category: "Creative", isSelected: false },
];

export default function TemplatesPage() {
  return (
    <>
      {/* Page Heading */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          CV Templates & Editor
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Choose from our ATS-optimized templates and customize your CV.
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`group cursor-pointer hover:border-primary transition-all ${
              template.isSelected ? "border-2 border-primary ring-4 ring-primary/10" : ""
            }`}
          >
            <CardContent className="p-0">
              <div className="aspect-[1/1.4] bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <div className="w-3/4 space-y-3 p-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
                    <div className="h-8 bg-primary/20 rounded w-full mt-4" />
                    <div className="space-y-2 mt-4">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded" />
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-4/5" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <span className="bg-primary text-white px-6 py-2 rounded-full font-bold shadow-xl">
                    {template.isSelected ? "Selected" : "Choose Template"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-bold">{template.name}</h3>
                <Badge
                  variant={
                    template.category === "ATS Optimized"
                      ? "success"
                      : template.category === "Modern"
                      ? "info"
                      : "secondary"
                  }
                  className="text-[10px] uppercase"
                >
                  {template.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
