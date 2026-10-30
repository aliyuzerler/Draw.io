import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"

/**
 * Kimlik sayfalarının ortak çerçevesi. Artık projenin diğer sayfalarıyla
 * aynı iskeleti kullanır: SiteHeader (tema + dil + oturum menüsü) ve
 * SiteFooter; ortada yalnızca odaklanmış kart kalır.
 */
export default async function AuthLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang: rawLang } = await params
    const lang: Locale = hasLocale(rawLang) ? rawLang : "tr"
    return (
        <div className="flex min-h-screen flex-col bg-canvas text-foreground">
            <div className="border-b border-border">
                <SiteHeader lang={lang} />
            </div>
            <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
                {children}
            </main>
            <SiteFooter lang={lang} path="" />
        </div>
    )
}
