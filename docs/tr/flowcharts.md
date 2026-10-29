# Akış şemaları ve dizilim diyagramları

Akış şemaları, kulvarlı (swimlane) diyagramlar, BPMN süreçleri ve dizilim (sıra) diyagramları tümüyle sıradan draw.io diyagramları olarak çıkar; böylece elle düzenlemeye devam edebilirsiniz. Bu sayfa, net bir ilk taslak elde etmek için bir isteğe ne koymanız gerektiğini gösterir.

## Akış şemaları

Adımları sırayla ve her karar noktasını sonuçlarıyla birlikte tarif edin:

```text
Bir iade talebi için akış şeması çiz: müşteri formu gönderir, destek siparişi kontrol eder; 30 günden eskiyse talep reddedilir, aksi hâlde faturalandırma iade yapar ve müşteriye e-posta gider.
```

İyi sonuç verenler:

- **Nerede başlayıp bittiğini söyleyin.** "Formun gönderilmesinden e-postaya kadar."
- **Her kararı ve sonuçlarını adlandırın.** "Sipariş 30 günden eskiyse: ret; aksi hâlde: iade."
- **Kim ne yapıyor, söyleyin** — kulvarlar için: "müşteri, destek ve faturalandırma için birer kulvar".
- **Bir yön seçin**: yukarıdan aşağıya ya da soldan sağa.

Yapay zekâ draw.io'nun akış şeması ve BPMN şekil kitaplıklarını kullanır: kararlar elmas olur; bir BPMN isteği, olaylar, ağ geçitleri ve görevler için BPMN şekilleri alır.

<!-- demo: flowchart -->

## Dizilim diyagramları

Katılımcıları adlandırın; sonra aralarındaki mesajları, mutsuz yolları da katarak sırayla verin:

```text
SMS kodlu bir giriş dizilim diyagramı çiz: uygulama, kimlik doğrulama API'si, SMS sağlayıcısı ve kullanıcı. Kod üç kez yanlış girildiğinde ne olduğunu göster.
```

Tekrar denemeleri, zaman aşımlarını ve eşzamansız yanıtları adlandırın; aksi hâlde diyagram, yalnızca her şeyin çalıştığı yolu gösterebilir.

## Elinizdeki akış şemasını yeniden çizdirme

Bir beyaz tahta fotoğrafı, ekran görüntüsü ya da PDF ekleyin ve yapay zekâdan yeniden çizmesini isteyin. Sonuç, resim yerine gerçek şekiller ve bağlantılar taşıyan düzenlenebilir bir diyagramdır. Sonra her zamanki gibi değişiklik isteyin: "iki onay adımını birleştir", "ödemenin ardından bir hata yolu ekle".

MCP sunucusuyla aracı (agent) kodunuzdan da çizebilir: "Ödeme (checkout) API'sinin istek akışını bir dizilim diyagramı olarak çiz". Bkz. [Claude Code'dan kullanın](./claude-code.md).

## Okunur kılma

- Ayarlar'da **Diyagram stili**: Sade şekilleri düz tutar, Stilize renkler ve simgeler ekler. Bkz. [Ayarlar](./settings.md).
- **Animasyonlu bağlantılar**, akışın yönünü gösterir; isteğinizde onları isteyin.
- **Diyagramın bir kısmını seçin** ve yalnızca o kısım için bir değişiklik isteyin; örneğin "bu adımları eşit aralıklı diz".

## Örnek

![Çevik Scrum iş akışı](../../public/agile_scrum.svg)

İstem: "Yazılım geliştirme ekibi için çevik scrum iş akışı diyagramı oluştur."
