"use client";

import Link from "next/link";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useState } from "react";
import WebComponentDialer from "../../components/WebComponentDialer";

export default function WebComponentPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme: "light" | "dark" = isDarkMode ? "dark" : "light";

  return (
    <div
      className={`w-full min-h-screen flex flex-col items-center justify-center gap-6 p-8 transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800"
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
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span className="text-sm font-medium">
            {isDarkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>

      <h2 className="text-xl font-semibold">
        rtc-kit-react (React + Web Components)
      </h2>

      <WebComponentDialer active theme={theme} />
    </div>
  );
}
