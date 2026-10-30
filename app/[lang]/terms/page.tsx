import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata: Metadata = {
    title: "Kullanım Şartları | Synora",
    description:
        "Synora kullanım şartları: hesap sorumluluğu, planlar ve ödeme, kabul edilebilir kullanım, fikri mülkiyet ve sorumluluk sınırı.",
}

const UPDATED = "30 Ekim 2026"

export default async function TermsPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang: rawLang } = await params
    if (!hasLocale(rawLang)) notFound()
    const lang = rawLang as Locale

    return (
        <div className="flex min-h-screen flex-col bg-canvas text-foreground">
            <div className="border-b border-border">
                <SiteHeader lang={lang} />
            </div>

            <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 text-[15px] leading-relaxed md:px-8">
                <h1 className="text-2xl font-semibold tracking-[-0.01em]">
                    Kullanım Şartları
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Son güncelleme: {UPDATED}
                </p>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        1. Hizmetin Kapsamı
                    </h2>
                    <p>
                        Synora; yapay zekâ desteğiyle draw.io diyagramları
                        oluşturmanızı, düzenlemenizi ve bulutta saklamanızı
                        sağlayan bir web hizmetidir. Hizmete kayıt olarak bu
                        şartları kabul etmiş olursunuz.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        2. Hesap Sorumluluğu
                    </h2>
                    <p>
                        Hesap bilgilerinizin gizliliğinden siz sorumlusunuz.
                        Hesabınız üzerinden yapılan işlemler sizin adınıza
                        yapılmış sayılır. Hesabınıza yetkisiz erişim fark
                        ederseniz şifrenizi derhal değiştirin.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        3. Planlar, Kotalar ve Ödeme
                    </h2>
                    <p>
                        Ücretsiz plan günlük/aylık istek ve kayıtlı diyagram
                        sınırlarına tabidir. Ücretli planlar (Pro, Ekip) aylık
                        abonelik olarak sunulur; ödemeler iyzico altyapısı
                        üzerinden 3D Secure ile alınır. Fiyatlar KDV dışı
                        olabilir; değişiklikler bir sonraki dönemden itibaren
                        uygulanır. Dilediğiniz an iptal edebilirsiniz; iptal,
                        dönem sonunda etkili olur.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        4. Kabul Edilemez Kullanım
                    </h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            Hizmeti yasalara aykırı içerik üretmek için
                            kullanmak
                        </li>
                        <li>Başkalarının hesaplarına erişmeye çalışmak</li>
                        <li>
                            Kotaları atlatmaya yönelik otomasyon (bot, çoklu
                            hesap, IP döndürme)
                        </li>
                        <li>
                            Hizmetin altyapısına zarar verecek yük testleri veya
                            veri kazıma
                        </li>
                    </ul>
                    <p>
                        Bu maddelere aykırılık, uyarı verilmeden hesabın askıya
                        alınmasıyla sonuçlanabilir.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        5. Fikri Mülkiyet ve Verileriniz
                    </h2>
                    <p>
                        Oluşturduğunuz diyagramların mülkiyeti size aittir.
                        Buluta kaydettiğiniz içerikleri Panelim sayfasından her
                        zaman dışa aktarabilir veya silebilirsiniz. Hizmeti
                        çalıştırmak için gerekli olan altyapı (draw.io gömülü
                        editörü, AI sağlayıcı entegrasyonları) ilgili
                        lisanslarına uygun şekilde kullanılır.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        6. Hizmet Düzeyi ve Sorumluluk Sınırı
                    </h2>
                    <p>
                        Hizmet &ldquo;olduğu gibi&rdquo; sunulur; AI
                        çıktılarının doğruluğu garanti edilmez — kritik
                        diyagramları gözden geçirin. Kanunların izin verdiği
                        ölçüde Synora, hizmetin kullanımından doğan dolaylı
                        zararlardan sorumlu tutulamaz.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">
                        7. Değişiklikler ve Uygulanacak Hukuk
                    </h2>
                    <p>
                        Bu şartlar zaman zaman güncellenebilir; önemli
                        değişiklikler hesabınıza bildirilir. Şartlar ile ilgili
                        uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır.
                    </p>
                </section>

                <nav className="mt-12 flex flex-wrap gap-3 border-t border-border pt-6 text-sm">
                    <Link
                        href={`/${lang}/privacy`}
                        className="rounded-lg border border-border bg-card px-3.5 py-2 font-medium hover:bg-foreground/[0.06]"
                    >
                        Gizlilik Politikası (KVKK) →
                    </Link>
                    <Link
                        href={`/${lang}/pricing`}
                        className="rounded-lg border border-border bg-card px-3.5 py-2 font-medium hover:bg-foreground/[0.06]"
                    >
                        Fiyatlandırma →
                    </Link>
                </nav>
            </main>

            <SiteFooter lang={lang} path="/terms" />
        </div>
    )
}
