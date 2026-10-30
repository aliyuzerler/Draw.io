import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BrandMark } from "@/components/workspace/brand-mark"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata: Metadata = {
    title: "Gizlilik Politikası (KVKK) | Synora",
}

const UPDATED = "30 Ekim 2026"

export default async function PrivacyPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang: rawLang } = await params
    if (!hasLocale(rawLang)) notFound()
    const lang = rawLang

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b border-border">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
                    <Link
                        href={`/${lang}`}
                        className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]"
                    >
                        <BrandMark className="size-7" />
                        Synora
                    </Link>
                    <Link
                        href={`/${lang}/terms`}
                        className="text-[13px] text-muted-foreground hover:text-foreground"
                    >
                        Kullanım Şartları →
                    </Link>
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 text-[15px] leading-relaxed">
                <h1 className="text-2xl font-semibold tracking-[-0.01em]">
                    Gizlilik Politikası ve KVKK Aydınlatma Metni
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Son güncelleme: {UPDATED}
                </p>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">1. Veri Sorumlusu</h2>
                    <p>
                        6698 sayılı Kişisel Verilerin Korunması Kanunu
                        (&ldquo;KVKK&rdquo;) uyarınca kişisel verileriniz,
                        Synora hizmetini işleten veri sorumlusu tarafından
                        aşağıda açıklanan kapsamda işlenmektedir. Veri
                        sorumlusuna ulaşmak için depodaki iletişim adreslerini
                        kullanabilirsiniz.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        2. İşlenen Kişisel Veriler
                    </h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            <strong>Hesap verileri:</strong> Kayıt olurken
                            verdiğiniz ad-soyad (isteğe bağlı), e-posta adresi
                            ve bcrypt algoritmasıyla şifrelenmiş şifre özetiniz.
                        </li>
                        <li>
                            <strong>Diyagram verileri:</strong> Buluta
                            kaydettiğiniz diyagram içerikleri ve başlıkları.
                            Bunlar hesabınıza özeldir ve yalnızca siz ve yetkili
                            hesabınızla erişilebilir.
                        </li>
                        <li>
                            <strong>Kullanım verileri:</strong> Plan
                            limitlerinin işletilmesi için AI istek sayıları ve
                            token tüketimleriniz (kullanıcı kimliğinize bağlı)
                            ile oturum açmamış ziyaretçiler için IP bazlı
                            sayaçlar.
                        </li>
                        <li>
                            <strong>Teknik kayıtlar:</strong> Hizmet güvenliği
                            için hata günlükleri; şifre sıfırlama taleplerinde
                            tek kullanımlık token özetleri.
                        </li>
                    </ul>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        3. İşleme Amaçları ve Hukuki Sebepler
                    </h2>
                    <p>
                        Verileriniz; hizmeti sunmak (sözleşmenin kurulması ve
                        ifası), hesabınızı doğrulamak, plan limitlerinizi
                        uygulamak, ödeme ve abonelik süreçlerini yürütmek
                        (iyzico üzerinden; kart bilgileri Synora sunucularında
                        saklanmaz), kötüye kullanımı önlemek ve yasal
                        yükümlülükleri yerine getirmek amacıyla işlenir.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">4. Çerezler</h2>
                    <p>
                        Synora oturumunuzu tutmak için zorunlu bir çerez
                        (synora_session) kullanır; bu çerez httpOnly'dir ve
                        yalnızca kimlik doğrulama için gereklidir. Reklam veya
                        profilleme amaçlı üçüncü taraf izleyicileri varsayılan
                        olarak çalışmaz.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        5. Üçüncü Taraf Servisler
                    </h2>
                    <p>
                        AI diyagram üretimi için seçtiğiniz sağlayıcı (ör.
                        OpenAI, Anthropic, Google) ile iletişim kurulur; istek
                        içeriğiniz model çıkarımı için bu sağlayıcıya iletilir.
                        Ödeme sağlayıcısı iyzico, e-posta teslimatı için Resend
                        (yapılandırılmışsa) kullanılabilir. Her biri kendi
                        gizlilik sözleşmesine tabidir.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        6. KVKK m.11 Kapsamındaki Haklarınız
                    </h2>
                    <p>
                        Verilerinize erişme, düzeltme, silme ve aktarılabilir
                        biçimde alma haklarına sahipsiniz. Panelim sayfasındaki{" "}
                        <strong>&ldquo;Verilerimi indir&rdquo;</strong>{" "}
                        düğmesiyle tüm verilerinizi JSON olarak dışa
                        aktarabilir, <strong>&ldquo;Hesabımı sil&rdquo;</strong>{" "}
                        düğmesiyle hesabınızı ve tüm diyagramlarınızı kalıcı
                        olarak sildirebilirsiniz.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">7. Veri Güvenliği</h2>
                    <p>
                        Şifreler bcrypt ile karma (hash) edilir; oturumlar
                        imzalı httpOnly çerezlerle taşınır; veritabanı erişimi
                        bağlantı dizesiyle sınırlandırılmıştır. Verilere
                        yalnızca hizmetin çalışması için gerekli sistem
                        bileşenleri erişir.
                    </p>
                </section>
            </main>

            <footer className="pb-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Synora
            </footer>
        </div>
    )
}
