# Sık sorulan sorular

Bu sayfa, insanların Next AI Draw.io'da sıkça karşılaştığı sorunları kapsar. Her biri için ne gördüğünüzü, neden olduğunu ve ne yapılacağını söyler.

## PDF dışa aktarma bir şey yapmıyor

Uygulamanın Dışa aktar penceresi bir draw.io dosyası, bir PNG resmi, bir SVG resmi ya da düzenlenebilir bir SVG kaydeder. PDF, draw.io'nun kendi menüsünden (tuvalin sol üstündeki ☰) gelir: **Olarak dışa aktar**'ı, sonra **PDF**'i seçin. Bundan sonra göreceğiniz, uygulamanın hangi draw.io'yu kullandığına bağlıdır.

**Uygulamanın içinde gelen draw.io.** Web uygulaması, Docker imajı ve masaüstü uygulaması — uygulama `NEXT_PUBLIC_DRAWIO_BASE_URL` ile derlenmediyse — onu kullanır. Bu draw.io kopyası PDF'i yazdırarak üretir. Kendi PDF penceresini açar; o penceredeki **Yazdır**, tarayıcınızın ya da sisteminizin yazdırma penceresini açar. Orada PDF olarak kaydetmeyi seçin; örneğin Chrome'da **PDF olarak kaydet** ya da Windows'ta **Microsoft Print to PDF**.

**Harici bir draw.io** — `NEXT_PUBLIC_DRAWIO_BASE_URL` ile ayarlanmış, örneğin `https://embed.diagrams.net`. Sayfa `convert.diagrams.net/node/export` adresine gider ve sonra hiçbir şey olmaz. Bu draw.io, PDF'i üretmek için diyagramı `convert.diagrams.net` adresindeki dönüştürme hizmetine gönderir ve o indirme uygulamanın içinde başarısız olur. Bunun yerine draw.io'nun menüsünden **Yazdır**'ı seçin ve yazdırma penceresinde PDF olarak kaydedin. Uygulamayı `NEXT_PUBLIC_DRAWIO_BASE_URL` olmadan yeniden derleyip kendi içindeki draw.io'yu kullanmasını da sağlayabilirsiniz.

İlgili GitHub konuları: #539, #125

## Tarayıcı, çevrimdışı ya da intranet ağında embed.diagrams.net'e ulaşamıyor

Bir intranette tarayıcı, "Cannot find server IP address for embed.diagrams.net" der.

Uygulama, kendi draw.io kopyasıyla gelir ve onu `/drawio` üzerinden sunar; bu yüzden tarayıcının `embed.diagrams.net`'e ihtiyacı yoktur. Mevcut Dockerfile, `NEXT_PUBLIC_DRAWIO_BASE_URL`i boş bırakır; dolayısıyla ondan derlenen her imaj — yayımlanan imaj da — bu kopyayı kullanır. Yalnızca `NEXT_PUBLIC_DRAWIO_BASE_URL=https://embed.diagrams.net` ile derlenen bir imaj, draw.io'yu `embed.diagrams.net`ten yükler. Bu değer, v0.5.0 öncesi Dockerfile'da varsayılanıydı.

Bu hatayı görüyorsanız v0.5.0 ya da üstü bir imaj kullanın ya da imajınızı o derleme argümanı olmadan yeniden derleyin. Dockerfile'ı değiştirmeniz gerekmez. Derleme, draw.io'yu indirir; intranet için imajı internet erişimi olan bir makinede derleyip intranete taşıyın. Bkz. [İnternet erişimi olmadan derleme](./offline-deployment.md#internet-erisimi-olmadan-derleme).

`NEXT_PUBLIC_*` adlı ortam değişkenleri **derleme zamanı** değişkenleridir: JavaScript kodunun içine gömülürler. **Çalışma zamanında ayarlamak işe yaramaz.**

Ayrı bir draw.io sunucusu kullanmaya devam etmek için adresini derleme zamanında `args` ile geçirin:

```yaml
# docker-compose.yml
services:
  drawio:
    image: jgraph/drawio:latest
    ports: ["8080:8080"]
  next-ai-draw-io:
    build:
      context: .
      args:
        - NEXT_PUBLIC_DRAWIO_BASE_URL=http://your-server-ip:8080/
    ports: ["3000:3000"]
    env_file: .env
```

İlgili GitHub konuları: #295, #317

## Kendi barındırdığınız bir model yalnızca düşünüyor, asla çizmiyor

Yerel olarak dağıttığınız bir model — örneğin Qwen ya da LiteLLM — yalnızca düşüncesini gösterir ve hiçbir diyagram üretmez.

İki olası neden vardır:

- **Model çok küçük.** Küçük modeller, araç çağrısı talimatlarını doğru izlemekte zorlanır. 32B parametre ya da üstü bir model kullanın.
- **Araç çağrıları açık değil.** Model, araç çağrıları üzerinden çizer; dolayısıyla modeli çalıştıran hizmetin araç kullanımı için kuruluması gerekir.

Modeli çalıştıran hizmette araç çağrılarını açın. Örneğin vLLM ile:

```bash
python -m vllm.entrypoints.openai.api_server \
    --model Qwen/Qwen3-32B \
    --enable-auto-tool-choice \
    --tool-call-parser hermes
```

İlgili GitHub konuları: #269, #75

## Model, yüklediğiniz bir resmi okuyamıyor

Bir resim gönderdikten sonra şunlardan birini görürsünüz:

- Sohbet, "Bu model resim girişini desteklemiyor." der; altında sağlayıcının hatası vardır.
- Model, resim yokmuş gibi yanıtlar; örneğin resim verilmediğini söyler.

Seçtiğiniz modelin görü (vision) desteği yoktur; yani resim okuyamaz. Örnekler: Kimi K2, DeepSeek ve Qwen metin modelleri. Uygulama, resmi seçtiğiniz modele gönderir; o modelin resmi kabul edip edemeyeceğine sağlayıcı karar verir. Sağlayıcı resmi reddettiğinde uygulama yukarıdaki iletiyi gösterir. Bazı sağlayıcılar resmi sessizce düşürür ve model, resim olmadan yanıtlar.

Ne yapmalı:

- Model ayarlarında resim okuyabilen bir model seçin; örneğin GPT-5.2, Claude Sonnet 4.5 ya da Gemini 3 Pro.
- Diğer modeller için, modelin sağlayıcı sayfasından resim girişini kabul edip etmediğine bakın. Adında `vision` ya da `vl` geçen modeller genellikle kabul eder.
- Resim okuyan bir model için resim reddediliyorsa v0.5.0 ya da üstüne güncelleyin. Eski sürümler, bir modelin resim okuyup okumadığını model adından tahmin ediyordu ve tahmin bazen yanlıştı.

İlgili GitHub konuları: #324, #421, #469, #874
