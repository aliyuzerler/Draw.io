# Metinden AWS mimari diyagramları

Sisteminizi düz metinle tarif edin; Next AI Draw.io, AWS mimari diyagramını draw.io'nun `aws4` şekil kitaplığındaki resmî AWS simgeleriyle çizer. Proje ücretsiz ve açık kaynaktır; sonuç normal bir draw.io diyagramıdır: elle düzenleyip `.drawio`, `.png` ya da `.svg` olarak dışa aktarabilirsiniz. Bu sayfa, iyi bir ilk taslağı nasıl alacağınızı ve onu nasıl geliştireceğinizi gösterir.

## Bir açıklamadan başlama

Editörde sistemi tarif edin: parçalarını ve isteklerin ya da verinin aralarında nasıl aktığını. Örneğin:

```text
AWS üzerinde sunucusuz bir REST API çiz: Lambda'nın önünde API Gateway, girişte Cognito, veri için DynamoDB, yüklenen dosyalar için S3. Kullanıcılar dışındaki her şeyi bir AWS Cloud grubunun içine koy.
```

Yapay zekâ çizmeden önce AWS şekil kitaplığına bakar; böylece her hizmet genel bir kutu yerine gerçek simgesini alır.

İyi sonuç verenler:

- **Hizmetleri adlandırın.** "Bir veritabanı" herhangi bir veritabanına dönüşebilir; "DynamoDB", DynamoDB simgesine dönüşür.
- **Neyin gruplandığını söyleyin.** AWS Cloud, Region, VPC, Availability Zone'lar, genel ve özel alt ağlar.
- **Akışın yönünü söyleyin.** Örneğin "soldan sağa, kullanıcıdan veritabanına".
- **Animasyonlu bağlantılar isteyin**, isteklerin ya da verinin yönü önemliyse.

<!-- demo: generate -->

## Elinizde olandan başlama

- **Bir ekran görüntüsü ya da beyaz tahta fotoğrafı**: yükleyin ve yapay zekâdan AWS simgeleriyle yeniden çizmesini isteyin.
- **Bir PDF ya da tasarım belgesi**: yükleyin ve tarif ettiği mimariyi isteyin.
- **Altyapı kodunuz**: MCP sunucusuyla Claude Code ya da Cursor, Terraform, CDK ya da CloudFormation dosyalarınızı okur ve tanımladıkları mimariyi çizer. Bkz. [Claude Code'dan kullanın](./claude-code.md).

```text
infra/ içindeki Terraform dosyalarını oku ve oluşturdukları AWS mimarisini VPC ve alt ağlara göre gruplayarak çiz
```

## Geliştirme

- **Şekilleri istediğiniz yere elle taşıyın.** Yapay zekâ, bir sonraki değişikliğinden önce sizin düzeninizi okur.
- **Bir hizmeti seçin ve onun için bir değişiklik isteyin**; örneğin "bunun önüne bir önbellek ekle".
- **Yanlış gideni geri alın.** Yapay zekânın her değişikliği bir sürümdür: kartından geri alın ya da eski bir sürümü geri yükleyin.

## Örnek

![React ve AWS ile kimlik doğrulama](../../public/auth.svg)

İstem: "React ve AWS kullanarak kimlik doğrulama süreci oluştur. Sunucusuz mimari kullan."

## Dışa aktarma

- **.drawio** her şeyi düzenlenebilir tutar; bu uygulamada ya da draw.io'da.
- **PNG** slaytlar ve belgeler için bir resimdir.
- **SVG** bulanmadan ölçeklenen bir resimdir.
