import { Check } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { UpgradeButton } from "@/components/auth/upgrade-button"
import { BrandMark } from "@/components/workspace/brand-mark"
import { PLAN_SEEDS } from "@/lib/auth/seed"
import { getSession } from "@/lib/auth/session-server"
import { db } from "@/lib/db"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata: Metadata = { title: "Fiyatlandırma | Synora" }

interface PlanView {
    id: string
    name: string
    description: string | null
    priceMonthly: number
    features: string[]
}

async function loadPlans(): Promise<PlanView[]> {
    if (process.env.DATABASE_URL) {
        try {
            const plans = await db.plan.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
            })
            if (plans.length > 0) {
                return plans.map((p) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    priceMonthly: p.priceMonthly,
                    features: safeFeatures(p.features),
                }))
            }
        } catch {
            // tohum verisine düş
        }
    }
    return PLAN_SEEDS.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        features: p.features,
    }))
}

function safeFeatures(raw: string): string[] {
    try {
        return JSON.parse(raw) as string[]
    } catch {
        return []
    }
}

export default async function PricingPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang: rawLang } = await params
    if (!hasLocale(rawLang)) notFound()
    const lang = rawLang as Locale
    const [plans, session] = await Promise.all([loadPlans(), getSession()])

    let myPlanId: string | null = null
    if (session && process.env.DATABASE_URL) {
        try {
            const u = await db.user.findUnique({
                where: { id: session.sub },
                select: { planId: true },
            })
            myPlanId = u?.planId ?? null
        } catch {
            myPlanId = null
        }
    }

    const order = ["free", "pro", "team"]
    const sorted = [...plans].sort(
        (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
    )

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b border-border">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
                    <Link
                        href={`/${lang}`}
                        className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]"
                    >
                        <BrandMark className="size-7" />
                        Synora
                    </Link>
                    <Link
                        href={session ? `/${lang}/dashboard` : `/${lang}/login`}
                        className="rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-foreground/[0.07] hover:text-foreground"
                    >
                        {session ? "Panelim" : "Giriş yap"}
                    </Link>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 md:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-3xl font-semibold tracking-[-0.01em]">
                        Sizin için doğru plan
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Synora ile AI'ı gerçek draw.io tuvalinde kullanın.
                        Ücretsiz başlayın; ihtiyacınız büyüdüğünde yükseltin.
                        Tüm planlar Türkçe desteklidir, dilediğiniz an iptal
                        edebilirsiniz.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {sorted.map((plan) => {
                        const isCurrent = myPlanId === plan.id
                        const highlight = plan.id === "pro"
                        return (
                            <section
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border p-6 ${
                                    highlight
                                        ? "border-foreground/60 shadow-pop"
                                        : "border-border"
                                }`}
                            >
                                {highlight && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
                                        En popüler
                                    </span>
                                )}
                                <h2 className="text-lg font-semibold">
                                    {plan.name}
                                </h2>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-3xl font-semibold tabular-nums">
                                        {plan.priceMonthly === 0
                                            ? "0 ₺"
                                            : `${(plan.priceMonthly / 100).toLocaleString("tr-TR")} ₺`}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        /ay
                                    </span>
                                </div>
                                {plan.description && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {plan.description}
                                    </p>
                                )}
                                <ul className="mt-5 flex-1 space-y-2 text-sm">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex gap-2">
                                            <Check
                                                aria-hidden
                                                className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                                            />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6">
                                    {isCurrent ? (
                                        <div className="rounded-lg border border-border bg-muted/50 py-2 text-center text-sm font-medium text-muted-foreground">
                                            Mevcut planınız
                                        </div>
                                    ) : plan.id === "free" ? (
                                        session ? (
                                            <UpgradeButton
                                                lang={lang}
                                                planId="free"
                                                label="Ücretsiz plana dön"
                                                outline
                                            />
                                        ) : (
                                            <Link
                                                href={`/${lang}/register`}
                                                className="block w-full rounded-lg border border-border px-4 py-2 text-center text-sm font-medium hover:bg-foreground/[0.06]"
                                            >
                                                Ücretsiz başla
                                            </Link>
                                        )
                                    ) : (
                                        <UpgradeButton
                                            lang={lang}
                                            planId={plan.id}
                                            label={`${
                                                myPlanId === "free"
                                                    ? "Yükselt"
                                                    : "Bu planı seç"
                                            } — ${plan.name}`}
                                        />
                                    )}
                                </div>
                            </section>
                        )
                    })}
                </div>

                <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
                    Ödemeler iyzico altyapısı ile 3D Secure üzerinden alınır.
                    Faturalar e-posta ile iletilir. Plan değişiklikleri bir
                    sonraki dönemde işler. Kurumsal ihtiyaçlar için satış ile
                    iletişime geçin.
                </p>
            </main>

            <footer className="pb-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Synora
            </footer>
        </div>
    )
}
