# Synora — Güvenlik ve Performans Optimizasyonu Raporu

Bu belge, projenin **uçtan uca güvenlik denetimi + performans denetimi** sonucunda yapılan tüm düzeltmeleri açıklar. Denetim üç paralel derinlemesine incelemeyle (API/kimlik, ön yüz, performans) ve `npm audit` bağımlılık taramasıyla yapıldı; ardından tüm bulgular giderildi ve doğrulandı.

**Sonuç:**

| Ölçüt | Önce | Sonra |
|---|---|---|
| `npm audit` açıkları | **20** (1 kritik, 9 yüksek, 9 orta, 1 düşük) | **0** |
| Kritik uygulama açığı (SSRF) | Varsayılan açık | Varsayılan **kapalı** |
| Birim test | 921 | **921 / 921 geçer** |
| Üretim derlemesi | — | **Başarılı** (Next 16.4.3, 155 sayfa) |
| Güvenlik başlıkları (CSP, HSTS…) | Hiçbiri yok | **Tam set** |

---

## 1. Bağımlılık Açıkları — 20 → 0

`npm audit` taraması **1 kritik** dahil 20 açık buldu; tamamı giderildi:

| Paket | Sorun | Çözüm |
|---|---|---|
| **next** | Kritik RCE: SVG kullanan görüntü optimizasyonunda kimliksiz uzaktan kod çalıştırma (GHSA-2464-fhr4-w9xw) + App Router Server Actions DoS (GHSA-p3m5-59mp-jv5r) | `16.0.7` → **`16.4.3`** |
| **zod** | Aşırı büyük kümelerde bellek tükenmesi (GHSA-mrhx-c7xc-m3w5) | `4.1.12` → **`4.6.7`** |
| **electron** | HID/USB izin hatası, SameSite cookie atlatma | `41` → **`42.11.3`** |
| **@opennextjs/cloudflare** | Cache interception, middleware atlatma | `1.17.1` → **`1.20.14`** |
| **@tailwindcss/typography** | postcss-selector-parser CPU tükenmesi | `0.5.19` → **`0.5.20`** |
| **deepmerge-ts, glob** | Prisma CLI / opennext zincirinde geçişli açıklar | `package.json` **overrides** ile güvenli sürümlere sabitlendi |

