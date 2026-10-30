import Link from "next/link"

import { BrandMark } from "@/components/workspace/brand-mark"

/** Kimlik sayfalarının ortak çerçevesi: üst marka çubuğu + ortalanmış kart */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b border-border">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]"
                    >
                        <BrandMark className="size-7" />
                        Synora
                    </Link>
                    <Link
                        href="/"
                        className="rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-foreground/[0.07] hover:text-foreground"
                    >
                        ← Editöre dön
                    </Link>
                </div>
            </header>
            <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
                {children}
            </main>
            <footer className="pb-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Synora
            </footer>
        </div>
    )
}
