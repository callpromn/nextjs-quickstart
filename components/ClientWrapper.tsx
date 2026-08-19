"use client";

import { ClientProvider } from "@callpromn/rtc-kit-react";
import { useEffect, useState } from "react";

interface RtcConfig {
  socketUrl: string;
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
      <div className="w-full h-full min-h-[220px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!config) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center text-gray-400">
        Connecting...
      </div>
    );
  }

  return (
    <ClientProvider
      config={{
        socketUrl: config.socketUrl,
        tokenEndpoint: "/api/rtc-config",
        socketConnectionOptions: {
          transports: ["websocket"],
        },
        phoneNumber: config.phoneNumber,
        outboundRoom: config.outboundRoom,
        inboundRoom: config.inboundRoom,
      }}
    >
      {children}
    </ClientProvider>
  );
}
