"use client";

import { useRtcKitReady } from "./useRtcKitReady";

/**
 * Inert idle-dialer preview for the *disabled* side of the showcase.
 *
 * Renders the real rtc-kit web components in their idle layout but with NO
 * socket, NO event listeners, and NO `keyboard` attribute (so it never grabs
 * window key events). The caller is expected to wrap this in a container with
 * `pointer-events-none` + reduced opacity to communicate the disabled state.
 */
export default function GreyedPreview({
  theme,
}: {
  theme: "light" | "dark";
}) {
  const ready = useRtcKitReady();

  if (!ready) {
    // Lightweight skeleton matching the dialer footprint.
    return (
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-[280px] h-11 rounded-xl bg-gray-500/20" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-16 h-12 rounded-xl bg-gray-500/20" />
          ))}
        </div>
        <div className="w-16 h-16 rounded-full bg-gray-500/20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="w-[280px] flex flex-row items-center gap-2">
        <rtc-number-field
          phone-number=""
          theme={theme}
          placeholder="Disabled"
          style={{ flex: 1 }}
        />
        <rtc-number-delete-button
          phone-number=""
          visible="false"
          theme={theme}
        />
      </div>

      <rtc-numpad phone-number="" max-length="8" theme={theme} />

      <call-button to-phone-number="" disabled theme={theme} />
    </div>
  );
}
