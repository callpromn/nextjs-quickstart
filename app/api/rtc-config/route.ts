import { NextResponse } from "next/server";
import { getRtmToken } from "@callpromn/rtc-sdk/server";

export async function GET() {
  const config = {
    socketUrl: process.env.SOCKET_URL,
    phoneNumber: process.env.PHONE_NUMBER,
    outboundRoom: process.env.OUTBOUND_ROOM,
    inboundRoom: process.env.INBOUND_ROOM,
  };

  const missing = Object.entries({
    ...config,
    CALLPRO_RTC_API_KEY: process.env.CALLPRO_RTC_API_KEY,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Server configuration incomplete" },
      { status: 500 }
    );
  }

  try {
    const socketToken = await getRtmToken(process.env.CALLPRO_RTC_API_KEY!);
    return NextResponse.json(
      { ...config, socketToken },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 502 }
    );
  }
}
