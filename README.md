# CallPro RTC SDK NextJS Жишээ

Энэ төсөл нь CallPro "rtc-kit-react" SDK-ыг NextJS дээр хэрхэн ашиглахыг харуулсан жишээ бөгөөд доорх үндсэн 2 хэсэгт хуваагдана.

1. **Core Implementation** - `@callpro/rtc-sdk`-ын функцуудыг шууд ашиглан хийсэн хэрэгжүүлэлт
2. **UI Components** - `@callpro/rtc-kit-react`-ын бэлэн компонентуудыг ашиглан хийсэн хэрэгжүүлэлт

## Урьдчилсан шаардлага

- Node.js 18+ хувилбарыг өөрийн хөгжүүлэлтийн орчинд суулгасан байх. 
- npm эсвэл yarn

## Суулгалт

1. Dependency-үүдийг суулга:
```bash
npm install @callpro/rtc-sdk
npm install @callpro/rtc-kit-react
```

2. Environment файлыг тохируулах:
Энэ төслийн environment-ын хувьсагчид:
- `NEXT_PUBLIC_SOCKET_URL`: WebSocket серверийн хаяг
- `NEXT_PUBLIC_SOCKET_TOKEN`: Холболтын токен
- `NEXT_PUBLIC_OUTBOUND_ROOM`: Гарах дуудлагын өрөөний нэр
- `NEXT_PUBLIC_INBOUND_ROOM`: Орох дуудлагын өрөөний нэр
- `NEXT_PUBLIC_PHONE_NUMBER`: Залгах дугаар

3. Development серверийг ажиллуулах:
```bash
npm run dev
```

## SDK Dependencies

Энэ төсөл дараах SDK-уудыг ашигласан:

```json
  "dependencies": {
    "@callpro/rtc-sdk": "@callpro/rtc-sdk",
    "@callpro/rtc-kit-react": "@callpro/rtc-kit-react"
  }
```

## Хуудаснуудын тайлбар

### 1. Үндсэн хуудас ('/')

Энэхүү хуудас нь хоёр санг хэрэгжүүлсэн хуудсуудын сонголтыг харуулах юм.
1. @callpro/rtc-sdk буюу зөвхөн дуудлагатай холбоотой функцууд болон классуудыг агуулсан санг ашиглаж хийсэн Page хуудас.
2. @callpro/rtc-kit-react буюу react framework-д зориулсан дуудлагын UI component-уудыг агуулсан санг ашиглаж хийсэн Page хуудас.

### 2. Core Implementation ('/core')

**Файл**: `app/core/page.tsx`

#### SDK ашиглалт:

##### Import:
```typescript
import { CallClient } from "@callpro/rtc-sdk";
```

##### Client үүсгэх:
```typescript
const callClient = CallClient();
const config = {
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL!,
  socketToken: process.env.NEXT_PUBLIC_SOCKET_TOKEN!,
  socketConnectionOptions: {
    transports: ["websocket"],
  },
  phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER || 'Компанийн утасны дугаар',
  outboundRoom: process.env.NEXT_PUBLIC_OUTBOUND_ROOM!,
  inboundRoom: process.env.NEXT_PUBLIC_INBOUND_ROOM!,
};

const callClientInstance = await callClient.createClient(config);
```

##### Event Handlers:
```typescript
// Орох дуудлага болон гарах дуудлагуудад энэхүү эвент ажиллана.
callClientInstance.on("call_init", async (data) => {
  if (data === "incoming") {
    const userData = await callClientInstance.getInboundUserData();
    setInboundUserData(userData);
    setIsIncomingCall(true);
  }
});

// Дуудлага дуусах
callClientInstance.on("hangup", () => {
  setIsIncomingCall(false);
  setIsOutboundCall(false);
  setIsCallActive(false);
});

// Дуудлага хариулах
callClientInstance.on("answered", () => {
  setIsIncomingCall(false);
  setIsOutboundCall(false);
  setIsCallActive(true);
});
```

##### Үндсэн функцууд:
- `acceptCall()` - Дуудлага хүлээж авах
- `declineCall()` - Дуудлага татгалзах
- `createCall('Залгаж буй дугаар')` - Дуудлага хийх
- `endCall()` - Дуудлага дуусгах
- `toggleMic()` - Микрофон асаах/унтраах
- `isConnected()` - Холболтын төлөв шалгах

#### Онцлогууд:

- **Өөрийн UI**: Бүх UI элементүүдийг бид өөрсдөө хийж гүйцэтгэх юм.
- **Дэлгэрэнгүй удирдлага**: Бүх state-ын удирдлагыг өөрөө хийнэ.
- **Анхаарах зүйлс**: Event handling, state management болон error handling-ыг өөрөө хийх шаардлагатай.

### 3. UI Components Implementation ('/webcomponent')

**Файл**: `app/webcomponent/page.tsx`

Энэ хуудас нь `@callpro/rtc-kit-react`-ын бэлэн компонентуудыг ашиглан хийсэн хэрэгжүүлэлт юм.

#### SDK ашиглалт:

##### Import:
```typescript
import {
  CallButton,
  AcceptButton,
  DeclineButton,
  EndButton,
  useClientContext,
  MicButton,
  Numpad,
  NumberField,
  NumberDeleteButton,
} from "@callpro/rtc-kit-react";
```

