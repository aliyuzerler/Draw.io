import { notFound } from "next/navigation"
import { Suspense } from "react"

import { LoginForm } from "@/components/auth/auth-forms"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata = { title: "Giriş Yap | Synora" }

export default async function LoginPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!hasLocale(lang)) notFound()
    return (
        <Suspense fallback={null}>
            <LoginForm lang={lang as Locale} />
        </Suspense>
    )
}
