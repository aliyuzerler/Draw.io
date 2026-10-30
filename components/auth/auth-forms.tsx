"use client"

import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { type FormEvent, type ReactNode, useState } from "react"

import { authText } from "@/components/auth/auth-texts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ── Paylaşılan parçalar ───────────────────────────────────────────────

function AuthCard({
    title,
    subtitle,
    children,
    footer,
}: {
    title: string
    subtitle: string
    children: ReactNode
    footer?: ReactNode
}) {
    return (
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-float sm:p-8">
            <h1 className="text-xl font-semibold tracking-[-0.01em]">
                {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
            {footer && (
                <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
                    {footer}
                </div>
            )}
        </div>
    )
}

function Field({
    id,
    label,
    hint,
    children,
}: {
    id: string
    label: string
    hint?: string
    children: ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}

function Notice({
    kind,
    children,
}: {
    kind: "error" | "success"
    children: ReactNode
}) {
    const isError = kind === "error"
    return (
        <div
            role={isError ? "alert" : "status"}
            className={`flex items-start gap-2 rounded-lg border p-3 text-[13px] ${
                isError
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-success/30 bg-success-muted text-success"
            }`}
        >
            {isError ? (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
            ) : (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            )}
            <span className="break-words">{children}</span>
        </div>
    )
}

async function postJson(url: string, body: unknown) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, data } as { ok: boolean; data: Record<string, string> }
}

// ── Giriş ─────────────────────────────────────────────────────────────

export function LoginForm({ lang }: { lang: string }) {
    const t = authText(lang)
    const router = useRouter()
    const params = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setError("")
        const { ok, data } = await postJson("/api/auth/login", {
            email,
            password,
        })
        if (ok) {
            const next = params.get("next")
            router.push(next?.startsWith("/") ? next : `/${lang}/dashboard`)
            router.refresh()
            return
        }
        setError(data.error || "Giriş yapılamadı.")
        setBusy(false)
    }

    return (
        <AuthCard
            title={t.loginTitle}
            subtitle={t.loginSubtitle}
            footer={
                <span>
                    {t.noAccount}{" "}
                    <Link
                        href={`/${lang}/register`}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        {t.registerBtn.toLowerCase()}
                    </Link>
                </span>
            }
        >
            <form onSubmit={submit} className="space-y-4" noValidate>
                {error && <Notice kind="error">{error}</Notice>}
                <Field id="email" label={t.email}>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@sirket.com"
                    />
                </Field>
                <Field id="password" label={t.password}>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </Field>
                <div className="text-right">
                    <Link
                        href={`/${lang}/forgot-password`}
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                        {t.forgotLink}
                    </Link>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    {busy ? t.working : t.loginBtn}
                </Button>
            </form>
        </AuthCard>
    )
}

// ── Kayıt ─────────────────────────────────────────────────────────────

export function RegisterForm({ lang }: { lang: string }) {
    const t = authText(lang)
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setError("")
        const { ok, data } = await postJson("/api/auth/register", {
            name,
            email,
            password,
        })
        if (ok) {
            router.push(`/${lang}/dashboard`)
            router.refresh()
            return
        }
        setError(data.error || "Kayıt oluşturulamadı.")
        setBusy(false)
    }

    return (
        <AuthCard
            title={t.registerTitle}
            subtitle={t.registerSubtitle}
            footer={
                <span>
                    {t.haveAccount}{" "}
                    <Link
                        href={`/${lang}/login`}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        {t.loginBtn.toLowerCase()}
                    </Link>
                </span>
            }
        >
            <form onSubmit={submit} className="space-y-4" noValidate>
                {error && <Notice kind="error">{error}</Notice>}
                <Field id="name" label={`${t.name} (${t.nameOptional})`}>
                    <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ada Lovelace"
                    />
                </Field>
                <Field id="email" label={t.email}>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@sirket.com"
                    />
                </Field>
                <Field id="password" label={t.password} hint={t.passwordHint}>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </Field>
                <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    {busy ? t.working : t.registerBtn}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                    <Link
                        href={`/${lang}/terms`}
                        className="underline underline-offset-4 hover:text-foreground"
                    >
                        kullanım koşullarını
                    </Link>{" "}
                    ve{" "}
                    <Link
                        href={`/${lang}/privacy`}
                        className="underline underline-offset-4 hover:text-foreground"
                    >
                        gizlilik politikasını (KVKK)
                    </Link>{" "}
                    kabul etmiş olursunuz.{" "}
                    <span className="sr-only">{t.termsNote}</span>
                </p>
            </form>
        </AuthCard>
    )
}

