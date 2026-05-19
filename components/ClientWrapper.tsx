"use client";

import { RTCProvider } from "@callpromn/rtc-react";
import "@callpromn/rtc-react/styles.css";
import { useEffect, useState } from "react";

interface RtcConfig {
  socketUrl: string;
  socketToken: string;
  phoneNumber: string;
  outboundRoom: string;
  inboundRoom: string;
}

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<RtcConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rtc-config")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load config");
        return res.json();
      })
      .then(setConfig)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!config) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-400">
        Connecting...
      </div>
    );
  }

  return (
    <RTCProvider
      config={{
        socketUrl: config.socketUrl,
        socketToken: config.socketToken,
        phoneNumber: config.phoneNumber,
        outboundRoom: config.outboundRoom,
        inboundRoom: config.inboundRoom,
      }}
      theme="dark"
    >
      {children}
    </RTCProvider>
  );
}
