declare global {
  namespace JSX {
    interface IntrinsicElements {
      "call-button": {
        "socket-url"?: string;
        "socket-token"?: string;
        "phone-number"?: string;
        "outbound-room"?: string;
        "inbound-room"?: string;
        "to-phone-number"?: string;
      };
    }
  }
}

export {};
