# Cloudflare Workers'a dağıtın

Bu sayfa, Next AI Draw.io'yu bir Cloudflare Worker olarak — yani Cloudflare'in sunucularında çalışan bir program olarak — nasıl daıtacağınızı gösterir. OpenNext adaptörü, Next.js uygulamasını bir Worker'a dönüştürür.

Worker, Cloudflare'in dünyaya yayılmış sunucularına dağıtılır; dolayısıyla çok düşük gecikmeyle yanıt verir. Bir `workers.dev` adresinde barındırma ücretsizdir. İsterseniz Cloudflare'in R2 deposu tam Next.js ISR desteği ekler.

## Ne gerekir

- Bir Cloudflare hesabı. Ücretsiz plan, temel bir dağıtım için yeterlidir.
- Node.js 22 ya da üstü. Depoın kurduğu Wrangler sürümü Node.js 22, Next.js 16 ise 20.9 ya da üstü ister.
- Wrangler CLI — Cloudflare'in komut satırı aracı. Depo onu bir dev bağımlılığı olarak listeler; `npm install` kurar.

Temel bir Workers dağıtımı ücretsizdir. Yalnızca ISR önbellekleme için R2'yi açmak isterseniz bir ödeme yöntemi gerekir.

## Windows kullanıyorsanız

OpenNext ve Wrangler, doğrudan Windows'ta çalışırken tam güvenilir değildir. Oradaki bir derleme, WASM dosya yollarındaki sorunlar yüzünden başarısız olabilir. Bunun yerine şunlardan birini kullanın:

- Sorunsuz çalışan GitHub Codespaces
- Windows üzerinde Linux veren WSL

## Bağımlılıkları kurun ve oturum açın

```bash
npm install
```

Sonra Wrangler ile Cloudflare'e oturum açın:

```bash
npx wrangler login
```

## Ortam değişkenlerini ayarlayın

Ayarlar üç yerde olabilir ve her biri farklı bir zamanda okunur:

- `.env.local`, `npm run dev` ile normal Next.js geliştirmesi için dosyadır. OpenNext derlemesi ayrıca `.env.local`, `.env` ve diğer `.env` dosyalarının değerlerini Worker'ın koduna kopyalar. Bu dosyalardaki her şey — API anahtarları dahil — dağıtırken Worker'ın içine yüklenir.
- `.dev.vars` yalnızca sizin bilgisayarınızda Wrangler tarafından okunur. `npm run preview`, değerlerini sizin makinenizde çalışan Worker'a verir; `npm run deploy` dosyayı yüklemez.
- Cloudflare'de Worker'a eklediğiniz sırlar, dağıtılmış Worker tarafından okunur. Aynı ad hem Cloudflare'de hem `.env.local`de ayarlıysa Worker, Cloudflare'deki değeri kullanır.

`.env.local` oluşturun ve API anahtarlarınızla yapılandırmanızı girin:

```bash
cp env.example .env.local
```

