import {
    BarChart3,
    CalendarDays,
    Clock,
    CreditCard,
    PlusCircle,
    Shield,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { authText } from "@/components/auth/auth-texts"
import { DiagramsPanel } from "@/components/auth/diagrams-panel"
import { LogoutButton } from "@/components/auth/logout-button"
import { BrandMark } from "@/components/workspace/brand-mark"
import { ensurePlans } from "@/lib/auth/seed"
import { getSession } from "@/lib/auth/session-server"
import { db } from "@/lib/db"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata: Metadata = { title: "Panelim | Synora" }

function formatLimit(n: number, unlimitedLabel: string): string {
    return n < 0 ? unlimitedLabel : n.toLocaleString("tr-TR")
}

function formatDate(d: Date | null | undefined): string {
    if (!d) return "—"
    return d.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang: rawLang } = await params
    if (!hasLocale(rawLang)) notFound()
    const lang = rawLang as Locale
    const t = authText(lang)

    const session = await getSession()
    if (!session) redirect(`/${lang}/login?next=/${lang}/dashboard`)

    // JWT'deki rol/plan bayatlamış olabilir; güncel hesabı oku.
    let fresh: {
        id: string
        email: string
        name: string | null
        role: string
        status: string
        planId: string
        createdAt: Date
        lastLoginAt: Date | null
    } | null = null
    let plan: {
        id: string
        name: string
        priceMonthly: number
        dailyRequestLimit: number
        monthlyRequestLimit: number
        maxDiagrams: number
        features: string
    } | null = null
    let requestsThisMonth = 0
    let diagramCount = 0

    if (process.env.DATABASE_URL) {
        try {
            await ensurePlans()
            const u = await db.user.findUnique({
                where: { id: session.sub },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    planId: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
            })
            if (!u || u.status === "SUSPENDED") {
                redirect(`/${lang}/login`)
            }
            fresh = u
            plan = await db.plan.findUnique({
                where: { id: u.planId },
                select: {
                    id: true,
                    name: true,
                    priceMonthly: true,
                    dailyRequestLimit: true,
                    monthlyRequestLimit: true,
                    maxDiagrams: true,
                    features: true,
                },
            })
            const monthStart = new Date()
            monthStart.setDate(1)
            monthStart.setHours(0, 0, 0, 0)
            ;[requestsThisMonth, diagramCount] = await Promise.all([
                db.usageEvent.count({
                    where: { userId: u.id, createdAt: { gte: monthStart } },
                }),
                db.diagram.count({ where: { userId: u.id } }),
            ])
        } catch (err) {
            console.error("[Synora] Panel verileri okunamadı:", err)
        }
    }

    const user = fresh ?? {
        id: session.sub,
        email: session.email,
        name: session.name,
        role: session.role,
        status: "ACTIVE",
        planId: "free",
        createdAt: null as Date | null,
        lastLoginAt: null as Date | null,
    }
    const effectivePlan = plan ?? {
        id: "free",
        name: "Ücretsiz",
        priceMonthly: 0,
        dailyRequestLimit: 10,
        monthlyRequestLimit: 100,
        maxDiagrams: 5,
        features: "[]",
    }
    let features: string[] = []
    try {
        features = JSON.parse(effectivePlan.features) as string[]
    } catch {
        features = []
    }

    const isAdmin = user.role === "ADMIN"

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b border-border">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 md:px-8">
                    <Link
                        href={`/${lang}`}
                        className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]"
                    >
                        <BrandMark className="size-7" />
                        Synora
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/${lang}`}
                            className="rounded-lg bg-foreground px-3.5 py-2 text-[13px] font-medium text-background"
                        >
                            {t.backToHome}
                        </Link>
                        <LogoutButton lang={lang} label={t.logout} />
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:px-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-[-0.01em]">
                            {t.dashboardTitle}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t.dashboardSubtitle}
                        </p>
                    </div>
                    <Link
                        href={`/${lang}`}
                        className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-[13px] font-medium hover:bg-foreground/[0.06]"
                    >
                        <PlusCircle className="size-4" />
                        {t.newDiagram}
                    </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Hesap */}
                    <section className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Shield className="size-4" /> {t.accountCard}
                        </h2>
                        <p className="mt-3 truncate text-[15px] font-medium">
                            {user.name || user.email.split("@")[0]}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                            {user.email}
                        </p>
                        <dl className="mt-4 space-y-1.5 text-[13px]">
                            <div className="flex justify-between gap-2">
                                <dt className="text-muted-foreground">
                                    {t.role}
                                </dt>
                                <dd className="font-medium">
                                    {isAdmin ? t.adminRole : t.userRole}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt className="text-muted-foreground">
                                    {t.status}
                                </dt>
                                <dd className="font-medium">
                                    {user.status === "SUSPENDED"
                                        ? t.suspendedStatus
                                        : t.activeStatus}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <dt className="text-muted-foreground">
                                    {t.memberSince}
                                </dt>
                                <dd className="flex items-center gap-1 font-medium">
                                    <CalendarDays className="size-3.5 text-muted-foreground" />
                                    {formatDate(user.createdAt)}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <dt className="text-muted-foreground">
                                    {t.lastLogin}
                                </dt>
                                <dd className="flex items-center gap-1 font-medium">
                                    <Clock className="size-3.5 text-muted-foreground" />
                                    {formatDate(user.lastLoginAt)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {/* Plan */}
                    <section className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <CreditCard className="size-4" /> {t.planCard}
                        </h2>
                        <div className="mt-3 flex items-baseline gap-2">
                            <p className="text-[15px] font-semibold">
                                {effectivePlan.name}
                            </p>
                            <span className="text-sm text-muted-foreground">
                                {effectivePlan.priceMonthly === 0
                                    ? "0 ₺/ay"
                                    : `${(effectivePlan.priceMonthly / 100).toLocaleString("tr-TR")} ₺/ay`}
                            </span>
                        </div>
                        <Link
                            href={`/${lang}/pricing`}
                            className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-foreground underline underline-offset-4"
                        >
                            Planları gör ve yükselt →
                        </Link>
                        <dl className="mt-4 space-y-1.5 text-[13px]">
                            <div className="flex justify-between gap-2">
                                <dt className="text-muted-foreground">
                                    {t.dailyLimit}
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    {formatLimit(
                                        effectivePlan.dailyRequestLimit,
                                        t.unlimited,
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt className="text-muted-foreground">
                                    {t.monthlyLimit}
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    {formatLimit(
                                        effectivePlan.monthlyRequestLimit,
                                        t.unlimited,
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt className="text-muted-foreground">
                                    {t.maxDiagrams}
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    {formatLimit(
                                        effectivePlan.maxDiagrams,
                                        t.unlimited,
                                    )}
                                </dd>
                            </div>
                        </dl>
                        {features.length > 0 && (
                            <div className="mt-4 border-t border-border pt-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t.featuresList}
                                </p>
                                <ul className="mt-1.5 space-y-1 text-[13px]">
                                    {features.slice(0, 4).map((f) => (
                                        <li key={f} className="flex gap-1.5">
                                            <span
                                                aria-hidden
                                                className="text-emerald-600 dark:text-emerald-400"
                                            >
                                                ✓
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    {/* Kullanım */}
                    <section className="rounded-2xl border border-border bg-card p-5 sm:col-span-2 lg:col-span-1">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <BarChart3 className="size-4" /> {t.usageCard}
                        </h2>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-muted/50 p-3">
                                <p className="text-2xl font-semibold tabular-nums">
                                    {requestsThisMonth}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {t.requestsThisMonth}
                                </p>
                            </div>
                            <div className="rounded-xl bg-muted/50 p-3">
                                <p className="text-2xl font-semibold tabular-nums">
                                    {diagramCount}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {t.savedDiagrams}
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">
                            {t.comingSoonDiagrams}
                        </p>
                    </section>
                </div>

                {/* Diyagramlarım — bulut kayıtları */}
                <div className="mt-4">
                    <DiagramsPanel lang={lang} />
                </div>

                {isAdmin && (
                    <section className="mt-4 rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-sm font-semibold text-muted-foreground">
                            {t.quickActions}
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                                href={`/${lang}/admin`}
                                className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-[13px] font-medium hover:bg-foreground/[0.06]"
                            >
                                <Shield className="size-4" />
                                {t.adminPanel}
                            </Link>
                        </div>
                    </section>
                )}
            </main>

            <footer className="pb-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Synora
            </footer>
        </div>
    )
}
