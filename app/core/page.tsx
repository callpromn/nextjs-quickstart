"use client";

import { ArrowLeft, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CoreDialer from "../../components/CoreDialer";

export default function CorePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme: "light" | "dark" = isDarkMode ? "dark" : "light";

  return (
    <div
      className={`w-full min-h-screen flex flex-col items-center justify-center py-8 gap-4 transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-100"
      }`}
    >
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className={`flex items-center gap-2 transition-colors duration-300 ${
            isDarkMode
              ? "text-white hover:text-gray-300"
              : "text-gray-800 hover:text-gray-600"
          }`}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Буцах</span>
        </Link>
      </div>

      <div className="absolute top-6 right-6">
        <button
          onClick={() => setIsDarkMode((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-sm font-medium">
            {isDarkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>

      <h2
        className={`text-xl font-semibold ${
          isDarkMode ? "text-gray-50" : "text-gray-800"
        }`}
      >
        rtc-sdk + rtc-kit (core)
      </h2>

      <CoreDialer active theme={theme} />
    </div>
  );
}