`npm audit` artık **"found 0 vulnerabilities"** bildiriyor. (Not: Prisma 7'ye major yükseltme yerine, güvenlik düzeltmesini taşıyan geçişli paketler scoped override ile çözüldü; Prisma 6 şeması ve çalışma zamanı değişmedi.)

---

## 2. KRİTİK — SSRF: Güvenli Varsayılan

**Bulgu:** `ALLOW_PRIVATE_URLS` varsayılanı **açık**tu. Geçerli görünümlü bir API anahtarıyla `x-ai-base-url: http://169.254.169.254/...` göndererek sunucunun iç ağına (bulut metadata servisi dahil) istek atılabiliyordu.

**Düzeltme:**
- `lib/ssrf-protection.ts` → `allowPrivateUrls()` artık **yalnızca `ALLOW_PRIVATE_URLS=true` iken izin verir** (secure by default). LAN'daki Ollama/LM Studio kullanan self-host kurulumları bu değişkenle eski davranışı geri alır (`env.example` güncellendi).
- **IPv6 normalizasyonu:** eski denetim tam-yazım loopback (`0:0:0:0:0:0:0:1`), karışık IPv4-eşlenik (`::ffff:127.0.0.1`) ve bölge kimlikli (`fe80::1%eth0`) biçimleri kaçırıyordu. Artık adres 8 gruba genişletilip `fc00::/7`, `fe80::/10`, loopback, belirtilmemiş adres ve gömülü IPv4 dahil **tüm aralıklar** denetlenir; bozuk girdi **fail-closed** kabul edilir.
- Test masumiyeti: sitenin **kendi EdgeOne fonksiyonu** (aynı kaynak, self-host'ta loopback) denetimden istisnadır.

**Doğrulama (çalışan sunucu):**
```
POST /api/chat  x-ai-base-url: http://169.254.169.254/...  →  400
{"error":"Private or internal base URLs are not allowed."}
```

---

## 3. YÜKSEK — Yetkilendirme ve Kaba Kuvvet

### 3.1 Bayatlamış JWT ile kalıcı yönetici erişimi (Y-1)
`requireAdmin` yalnızca JWT'deki `role`'a bakıyordu: rolü düşürülen veya **askıya alınan** yönetici 30 gün boyunca admin API'lerini kullanabilirdi. Artık:
- `lib/admin/auth.ts` + `lib/auth/api.ts` — oturum yolu her istekte **DB'den güncel `role` ve `status`** doğrular (`DATABASE_URL` tanımlıyken); silinmiş/askıya alınan/düşürülen hesap anında kesilir.
- `/api/chat` — askıya alınan ya da silinen kullanıcı sunucu anahtarlarıyla sohbet edemez (daha önce sessizce IP kotasına düşüyordu; artık **403**).

### 3.2 Admin şifre akışında kaba kuvvet (Y-2)
`x-admin-password` denemeleri sınırsızdı. Artık **IP başına 5 hatalı deneme / 5 dk**; aşıldığında `429 + Retry-After`. Doğrulama:

```
deneme 1-5: 401   deneme 6-7: 429   doğru şifre: 200
```

Ayrıca `requireAdmin`'de ** Promise beklenmeyen bir hata** giderildi: şifre akışı her zaman jenerik 401'e eziliyordu; artık `checkAdminAuth`'ın gerçek yanıtı (401/403/429) döner.

### 3.3 Son yönetici koruması (O-9)
Kullanıcı silme/rol düşürme koruması yalnızca oturum çağıranına uygulanıyordu; şifre akışıyla **son admin silinebiliyordu**. Koruma artık çağıran tipinden bağımsız: sistemdeki tek ADMIN silinemez/düşürülemez (`isLastAdmin`).

---

## 4. YÜKSEK — iyzico Webhook (Y-4)

- Belirteç karşılaştırması **`timingSafeEqual`** ile yapılır (zamanlama sızıntısı kapalı).
- Olay imzası (`sha256(token|ref|status)`) ile **replay koruması**: aynı olay 10 dk penceresinde ikinci kez işlenmez.
- Yükte zaman damgası varsa **10 dk tazelik penceresi** dışındaki olaylar reddedilir.

---

## 5. YÜKSEK — Sohbet Rotası Sertleştirmesi

| Risk | Düzeltme |
|---|---|
| Askıya alınan kullanıcı sunucu anahtarıyla sohbet (Y-1) | `status !== "ACTIVE"` veya hesap yok → **403** |
| Sınırsız istek gövdesi (O-7) | `readLimitedJsonBody`: **25 MB** gövde sınırı (akış okunurken aşılırsa iptal), **60 mesaj**, **500.000** toplam metin karakteri → 413/400 |
| Kota TOCTOU yarışı (O-6) | Sayım + olay oluşturma artık **`Serializable` işlemde atomik**; paralel istekler limiti aşamaz |
| Plan limiti mesajları | Davranış korunarak işlem içine taşındı (yanıt biçimi aynı) |

---

## 6. ORTA — Kimlik Zinciri

### 6.1 Oturum invalidasyonu (O-5)
Şifre sıfırlama/şifre değişimi sonrası eski JWT 30 gün yaşamaya devam ediyordu. Artık:
- `prisma/schema.prisma` → `User.sessionsInvalidatedAt` alanı (**dağıtımda `npx prisma db push` gerekir**),
- `lib/auth/session.ts` → payload'a `iat` eklendi,
- `lib/auth/session-server.ts` → `getSessionFromRequestVerified`: JWT imzasına ek olarak damga denetimi (60 sn TTL önbellekle, DB yükü mınimal). Chat, admin, me, hesap rotaları bu doğrulanmış okuyucuya geçirildi.

### 6.2 Şifre sıfırlama bağlantısı (O-4)
- **Host header poisoning:** `NEXT_PUBLIC_SITE_URL` yoksa bağlantı Host başlığından türetiliyordu — saldırgan e-postadaki bağlantıyı kendi alanına çevirebilirdi. Üretimde artık yalnızca `NEXT_PUBLIC_SITE_URL` kullanılır; yoksa bağlantı üretilmez ve operatöre uyarı loglanır.
- **Token sızıntısı:** posta sağlayıcısı yokken sıfırlama bağlantısı (token dahil) günlüğe yazılıyordu; artık yalnızca "bağlantı üretildi (gönderilemedi)" yazılır.

### 6.3 Giriş zamanlaması (O-1)
Bilinmeyen e-postada bcrypt karşılaştırması atlanıyor, yanıt süresi kullanıcı varlığını ele veriyordu. Artık **kukla hash ile eşit maliyetli** karşılaştırma yapılır. Ek olarak bcrypt maliyeti **10 → 12** yükseltildi ve **72 bayt üzeri** şifreler (bcrypt'in sessiz kırpma sınırı) açıkça reddedilir.

### 6.4 Erişim kodu (O-3)
- `checkAccessCode` karşılaştırması **timing-safe** hale getirildi (`timingSafeIncludes`).
- `/api/verify-access-code` uç noktasına `rejectCrossSite` + **10 deneme/dk** hız sınırı eklendi (kaba kuvvet oraclesı kapandı).

### 6.5 Giriş sonrası açık yönlendirme (O-1 ön yüz)
`?next=//evil.com` ve `/\evil.com` `startsWith("/")` testini geçiyordu; yalnızca **aynı siteye giden göreli yollar** kabul edilir.

### 6.6 Şifre değiştirme uç noktası (D-9 — eksik fonksiyon)
`PATCH /api/auth/account` — `{currentPassword, newPassword}`: mevcut şifre doğrulanır, politika denetlenir, **tüm oturumlar düşürülür** (5 deneme/dk).

### 6.7 CSRF tutarlılığı (O-2)
`rejectCrossSite` (JSON Content-Type zorunluluğu + desktop Host denetimi) eksik olan **tüm oturumlu POST** uçlarına eklendi: `/api/diagrams`, `/api/billing/checkout`, `/api/admin/test-model`, `/api/auth/logout` (+ `DELETE /api/auth/account`). İstemcideki çıkış çağrıları JSON gövdesiyle uyumlu hale getirildi.

---

## 7. ORTA/DÜŞÜK — Diğer Kapatılan Boşluklar

| # | Açık | Düzeltme |
|---|---|---|
| 1 | `/api/auth/export-data` çalınan oturumla sınırsız döküm (D-3) | 5 istek/dk hız sınırı + diyagram dökümü **200 ile sınırlı** |
| 2 | `/api/log-save`, `/api/log-feedback` kimliksiz Langfuse skor spam'i (D-5) | `rejectCrossSite` + 30 istek/dk |
| 3 | `/api/server-models` ortam değişkeni **adlarını** ifşa ediyordu (D-1) | `apiKeyEnv`/`baseUrlEnv` yanıttan çıkarıldı (değerler zaten asla gitmiyor) |
| 4 | `proxy.ts` ORIGIN_SECRET düz karşılaştırma (D-6) | Edge uyumlu **sabit zamanlı XOR** karşılaştırması |
| 5 | Diyagram PATCH/DELETE çift gidiş-dönüş + yarış | `updateMany`/`deleteMany` sahiplik koşuluyla **tek gidiş-dönüş**, race-safe; başlık tipi denetimi (D-10) |
| 6 | EdgeOne fonksiyonu kotasız anonim kullanım (O-10) | İzolat başına **20 istek/dk/IP** hız sınırı |
| 7 | Docs bağlantı şeması `javascript:` geçiriyordu (D-5) | Yalnız `http(s)/mailto/#/protokole göreli` kabul edilir |
| 8 | Layout JSON-LD `<` kaçışsız (D-4) | `JSON.stringify(...).replace(/</g, "\\u003c")` |
| 9 | İstemcide sınırsız dosya okuma (O-3) | PDF/metin çıkarımı için **20 MB** üst sınır |
| 10 | Kota hatasında fail-open (D-11) | Bilinçli tasarım olarak korundu, belgelendi (kullanılabilirlik önceliği) |

---

## 8. Güvenlik Başlıkları — Sıfırdan Tam Set (Y-1)

`next.config.ts`'e `headers()` eklendi (CDN dağıtımları için `public/_headers` da güncellendi):

| Başlık | Değer |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; ...; frame-ancestors 'self'` (GA etkinse sağlayıcıları eklenir; geliştirmede HMR için ws) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` (tıklama kapançlama) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), usb=(), hid=(), serial=(), payment=(), interest-cohort=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |

**draw.io çerçevesi için ayrı politika:** editör belgesi (`/drawio/*`) mxGraph/eklenti çalışma biçimi nedeniyle `unsafe-eval` içeren rahat CSP alır; genel kural `/:path*` önce, `/drawio/:path*` kuralı aynı başlıkları ezer (Next'te son eşleşen kazanır). Doğrulanmış yanıt başlıkları:

```
/                   → katı CSP + tüm güvenlik başlıkları
/drawio/index.html  → rahat CSP + Cache-Control: public, max-age=31536000, immutable
/api/config         → güvenlik başlıkları (API yanıtlarında da)
```

---

## 9. Performans Optimizasyonları

| # | Sorun | Düzeltme | Etki |
|---|---|---|---|
| 1 | **pdf.js (~400 KB+) workspace paketinde** — PDF yüklemeyen kullanıcı da ödüyordu | `lib/pdf-utils.ts` → `await import("unpdf")` ile yalnızca PDF yüklenince indirilir | İlk yükleme JS ↓ |
| 2 | **DiagramContext değeri her render'da yeniden** — 20 kapanış, akış parçası başına tüm tüketiciler yeniden render | Tüm handler'lar `useCallback` (ref tabanlı, sabit kimlik), değer `useMemo` | Akış sırasında gereksiz render ↓↓ |
| 3 | **Dialog'lar ilk pakette** (SettingsDialog + ModelConfigDialog ~100 KB+) kapalıyken bile | `next/dynamic` ile SettingsDialog / CompareDialog / SaveDialog bölünür | İlk yükleme JS ↓ |
| 4 | **`ai-models.json` her `/api/chat` ve `/api/server-models` isteğinde diskten** okunup ayrıştırılıyordu | `lib/server-model-config.ts` → 30 sn TTL + **env imzalı** önbellek; admin panel yazımı önbelleği anında düşürür | İstek gecikmesi ↓ |
| 5 | **/drawio paketi (10 MB `app.min.js`) için cache başlığı yok** | `next.config.ts` + `_headers` → `immutable` | Tekrar ziyarette ağ ↓↓ |
| 6 | Workspace **tüm mağaza aboneliği** — herhangi bir UI bayrağı tüm düzen ağacını render ediyordu | Alan bazlı seçiciler | Render sayısı ↓ |
| 7 | Mesaj listesi akışta her parçada tüm satırları yeniden render ediyordu | `UserMessage`/`AssistantMessage` **`React.memo`**; `hasCardless` taraması `useMemo` | Uzun konuşmalarda ↓ |
| 8 | **~2 MB tanıtım videosu ilk ekranda otomatik** indirilip oynatılıyordu | `IntersectionObserver` ile yalnız görünürken oynat/duraklat (reduced-motion korunur) | İlk yükleme ağ ↓ |
| 9 | `next/font` `fallback: []` — yazı tipi yüklenene kadar görünmez metin (CLS) | Kaldırıldı; boyut ayarlı yedek font devrede | CLS ↓ |
| 10 | Docs ekran görüntüleri `loading` özniteliği olmadan | `loading="lazy" decoding="async"` | Docs sayfaları ↓ |
| 11 | Middleware `/drawio/*` için boşuna çalışıyordu | Matcher `drawio(?:$|/)` dışlar | Edge çağrıları ↓ |
| 12 | Diyagram POST'ta 3 ardışık sorgu | Plan, kullanıcı sorgusuyla birleşti (tek gidiş-dönüş) | DB yükü ↓ |

**Dokunulmadı (zaten iyi):** sürümlenmiş draw.io paketi (SHA-256 + zip-slip koruması), postMessage origin+source doğrulaması, react-markdown (HTML enjeksiyonsuz), next/font self-hosted, i18n sözlükleri tembel, Prisma indeksleri erişim örüntüsüyle birebir, sunucu tarafı model kataloğu (275 KB) istemciye gitmiyor.

---

## 10. Denetimden Geçen (Değişiklik Gerektirmeyen) Güçlü Yanlar

1. Şifre sıfırlama tokenları: 256-bit rastgele, sha256 özetli, 1 saatlik, tek kullanımlık; yanıtlar tamamen jenerik.
2. JWT oturumu: HS256 sabitlenmiş (alg karışıklığı yok), üretimde `AUTH_SECRET` zorunlu, `httpOnly + secure + sameSite=lax` çerez.
3. Diyagram sahipliği: tüm CRUD `userId` koşullu, cuid kimlikler (tahmin edilemez), 5 MB XML sınırı.
4. Admin paneli: maskeli sırlar, ayar whitelist'i (bilinmeyen anahtar reddi), 0600 atomik yazım, test-model'de `{isSet}` eksfiltrasyon engeli.
5. Enjeksiyon: kod tabanında `$queryRaw`/`$executeRaw`/`eval`/`exec` yok; Prisma parametrik.
6. Repoda hardcoded sır yok; `.env*` gitignore kapsamında.
7. draw.io paketi derlemede sabit sürüm + SHA-256 doğrulamalı indirilir.

---

## 11. Kalan Riskler ve Öneriler

1. **Bellek içi hız limitleri** tek örnek içindir. Çoklu örnek/region dağıtımda paylaşımlı depoya (Upstash Redis / Neon) taşınmalı — raporun Faz 2 planında mevcut.
2. **DNS rebinding (TOCTOU):** `parse-url` denetim sonrası `fetch` yeniden çözer. Tam kapatma için çözümlenen IP'ye bağlanan özel `undici` dispatcher gerekir; mevcut katman (özel IP reddi + redirect reddi + boyut/zaman sınırı) pratik saldırı yüzeyini kapatır.
3. **CSP'de `script-src 'unsafe-inline'`**: Next.js'in satır içi betikleri (tema başlatma) için gerekli; nonce altyapısıyla daraltılabilir (ileri çalışma).
4. **Dağıtım adımı:** `sessionsInvalidatedAt` alanı için şema senkronu: `npx prisma db push`. Ayrıca üretimde `NEXT_PUBLIC_SITE_URL` zorunlu.
5. **Hız limitleri `x-forwarded-for` ilk değerini kullanır:** CDN arkasında `CLIENT_IP_HEADER` (örn. `cf-connecting-ip`) + `ORIGIN_SECRET` tanımlanmalı (env.example'daki yönerge).

---

## 12. Doğrulama Özeti

- **Birim testler:** 85 dosya / **921 test — tamamı geçer** (değişen güvenli varsayımlara uyan testler güncellendi: private-URL senaryoları `ALLOW_PRIVATE_URLS=true` ile self-host olarak etiketlendi).
- **Derleme:** `npm run build` — Next 16.4.3 + Turbopack, **155 sayfa** sorunsuz.
- **Çalışan sunucu denetimleri:** CSP/HSTS başlıkları, SSRF reddi (400), cross-site reddi (415), admin panel kilidi (403), kaba kuvvet limiti (401×5 → 429), erişim kodu hız sınırı.
- **`npm audit`:** 0 açık.
