import type React from "react";

type RtcCustomElements = {
  "call-button": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    "to-phone-number"?: string;
    disabled?: boolean;
    theme?: "light" | "dark";
    keyboard?: string;
  };
  "accept-button": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    disabled?: boolean;
    theme?: "light" | "dark";
    keyboard?: string;
  };
  "decline-button": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    disabled?: boolean;
    theme?: "light" | "dark";
    keyboard?: string;
  };
  "endcall-button": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    disabled?: boolean;
    theme?: "light" | "dark";
    keyboard?: string;
  };
  "mic-button": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    disabled?: boolean;
    "mic-on"?: string;
    theme?: "light" | "dark";
    keyboard?: string;
  };
  "rtc-numpad": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    "phone-number"?: string;
    "max-length"?: string;
    theme?: "light" | "dark";
    keyboard?: string;
  };
  "rtc-number-field": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    "phone-number"?: string;
    theme?: "light" | "dark";
    placeholder?: string;
  };
  "rtc-number-delete-button": React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > & {
    "phone-number"?: string;
    visible?: string;
    theme?: "light" | "dark";
    keyboard?: string;
  };
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends RtcCustomElements {}
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends RtcCustomElements {}
  }
}

export {};
