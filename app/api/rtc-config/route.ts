import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    socketUrl: process.env.SOCKET_URL,
    socketToken: process.env.SOCKET_TOKEN,
    phoneNumber: process.env.PHONE_NUMBER,
    outboundRoom: process.env.OUTBOUND_ROOM,
    inboundRoom: process.env.INBOUND_ROOM,
  };

  const missing = Object.entries(config)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Server configuration incomplete" },
      { status: 500 }
    );
  }

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
