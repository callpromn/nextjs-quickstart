"use client";

import {
  CallButton,
  AcceptButton,
  DeclineButton,
  EndButton,
  useClientContext,
  MicButton,
  Numpad,
  NumberField,
  NumberDeleteButton,
} from "@callpromn/rtc-kit-react";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import ClientWrapper from "../../components/ClientWrapper";

function WebComponentContent() {
  const {
    isConnected,
    checkConnectionStatus,
    isIncomingCall,
    isOutboundCall,
    isCallActive,
    inboundUserData,
    toPhoneNumber,
    setToPhoneNumber,
  } = useClientContext();

  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center py-8 gap-3 transition-all duration-500 ${
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
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
            isDarkMode
              ? "bg-gray-800 hover:bg-gray-700 text-yellow-400 hover:text-yellow-300"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800 hover:text-gray-700"
          }`}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-sm font-medium">
            {isDarkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>

      <h2
        className={`text-xl font-semibold mb-3 ${
          isDarkMode ? "text-gray-50" : "text-gray-800"
        }`}
      >
        CallPro RTC UI Kit Test NextJS
      </h2>

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
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-full text-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
        >
          🔌 Холболтын шалгах
        </button>
      </div>

      {!isOutboundCall && !isIncomingCall && (
        <NumberField
          phoneNumber={toPhoneNumber}
          theme={isDarkMode ? "dark" : "light"}
        />
      )}

      {!isOutboundCall && !isIncomingCall && !isCallActive && (
        <Numpad
          phoneNumber={toPhoneNumber}
          onNumberClick={setToPhoneNumber}
          theme={isDarkMode ? "dark" : "light"}
        />
      )}

      <div
        className={
          isOutboundCall || isIncomingCall || isCallActive
            ? "flex flex-col items-center gap-4 w-[300px]"
            : "w-[300px] gap-4"
        }
      >
        {isOutboundCall && (
          <div
            className={`flex flex-col items-center justify-center backdrop-blur-sm p-8 rounded-2xl text-center shadow-2xl transition-all duration-300 ${
              isDarkMode
                ? "bg-white/10 border border-white/20 text-white"
                : "bg-white/80 border border-gray/20 text-gray-800"
            }`}
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                📞
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-4">
              {`${toPhoneNumber} руу залгаж байна...`}
            </h3>
            <EndButton theme={isDarkMode ? "dark" : "light"} />
          </div>
        )}

        {isIncomingCall && (
          <div
            className={`backdrop-blur-sm p-8 rounded-2xl text-center shadow-2xl transition-all duration-300 ${
              isDarkMode
                ? "bg-white/10 border border-white/20 text-white"
                : "bg-white/80 border border-gray/20 text-gray-800"
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
                onClick={() => {
                  setToPhoneNumber(inboundUserData?.fromNumber || "");
                }}
                theme={isDarkMode ? "dark" : "light"}
              />
              <DeclineButton theme={isDarkMode ? "dark" : "light"} />
            </div>
          </div>
        )}

        {isCallActive && (
          <div
            className={`backdrop-blur-sm p-8 rounded-2xl text-center shadow-2xl transition-all duration-300 ${
              isDarkMode
                ? "bg-white/10 border border-white/20 text-white"
                : "bg-white/80 border border-gray/20 text-gray-800"
            }`}
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                📞
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Дуудлага хийж байна</h3>
            <div className="flex flex-row items-center gap-4 justify-center mt-6">
              <MicButton theme={isDarkMode ? "dark" : "light"} />
              <EndButton theme={isDarkMode ? "dark" : "light"} />
            </div>
          </div>
        )}

        {!isOutboundCall && !isIncomingCall && !isCallActive && (
          <div className="grid grid-cols-3 w-full gap-4">
            <div className="w-full flex items-center justify-end"></div>
            <div className="w-full flex items-center justify-center">
              {isConnected &&
                !isIncomingCall &&
                !isOutboundCall &&
                !isCallActive && (
                  <CallButton
                    toPhoneNumber={toPhoneNumber}
                    disabled={toPhoneNumber.length === 0}
                    onClick={() => {
                      console.log("call button clicked");
                    }}
                    theme={isDarkMode ? "dark" : "light"}
                  />
                )}
            </div>
            <div className="w-full flex items-center justify-start">
              {" "}
              <NumberDeleteButton
                phoneNumber={toPhoneNumber}
                onClick={() => setToPhoneNumber(toPhoneNumber.slice(0, -1))}
                theme={isDarkMode ? "dark" : "light"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WebComponentPage() {
  return (
    <ClientWrapper>
      <WebComponentContent />
    </ClientWrapper>
  );
}
