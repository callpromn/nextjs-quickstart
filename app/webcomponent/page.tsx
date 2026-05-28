"use client";

import {
  AcceptButton,
  CallButton,
  DeclineButton,
  EndButton,
  MicButton,
  Numpad,
  NumberField,
  NumberDeleteButton,
  useClientContext,
} from "@callpromn/rtc-kit-react";
import Link from "next/link";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ClientWrapper from "../../components/ClientWrapper";

function StatusBar({
  isDarkMode,
  onToggleTheme,
}: {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}) {
  const { isConnected, checkConnectionStatus } = useClientContext();
  return (
    <div className="flex items-center gap-3">
      <span
        className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
          isConnected
            ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
            : "bg-red-500 text-white shadow-lg shadow-red-500/50"
        }`}
      >
        {isConnected ? "🟢 Холбогдсон" : "🔴 Холбогдож байна..."}
      </span>
      <button
        onClick={checkConnectionStatus}
        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300"
      >
        🔌 Холболтын шалгах
      </button>
      <button
        onClick={onToggleTheme}
        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300 ${
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
  );
}

function Dialer({ theme }: { theme: "light" | "dark" }) {
  const {
    isIncomingCall,
    isOutboundCall,
    isCallActive,
    isConnected,
    isMicOn,
    inboundUserData,
    toPhoneNumber,
    setToPhoneNumber,
  } = useClientContext();

  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isIdle = !isIncomingCall && !isOutboundCall && !isCallActive;
  const isDarkMode = theme === "dark";

  if (isIdle) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-[280px] flex flex-row items-center gap-2">
          <NumberField phoneNumber={toPhoneNumber} theme={theme} />
          <NumberDeleteButton
            phoneNumber={toPhoneNumber}
            onClick={() => {}}
            theme={theme}
          />
        </div>

        <Numpad
          phoneNumber={toPhoneNumber}
          onNumberClick={setToPhoneNumber}
          maxLength={8}
          theme={theme}
        />

        <CallButton
          toPhoneNumber={toPhoneNumber}
          disabled={!isConnected || toPhoneNumber.length === 0}
          theme={theme}
        />
      </div>
    );
  }

  if (isOutboundCall) {
    return (
      <div
        className={`flex flex-col items-center justify-center backdrop-blur-sm p-8 rounded-2xl shadow-2xl transition-all duration-300 ${
          isDarkMode
            ? "bg-white/10 border border-white/20 text-white"
            : "bg-white/80 border border-gray-200 text-gray-800"
        }`}
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            📞
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-4 text-center">
          {`${toPhoneNumber} руу залгаж байна...`}
        </h3>
        <EndButton theme={theme} />
      </div>
    );
  }

  if (isIncomingCall) {
    return (
      <div
        className={`backdrop-blur-sm p-8 rounded-2xl text-center shadow-2xl transition-all duration-300 ${
          isDarkMode
            ? "bg-white/10 border border-white/20 text-white"
            : "bg-white/80 border border-gray-200 text-gray-800"
        }`}
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            📞
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-6">
          {`${
            inboundUserData?.fromNumber
              ? inboundUserData.fromNumber
              : "Танихгүй дугаар"
          } залгаж байна`}
        </h3>
        <div className="flex gap-6 justify-center">
          <AcceptButton
            theme={theme}
            onClick={() =>
              setToPhoneNumber(inboundUserData?.fromNumber || "")
            }
          />
          <DeclineButton theme={theme} />
        </div>
      </div>
    );
  }

  // isCallActive
  return (
    <div
      className={`backdrop-blur-sm p-8 rounded-2xl text-center shadow-2xl transition-all duration-300 ${
        isDarkMode
          ? "bg-white/10 border border-white/20 text-white"
          : "bg-white/80 border border-gray-200 text-gray-800"
      }`}
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          📞
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">Дуудлага хийж байна</h3>
      <div
        className={`text-3xl font-mono mb-6 ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        {formatTime(callDuration)}
      </div>
      <div className="flex flex-row items-center gap-4 justify-center">
        <MicButton theme={theme} />
        <EndButton theme={theme} />
      </div>
      <p
        className={`mt-3 text-xs ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Mic: {isMicOn ? "on" : "off"}
      </p>
    </div>
  );
}

function Content() {
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

      <h2 className="text-xl font-semibold">
        rtc-kit-react (React + Web Components)
      </h2>

      <StatusBar
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((v) => !v)}
      />

      <Dialer theme={theme} />
    </div>
  );
}

export default function WebComponentPage() {
  return (
    <ClientWrapper>
      <Content />
    </ClientWrapper>
  );
}
