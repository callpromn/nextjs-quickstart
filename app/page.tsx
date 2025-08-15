"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 py-8 gap-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">CallPro RTC SDK</h1>
        <p className="text-gray-300 text-lg">Choose your implementation</p>
      </div>

      <div className="flex flex-col gap-6">
        <Link
          href="/core"
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-white hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 text-center min-w-[300px]"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              ⚡
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Core Implementation</h2>
          <p className="text-gray-300 text-sm">
            Direct rtc-sdk functions with custom UI
          </p>
        </Link>

        <Link
          href="/webcomponent"
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-white hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 text-center min-w-[300px]"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              🧩
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">UI Components</h2>
          <p className="text-gray-300 text-sm">
            Pre-built rtc-kit-react components
          </p>
        </Link>
      </div>
    </div>
  );
}
