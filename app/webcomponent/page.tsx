"use client";

import {
  CallWidget,
  CallButton,
  Numpad,
  NumberField,
  useCall,
  useKeyboardDialer,
} from "@callpromn/rtc-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClientWrapper from "../../components/ClientWrapper";

function StatusBar() {
  const { isConnected, state } = useCall();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`px-3 py-1 rounded-full ${
          isConnected ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        {isConnected ? "🟢 Connected" : "🔴 Connecting…"}
      </span>
      <span className="text-gray-400">state: {state}</span>
    </div>
  );
}

function CustomDialer() {
  const { toNumber } = useCall();
  useKeyboardDialer();
  return (
    <div className="flex flex-col items-stretch gap-3 w-[280px]">
      <NumberField autoFocus={false} />
      <Numpad />
      <CallButton toNumber={toNumber} />
    </div>
  );
}

function Content() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-10 bg-slate-900 text-white p-8">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-gray-300"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      <h2 className="text-xl font-semibold">@callpromn/rtc-react demo</h2>
      <StatusBar />

      <div className="flex flex-row items-start gap-12">
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-sm uppercase text-gray-400">Drop-in widget</h3>
          <CallWidget />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h3 className="text-sm uppercase text-gray-400">Composed primitives</h3>
          <CustomDialer />
        </div>
      </div>
    </div>
  );
}

export default function WebComponentPage() {
  return (
    <ClientWrapper>
      <Content />
    </ClientWrapper>
  );
}
