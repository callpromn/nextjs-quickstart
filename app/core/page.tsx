"use client";

import {
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import {
  CallClient,
  CallClientInstance,
  InboundUserData,
} from "@callpromn/rtc-sdk";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CorePage() {
  const callClient = CallClient();

  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isOutboundCall, setIsOutboundCall] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [toPhoneNumber, setToPhoneNumber] = useState("");
  const [inboundUserData, setInboundUserData] = useState<InboundUserData>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [webComponentsReady, setWebComponentsReady] = useState(false);
  const callClientInstance = useRef<CallClientInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const numpadRef = useRef<HTMLElement | null>(null);
  const deleteBtnRef = useRef<HTMLElement | null>(null);

  const theme = isDarkMode ? "dark" : "light";

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("@callpromn/rtc-kit")
      .then(() =>
        Promise.all([
          customElements.whenDefined("rtc-numpad"),
          customElements.whenDefined("rtc-number-field"),
          customElements.whenDefined("rtc-number-delete-button"),
          customElements.whenDefined("call-button"),
          customElements.whenDefined("accept-button"),
          customElements.whenDefined("decline-button"),
          customElements.whenDefined("endcall-button"),
          customElements.whenDefined("mic-button"),
        ]),
      )
      .then(() => setWebComponentsReady(true))
      .catch((err) => console.error("Failed to load rtc-kit:", err));
  }, []);

  const createCallClient = async () => {
    try {
      const res = await fetch("/api/rtc-config");
      if (!res.ok) throw new Error("Failed to load config");
      const serverConfig = await res.json();

      const config = {
        socketUrl: serverConfig.socketUrl,
        socketToken: serverConfig.socketToken,
        socketConnectionOptions: { transports: ["websocket"] },
        phoneNumber: serverConfig.phoneNumber,
        outboundRoom: serverConfig.outboundRoom,
        inboundRoom: serverConfig.inboundRoom,
      };

      callClientInstance.current = await callClient.createClient(config);

      callClientInstance.current.on("call_init", async (data: string) => {
        if (data === "incoming") {
          const userData =
            await callClientInstance.current?.getInboundUserData();
          setInboundUserData(userData || null);
          setIsIncomingCall(true);
        }
      });

      callClientInstance.current.on("hangup", () => {
        setIsIncomingCall(false);
        setIsOutboundCall(false);
        setIsCallActive(false);
      });

      callClientInstance.current.on("busy", () => {
        setIsIncomingCall(false);
        setIsOutboundCall(false);
        setIsCallActive(false);
      });

      callClientInstance.current.on("answered", () => {
        setIsIncomingCall(false);
        setIsOutboundCall(false);
        setIsCallActive(true);
      });

      callClientInstance.current.on("bye", () => {
        setIsIncomingCall(false);
        setIsOutboundCall(false);
        setIsCallActive(false);
      });

      setIsConnected(callClientInstance.current.isConnected());
    } catch (error) {
      console.error("Failed to create call client:", error);
      setConfigError("Failed to initialize. Please try again.");
    }
  };

  useEffect(() => {
    createCallClient();
  }, []);

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

  // rtc-numpad emits a custom `number-click` event with detail.value
  useEffect(() => {
    const el = numpadRef.current;
    if (!el || !webComponentsReady) return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ value: string }>;
      const value = customEvent.detail?.value;
      if (!value) return;
      setToPhoneNumber((prev) => (prev.length < 8 ? prev + value : prev));
    };

    el.addEventListener("number-click", handler);
    return () => el.removeEventListener("number-click", handler);
  }, [webComponentsReady]);

  // rtc-number-delete-button emits a `delete-click` event
  useEffect(() => {
    const el = deleteBtnRef.current;
    if (!el || !webComponentsReady) return;

    const handler = () => {
      setToPhoneNumber((prev) => prev.slice(0, -1));
    };

    el.addEventListener("delete-click", handler);
    return () => el.removeEventListener("delete-click", handler);
  }, [webComponentsReady]);

  const handleAcceptCall = async () => {
    try {
      await callClientInstance.current?.acceptCall();
      setIsIncomingCall(false);
      setIsCallActive(true);
    } catch (error) {
      console.error("Failed to accept call:", error);
    }
  };

  const handleDeclineCall = async () => {
    try {
      await callClientInstance.current?.declineCall();
      setIsIncomingCall(false);
      setIsCallActive(false);
    } catch (error) {
      console.error("Failed to decline call:", error);
    }
  };

  const handleEndCall = async () => {
    try {
      await callClientInstance.current?.endCall();
      setIsIncomingCall(false);
      setIsOutboundCall(false);
      setIsCallActive(false);
    } catch (error) {
      console.error("Failed to end call:", error);
    }
  };

  const handleMakeCall = async () => {
    if (!toPhoneNumber) return;
    try {
      await callClientInstance.current?.createCall(toPhoneNumber);
      setIsOutboundCall(true);
    } catch (error) {
      console.error("Failed to make call:", error);
    }
  };

  const handleToggleMic = async () => {
    try {
      await callClientInstance.current?.toggleMic();
      setIsMicOn((prev) => !prev);
    } catch (error) {
      console.error("Failed to toggle mic:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const checkConnectionStatus = () => {
    setIsConnected(false);
    setTimeout(() => {
      if (callClientInstance.current) {
        setIsConnected(callClientInstance.current.isConnected());
      }
    }, 1000);
  };

  // Physical keyboard dialer — types digits, backspaces, dials on Enter.
  useEffect(() => {
    if (isIncomingCall || isOutboundCall || isCallActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        setToPhoneNumber((prev) => (prev.length < 8 ? prev + e.key : prev));
      } else if (e.key === "Backspace") {
        setToPhoneNumber((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        if (isConnected && toPhoneNumber.length > 0) {
          handleMakeCall();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isIncomingCall,
    isOutboundCall,
    isCallActive,
    isConnected,
    toPhoneNumber,
  ]);

  if (configError) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        {configError}
      </div>
    );
  }

  const isIdle = !isOutboundCall && !isIncomingCall && !isCallActive;

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center py-8 gap-4 transition-all duration-500 ${
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
          🔌 Холболтын шалгах
        </button>
      </div>

      {!webComponentsReady && (
        <div
          className={`text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Loading rtc-kit web components…
        </div>
      )}

      {webComponentsReady && isIdle && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-[280px] flex flex-row items-center gap-2">
            <rtc-number-field
              phone-number={toPhoneNumber}
              theme={theme}
              style={{ flex: 1 }}
            />
            <rtc-number-delete-button
              ref={deleteBtnRef as React.RefObject<HTMLElement>}
              phone-number={toPhoneNumber}
              visible={(toPhoneNumber.length > 0).toString()}
              theme={theme}
            />
          </div>

          <rtc-numpad
            ref={numpadRef as React.RefObject<HTMLElement>}
            phone-number={toPhoneNumber}
            max-length="8"
            theme={theme}
          />

          <call-button
            to-phone-number={toPhoneNumber}
            disabled={!isConnected || toPhoneNumber.length === 0}
            theme={theme}
            onClick={handleMakeCall}
          />
        </div>
      )}

      {webComponentsReady && isOutboundCall && (
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
          <endcall-button theme={theme} onClick={handleEndCall} />
        </div>
      )}

      {webComponentsReady && isIncomingCall && (
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
            <accept-button
              theme={theme}
              onClick={() => {
                setToPhoneNumber(inboundUserData?.fromNumber || "");
                handleAcceptCall();
              }}
            />
            <decline-button theme={theme} onClick={handleDeclineCall} />
          </div>
        </div>
      )}

      {webComponentsReady && isCallActive && (
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
            <mic-button
              mic-on={isMicOn ? "" : undefined}
              theme={theme}
              onClick={handleToggleMic}
            />
            <endcall-button theme={theme} onClick={handleEndCall} />
          </div>
        </div>
      )}
    </div>
  );
}
