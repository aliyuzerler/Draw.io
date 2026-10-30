import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BrandMark } from "@/components/workspace/brand-mark"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata: Metadata = {
    title: "Kullanım Şartları | Synora",
}

const UPDATED = "30 Ekim 2026"

export default async function TermsPage({
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
                        href={`/${lang}/privacy`}
                        className="text-[13px] text-muted-foreground hover:text-foreground"
                    >
                        Gizlilik →
                    </Link>
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 text-[15px] leading-relaxed">
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
            </main>

            <footer className="pb-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Synora
            </footer>
        </div>
    )
}
