"use client";

import { useState } from "react";
import { Sun, Moon, Zap, Puzzle } from "lucide-react";
import CoreDialer from "../components/CoreDialer";
import WebComponentDialer from "../components/WebComponentDialer";

type Side = "core" | "webcomponent";

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeSide, setActiveSide] = useState<Side>("core");

  const theme: "light" | "dark" = isDarkMode ? "dark" : "light";

  return (
    <div
      className={`w-full min-h-screen flex flex-col items-center gap-8 px-4 py-8 transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800"
      }`}
    >
      {/* ---- Top bar: title · toggle · theme ---- */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold">CallPro RTC SDK</h1>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Compare both integration styles side by side
          </p>
        </div>

        <SideToggle
          activeSide={activeSide}
          onChange={setActiveSide}
          isDarkMode={isDarkMode}
        />

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
      </header>

      {/* ---- Panels ---- */}
      <main className="w-full max-w-5xl flex flex-col md:flex-row items-stretch gap-6">
        <Panel
          icon={<Zap size={20} />}
          accent="blue"
          title="Core"
          subtitle="Direct rtc-sdk + custom UI"
          side="core"
          activeSide={activeSide}
          onActivate={setActiveSide}
          isDarkMode={isDarkMode}
          orderClass="md:order-1"
        >
          <CoreDialer active={activeSide === "core"} theme={theme} />
        </Panel>

        <Panel
          icon={<Puzzle size={20} />}
          accent="green"
          title="Web Components"
          subtitle="Pre-built rtc-kit-react components"
          side="webcomponent"
          activeSide={activeSide}
          onActivate={setActiveSide}
          isDarkMode={isDarkMode}
          orderClass="md:order-2"
        >
          <WebComponentDialer
            active={activeSide === "webcomponent"}
            theme={theme}
          />
        </Panel>
      </main>
    </div>
  );
}

function SideToggle({
  activeSide,
  onChange,
  isDarkMode,
}: {
  activeSide: Side;
  onChange: (s: Side) => void;
  isDarkMode: boolean;
}) {
  const base =
    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300";
  const activeCls = "bg-blue-500 text-white shadow-lg shadow-blue-500/40";
  const inactiveCls = isDarkMode
    ? "text-gray-400 hover:text-gray-200"
    : "text-gray-500 hover:text-gray-700";

  return (
    <div
      className={`flex items-center gap-1 p-1 rounded-full ${
        isDarkMode ? "bg-gray-800/80" : "bg-gray-200/80"
      }`}
    >
      <button
        onClick={() => onChange("core")}
        className={`${base} ${activeSide === "core" ? activeCls : inactiveCls}`}
      >
        Core
      </button>
      <button
        onClick={() => onChange("webcomponent")}
        className={`${base} ${
          activeSide === "webcomponent" ? activeCls : inactiveCls
        }`}
      >
        Web Components
      </button>
    </div>
  );
}

function Panel({
  icon,
  accent,
  title,
  subtitle,
  side,
  activeSide,
  onActivate,
  isDarkMode,
  orderClass,
  children,
}: {
  icon: React.ReactNode;
  accent: "blue" | "green";
  title: string;
  subtitle: string;
  side: Side;
  activeSide: Side;
  onActivate: (s: Side) => void;
  isDarkMode: boolean;
  orderClass: string;
  children: React.ReactNode;
}) {
  const isActive = activeSide === side;
  const accentRing =
    accent === "blue"
      ? "ring-blue-500/60 shadow-blue-500/20"
      : "ring-green-500/60 shadow-green-500/20";
  const iconBg =
    accent === "blue"
      ? "bg-blue-500/20 text-blue-400"
      : "bg-green-500/20 text-green-400";

  // Inactive panel is clickable to activate; active panel passes clicks through.
  const orderActive = isActive ? "order-1" : "order-2";

  return (
    <section
      onClick={isActive ? undefined : () => onActivate(side)}
      className={`flex-1 flex flex-col items-center gap-5 rounded-2xl p-6 backdrop-blur-sm border transition-all duration-300 ${orderActive} ${orderClass} ${
        isDarkMode
          ? "bg-white/5 border-white/10"
          : "bg-white/70 border-gray-200"
      } ${
        isActive
          ? `ring-2 shadow-2xl ${accentRing}`
          : "cursor-pointer hover:border-white/30 opacity-95"
      }`}
    >
      <div className="flex items-center gap-3 w-full">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold leading-tight">{title}</h2>
          <p
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        </div>
        {isActive ? (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              accent === "blue"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-green-500/20 text-green-300"
            }`}
          >
            Active
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            Tap to use
          </span>
        )}
      </div>

      <div className="w-full flex items-center justify-center">{children}</div>
    </section>
  );
}
