# Docker ile çalıştırın

Yalnızca kendi bilgisayarınızda Next AI Draw.io'yu çalıştırmak istiyorsanız en iyi yol Docker'dır. Bu sayfa, uygulamayı bir kapsayıcıda nasıl başlatacağınızı, ona yapay zekâ sağlayıcı ayarlarınızı nasıl vereceğinizi, sunucudan birkaç modeli nasıl sunacağınızı ve yönetim paneli ayarlarını nasıl koruyacağınızı gösterir.

## Uygulamayı başlatın

Docker kurulu değilse önce kurun: [Get Docker](https://docs.docker.com/get-docker/).

Sonra şunu çalıştırın:

```bash
docker run -d -p 3000:3000 \
  -e AI_PROVIDER=openai \
  -e AI_MODEL=gpt-4o \
  -e OPENAI_API_KEY=your_api_key \
  ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

`-e` seçenekleri yapay zekâ sağlayıcısını, modeli ve API anahtarını ayarlar. Bunları, kullanmak istediğiniz sağlayıcının ayarlarıyla değiştirin. Seçenekler için bkz. [Yapay zekâ sağlayıcıları](./ai-providers.md).

## Bir env dosyası kullanın

Ayarları bir env dosyasında da tutabilirsiniz. Depodaki şablon olan `env.example` ile başlayın. Depoyu klonladıysanız onu `.env` olarak kopyalayın. Aksi hâlde dosyayı GitHub'dan indirin:

```bash
# Depo bir klonu içinde
cp env.example .env

# Depo olmadan
curl -o .env https://raw.githubusercontent.com/DayuanJiang/next-ai-draw-io/main/env.example
```

`.env` dosyasını kendi ayarlarınızla düzenleyin ve kapsayıcıyı `--env-file` ile başlatın:

```bash
docker run -d -p 3000:3000 --env-file .env ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

`docker run --env-file`, `=` işaretinden sonraki her şeyi değer olarak kullanır; satır sonundaki bir yorum dahil. `env.example` içindeki bazı satırlar böyle bir yorumla biter:

```bash
# OPENAI_BASE_URL=https://api.openai.com/v1  # Optional: Custom OpenAI-compatible endpoint
```

Böyle bir satırı başındaki `#`yi silerek açtığınızda, değerden sonraki yorumu da silin:

```bash
OPENAI_BASE_URL=https://api.openai.com/v1
```

Docker Compose'un `env_file`ı bu yorumları kendiliğinden temizler.

## Sunucudan birkaç model sunma

Kapsayıcının içine bir `ai-models.json` dosyası bağlayabilirsiniz. Bu dosyayla sunucu birkaç model sunar ve kullanıcı API anahtarları açığa çıkmaz. Dosyayı `/app/ai-models.json` yoluna bağlayın:

```bash
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=your_api_key \
  -v $(pwd)/ai-models.json:/app/ai-models.json:ro \
  ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

Dosyayı kapsayıcı içinde başka bir yolda tutmak için `AI_MODELS_CONFIG_PATH` o yola ayarlayın:

```bash
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=your_api_key \
  -e AI_MODELS_CONFIG_PATH=/config/ai-models.json \
  -v $(pwd)/ai-models.json:/config/ai-models.json:ro \
  ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

## Yönetim paneli ayarlarını koruma

[Yönetim paneli](./admin-panel.md), ayarlarını kapsayıcı içindeki `/app/data` klasörüne kaydeder. Depodaki `docker-compose.yml`, `./data` klasörünü oraya bağlar (`./data:/app/data`); böylece kapsayıcı değişse de ayarlar kalır. `docker run` ile aynı bağlamayı ekleyin:

```bash
docker run -d -p 3000:3000 --env-file .env \
  -v $(pwd)/data:/app/data \
  ghcr.io/dayuanjiang/next-ai-draw-io:latest
```

Kapsayıcıdaki uygulama `nextjs` kullanıcısı (kullanıcı kimliği 1001) olarak çalışır ve bu kullanıcının klasöre yazabiliyor olması gerekir. Linux'ta `./data` yoksa Docker onu root sahipliğiyle oluşturur ve yönetim paneli salt okunur olur. Kapsayıcıyı başlatmadan önce klasörü doğru sahibiyle oluşturun. Bu komutları, `docker run` ya da `docker compose up` çalıştırdığınız yerde çalıştırın:

```bash
mkdir -p data
sudo chown 1001:1001 data
```

## embed.diagrams.net engelliyse

Uygulama embed.diagrams.net'e ihtiyaç duymaz. ghcr.io'daki imaj `NEXT_PUBLIC_DRAWIO_BASE_URL` olmadan derlenir; depodaki `docker-compose.yml`den derlenen imaj da öyle. Böylece uygulama kendi draw.io kopyasını `/drawio` üzerinden sunar ve tarayıcı asla embed.diagrams.net'e bağlanmaz. Yalnızca `NEXT_PUBLIC_DRAWIO_BASE_URL=https://embed.diagrams.net` derleme argümanıyla derlenen bir imaj, draw.io'yu oradan yükler.

İnternetsiz çalıştırmak için bkz. [Çevrimdışı ya da intranette çalıştırın](./offline-deployment.md).
