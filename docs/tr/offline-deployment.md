# Çevrimdışı ya da intranette çalıştırın

Next AI Draw.io, internet erişimi olmayan bir ağda — örneğin bir şirket intranetinde — çalışabilir. Bu sayfa, orada nasıl derlenip çalıştırılacağını ve isterseniz ayrı bir draw.io sunucusunun nasıl kullanılacağını gösterir.

## Uygulama çevrimdışı nasıl çalışır

Next AI Draw.io, kendi draw.io kopyasıyla gelir. `npm run build`, draw.io sürümünü bir kez `public/drawio` içine indirir; Docker derlemesi de aynısını yapar. Uygulama sonra bu kopyayı `/drawio` üzerinden sunar.

Uygulamayı kullanırken tarayıcı, `embed.diagrams.net`'e asla bağlanmaz. Yani uygulama, derleme internet erişimiyle yapılmış olduğu sürece çevrimdışı ya da intranet ağında çalışır.

## Docker Compose ile çalıştırma

1. Depoyu klonlayın ve API anahtarlarınızı `.env` içinde tanımlayın.
2. `docker compose up -d` çalıştırın. Depodaki `docker-compose.yml`yi kullanır.
3. `http://localhost:3000` açın.

Ayrı bir draw.io kapsayıcısına ihtiyacınız yoktur.

## İnternet erişimi olmadan derleme

Derleme, [draw.io sürümlerinden](https://github.com/jgraph/drawio/releases) `draw.war` dosyasını (yaklaşık 50 MB) indirir. Derleme makinesi GitHub'a ulaşamıyorsa şunlardan birini seçin:

- **draw.io'yu elle kopyalayın.** Başka bir makinede, `packages/mcp-server/src/drawio-version.json` içindeki sürüm için `draw.war` dosyasını indirin. `public/drawio` içine açın ve içindeki `WEB-INF` ile `META-INF` klasörlerini silin. Sürümü — örneğin `v32.0.2` — `public/drawio/.version` içine yazın. Derleme bu kopyayı kullanır.
- **İmajı başka yerde derleyin.** İmajı internet erişimi olan bir makinede derleyin, sonra çevrimdışı ağa aktarın.

## Diğer web sitelerinden resim ekleme

Paketlenen draw.io, bir dizi statik dosyadır (sunucunun olduğu gibi gönderdiği dosyalar). Resim vekili (`/drawio/proxy`) içermez — draw.io sunucusunun, draw.io için diğer sitelerden resimleri getiren parçası.

Web adresiyle diğer bir siteden eklediğiniz bir resim yine tuvalde görünür. Dışa aktarılan PNG ve SVG resimleri ile sürüm resimleri onu çıkarır; çünkü draw.io bu tür resimleri o vekil üzerinden getirir.

Bu resimleri bir dosyadan ekleyin; draw.io onları diyagramın içine gömer.

## Ayrı bir draw.io sunucusu kullanma

Bu isteğe bağlıdır. Uygulamayı yine başka bir draw.io'ya — örneğin `jgraph/drawio` imajına — yönlendirebilirsiniz. `NEXT_PUBLIC_DRAWIO_BASE_URL` adresini ayarlayın. Bu değişken uygulama derlenirken okunur; dolayısıyla derleme argümanı olarak geçirin:

```yaml
services:
  drawio:
    image: jgraph/drawio:latest
    ports: ["8080:8080"]
  next-ai-draw-io:
    build:
      context: .
      args:
        - NEXT_PUBLIC_DRAWIO_BASE_URL=http://localhost:8080
    ports: ["3000:3000"]
    env_file: .env
    volumes:
      - ./data:/app/data
    depends_on: [drawio]
```

`volumes` girdisi, [yönetim panelinde](./admin-panel.md) kaydettiğiniz ayarları (`data/settings.json`) kapsayıcının dışında tutar; böylece kapsayıcı değişse de kalırlar.

Harici bir draw.io ile uygulama, draw.io'nun kendi araç çubuğunu kullanır ve şu özellikler kapalıdır:

- Yapay zekânın değiştirdiği şekillerin çerçevelenmesi
- Seçtiğiniz şekiller hakkında soru sorma
- Uygulamanın tuval araç çubuğu
- Ctrl+Z ile yapay zekâ değişikliklerini geri alma

Tarayıcılar, bir sayfanın farklı bir kaynak (farklı sunucu adı, port ya da protokol) üzerinden sunulan bir editörü denetlemesine izin vermez.

**`NEXT_PUBLIC_DRAWIO_BASE_URL`, kullanıcının tarayıcısından ulaşılabilir olmalıdır.**

| draw.io nerede çalışıyor | Değer |
|---|---|
| Kendi bilgisayarınızda (localhost) | `http://localhost:8080` |
| Uzak bir sunucuda | `http://YOUR_SERVER_IP:8080` |

Docker'ın iç adlarını — örneğin `http://drawio:8080` — **kullanmayın**. Bunlar, kapsayıcıların birbirine ulaşmak için kullandığı adlardır ve tarayıcı bu adlarla sunucuyu bulamaz.