// ── Şifremi unuttum ──────────────────────────────────────────────────

export function ForgotPasswordForm({ lang }: { lang: string }) {
    const t = authText(lang)
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [sent, setSent] = useState(false)
    const [demoUrl, setDemoUrl] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setError("")
        const { ok, data } = await postJson("/api/auth/forgot-password", {
            email,
            lang,
        })
        setBusy(false)
        if (!ok && data.error) {
            setError(data.error)
            return
        }
        setSent(true)
        setDemoUrl(data.resetUrl || null)
    }

    return (
        <AuthCard
            title={t.forgotTitle}
            subtitle={t.forgotSubtitle}
            footer={
                <Link
                    href={`/${lang}/login`}
                    className="font-medium text-foreground underline underline-offset-4"
                >
                    {t.backToLogin}
                </Link>
            }
        >
            {sent ? (
                <div className="space-y-4">
                    <Notice kind="success">{t.forgotGeneric}</Notice>
                    {demoUrl && (
                        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-[13px]">
                            <p className="font-medium">{t.demoResetTitle}</p>
                            <p className="mt-1 text-muted-foreground">
                                {t.demoResetHint}
                            </p>
                            <a
                                href={demoUrl}
                                className="mt-2 flex items-center gap-1 font-medium break-all text-foreground underline underline-offset-4"
                            >
                                {demoUrl}
                                <ExternalLink className="size-3.5 shrink-0" />
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4" noValidate>
                    {error && <Notice kind="error">{error}</Notice>}
                    <Field id="email" label={t.email}>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@sirket.com"
                        />
                    </Field>
                    <Button type="submit" className="w-full" disabled={busy}>
                        {busy && <Loader2 className="size-4 animate-spin" />}
                        {busy ? t.working : t.forgotBtn}
                    </Button>
                </form>
            )}
        </AuthCard>
    )
}

// ── Şifre sıfırlama ──────────────────────────────────────────────────

export function ResetPasswordForm({ lang }: { lang: string }) {
    const t = authText(lang)
    const router = useRouter()
    const params = useSearchParams()
    const token = params.get("token") || ""
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [done, setDone] = useState(false)
    const [busy, setBusy] = useState(false)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setBusy(true)
        setError("")
        const { ok, data } = await postJson("/api/auth/reset-password", {
            token,
            password,
        })
        setBusy(false)
        if (ok) {
            setDone(true)
            return
        }
        setError(data.error || "Şifre güncellenemedi.")
    }

    if (!token) {
        return (
            <AuthCard
                title={t.resetTitle}
                subtitle={t.resetSubtitle}
                footer={
                    <Link
                        href={`/${lang}/forgot-password`}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        {t.forgotLink}
                    </Link>
                }
            >
                <Notice kind="error">
                    Sıfırlama bağlantısı eksik. Lütfen e-postadaki bağlantıyı
                    kullanın.
                </Notice>
            </AuthCard>
        )
    }

    return (
        <AuthCard
            title={t.resetTitle}
            subtitle={t.resetSubtitle}
            footer={
                done ? (
                    <button
                        type="button"
                        onClick={() => router.push(`/${lang}/login`)}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        {t.loginBtn.toLowerCase()}
                    </button>
                ) : (
                    <Link
                        href={`/${lang}/login`}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        {t.backToLogin}
                    </Link>
                )
            }
        >
            {done ? (
                <Notice kind="success">{t.resetSuccess}</Notice>
            ) : (
                <form onSubmit={submit} className="space-y-4" noValidate>
                    {error && <Notice kind="error">{error}</Notice>}
                    <Field
                        id="password"
                        label={t.newPassword}
                        hint={t.passwordHint}
                    >
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </Field>
                    <Button type="submit" className="w-full" disabled={busy}>
                        {busy && <Loader2 className="size-4 animate-spin" />}
                        {busy ? t.working : t.resetBtn}
                    </Button>
                </form>
            )}
        </AuthCard>
    )
}
