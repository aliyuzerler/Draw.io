# Giriş

Next AI Draw.io, bir yapay zekâ ile sohbet ederek draw.io diyagramları çizer ve düzenler. Siz diyagramı tarif edersiniz, yapay zekâ onu gerçek bir draw.io tuvaline çizer; sonra diyagram üzerinde elle çalışmaya devam edebilir ya da değişiklik isteyebilirsiniz. Yapay zekânın yaptığı her değişiklik vurgulanır ve geri yükleyebileceğiniz bir sürüm olarak kaydedilir.

<!-- demo: tour -->

## Kullanmanın üç yolu

| Nerede | Ne elde edersiniz | Buradan başlayın |
|---|---|---|
| Tarayıcıda | next-ai-drawio.jiang.jp adresindeki editör. Kurulum gerekmez; günlük demo sınırını kaldırmak için kendi API anahtarınızı ekleyin | [Editörü aç](https://next-ai-drawio.jiang.jp/) |
| Masaüstünde | Windows, macOS ve Linux için aynı uygulama | [Son sürüm](https://github.com/DayuanJiang/next-ai-draw-io/releases/latest) |
| Yapay zekâ aracınızda | Bir MCP sunucusu: Claude Code, Cursor, Codex ve VS Code, projenizin dosyalarından aynı tuvale, tarayıcınızda çizer | [Claude Code'dan kullanın](./claude-code.md) |

## Neler yapabilirsiniz

- **Oluşturma**: bir diyagramı kelimelerle tarif edin veya bir ekran görüntüsünden, beyaz tahta fotoğrafından, PDF'ten ya da bir web sayfasından başlayın.
- **Elle düzenleme**: tuval, draw.io editörünün kendisidir. draw.io'da yaptığınız gibi şekilleri taşıyın, yeniden biçimlendirin ve ekleyin.
- **Yapay zekâ ile düzenleme**: şekilleri seçin ve yalnızca onlar için bir değişiklik isteyin, ya da tüm diyagram için bir değişiklik isteyin. Yapay zekâ önce elle yaptığınız düzenlemeleri okur.
- **Geri dönme**: yapay zekânın yaptığı her değişiklik sohbette bir sürüm kartına dönüşür. Son değişikliği geri alın, bir sürümü tuvalle karşılaştırın ya da eski bir sürümü geri yükleyin.
- **Dışa aktarma**: draw.io'da düzenlemeye devam etmek için bir `.drawio` dosyası kaydedin ya da PNG veya SVG olarak dışa aktarın.

## Nasıl çalışır

Bir diyagram, draw.io XML'idir. Uygulama isteğinizi ve geçerli diyagramı seçtiğiniz yapay zekâ modeline gönderir; model, yeni ya da değiştirilmiş XML ile yanıt verir ve tuval bu XML'i gelirken gösterir. draw.io editörü uygulamanın içinde paketlenmiştir, bu yüzden uygulama onu doğrudan sürebilir ve düzenlemelerinizi geri okuyabilir.

Uygulama şu teknolojilerle geliştirilmiştir:

- Sayfalar ve API için **Next.js**
- Birçok yapay zekâ sağlayıcısından yanıtları akıtmak için **Vercel AI SDK** (`ai` ve `@ai-sdk/*`)
- Editör olarak **draw.io**

## Yapay zekâ sağlayıcıları

Demo sitesinin günlük kullanım sınırı vardır. Ayarlar'dan başka bir sağlayıcı seçip kendi anahtarınızı girebilirsiniz; anahtar tarayıcınızda tutulur ve asla sunucuda saklanmaz. Uygulamayı kendiniz barındırdığınızda sağlayıcıları ortam değişkenleriyle kurarsınız: bkz. [Yapay zekâ sağlayıcıları](./ai-providers.md).

## Sonraki adımlar

- Web uygulamasında [çizme ve düzenleme](./editor.md)
- [Sürümler ve geri alma](./versions.md)
- [Claude Code'dan kullanın](./claude-code.md) ya da [diğer MCP istemcileri](./mcp-clients.md)
- [AWS mimari diyagramları](./aws-architecture.md) ve [akış şemaları ve dizilim diyagramları](./flowcharts.md)
- [Docker ile çalıştırın](./docker.md)
- [SSS](./FAQ.md)
