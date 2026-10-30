import { notFound } from "next/navigation"
import { Suspense } from "react"

import { RegisterForm } from "@/components/auth/auth-forms"
import type { Locale } from "@/lib/i18n/config"
import { hasLocale } from "@/lib/i18n/dictionaries"

export const metadata = { title: "Kayıt Ol | Synora" }

export default async function RegisterPage({
    params,
}: {
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    if (!hasLocale(lang)) notFound()
    return (
        <Suspense fallback={null}>
            <RegisterForm lang={lang as Locale} />
        </Suspense>
    )
}
