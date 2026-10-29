# Ayarlar

Ayarlar'ı sohbet panelinden açın. Dört sekmesi vardır: Genel, Çizim, Modeller ve Hakkında.

## Genel

| Ayar | Ne yapar |
|---|---|
| Dil | Arayüzün dili: Türkçe, İngilizce, Basitleştirilmiş Çince, Geleneksel Çince veya Japonca |
| Tema | Açık, koyu ya da sistemin ayarı. Tuval aynı temayı izler |
| Gönderme kısayolu | Enter ya da Cmd/Ctrl+Enter gönderir. Shift+Enter her zaman yeni satır ekler; Cmd/Ctrl+Enter her zaman gönderir |
| Erişim kodu | Site bir kod istediğinde görünür; kodu sitenin sahibi verir |
| Vekil (proxy) ayarları | Yalnızca masaüstü uygulaması: yapay zekâ sağlayıcılarına giden istekler için HTTP ya da HTTPS vekili |

## Çizim

| Ayar | Ne yapar |
|---|---|
| Diyagram stili | Yapay zekânın yeni diyagramları nasıl çizdiği: Stilize renkleri ve simgeleri kullanır, Sade şekilleri düz tutar |
| Diyagramları ekran görüntüsüyle denetle (deneysel) | Her çizimden sonra, resim okuyabilen bir model ekran görüntüsüne bakar ve düzeltmeler ister. Böyle bir model gerekir |
| Özel talimatlar | Her istekte yapay zekânın talimatlarına eklenen metin; örneğin "Her zaman mavi bir renk şeması kullan" |
| Çıkış token sınırı | Tek bir yanıtın bütçesi; modelin düşünmesi ile diyagram arasında paylaşılır. Yapay zekâ durmadan düşünüyor ve diyagram çıkmıyorsa yükseltin; varsayılan için boş bırakın |

## Modeller

Demo sitesi, API anahtarı gerektirmeyen ve günlük sınırı olan kendi modelleriyle gelir. Başka bir model kullanmak ya da sınırı aşmak için kendi API anahtarınızla bir sağlayıcı ekleyin:

1. Modeller sekmesinde bir sağlayıcı seçin; örneğin OpenAI, Anthropic, Google, DeepSeek, Amazon Bedrock ya da Ollama. API anahtarı al, sağlayıcının anahtar oluşturma sayfasını açar.
2. Anahtarı girin. Bazı sağlayıcılar bir taban URL de ister; örneğin şirket ağ geçidi ya da yerel sunucu.
3. Model ekleyin: önerilenleri seçin, sağlayıcının tam listesini alın ya da bir model kimliği yazın.
4. Test, her modele çok kısa bir mesaj göndererek anahtarın ve modelin çalıştığını denetler.

Sonra modeli, sohbetin model seçicisinden seçin. API anahtarları bu cihazdaki bu tarayıcıda kalır ve yalnızca isteklerinizle birlikte sunucuya gider.

Bir modelin çizim yapabilmesi için araç çağrıları gerekir. models.dev tarafından araç çağrısı desteği olmayan biçimde listelenen model, "araç çağrısı yok" olarak işaretlenir.

Uygulamayı kendiniz barındırıyorsanız herkes için ortam değişkenleriyle modeller de kurabilirsiniz: bkz. [Yapay zekâ sağlayıcıları](./ai-providers.md).

## Hakkında

Uygulamanın sürümü ve projenin web sitesine bir bağlantı.
