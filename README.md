# CallPro RTC SDK — Next.js Quickstart

CallPro-ийн RTC багцуудыг Next.js (App Router) дээр нэвтрүүлэх албан ёсны жишээ төсөл. Нэг ижил дуудлагын аппыг **хоёр өөр хувилбараар** зэрэгцүүлэн харуулна:

1. **Core** — `@callpromn/rtc-sdk`-ийн API-г шууд ашиглаж, UI болон төлөвийг өөрөө бичнэ.
2. **Component** — `@callpromn/rtc-kit-react`-ийн бэлэн component болон `ClientProvider`-ийг ашиглана.

Дэлгэрэнгүй API-г багц бүрийн npm дээрх README-ээс үзнэ үү.

## Ашигласан багцууд

| Багц | Үүрэг |
|---|---|
| [`@callpromn/rtc-sdk`](https://www.npmjs.com/package/@callpromn/rtc-sdk) | Дуудлагын цөм SDK: signaling (Socket.IO) ба WebRTC media |
| [`@callpromn/rtc-kit`](https://www.npmjs.com/package/@callpromn/rtc-kit) | Framework-аас хамааралгүй Web Components UI element-үүд |
| [`@callpromn/rtc-kit-react`](https://www.npmjs.com/package/@callpromn/rtc-kit-react) | React wrapper component, `ClientProvider` ба hook-ууд |

## Шаардлага

- **Node.js 20 LTS** (Next.js 15 нь 18.18+ шаарддаг), npm
- **CallPro tenant-ийн тохиргоо**: signaling server-ийн хаяг, token, inbound/outbound room-ийн нэр, утасны дугаар. Эдгээр утгыг CallPro platform дээрх tenant-ийн тохиргооноос авна.

## Суулгах ба ажиллуулах

```bash
git clone <repository-url>
cd <project-folder>
npm install
cp .env.example .env.local
```

`.env.local`-д tenant-ийн утгуудаа оруулна (доорх нь зөвхөн жишээ):

```ini
PHONE_NUMBER=00000000
SOCKET_URL=wss://signaling.example.com
SOCKET_TOKEN=your-socket-token
OUTBOUND_ROOM=your-outbound-room
INBOUND_ROOM=your-inbound-room
```

```bash
npm run dev      # http://localhost:3000
```

## Бүтэц

| Зам | Тайлбар |
|---|---|
| `/` | Хоёр хувилбарыг зэрэгцүүлсэн дэлгэц. Аль нэгийг сонгоход зөвхөн тэр тал signaling-тэй холбогдоно (нэг socket холболт) |
| `/core` | Core — бие даасан хуудас |
| `/webcomponent` | Component — бие даасан хуудас |
| `/api/rtc-config` | Тохиргоог runtime үед client рүү дамжуулдаг server route |

## Тохиргоо

Энэ төсөл орчны хувьсагчдаа **зориуд `NEXT_PUBLIC_` угтваргүй** үлдээдэг. `NEXT_PUBLIC_` хувьсагч build үед статик JS bundle дотор шигдэн ордог тул `SOCKET_TOKEN` мэт нууцыг ил гаргана. Тиймээс нууц утгуудыг зөвхөн server талд хадгалж, runtime үед server route-аар дамжуулна:

```
.env.local (server) → GET /api/rtc-config (Cache-Control: no-store) → client
```

`app/api/rtc-config/route.ts` нь 5 утгыг буцаах ба аль нэг дутуу бол `500` өгч, амжилттай хариуг cache-лэхгүй. Client тал (`ClientWrapper.tsx`, `CoreDialer.tsx`) энэ route-аас тохиргоогоо татна.

- Нууц утгыг **хэзээ ч** client кодод эсвэл `NEXT_PUBLIC_` хувьсагчид бичихгүй.
- Production-д signaling token-ийг богино настай, session бүрд server талаас олгодог байлгаарай.

---

## 1. Core — `@callpromn/rtc-sdk`

**Файл**: `components/CoreDialer.tsx`

Тохиргоог `/api/rtc-config`-аас татаж `createClient`-д дамжуулна:

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

Тохиргоо нь зөвхөн **signaling** холболтыг тодорхойлно; WebRTC media-гийн хаяг/token дуудлага бүрд signaling-аар ирдэг.

- **Event-үүд** (`instance.on(event, handler)`): `call_init` (`"incoming"`/`"outbound"`), `ringing`, `answered`, `hangup`, `busy`, `bye`. `CoreDialer` нь үндсэн 5-г (`call_init`, `answered`, `hangup`, `busy`, `bye`) боловсруулдаг.
- **Функцууд**: `createCall(to)`, `acceptCall()`, `declineCall()`, `endCall()`, `toggleMic()`, `isConnected()`, `getInboundUserData()`, `disconnect()`.
- **Цэвэрлэгээ**: `disconnect()` дуудсаны дараа instance дахин ашиглагдахгүй. Unmount эсвэл React StrictMode-ийн давхар mount үед заавал дуудна (`CoreDialer.tsx`-ийн `useEffect` cleanup-г үз).
- **UI**: `@callpromn/rtc-kit`-ийн custom element-үүд — `call-button`, `accept-button`, `decline-button`, `endcall-button`, `mic-button`, `rtc-numpad`, `rtc-number-field`, `rtc-number-delete-button`. Багцыг import хийхэд element-үүд global орчинд бүртгэгддэг (side effect) тул зөвхөн client талд динамикаар ачаална (`components/useRtcKitReady.ts`). Attribute-уудын дэлгэрэнгүйг rtc-kit README-ээс үз.

---

## 2. Component — `@callpromn/rtc-kit-react`

**Файл**: `components/WebComponentDialer.tsx`

Бүх component `ClientProvider`-ийн дотор байх ёстой. Provider нь client-ийг үүсгэж, event-ийг сонсож, төлөв болон үйлдлүүдийг context-оор дамжуулдаг. Component-ууд үйлдлээ context-оос **автоматаар** авдаг тул `createCall`/`acceptCall` зэргийг өөрөө дуудах шаардлагагүй:

```tsx
import {
  ClientProvider, useClientContext, useKeyboardDialer,
  CallButton, Numpad, NumberField,
} from "@callpromn/rtc-kit-react";

// 1. Provider-ээр бүрхэнэ (config-ийг /api/rtc-config-аас татна — components/ClientWrapper.tsx)
<ClientProvider config={config}>{children}</ClientProvider>;

// 2. Дотор нь төлөв болон үйлдлийг context-оос авна
const { isConnected, toPhoneNumber, setToPhoneNumber } = useClientContext();
useKeyboardDialer({ maxLength: 8 }); // компьютерийн гараар дугаар цуглуулах (сонголтоор)

<NumberField phoneNumber={toPhoneNumber} theme={theme} />
<Numpad phoneNumber={toPhoneNumber} onNumberClick={setToPhoneNumber} maxLength={8} theme={theme} />
<CallButton toPhoneNumber={toPhoneNumber} disabled={!isConnected || toPhoneNumber.length === 0} theme={theme} />
```

- **`useClientContext` талбарууд**: `isConnected`, `isIncomingCall`, `isOutboundCall`, `isCallActive`, `isMicOn`, `inboundUserData`, `toPhoneNumber`, `setToPhoneNumber`, `checkConnectionStatus`.
- **Component-ууд**: `CallButton`, `AcceptButton`, `DeclineButton`, `EndButton`, `MicButton`, `Numpad`, `NumberField`, `NumberDeleteButton`. Бүгд `theme` prop дэмждэг; компьютерийн гараар дугаар цуглуулахдаа `useKeyboardDialer` hook-ийг ашиглана.

---

## Харьцуулалт

| Шалгуур | Core (`rtc-sdk`) | Components (`rtc-kit-react`) |
|---|---|---|
| Event ба төлөвийн удирдлага | Өөрөө бичнэ | `ClientProvider` автоматаар |
| UI | Web component эсвэл өөрийн UI | Бэлэн React component |
| Уян хатан байдал | Бүрэн хяналт | Стандарт хэрэглээнд хангалттай |
| Кодын хэмжээ | Их | Бага |
| Тохирох хэрэглээ | Custom UX, framework-гүй орчин | React төсөлд хурдан нэвтрүүлэлт |

## Түгээмэл асуудлууд

| Асуудал | Шалгах зүйл |
|---|---|
| Холболт үүсэхгүй (🔴) | `.env.local` бөглөгдсөн эсэх; `/api/rtc-config` хариу өгч буй эсэх (DevTools → Network) |
| `useClientContext` алдаа өгөх | Component `ClientProvider`-ийн дотор байгаа эсэх |
| Web component харагдахгүй | `@callpromn/rtc-kit` client талд import хийгдсэн эсэх (`useRtcKitReady`) |
| Микрофон ажиллахгүй | Browser-ийн mic permission; `https://` эсвэл `localhost` шаардлагатай |
