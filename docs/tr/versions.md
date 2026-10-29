# Sürümler ve geri alma

Yapay zekânın yaptığı her değişiklik bir sürüm olarak kaydedilir; böylece bir istek deneyebilir, sonucuna bakabilir ve beğenmezseniz geri dönebilirsiniz.

<!-- demo: ai-edit -->

## Sürüm kartları

Diyagramı değiştiren her yanıt, sohbette bir sürüm kartıyla biter. Kart, sürüm numarasını, ne olduğunu ("Diyagram çizildi", "Diyagram değiştirildi") ve neyin değiştiğini gösterir; örneğin "1 şekil eklendi, 1 bağlantı eklendi". XML'i göster, yapay zekânın yazdığı XML'i açar.

Değişen şekiller 3 saniye boyunca tuvalde çerçeveyle vurgulanır. Tuvalin gösterdiği sürümün kartında, Değişiklikleri göster onları yeniden vurgular.

## Son değişikliği geri alma

Tuval o sürümü gösterirken, en yeni kartta Değişikliği geri al bulunur. Bu, yapay zekânın son değişikliğini geri alır; kart daha sonra "Değişiklik geri alındı" der ve Değişikliği yinele önerir.

Tuvale Ctrl+Z yapmak, yapay zekânın son değişikliği için aynı işi görür.

Bir sürümden sonra diyagramı elle düzenlerseniz kart, "Bu sürümden bu yana tuvali elle değiştirdiniz" der. Geri alma yerine Geri yükle gelir; çünkü geri almak sizin düzenlemelerinizi de kaldırırdı.

## Eski bir sürümü geri yükleme

Eski kartlarda Geri yükle v1, Geri yükle v2 ve benzerleri bulunur. Geri yükleme o sürümü tuvale getirir; daha yeni sürümler listede kalır, böylece sonra onlardan birini yeniden geri yükleyebilirsiniz. Bir ileti, geri yüklemeyi doğrular ve öncesindeki tuvale dönmek için bir Geri al düğmesi taşır.

<!-- demo: versions -->

## Sürümleri karşılaştırma

İki ya da daha fazla sürüm olduğunda, sohbet başlığının altındaki Sürümler satırı her birinin resmini gösterir. Tuvalede olan resim çerçevelidir. Bir resme — ya da bir karttaki resme — tıklayın; Sürümleri karşılaştır açılır: sürüm ve tuvalin şimdiki hâli yan yana, aralarında fark olan şekillerin listesiyle. Önceki sürüm ve Sonraki sürüm ile aralarında geçiş yapın ve istediğinizi oradan geri yükleyin.

## MCP sunucusunda

MCP sunucusu, aynı sürüm kartlarını kendi tuvalinin yanında, son 20 sürümüyle tutar. Yapay zekâdan geri almasını da isteyebilirsiniz; bkz. [Claude Code'dan kullanın](./claude-code.md).
