import { cookies } from "next/headers"

import { db } from "@/lib/db"

import {
    getSessionFromRequest,
    SESSION_COOKIE,
    type SessionPayload,
    verifySessionToken,
} from "./session"

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

// ── Oturum invalidasyonu (şifre değişimi/sıfırlaması sonrası) ──────────────
// JWT'nin doğal ömrü 30 gündür; şifresi sıfırlanan bir hesabın çalınmış
// çerezi de düşmelidir. sessionsInvalidatedAt <= iat ise oturum geçersiz.
// Doğrulama 60 sn TTL önbellekle yapılır: her API çağrısına ek DB yükü olmasın.

const invalidBeforeCache = new Map<
    string,
    { at: number | null; loaded: number }
>()
const INVALIDATION_CACHE_TTL_MS = 60_000

function pruneInvalidationCache(now: number) {
    for (const [key, value] of invalidBeforeCache) {
        if (now - value.loaded > INVALIDATION_CACHE_TTL_MS)
            invalidBeforeCache.delete(key)
    }
}

/**
 * API rotaları için doğrulanmış oturum okuma: JWT imzasına ek olarak
 * (DB yapılandırılmışsa) kullanıcının sessionsInvalidatedAt damgasını
 * denetler. Şifre sıfırlamadan önce verilmiş oturumlar null döner.
 */
export async function getSessionFromRequestVerified(
    req: Request,
): Promise<SessionPayload | null> {
    const session = await getSessionFromRequest(req)
    if (!session) return null
    if (!process.env.DATABASE_URL) return session
    try {
        const now = Date.now()
        if (invalidBeforeCache.size > 10000) pruneInvalidationCache(now)
        let cached = invalidBeforeCache.get(session.sub)
        if (!cached || now - cached.loaded > INVALIDATION_CACHE_TTL_MS) {
            const user = await db.user.findUnique({
                where: { id: session.sub },
                select: { sessionsInvalidatedAt: true },
            })
            cached = {
                at: user?.sessionsInvalidatedAt?.getTime() ?? null,
                loaded: now,
            }
            invalidBeforeCache.set(session.sub, cached)
        }
        if (cached.at && (session.iat ?? 0) * 1000 < cached.at) return null
        return session
    } catch {
        // DB erişilemediğinde eski davranış: JWT imzası yeteli sayılır
        return session
    }
}
