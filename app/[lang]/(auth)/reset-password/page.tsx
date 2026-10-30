import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ResetPasswordForm } from "@/components/auth/auth-forms"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata = { title: "Şifre Sıfırlama | Synora" }

export default async function ResetPasswordPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!hasLocale(lang)) notFound()
    return (
        <Suspense fallback={null}>
            <ResetPasswordForm lang={lang as Locale} />
        </Suspense>
    )
}
