"use client";

import {
  CallClient,
  CallClientInstance,
  InboundUserData,
} from "@callpromn/rtc-sdk";
import { useEffect, useRef, useState } from "react";
import { useRtcKitReady } from "./useRtcKitReady";
import GreyedPreview from "./GreyedPreview";

/**
 * Core implementation dialer: talks to `@callpromn/rtc-sdk` directly and wires
 * raw rtc-kit web components by hand.
 *
 * Connection lifecycle is gated on `active` — the signaling client is only
 * created while this panel is the active side of the showcase, so exactly one
 * connection to the shared inbound/outbound rooms exists at a time. When
 * inactive it renders an inert, greyed preview (no socket, no listeners).
 */
export default function CoreDialer({
  active,
  theme,
}: {
  active: boolean;
  theme: "light" | "dark";
}) {
  const callClient = CallClient();

  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isOutboundCall, setIsOutboundCall] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [toPhoneNumber, setToPhoneNumber] = useState("");
  const [inboundUserData, setInboundUserData] = useState<InboundUserData>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const callClientInstance = useRef<CallClientInstance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const numpadRef = useRef<HTMLElement | null>(null);
  const deleteBtnRef = useRef<HTMLElement | null>(null);

  const ready = useRtcKitReady();
  const isDarkMode = theme === "dark";
  const isIdle = !isOutboundCall && !isIncomingCall && !isCallActive;

  // Connect only while this panel is active. Toggling away triggers cleanup,
  // which disconnects and resets state back to idle/disconnected.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
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

        const instance = await callClient.createClient(config);

        // StrictMode / toggle дунд unmount болж магадгүй — шинэ instance-ыг устгана.
        if (cancelled) {
          instance.disconnect?.();
          return;
        }

        callClientInstance.current = instance;

        instance.on("call_init", async (data: string) => {
          if (data === "incoming") {
            const userData = await instance.getInboundUserData();
            setInboundUserData(userData || null);
            setIsIncomingCall(true);
          }
        });

        instance.on("hangup", () => {
          setIsIncomingCall(false);
          setIsOutboundCall(false);
          setIsCallActive(false);
        });

        instance.on("busy", () => {
          setIsIncomingCall(false);
          setIsOutboundCall(false);
          setIsCallActive(false);
        });

        instance.on("answered", () => {
          setIsIncomingCall(false);
          setIsOutboundCall(false);
          setIsCallActive(true);
        });

        instance.on("bye", () => {
          setIsIncomingCall(false);
          setIsOutboundCall(false);
          setIsCallActive(false);
        });

        setIsConnected(instance.isConnected());
      } catch (error) {
        console.error("Failed to create call client:", error);
        if (!cancelled) setConfigError("Failed to initialize. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
      callClientInstance.current?.disconnect?.();
      callClientInstance.current = null;
      setIsConnected(false);
      setIsIncomingCall(false);
      setIsOutboundCall(false);
      setIsCallActive(false);
      setConfigError(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

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

  // rtc-numpad emits `number-click`. The idle UI is conditionally rendered, so
  // the element remounts whenever we leave/return to idle (or toggle active) —
  // re-run on those deps to re-attach the listener to the live element.
  useEffect(() => {
    const el = numpadRef.current;
    if (!el || !ready || !active) return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ value: string }>;
      const value = customEvent.detail?.value;
      if (!value) return;
      setToPhoneNumber((prev) => (prev.length < 8 ? prev + value : prev));
    };

    el.addEventListener("number-click", handler);
    return () => el.removeEventListener("number-click", handler);
  }, [ready, active, isIdle]);

  // rtc-number-delete-button emits `delete-click` — same remount caveat.
  useEffect(() => {
    const el = deleteBtnRef.current;
    if (!el || !ready || !active) return;

    const handler = () => {
      setToPhoneNumber((prev) => prev.slice(0, -1));
    };

    el.addEventListener("delete-click", handler);
    return () => el.removeEventListener("delete-click", handler);
  }, [ready, active, isIdle]);

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

  const checkConnectionStatus = () => {
    setIsConnected(false);
    setTimeout(() => {
      if (callClientInstance.current) {
        setIsConnected(callClientInstance.current.isConnected());
      }
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ---- Inactive: inert greyed preview, no connection ----
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

  // ---- Active: live, connected, interactive ----
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

      {configError && (
        <div className="text-sm text-red-500">{configError}</div>
      )}

      {!ready && (
        <div
          className={`text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Loading rtc-kit web components…
        </div>
      )}

      {ready && isIdle && (
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
              keyboard=""
            />
          </div>

          <rtc-numpad
            ref={numpadRef as React.RefObject<HTMLElement>}
            phone-number={toPhoneNumber}
            max-length="8"
            theme={theme}
            keyboard=""
          />

          <call-button
            to-phone-number={toPhoneNumber}
            disabled={!isConnected || toPhoneNumber.length === 0}
            theme={theme}
            keyboard=""
            onClick={handleMakeCall}
          />
        </div>
      )}

      {ready && isOutboundCall && (
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
          <endcall-button theme={theme} keyboard="" onClick={handleEndCall} />
        </div>
      )}

      {ready && isIncomingCall && (
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
              keyboard=""
              onClick={() => {
                setToPhoneNumber(inboundUserData?.fromNumber || "");
                handleAcceptCall();
              }}
            />
            <decline-button
              theme={theme}
              keyboard=""
              onClick={handleDeclineCall}
            />
          </div>
        </div>
      )}

      {ready && isCallActive && (
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
              keyboard=""
              onClick={handleToggleMic}
            />
            <endcall-button theme={theme} keyboard="" onClick={handleEndCall} />
          </div>
        </div>
      )}
    </div>
  );
}
