import { cookies } from "next/headers"

import { SESSION_COOKIE, verifySessionToken } from "./session"

/**
 * Sunucu bileşenleri için oturum okuma (Node runtime).
 * Edge katmanı (proxy.ts) lib/auth/session.ts'ten import eder; next/headers
 * yalnızca burada kullanılır.
 */
export async function getSession() {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    if (!token) return null
    return verifySessionToken(token)
}
