import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ForgotPasswordForm } from "@/components/auth/auth-forms"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata = { title: "Şifremi Unuttum | Synora" }

export default async function ForgotPasswordPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!hasLocale(lang)) notFound()
    return (
        <Suspense fallback={null}>
            <ForgotPasswordForm lang={lang as Locale} />
        </Suspense>
    )
}
