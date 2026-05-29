"use client";

import { useEffect, useState } from "react";

// rtc-kit web components бүгд side-effect import дээр бүртгэгддэг.
// Бүх элемент `customElements.define` хийгдэж дуустал хүлээнэ.
const RTC_ELEMENTS = [
  "rtc-numpad",
  "rtc-number-field",
  "rtc-number-delete-button",
  "call-button",
  "accept-button",
  "decline-button",
  "endcall-button",
  "mic-button",
] as const;

/**
 * Loads `@callpromn/rtc-kit` (side-effect registration of the custom elements)
 * and resolves once every element is defined. Safe to call from multiple
 * components — the dynamic import is cached and `whenDefined` resolves
 * instantly for already-registered elements.
 */
export function useRtcKitReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    import("@callpromn/rtc-kit")
      .then(() =>
        Promise.all(RTC_ELEMENTS.map((name) => customElements.whenDefined(name))),
      )
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => console.error("Failed to load rtc-kit:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