##### Context ашиглалт:
```typescript
const {
  isConnected,
  checkConnectionStatus,
  isIncomingCall,
  isOutboundCall,
  isCallActive,
  inboundUserData,
  toPhoneNumber,
  setToPhoneNumber,
} = useClientContext();
```

##### Компонентуудыг ашиглах:

**Дугаар оруулах талбар:**
```jsx
<NumberField phoneNumber={toPhoneNumber} />
```

**Numpad буюу дугаарын товчлуурууд:**
```jsx
<Numpad phoneNumber={toPhoneNumber} onNumberClick={setToPhoneNumber} />
```

**Дуудлага хийх товчлуур:**
```jsx
<CallButton
  toPhoneNumber={toPhoneNumber}
  disabled={toPhoneNumber.length === 0}
  onClick={() => console.log("call button clicked")}
/>
```

**Дуудлага хүлээж авах товчлуур:**
```jsx
<AcceptButton
  onClick={() => {
    setToPhoneNumber(inboundUserData?.fromNumber || "");
  }}
/>
```

**Дуудлага татгалзах товчлуур:**
```jsx
<DeclineButton />
```

**Дуудлага дуусгах товчлуур:**
```jsx
<EndButton />
```

**Микрофон асаах болон унтраах товчлуур:**
```jsx
<MicButton />
```

**Оруулсан дугаарыг нэг нэг оронгоор устгах товчлуур:**
```jsx
<NumberDeleteButton
  phoneNumber={toPhoneNumber}
  onClick={() => setToPhoneNumber(toPhoneNumber.slice(0, -1))}
/>
```

#### Онцлогууд:

- **Бэлэн компонентууд**: Бүх UI компонентууд SDK-наас ирдэг.
- **Автомат state удирдлага**: SDK өөрөө state-ыг удирддаг.
- **Хялбар ашиглалт**: Функцуудыг дуудах шаардлагагүй, компонентууд маань дуудлагын функцуудаа автоматаар дуудаад ажиллуулдаг.

### 4. Client Wrapper Component

**Файл**: `import { ClientProvider } from "@callpro/rtc-kit-react";`

Энэ provider нь `@callpro/rtc-sdk` сангийн `Client` болон state-уудыг зохицуулах бөгөөд та өөрийнхөө project-ийнхоо үндсэн layout хэсэгт project-оо wrap хийж өгснөөр rtc-kit-react сангийн компонентууд бүрэн ажиллах юм.

#### Ашиглалт:
```typescript
import { ClientProvider } from "@callpro/rtc-kit-react";
const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || "Компанийн утасны дугаар"

<ClientProvider
  config={{
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL!,
    socketToken: process.env.NEXT_PUBLIC_SOCKET_TOKEN!,
    phoneNumber: phoneNumber,
    socketConnectionOptions: undefined,
    outboundRoom: process.env.NEXT_PUBLIC_OUTBOUND_ROOM!,
    inboundRoom: process.env.NEXT_PUBLIC_INBOUND_ROOM!,
  }}
>
  {children}
</ClientProvider>
```

#### Root Layout дээр ашиглах:
```typescript
// app/layout.tsx
import ClientWrapper from "../components/ClientWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
```

## Хэрэгжүүлэлтийн ялгаа

| Онцлог | Core Implementation | UI Components |
|---------|-------------------|---------------|
| **Кодын хэмжээ** | Олон (~400 мөр) | Цөөн (~160 мөр) |
| **UI удирдлага** | Өөрөө хийх | Автомат |
| **State удирдлага** | Manual | Автомат |
| **Уян хатан байдал** | Өндөр | Дунд зэрэг |
| **Хөгжүүлэлтийн хурд** | Удаан | Хурдан |
| **Тохируулах боломж** | Бүрэн | Хязгаартай |

## Хэрэгжүүлэх зөвлөмжүүд

### Core Implementation ашиглах үед:
1. Бүх event handler-уудыг сайтар бичих
2. State удирдлагыг анхааралтай хийх
3. Error handling нэмэх
4. Cleanup логик нэмэх (useEffect-ийн return)

### UI Components ашиглах үед:
1. ClientProvider-ийг зөв тохируулах
2. useClientContext hook-ийг ашиглах
3. Компонентуудын props-уудыг зөв дамжуулах
4. Custom styling хэрэгтэй бол CSS класс нэмэх

## Алдаа засах

### Түгээмэл асуудлууд:

1. **WebSocket холболт амжилтгүй**
   - Environment variables-уудыг шалгах
   - Server статусыг шалгах

2. **Дуудлага хийх боломжгүй**
   - Socket холболт байгаа эсэхийг шалгах
   - Phone number format зөв эсэхийг шалгах

3. **UI Components ажиллахгүй байх**
   - ClientProvider wrap хийсэн эсэхийг шалгах
   - useClientContext зөв import хийсэн эсэхийг шалгах

## Дэмжлэг

Асуулт байвал:
- GitHub Issues үүсгэх
- Документацийг уншиж дэлгэрэнгүй мэдээлэл авах
- Sample кодуудыг судлах
