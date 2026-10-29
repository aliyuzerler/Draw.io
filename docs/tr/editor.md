# Çizme ve düzenleme

Editörde sol tarafta draw.io tuvali, sağ tarafta sohbet bulunur. İstediğinizi sohbette tarif edersiniz, yapay zekâ onu tuvale çizer; sonra diyagramı elle ya da yeni bir istekle değiştirebilirsiniz.

## Diyagram başlatma

Sohbete bir açıklama yazın ve Enter'a basın. İyi bir istek, diyagramın parçalarını ve bunların birbirine nasıl bağlandığını belirtir; örneğin "SMS kodları ve tekrar denemeler içeren bir giriş dizilim diyagramı".

<!-- demo: generate -->

Başlangıç ekranındaki örnekler, editörün neler yapabildiğini gösterir. Birini seçin ve Gönder'e basın: kaydedilmiş yanıtı, yapay zekâ çağrısı yapılmadan hemen görünür.

Elinizde olan bir şeyden başlamak için:

- **Resimler**: bir ekran görüntüsü, beyaz tahta fotoğrafı ya da başka bir araçtan çıkmış bir diyagram ekleyin ve yapay zekâdan yeniden çizmesini isteyin. Her biri en fazla 2 MB olan PNG, JPEG, GIF ve WebP resimleri.
- **Belgeler**: bir PDF ya da metin dosyası (Markdown, JSON, CSV, YAML, kod ve daha fazlası) ekleyin ve içeriğinin diyagramını isteyin. Dosya başına en fazla 150.000 karakter olmak üzere metinleri okunur.
- **Web sayfaları**: Ekle'yi, ardından URL'den çıkar'ı seçin ve sayfanın adresini yapıştırın.
- **draw.io dosyaları**: tuvalde açılmak üzere bir `.drawio` ya da `.drawio.svg` dosyası ekleyin.

Tek bir mesajla en fazla 5 dosya gönderilir.

## Yapay zekâ ile değiştirme

Sohbette bir değişiklik isteyin; örneğin "veritabanını üç düğümlü bir kümeye dönüştür". Yapay zekâ, gördüğü diyagramı — elinizle yaptığınız değişiklikler dahil — değiştirir.

Diyagramın yalnızca bir kısmını değiştirmek için önce o şekilleri tuvalde seçin. Yanlarında "Yapay zekâya bunu değiştirt" düğmesi görünür; ona tıklayın ya da doğrudan sohbete yazın. Seçim mesajınızla birlikte gider; böylece "bunları mavi yap" yalnızca seçili şekilleri değiştirir.

Bir yanıt gelirken Durdur, gelmesini sonlandırır. Bir yanıtın altında onu yeniden üretebilirsiniz; gönderdiğiniz bir mesaj düzenlenip yeniden gönderilebilir. Bir yanıtın üzerine gelmek, giriş ve çıkış token'larını ve ne kadar sürdüğünü de gösterir; ayrıntılar için (örneğin önbellekten okunan token'lar) o sayıların üzerine gelin.

<!-- demo: ai-edit -->

## Elle düzenleme

Tuvaller, draw.io editörünün kendisidir; dolayısıyla draw.io'daki her şey burada da çalışır: şekilleri sürükleyin, birbirine bağlayın, etiketleri çift tıkla düzenleyin, sağ üstteki Biçim panelinden renkleri, yazı tiplerini ve çizgileri değiştirin. Ctrl+Z ve Ctrl+Y düzenlemelerinizi geri alır ve yineler.

Yapay zekânın yaptığı her değişiklik birkaç saniye boyunca çerçeveyle vurgulanır, böylece ne yaptığını görürsünüz. Geri dönmek için bkz. [Sürümler ve geri alma](./versions.md).

<!-- demo: hand-edit -->

## Diyagramlarınız

Diyagramlar, çalışırken bu tarayıcıya kaydedilir. Diyagramlar listesi her diyagramı sohbetiyle birlikte tutar: oradan arayın, yeniden adlandırın ya da silin; başka bir diyagrama başlamak için Yeni diyagram'ı seçin. Bir diyagram yalnızca oluşturulduğu tarayıcıda ve cihazda kalır; kopyasını saklamak ya da taşımak için dışa aktarın.

## Dışa aktarma

Dışa aktarma, diyagramı dört biçimden birinde kaydeder:

| Biçim | Ne işe yarar |
|---|---|
| draw.io dosyası | Her şeyi düzenlenebilir tutar; burada ya da draw.io'da |
| PNG resmi | Slaytlar ve belgeler için bir resim |
| SVG resmi | Bulanmadan ölçeklenen bir resim |
| Düzenlenebilir SVG | draw.io'da hâlâ açılabilen bir resim |

Bir PNG şeffaf arka plana sahip olabilir.

## Kayıtlı istemler

Sık kullandığınız bir istemi — örneğin "Bir AWS mimarisi çiz…" — kaydedin; sonra kayıtlı istemler listesinden yeniden gönderebilirsiniz. İstemler en üste sabitlenebilir, aranabilir ve JSON dosyası olarak dışa ya da içe aktarılabilir.
