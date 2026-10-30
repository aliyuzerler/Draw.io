import { Check } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { UpgradeButton } from "@/components/auth/upgrade-button"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { PLAN_SEEDS } from "@/lib/auth/seed"
import { getSession } from "@/lib/auth/session-server"
import { db } from "@/lib/db"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"
import { localeAlternates, OG_IMAGE, OG_LOCALE } from "@/lib/seo"

import { pricingText } from "./texts"

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

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const rawLang = (await params).lang
    const locale: Locale = hasLocale(rawLang) ? rawLang : "tr"
    const t = pricingText(locale)
    return {
        title: "Fiyatlandırma | Synora",
        description: t.lede,
        alternates: localeAlternates(locale, "/pricing"),
        openGraph: {
            title: "Fiyatlandırma | Synora",
            description: t.lede,
            type: "website",
            url: `/${locale}/pricing`,
            siteName: "Synora",
            locale: OG_LOCALE[locale],
            images: [{ ...OG_IMAGE, alt: "Fiyatlandırma | Synora" }],
        },
    }
}

export default async function PricingPage({ params }: Props) {
    const { lang: rawLang } = await params
    if (!hasLocale(rawLang)) notFound()
    const lang = rawLang as Locale
    const t = pricingText(lang)
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
        <div className="site flex min-h-screen flex-col bg-canvas text-foreground">
            <div className="border-b border-border">
                <SiteHeader lang={lang} />
            </div>

            <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 md:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-3xl font-semibold tracking-[-0.01em]">
                        {t.title}
                    </h1>
                    <p className="mt-3 text-muted-foreground">{t.lede}</p>
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {sorted.map((plan) => {
                        const isCurrent = myPlanId === plan.id
                        const highlight = plan.id === "pro"
                        return (
                            <section
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border bg-card p-6 ${
                                    highlight
                                        ? "border-foreground/60 shadow-pop"
                                        : "border-border"
                                }`}
                            >
                                {highlight && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background">
                                        {t.popular}
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
                                        {t.perMonth}
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
                                                className="mt-0.5 size-4 shrink-0 text-success"
                                            />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6">
                                    {isCurrent ? (
                                        <div className="rounded-lg border border-border bg-muted/50 py-2 text-center text-sm font-medium text-muted-foreground">
                                            {t.currentPlan}
                                        </div>
                                    ) : plan.id === "free" ? (
                                        session ? (
                                            <UpgradeButton
                                                lang={lang}
                                                planId="free"
                                                label={t.backToFree}
                                                outline
                                            />
                                        ) : (
                                            <Link
                                                href={`/${lang}/register`}
                                                className="block w-full rounded-lg border border-border px-4 py-2 text-center text-sm font-medium hover:bg-foreground/[0.06]"
                                            >
                                                {t.startFree}
                                            </Link>
                                        )
                                    ) : (
                                        <UpgradeButton
                                            lang={lang}
                                            planId={plan.id}
                                            label={`${
                                                myPlanId === "free"
                                                    ? t.upgrade
                                                    : t.choose
                                            } — ${plan.name}`}
                                        />
                                    )}
                                </div>
                            </section>
                        )
                    })}
                </div>

                <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
                    {t.note}
                </p>
            </main>

            <SiteFooter lang={lang} path="/pricing" />
        </div>
    )
}
