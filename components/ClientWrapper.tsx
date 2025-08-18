"use client";

import { ClientProvider } from "@callpromn/rtc-kit-react";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const phoneNumber =
    process.env.NEXT_PUBLIC_PHONE_NUMBER || "YOUR_COMPANY_PHONE";

  return (
    <ClientProvider
      config={{
        socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL!,
        socketToken: process.env.NEXT_PUBLIC_SOCKET_TOKEN!,
        phoneNumber: phoneNumber,
        socketConnectionOptions: undefined,
        outboundRoom: process.env.NEXT_PUBLIC_OUTBOUND_ROOM!,
        inboundRoom: process.env.NEXT_PUBLIC_INBOUND_ROOM!,
      }}
    >
      {children}
    </ClientProvider>
  );
}
