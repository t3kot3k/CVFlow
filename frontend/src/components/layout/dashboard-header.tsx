"use client";

import { useState } from "react";

export function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="flex items-center justify-between border-b border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-background-dark px-8 py-4">
      <div className="flex items-center gap-4 w-full max-w-xl">
        <label className="flex flex-col flex-1 h-10">
          <div className="flex w-full flex-1 items-stretch rounded-lg bg-[#e7ebf3] dark:bg-gray-800">
            <div className="text-[#4d6599] flex items-center justify-center pl-4">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="w-full border-none bg-transparent focus:ring-0 text-sm px-3 text-[#0e121b] dark:text-white placeholder:text-[#4d6599] focus:outline-none"
              placeholder="Search applications, tips, or files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center size-10 rounded-lg bg-[#e7ebf3] dark:bg-gray-800 text-[#0e121b] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="flex items-center justify-center size-10 rounded-lg bg-[#e7ebf3] dark:bg-gray-800 text-[#0e121b] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </header>
  );
}
