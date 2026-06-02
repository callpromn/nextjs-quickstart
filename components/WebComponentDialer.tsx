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
  useKeyboardDialer,
} from "@callpromn/rtc-kit-react";
import { useEffect, useRef, useState } from "react";
import ClientWrapper from "./ClientWrapper";
import GreyedPreview from "./GreyedPreview";

/**
 * Web-component implementation dialer: pre-built `@callpromn/rtc-kit-react`
 * wrappers driven by the `ClientProvider` context.
 *
 * The provider connects on mount, so we only mount it (via `ClientWrapper`)
 * while this panel is `active`. When inactive we render an inert greyed
 * preview and keep no connection — guaranteeing a single live socket across
 * the showcase.
 */
export default function WebComponentDialer({
  active,
  theme,
}: {
  active: boolean;
  theme: "light" | "dark";
}) {
  if (!active) {
    return (
      <div className="flex flex-col items-center gap-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
          ⚪ Disabled
        </span>
        <div className="opacity-50 grayscale pointer-events-none select-none">
          <GreyedPreview theme={theme} />
        </div>
      </div>
    );
  }

  return (
    <ClientWrapper>
      <InnerDialer theme={theme} />
    </ClientWrapper>
  );
}

function InnerDialer({ theme }: { theme: "light" | "dark" }) {
  const {
    isIncomingCall,
    isOutboundCall,
    isCallActive,
    isConnected,
    isMicOn,
    inboundUserData,
    toPhoneNumber,
    setToPhoneNumber,
    checkConnectionStatus,
  } = useClientContext();

  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useKeyboardDialer({ maxLength: 8 });

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

  const isDarkMode = theme === "dark";
  const isIdle = !isIncomingCall && !isOutboundCall && !isCallActive;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-row items-center justify-center gap-3">
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
          🔌 Шалгах
        </button>
      </div>

      {isIdle && (
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
      )}

      {isOutboundCall && (
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
      )}

      {isIncomingCall && (
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
              onClick={() => setToPhoneNumber(inboundUserData?.fromNumber || "")}
            />
            <DeclineButton theme={theme} />
          </div>
        </div>
      )}

      {isCallActive && (
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
      )}
    </div>
  );
}
