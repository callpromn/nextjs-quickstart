"use client";

import {
  Delete,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import {
  CallClient,
  CallClientInstance,
  InboundUserData,
} from "@callpro/rtc-sdk";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CorePage() {
  const callClient = CallClient();
  const phoneNumber =
    process.env.NEXT_PUBLIC_PHONE_NUMBER || "YOUR_COMPANY_PHONE";

  const config = {
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL!,
    socketToken: process.env.NEXT_PUBLIC_SOCKET_TOKEN!,
    socketConnectionOptions: {
      transports: ["websocket"],
    },
    phoneNumber: phoneNumber,
    outboundRoom: process.env.NEXT_PUBLIC_OUTBOUND_ROOM!,
    inboundRoom: process.env.NEXT_PUBLIC_INBOUND_ROOM!,
  };

  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isOutboundCall, setIsOutboundCall] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [toPhoneNumber, setToPhoneNumber] = useState("");
  const [inboundUserData, setInboundUserData] = useState<InboundUserData>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const callClientInstance = useRef<CallClientInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const createCallClient = async () => {
    try {
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
        console.log("📞 Call ended");
        setIsIncomingCall(false);
        setIsOutboundCall(false);
        setIsCallActive(false);
      });

      callClientInstance.current.on("busy", () => {
        console.log("📞 Call busy");
        setIsIncomingCall(false);
        setIsOutboundCall(false);
        setIsCallActive(false);
      });

      callClientInstance.current.on("answered", () => {
        console.log("📞 Call answered");
        setIsIncomingCall(false);
        setIsOutboundCall(false);
        setIsCallActive(true);
      });

      callClientInstance.current.on("bye", () => {
        console.log("📞 Call ended");
        setIsIncomingCall(false);
        setIsOutboundCall(false);
        setIsCallActive(false);
      });

      // Socket-ын холболтын төлөвийг шалгах
      setIsConnected(callClientInstance.current.isConnected());
      console.log("✅ Call client connected and ready");
    } catch (error) {
      console.error("❌ Failed to create call client:", error);
    }
  };

  useEffect(() => {
    createCallClient();
  }, []);

  // Timer effect for call duration
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

  const handleAcceptCall = async () => {
    try {
      await callClientInstance.current?.acceptCall();
      console.log("✅ Call accepted");
      setIsIncomingCall(false);
      setIsCallActive(true);
    } catch (error) {
      console.error("❌ Failed to accept call:", error);
    }
  };

  const handleDeclineCall = async () => {
    try {
      await callClientInstance.current?.declineCall();
      console.log("❌ Call declined");
      setIsIncomingCall(false);
      setIsCallActive(false);
    } catch (error) {
      console.error("❌ Failed to decline call:", error);
    }
  };

  const handleEndCall = async () => {
    try {
      await callClientInstance.current?.endCall();
      console.log("📞 Call ended");
      setIsIncomingCall(false);
      setIsOutboundCall(false);
      setIsCallActive(false);
    } catch (error) {
      console.error("❌ Failed to end call:", error);
    }
  };

  const handleMakeCall = async () => {
    try {
      await callClientInstance.current?.createCall(toPhoneNumber);
      setIsOutboundCall(true);
      console.log("📞 Outbound call initiated");
    } catch (error) {
      console.error("❌ Failed to make call:", error);
    }
  };

  const handleToggleMic = async () => {
    try {
      await callClientInstance.current?.toggleMic();
      setIsMicOn(!isMicOn);
      console.log(`🎤 Mic ${!isMicOn ? "on" : "off"}`);
    } catch (error) {
      console.error("❌ Failed to toggle mic:", error);
    }
  };

  // Helper function to format call duration
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Socket-ын холболтын төлөвийг шалгах
  const checkConnectionStatus = () => {
    setIsConnected(false);
    setTimeout(() => {
      if (callClientInstance.current) {
        const connected = callClientInstance.current.isConnected();
        setIsConnected(connected);
        console.log(
          `🔌 Connection status: ${connected ? "Connected" : "Disconnected"}`
        );
        return connected;
      }
      return false;
    }, 1000);
  };

  // Handle numpad clicks
  const handleNumberClick = (number: string) => {
    if (toPhoneNumber.length < 8) {
      setToPhoneNumber(toPhoneNumber + number);
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    setToPhoneNumber(toPhoneNumber.slice(0, -1));
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
        CallPro RTC Core Test NextJS
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
        <div className="w-[250px] flex flex-row items-center gap-4">
          <div
            className={`backdrop-blur-sm rounded-2xl p-4 shadow-xl transition-all duration-300 ${
              isDarkMode
                ? "bg-white/10 border border-white/20"
                : "bg-white/80 border border-blue-200/40"
            }`}
          >
            <input
              type="text"
              value={toPhoneNumber}
              readOnly
              className={`w-full text-center text-lg font-mono bg-transparent outline-none ${
                isDarkMode
                  ? "text-white placeholder-gray-400"
                  : "text-gray-800 placeholder-gray-500"
              }`}
              placeholder="Дугаар оруулна уу"
            />
          </div>
        </div>
      )}

      {!isOutboundCall && !isIncomingCall && !isCallActive && (
        <div className="grid grid-cols-3 gap-3 w-[250px] place-items-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((num) => (
            <button
              key={num}
              onClick={() =>
                num !== "*" && num !== "#"
                  ? handleNumberClick(num.toString())
                  : undefined
              }
              className={`w-16 h-16 backdrop-blur-sm rounded-xl text-xl font-semibold transition-all duration-300 hover:shadow-lg ${
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:shadow-white/10"
                  : "bg-white/80 text-gray-800 hover:bg-white/90 border border-blue-200/40 hover:shadow-blue/10"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
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
            className={`flex flex-col items-center justify-center backdrop-blur-sm p-8 rounded-2xl shadow-2xl transition-all duration-300 ${
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
            <h3 className="text-lg font-semibold mb-4 text-center">
              {`${toPhoneNumber} руу залгаж байна...`}
            </h3>
            <button
              onClick={handleEndCall}
              className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full text-white text-2xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50"
            >
              <PhoneOff />
            </button>
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
              <button
                onClick={() => {
                  setToPhoneNumber(inboundUserData?.fromNumber || "");
                  handleAcceptCall();
                }}
                className="flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full text-white text-2xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50"
              >
                <Phone />
              </button>
              <button
                onClick={handleDeclineCall}
                className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full text-white text-2xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50"
              >
                <PhoneOff />
              </button>
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
            <div
              className={`text-3xl font-mono mb-6 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {formatTime(callDuration)}
            </div>
            <div className="flex flex-row items-center gap-4 justify-center">
              <button
                onClick={handleToggleMic}
                className={`flex items-center justify-center w-16 h-16 rounded-full text-white text-2xl transition-all duration-300 hover:shadow-lg ${
                  isMicOn
                    ? "bg-gray-600 hover:bg-gray-700 hover:shadow-gray-600/50"
                    : "bg-red-500 hover:bg-red-600 hover:shadow-red-500/50"
                }`}
              >
                {isMicOn ? <Mic /> : <MicOff />}
              </button>
              <button
                onClick={handleEndCall}
                className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full text-white text-2xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50"
              >
                <PhoneOff />
              </button>
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
                  <button
                    onClick={handleMakeCall}
                    disabled={toPhoneNumber.length === 0}
                    className="flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-full text-white text-2xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50"
                  >
                    <Phone />
                  </button>
                )}
            </div>
            <div className="w-full flex items-center justify-start">
              {" "}
              {toPhoneNumber.length > 0 && (
                <button
                  onClick={handleBackspace}
                  className={`flex items-center justify-center w-12 h-12 backdrop-blur-sm rounded-xl transition-all duration-300 hover:shadow-lg ${
                    isDarkMode
                      ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      : "bg-white/80 text-gray-800 hover:bg-white/90 border border-blue-200/40"
                  }`}
                >
                  <Delete />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
