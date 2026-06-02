# CallPro RTC SDK — Next.js Quickstart

Энэхүү repository нь CallPro-ийн RTC багц сангуудыг Next.js (App Router) дээр хэрхэн нэвтрүүлэхийг харуулсан албан ёсны жишээ төсөл юм. Нэг дуудлагын аппликэйшнийг **хоёр өөр түвшний integration-ээр** зэрэгцүүлэн хэрэгжүүлж үзүүлнэ:

1. **Core integration** — `@callpromn/rtc-sdk`-ийн API-г шууд ашиглаж, UI болон төлөвийн удирдлагыг өөрөө бичих
2. **Component integration** — `@callpromn/rtc-kit-react`-ийн бэлэн component-ууд болон `ClientProvider`-ийг ашиглах

## Ашигласан багцууд

| Багц | Үүрэг |
|---|---|
| [`@callpromn/rtc-sdk`](https://www.npmjs.com/package/@callpromn/rtc-sdk) | Дуудлагын цөм SDK — signaling (Socket.IO) болон WebRTC media давхарга |
| [`@callpromn/rtc-kit`](https://www.npmjs.com/package/@callpromn/rtc-kit) | Framework-ээс хамааралгүй Web Components (Shadow DOM) UI element-үүд |
| [`@callpromn/rtc-kit-react`](https://www.npmjs.com/package/@callpromn/rtc-kit-react) | React wrapper component-ууд, `ClientProvider` context болон hook-ууд |

## Урьдчилсан шаардлага

- **Node.js 20 LTS** (Next.js 15 нь 18.18+ шаарддаг)
- npm
- **CallPro tenant-ийн тохиргооны утгууд** — signaling server-ийн хаяг, холболтын token, inbound/outbound room-ийн нэрс болон tenant-ийн утасны дугаар. Эдгээр утгыг CallPro platform-ын tenant тохиргооноос олгоно.

## Суулгах ба ажиллуулах

```bash
git clone <repository-url>
cd rtc-nextjs-quickstart
npm install
```

Орчны хувьсагчдыг тохируулна:

```bash
cp .env.example .env.local
```

`.env.local` доторх хувьсагч бүрийг өөрийн tenant-ийн утгаар бөглөнө (доорх утгууд нь зөвхөн жишээ):

```ini
# Эдгээр хувьсагч зөвхөн server-ийн орчинд уншигдана ("Аюулгүй байдал" хэсгийг үзнэ үү)
PHONE_NUMBER=00000000
SOCKET_URL=wss://signaling.example.com
SOCKET_TOKEN=your-socket-token
OUTBOUND_ROOM=your-outbound-room
INBOUND_ROOM=your-inbound-room
```

> ⚠️ Жинхэнэ token, утасны дугаар, server-ийн хаягийг хэзээ ч repository-д commit хийж болохгүй. `.env.local` нь `.gitignore`-д орсон байгаа.

Development server ажиллуулах:

```bash
npm run dev      # http://localhost:3000
```

## Хуудасны бүтэц

| Зам | Тайлбар |
|---|---|
| `/` | Хоёр integration-ийг зэрэгцүүлсэн харьцуулалтын дэлгэц. Нэг талыг нь сонгоход зөвхөн тухайн тал signaling server-тэй холбогдоно (нэг socket холболтын зарчим) |
| `/core` | Core integration — бие даасан хуудас |
| `/webcomponent` | Component integration — бие даасан хуудас |
| `/api/rtc-config` | Тохиргоог runtime үед client рүү дамжуулах server route |

## Тохиргооны урсгал ба аюулгүй байдлын загвар

Энэ төсөл орчны хувьсагчдад **зориуд `NEXT_PUBLIC_` угтвар ашигладаггүй**. `NEXT_PUBLIC_` хувьсагчид build үед статик JS bundle дотор шигдэн орох тул `SOCKET_TOKEN` мэт нууц утгыг ил болгодог. Үүний оронд:

```
.env.local (server) → GET /api/rtc-config (Cache-Control: no-store) → client runtime үед татна
```

`app/api/rtc-config/route.ts` нь дутуу тохиргоотой үед `500` буцааж, амжилттай хариултаа cache хийхийг хориглодог. Client талд `components/ClientWrapper.tsx` (component integration) болон `components/CoreDialer.tsx` (core integration) тус тус энэ route-аас тохиргоогоо татаж SDK-д дамжуулна.

> Production орчинд signaling token-ийг богино хугацааны, server талаас сессия бүрд олгогддог байхаар хэрэгжүүлэхийг зөвлөж байна.

---

## 1. Core integration — `@callpromn/rtc-sdk`

**Файл**: `components/CoreDialer.tsx` (хуудас: `app/core/page.tsx`)

### Client үүсгэх

```typescript
import { CallClient, CallClientInstance, InboundUserData } from "@callpromn/rtc-sdk";

const callClient = CallClient();
const instanceRef = useRef<CallClientInstance | null>(null);

const res = await fetch("/api/rtc-config");
const serverConfig = await res.json();

const instance = await callClient.createClient({
  socketUrl: serverConfig.socketUrl,
  socketToken: serverConfig.socketToken,
  socketConnectionOptions: { transports: ["websocket"] },
  phoneNumber: serverConfig.phoneNumber,
  outboundRoom: serverConfig.outboundRoom,
  inboundRoom: serverConfig.inboundRoom,
});
```

Тохиргоо нь зөвхөн **signaling** холболтыг тодорхойлно. WebRTC media server-ийн хаяг болон token нь дуудлага бүрд signaling-аар дамжин ирдэг тул тохиргоонд заагддаггүй.

### Event-үүд

`instance.on(event, handler)`-аар дараах **6 event-ийг** сонсоно:

| Event | Payload | Тайлбар |
|---|---|---|
| `call_init` | `"incoming"` \| `"outbound"` | Дуудлага эхэлсэн (орох эсвэл гарах) |
| `ringing` | — | Эсрэг тал руу дуудлага хонхдож байна |
| `answered` | — | Дуудлагад хариулсан |
| `hangup` | — | Дуудлага таслагдсан |
| `busy` | — | Эсрэг тал завгүй |
| `bye` | — | Эсрэг тал дуудлагаа дуусгасан |

```typescript
instance.on("call_init", async (direction: string) => {
  if (direction === "incoming") {
    // InboundUserData нь null байж болохыг анхаарна уу
    const userData: InboundUserData = await instance.getInboundUserData();
    if (!userData) return;
    // userData.fromNumber — залгаж буй дугаар
    setIsIncomingCall(true);
  }
});

instance.on("answered", () => setIsCallActive(true));
instance.on("hangup", () => resetCallState());
instance.on("busy", () => resetCallState());
instance.on("bye", () => resetCallState());
```

### Үндсэн функцууд

| Функц | Тайлбар |
|---|---|
| `createCall(toPhoneNumber)` | Гарах дуудлага эхлүүлэх |
| `acceptCall()` | Орох дуудлагыг хүлээн авах |
| `declineCall()` | Орох дуудлагыг татгалзах |
| `endCall()` | Идэвхтэй дуудлагыг дуусгах |
| `toggleMic()` | Микрофоныг хаах/нээх |
| `isConnected()` | Signaling холболтын төлөв (синхрон, `boolean`) |
| `getInboundUserData()` | Орох дуудлагын мэдээлэл (`Promise<InboundUserData>`, дуудлага байхгүй үед `null`) |
| `disconnect()` | Холболтыг бүрэн салгаж, бүх listener-ийг цэвэрлэх |

### Цэвэрлэгээ (React StrictMode)

`disconnect()` нь instance-ийг дахин ашиглах боломжгүйгээр салгадаг тул unmount буюу StrictMode-ийн давхар mount үед заавал дуудна:

```typescript
useEffect(() => {
  let cancelled = false;
  (async () => {
    const instance = await callClient.createClient(config);
    if (cancelled) { instance.disconnect?.(); return; }
    instanceRef.current = instance;
  })();
  return () => {
    cancelled = true;
    instanceRef.current?.disconnect?.();
    instanceRef.current = null;
  };
}, []);
```

### UI — `@callpromn/rtc-kit` Web Components

Core хувилбарт UI-г `@callpromn/rtc-kit`-ийн түүхий custom element-үүдээр угсарна. Багцыг import хийх нь **side effect** буюу бүх element-ийг глобалд бүртгэдэг тул SSR орчинд зөвхөн client талд динамикаар ачаална (`components/useRtcKitReady.ts`-ийг үзнэ үү):

```typescript
useEffect(() => {
  import("@callpromn/rtc-kit"); // customElements.define() side effect
}, []);
```

Бүртгэгддэг element-үүд:

| Tag | Гол attribute-ууд | Event |
|---|---|---|
| `<call-button>` | `to-phone-number`, `disabled`, `theme`, `keyboard` | `click` |
| `<accept-button>` | `disabled`, `theme`, `keyboard` | `click` |
| `<decline-button>` | `disabled`, `theme`, `keyboard` | `click` |
| `<endcall-button>` | `disabled`, `theme`, `keyboard` | `click` |
| `<mic-button>` | `mic-on`, `disabled`, `theme`, `keyboard` | `click` |
| `<rtc-numpad>` | `phone-number`, `max-length`, `theme`, `keyboard` | `number-click` (`detail.value`) |
| `<rtc-number-field>` | `phone-number`, `placeholder`, `theme` | — |
| `<rtc-number-delete-button>` | `phone-number`, `visible`, `theme`, `keyboard` | `delete-click` |

`keyboard=""` attribute нь тухайн element-ийн товчлуурын холболтыг (жишээ нь дугаарын товчнууд, Enter-ээр залгах) идэвхжүүлнэ — `CoreDialer.tsx` бүх интерактив element дээр ийнхүү тохируулсан байгаа.

```tsx
const numpadRef = useRef<HTMLElement | null>(null);

<rtc-numpad
  ref={numpadRef as React.RefObject<HTMLElement>}
  phone-number={toPhoneNumber}
  max-length="8"
  theme={theme}
  keyboard=""
/>
<call-button
  to-phone-number={toPhoneNumber}
  disabled={!isConnected || toPhoneNumber.length === 0}
  theme={theme}
  keyboard=""
  onClick={handleMakeCall}
/>
```

`rtc-numpad`-ийн `number-click` зэрэг custom event-үүдийг `addEventListener`-ээр сонсоно:

```typescript
numpadRef.current?.addEventListener("number-click", (event: Event) => {
  const { value } = (event as CustomEvent<{ value: string }>).detail;
  setToPhoneNumber((prev) => (prev.length < 8 ? prev + value : prev));
});
```

---

## 2. Component integration — `@callpromn/rtc-kit-react`

**Файл**: `components/WebComponentDialer.tsx` (хуудас: `app/webcomponent/page.tsx`)

### ClientProvider

Бүх component `ClientProvider`-ийн дотор байх ёстой. Provider нь client-ийг үүсгэж, бүх event-ийг сонсож, төлөв болон үйлдлүүдийг context-оор түгээнэ (`components/ClientWrapper.tsx`):

```tsx
import { ClientProvider } from "@callpromn/rtc-kit-react";

const [config, setConfig] = useState<RtcConfig | null>(null);

useEffect(() => {
  fetch("/api/rtc-config")
    .then((res) => { if (!res.ok) throw new Error("Failed to load config"); return res.json(); })
    .then(setConfig);
}, []);

if (!config) return <div>Connecting…</div>;

return (
  <ClientProvider
    config={{
      socketUrl: config.socketUrl,
      socketToken: config.socketToken,
      socketConnectionOptions: { transports: ["websocket"] },
      phoneNumber: config.phoneNumber,
      outboundRoom: config.outboundRoom,
      inboundRoom: config.inboundRoom,
    }}
  >
    {children}
  </ClientProvider>
);
```

### useClientContext

```typescript
import { useClientContext, useKeyboardDialer } from "@callpromn/rtc-kit-react";

const {
  isConnected,
  isIncomingCall,
  isOutboundCall,
  isCallActive,
  isMicOn,
  inboundUserData,
  toPhoneNumber,
  setToPhoneNumber,
  checkConnectionStatus,
} = useClientContext();

useKeyboardDialer({ maxLength: 8 }); // компьютерийн гараар дугаар цуглуулах (сонголтоор)
```

### Component-ууд

Wrapper component-ууд дуудлагын үйлдлүүдээ context-оос **автоматаар** авдаг тул `createCall`/`acceptCall` зэргийг гараар дуудах шаардлагагүй:

```tsx
import {
  CallButton, AcceptButton, DeclineButton, EndButton, MicButton,
  Numpad, NumberField, NumberDeleteButton,
} from "@callpromn/rtc-kit-react";

// Дугаар цуглуулах
<NumberField phoneNumber={toPhoneNumber} theme={theme} />
<Numpad phoneNumber={toPhoneNumber} onNumberClick={setToPhoneNumber} maxLength={8} theme={theme} />
<NumberDeleteButton phoneNumber={toPhoneNumber} theme={theme} />

// Дуудлага хийх — onClick шаардлагагүй, context-ийн createCall автоматаар дуудагдана
<CallButton
  toPhoneNumber={toPhoneNumber}
  disabled={!isConnected || toPhoneNumber.length === 0}
  theme={theme}
/>

// Орох дуудлага — onClick нь зөвхөн нэмэлт үйлдэлд (дэлгэцэд дугаар харуулах г.м.)
<AcceptButton theme={theme} onClick={() => setToPhoneNumber(inboundUserData?.fromNumber || "")} />
<DeclineButton theme={theme} />

// Идэвхтэй дуудлага
<MicButton theme={theme} />
<EndButton theme={theme} />
```

Бүх component `theme={"light" | "dark"}`, `className`, `style` props дэмжинэ. Товчлуурын холболтыг идэвхжүүлэхэд `keyboard?: boolean` prop ашиглана (түүхий web component-ийн `keyboard=""` string attribute-аас ялгаатай).

---

## Хоёр integration-ийн харьцуулалт

| Шалгуур | Core (`rtc-sdk`) | Components (`rtc-kit-react`) |
|---|---|---|
| Event болон төлөвийн удирдлага | Өөрөө бичнэ | `ClientProvider` автоматаар |
| UI | Түүхий web components эсвэл бүрэн өөрийн UI | Бэлэн React component-ууд |
| Уян хатан байдал | Бүрэн хяналт | Стандарт хэрэглээнд хангалттай |
| Кодын хэмжээ | Их | Бага |
| Тохирох хэрэглээ | Custom UX, framework-гүй орчин | React төслүүдэд хурдан нэвтрүүлэлт |

## Аюулгүй байдлын зөвлөмж

- `SOCKET_TOKEN` болон бусад нууц утгыг **хэзээ ч** client-ийн кодод шууд бичихгүй, `NEXT_PUBLIC_` хувьсагчид хийхгүй
- Жинхэнэ token, утасны дугаар, дотоод server-ийн хаягийг repository-д commit хийхгүй — зөвхөн `.env.local` (gitignored) дотор хадгална
- Signaling token-ийг богино хугацааны, server талаас олгогддог байхаар төлөвлөнө
- Дуудлага бүрийн WebRTC server-ийн хаяг/token нь signaling-аар ирдэг түр зуурын утгууд тул log хийх буюу хадгалахгүй

## Түгээмэл асуудлууд

| Асуудал | Шалгах зүйл |
|---|---|
| Холболт үүсэхгүй (🔴) | `.env.local` бөглөгдсөн эсэх; `/api/rtc-config` амжилттай хариу өгч буй эсэх (browser DevTools → Network) |
| `useClientContext` алдаа шиддэг | Component `ClientProvider`-ийн дотор байгаа эсэх |
| Web components харагдахгүй | `@callpromn/rtc-kit` client талд import хийгдсэн эсэх (`useRtcKitReady`) |
| Микрофон ажиллахгүй | Browser-ийн mic permission; `https://` эсвэл `localhost` орчин шаардлагатай |
| Хоёр өөр хувилбарын SDK зэрэг ачаалагдах | `npm ls @callpromn/rtc-sdk` — нэг л хувилбар "deduped" харагдах ёстой. Хоёр хувилбар харагдвал `package.json`-ийн хүрээнүүдээ нийцүүлээд `npm install` дахин ажиллуулна |

## Дэмжлэг

- Багцуудын баримтжуулалт: тус бүрийн npm хуудас болон README
- Алдаа мэдээлэх: энэ repository-ийн GitHub Issues
