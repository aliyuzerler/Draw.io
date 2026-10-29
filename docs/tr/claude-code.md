# Claude Code'dan kullanın

MCP sunucusu, Claude Code'un sizin projenizin dosyalarından draw.io diyagramları çizmesini sağlar. Diyagram, tarayıcınızda canlı bir tuvalde görünür — web uygulamasıyla aynı tuvalde: elle düzenleyebilirsiniz ve Claude, diyagramı yeniden değiştirmeden önce düzenlemelerinizi okur.

## Kurulum

Node.js 18 ya da üstü gerekir. Bir terminalde şunu çalıştırın:

```bash
claude mcp add --scope user drawio -- npx @next-ai-drawio/mcp-server@latest
```

`--scope user`, araçları her projede kullanılabilir kılar. Olmadan, araçlar yalnızca komutu çalıştırdığınız klasörde var olur.

Ayrıca Claude Code topluluk pazarından bir eklenti olarak kurabilirsiniz (Claude Code 2.1.275 ya da üstü):

```text
/plugin install next-ai-drawio --marketplace anthropics/claude-plugins-community
```

Yeni bir Claude Code oturumu başlatın. `/mcp`, bağlandığında `drawio`yu listeler.

Codex, VS Code, Cursor ve diğer istemciler için bkz. [MCP sunucusu README](../../packages/mcp-server/README.md).

## İlk diyagramınızı çizdirin

Claude'nun okuyabileceği bir şeyin diyagramını isteyin:

```text
Bu repoyu oku ve mimarisini çiz
```

Claude, kodu kendi araçlarıyla okur, önizlemeyi tarayıcınızda açar ve diyagramı orada çizer. Büyük bir diyagram parçalar hâlinde çizilir; böylece büyüdüğünü görürsünüz.

İyi çalışan diğer istekler:

- "Ödeme (checkout) API'sinin istek akışını bir dizilim diyagramı olarak çiz"
- "docs/architecture.md dosyasını AWS simgeleriyle bir diyagrama dönüştür"
- "diagrams/system.drawio dosyasını aç ve yeni kuyruk hizmetini ekle"

<!-- demo: mcp -->

## Diyagram üzerinde birlikte çalışmak

- **Elle düzenleyin.** Önizleme, tam bir draw.io editörüdür. Şekilleri taşıyın, etiketleri değiştirin ya da yeniden biçimlendirin; Claude, yeniden düzenlemeden önce diyagramı — sizin değişiklikleriniz dahil — okur.
- **Şekillere işaret edin.** Önizlemede şekiller seçin ve "bunları mavi yap" ya da "bunu iki hizmete böl" deyin. Claude, seçtiklerinizi okur.
- **Neyin değiştiğini görün.** Claude'nin değişiklikleri birkaç saniye boyunca çerçevelenir. Önizlemede Ctrl+Z, son değişikliğini geri alır.
- **Daha gerisine gidin.** Son 20 sürüm, tuvalin yanındaki kartlardadır; oradan birini karşılaştırabilir ya da geri yükleyebilirsiniz. Claude'dan geri almasını da isteyebilirsiniz.

## Kaydetme ve dışa aktarma

Her değişiklik, son 20 sürümüyle birlikte `~/.next-ai-drawio/<oturum-kimliği>.drawio` yoluna kaydedilir; en yeni 50 diyagram saklanır. Bir diyagramı sonraki bir konuşmada sürdürmek için Claude'dan isteyin: kayıtlı diyagramı bulur ve yeniden açar.

Dosya gerektiğinde Claude'dan dışa aktarmasını isteyin: `.drawio`, `.png`, `.svg` ya da `.drawio.svg`. Bir `.drawio.svg` dosyası, draw.io'nun da açıp düzenleyebildiği bir resimdir; README dosyalarına uyar.

## Kendi çizim kurallarınız

Bunları `~/.next-ai-drawio/instructions.md` içine yazın; örneğin "Her zaman sade bir stil kullan". Her çağrıda çizim rehberine eklenirler, dolayısıyla değişiklikler yeniden başlatma olmadan uygulanır. İlk 5000 karakter kullanılır.

## Ayarlar

Ortam değişkenleri sunucunun çalışma biçimini değiştirir. Sunucuyu eklerken `-e` ile geçirin:

```bash
claude mcp add --scope user drawio -e DRAWIO_LANG=tr -- npx @next-ai-drawio/mcp-server@latest
```

| Değişken | Varsayılan | Ne yapar |
|---|---|---|
| `PORT` | `6002` | Önizleme portu; doluysa 6020'ye kadar boş sonraki port kullanılır |
| `DRAWIO_DATA_DIR` | `~/.next-ai-drawio` | Kayıtlı diyagramlar ve `instructions.md` klasörü; `off` kaydetmeyi kapatır |
| `DRAWIO_AUTO_SCREENSHOT` | ayarlanmadı | `true`, her oluşturma ve düzenleme sonucuna bir ekran görüntüsü ekler (çağrı başına 2-10 sn) |
| `DRAWIO_LANG` | ayarlanmadı | Editörün ve önizlemenin dilini sabitler: `tr`, `en`, `zh`, `zh-tw`, `ja`, `de` vb. |
| `DRAWIO_DARK` | `auto` | `1` koyu başlatır, `0` açık başlatır, `auto` sistemi izler |
| `BROWSER` | ayarlanmadı | `none`, önizlemeyi kendiliğinden açmaz |

Tüm değişkenler ve kendi barındırdığınız bir draw.io'yu kullanma, [MCP sunucusu README](../../packages/mcp-server/README.md#configuration)'dedir.

## Sorun giderme

- **Önizleme açılmıyor.** Claude'dan önizleme adresini isteyin ve kendiniz açın; adresin `?mcp=` kısmı sayfayı oturuma bağlar.
- **VS Code Simple Browser ya da Cursor'un tarayıcısında boş önizleme.** Sayfa, başka sayfalara gömülmeyi reddeder. Adresi normal bir tarayıcıda açın.
- **Ekran görüntüsü ya da PNG/SVG dışa aktarma zaman aşımına uğruyor.** Önizleme sekmesi onları üretir ve tarayıcılar arka plan sekmelerini yavaşlatır. Sekmeyi öne getirin ve yeniden deneyin.
- **"Etkin oturum yok".** Claude önce bir oturum başlatmalı; drawio oturumunu yeniden başlatmasını isteyin.
