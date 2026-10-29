# Yönetim paneli

Yönetim paneli, sunucunuzun ayarlarını `.env`'i elle düzenlemeden bir web sayfasından yönetmenizi sağlar. Bu sayfa, paneli nasıl açacağınızı, oradan neleri değiştirebileceğinizi ve ayarlarınızın nereye kaydedildiğini gösterir.

## Paneli açma

1. `ADMIN_PASSWORD` ortam değişkenini ayarlayın. Ayarlanmadığı sürece panel kapalıdır.
2. `/admin` yolunu açın ve o parola ile oturum açın.

## Herkese model sunma

Modeller bölümünde sağlayıcıları API anahtarlarıyla ve model listeleriyle ekleyin. Kimlik alanları, uygulamanın [Ayarlar](./settings.md) bölümünün Modeller sekmesindekiyle aynıdır.

Kaydedilen modeller, herkesin kullanabildiği sunucu tarafı modellere dönüşür. İstek zamanında, ortamınızdaki herhangi bir `AI_MODELS_CONFIG` ya da `ai-models.json` ile birleştirilirler. Panel o ortam dosyalarını değiştirmez.

## Diğer ayarları değiştirme

Panelin diğer bölümleri şu ayarları tutar:

| Bölüm | Orada ne ayarlarsınız |
|---|---|
| Yanıtlar | Yapay zekânın nasıl yanıt vereceğini belirleyen üretim parametreleri |
| Erişim | Erişim kodları |
| İsteğe Bağlı Özellikler | Özellik anahtarları |
| Çağrı Günlükleri | Model çağrılarının kayıtları (gözlemlenebilirlik) |
| Kullanım Sınırları | Kotalar |

Kaydedilen ayarlar, ayar dosyasına yazılır (varsayılan `data/settings.json`) ve yeniden başlatma olmadan hemen uygulanır. Langfuse ve DynamoDB gibi birkaç ayar, "Yeniden başlatma gerekir" olarak işaretlenir: sunucuyu yeniden başlattıktan sonra uygulanırlar.

Panel yalnızca gösterdiği ayarları değiştirebilir; başka herhangi bir değişkeni kaydetmeyi reddeder. Şunları ortamda ayarlayın:

- Uygulama derlenirken sabitlenen `NEXT_PUBLIC_*` değişkenleri
- Paneli açan `ADMIN_PASSWORD` ve ayar dosyasının yerini söyleyen `SETTINGS_FILE`
- Her sağlayıcının akıl yürütme ve düşünme ayarları; örneğin `OPENAI_REASONING_EFFORT` ve `ANTHROPIC_THINKING_BUDGET_TOKENS`
- Panelin göstermediği diğer değişkenler; örneğin `DEBUG_LLM_PAYLOAD` ve `CLIENT_IP_HEADER`

## Hangi değer kullanılır

Bir ayarın değeri birden fazla yerde olabilir. Uygulama, bu sırayla bulduğu ilkini kullanır:

1. Panele kaydedilmiş bir değer
2. Ortam değişkeni
3. Yerleşik varsayılan

Panele kaydedilmiş bir değeri kaldırırsanız ortam değişkeni yeniden kullanılır.

## Ayarlarınız nereye kaydedilir

Varsayılan olarak ayarlar, sunucunun çalıştığı klasördeki `data/settings.json` içine kaydedilir. Başka bir yere kaydetmek için `SETTINGS_FILE` ortam değişkenini dosyanın yoluna ayarlayın.

- API anahtarları gibi sırlar, ayar dosyasına düz metin olarak kaydedilir. Dosya 600 kipindedir; yalnızca sahibi okuyabilir ve yazabilir. Dosyayı gizli tutun.
- Panel, uygulamanın ayar dosyasının klasörünü oluşturamadığı ya da yazamadığı herhangi bir sunucuda salt okunur olur. Panel bunun üstte bir bildirim gösterir; alanları ve "Değişiklikleri kaydet" düğmesi kapatılır. Uygulama klasörü bir kez denetler ve sonucu sunucu yeniden başlayana dek korur.
- Vercel ve Cloudflare Workers gibi sunucusuz platformların kalıcı diski yoktur; bu yüzden panel orada salt okunurdur. O platformlarda her şeyi ortam değişkenleriyle ayarlayın.

## Ayarları Docker ile koruma

Depodaki `docker-compose.yml`, sunucudaki `./data` klasörünü kapsayıcı içinde `/app/data`ya bağlar (`./data:/app/data`); böylece kaydettiğiniz ayarlar kapsayıcı değişse de kalır. `SETTINGS_FILE` ayarlıyorsanız dosyayı `/app/data` içinde tutun.

Kapsayıcıdaki uygulama `nextjs` kullanıcısı (uid 1001) olarak çalışır ve bu kullanıcının klasöre yazabiliyor olması gerekir. Linux'ta `./data` yoksa Docker onu root sahipliğiyle oluşturur. Uygulama ona yazamaz ve panel salt okunur olur. Kapsayıcıyı başlatmadan önce, `docker-compose.yml`'yi tutan klasörde klasörü doğru sahibiyle oluşturun:

```bash
mkdir -p data
sudo chown 1001:1001 data
```

Panel bu nedenle hâlihazırda salt okunursa `chown` komutunu çalıştırın ve kapsayıcıyı yeniden başlatın.