Dağıtılmış Worker için, ilk dağıtımdan sonra API anahtarlarını Cloudflare'de sırlar olarak ekleyin; bkz. [API anahtarlarını Worker'a ekleme](#api-anahtarlarini-workera-ekleme). Anahtarların Worker'ın koduna girmesini istemiyorsanız `npm run deploy` öncesinde onları `.env.local`den çıkarın. Sır içermeyen ayarlar — örneğin `AI_PROVIDER` ve `AI_MODEL` — `.env.local`de kalabilir.

`.env.local` içinde API anahtarı yokken Worker'ı kendi bilgisayarınızda önizlemek için anahtarları `.dev.vars` içine koyun. Bu dosya sizin bilgisayarınızda kalır:

```bash
cp env.example .dev.vars
```

## R2 kullanıp kullanmayacağınızı seçin

R2, Cloudflare'in depolama hizmetidir. OpenNext'e, Artımlı Statik Yeniden Üretim (ISR) sayfalarını — Next.js'in önceden derleyip dağıtımdan sonra güncellediği sayfalar — saklayacağı bir yer verir. Bu uygulamada bugün ISR sayfası yoktur; dolayısıyla R2'ye yalnızca siz eklerseniz ihtiyaç duyarsınız.

| Özellik | R2'siz | R2'li |
|---|---|---|
| Maliyet | Ücretsiz | Ödeme yöntemi gerekir |
| ISR önbellekleme | Hayır | Evet |
| Statik sayfalar | Evet | Evet |
| API yolları | Evet | Evet |
| Kurulum | Basit | Orta |

Depo varsayılan olarak R2'siz kurulumu kullanır. Yalnızca ISR önbellekleme gerektiren sayfalar eklerseniz R2'yi seçin.

### Varsayılanı koruyun, R2'siz

Bu kurulum ücretsizdir ve depoın kuruluş biçimi budur: `open-next.config.ts`, `defineCloudflareConfig({})`tir ve `wrangler.jsonc` içinde `r2_buckets` yoktur. Bir şey değiştirmeniz gerekmez. Bir workers.dev alt etki alanı kaydetmeye geçin.

### ISR önbellekleme için R2 ekleme

R2, Cloudflare hesabınızda bir ödeme yöntemi ister.

1. Cloudflare panosunda bir R2 kovası oluşturun: **Storage & Databases**'a, sonra **R2**'ye gidin, **Create bucket**'a tıklayın ve adını `next-inc-cache` koyun.
2. `open-next.config.ts`'yi kurun:

   ```ts
   import { defineCloudflareConfig } from "@opennextjs/cloudflare/config"
   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"

   export default defineCloudflareConfig({
     incrementalCache: r2IncrementalCache,
   })
   ```

3. `wrangler.jsonc`'ye `r2_buckets` ekleyin:

   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "main": ".open-next/worker.js",
     "name": "next-ai-draw-io-worker",
     "compatibility_date": "2025-12-08",
     "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
     "assets": {
       "directory": ".open-next/assets",
       "binding": "ASSETS"
     },
     "r2_buckets": [
       {
         "binding": "NEXT_INC_CACHE_R2_BUCKET",
         "bucket_name": "next-inc-cache"
       }
     ],
     "services": [
       {
         "binding": "WORKER_SELF_REFERENCE",
         "service": "next-ai-draw-io-worker"
       }
     ]
   }
   ```

`bucket_name`, Cloudflare panosunda oluşturduğunuz kovanın adıyla birebir aynı olmalıdır.

Zamana dayalı yeniden doğrulama — bir sayfayı belli bir süreden sonra güncelleyen (bir sayfada ya da fetch'te `revalidate`) — ayrıca `open-next.config.ts` içinde bir `queue` ister. Bkz. OpenNext Cloudflare önbellekleme belgeleri.

## Bir workers.dev alt etki alanı kaydedin

İlk dağıtımdan önce bir workers.dev alt etki alanına ihtiyacınız vardır. Bunu yalnızca bir kez yaparsınız.

Önerilen yol Cloudflare panosudur: https://dash.cloudflare.com adresine gidin, **Workers & Pages**'i, sonra **Overview**'i açın ve **Set up a subdomain**'i seçin.

Ayrıca dağıtım sırasında da kaydedebilirsiniz. `npm run deploy` çalıştırdığınızda Wrangler sorabilir:

```
Would you like to register a workers.dev subdomain? (Y/n)
```

`Y` yazın ve bir alt etki alanı adı seçin. Kimsenin yanıtlayamadığı CI/CD ve benzeri ortamlarda bu soru çıkmaz; o yüzden önce panodan kaydedin.

## Önce yerel olarak önizleyin

Bu adım isteğe bağlıdır. Dağıtmadan önce Worker'ı kendi bilgisayarınızda önizlemek için:

```bash
npm run preview
```

## Dağıtın

```bash
npm run deploy
```

Betik:

1. Next.js uygulamasını derler
2. Onu OpenNext ile bir Cloudflare Worker'a dönüştürür ve `.env.local` ile diğer `.env` dosyalarının değerlerini Worker'a kopyalar
3. Statik varlıkları yükler
4. Worker'ı yayımlar

Uygulamanız bundan sonra şu adreste olur:

```
https://<worker-adı>.<alt-etki-alanınız>.workers.dev
```

## API anahtarlarını Worker'a ekleme

Dağıtılmış Worker için API anahtarlarını Worker'ın sırlarına koyun. Sağlayıcınızın gerektirdiği her anahtarı — örneğin `OPENAI_API_KEY` — iki yoldan biriyle ekleyin:

- Cloudflare panosunda: **Workers & Pages**'i açın, Worker'ınızı seçin, **Settings**'i, sonra **Variables and Secrets**'i açın, **Add**'a tıklayın ve **Secret** türünü seçin.
- Komut satırında aşağıdaki komutu çalıştırın. Wrangler değeri sorar.

  ```bash
  npx wrangler secret put OPENAI_API_KEY
  ```

Bu anahtarları panoda eklerken Secret türünü seçin. Her `npm run deploy` sırları korur ve panoda eklenen Text türündeki değişkenleri kaldırır. `wrangler.jsonc` içinde `"keep_vars": true` ayarı o değişkenleri de korur.

## Sık hataları düzeltme

- **`You need to register a workers.dev subdomain`**: hesabınızın henüz bir workers.dev alt etki alanı yok. https://dash.cloudflare.com adresine gidin, **Workers & Pages**'i açın ve **Set up a subdomain**'i seçin.
- **`Please enable R2 through the Cloudflare Dashboard`**: R2, `wrangler.jsonc` içinde kurulu ama hesabınız için henüz açılmamış. R2'yi açın (ödeme yöntemi gerekir) ya da R2'siz daıtın.
- **`No R2 binding "NEXT_INC_CACHE_R2_BUCKET" found`**: `wrangler.jsonc` içinde `r2_buckets` yok. `r2_buckets` bölümünü ekleyin ya da R2'siz varsayılan kuruluşa geçin.
- **`Can't set compatibility date in the future`**: wrangler yapılandırmasındaki `compatibility_date` gelecekte bir tarih. Onu bugüne ya da daha eskisine değiştirin.
- **Windows hatası `resvg.wasm?module` (ENOENT)**: bir wasm dosyasının adında `?module` var ve Windows dosya adları `?` içeremez. Linux'ta derleyip daıtın: WSL, Codespaces ya da CI.
