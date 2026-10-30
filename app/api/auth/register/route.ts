import { NextResponse } from "next/server"
import { rejectCrossSite } from "@/lib/access-code"
import { dbNotConfigured, jsonError } from "@/lib/auth/api"
import {
    hashPassword,
    isValidEmail,
    validatePassword,
} from "@/lib/auth/password"
import { clientIpOf, rateLimit } from "@/lib/auth/rate-limit"
import { ensurePlans } from "@/lib/auth/seed"
import {
    SESSION_COOKIE,
    sessionCookieOptions,
    signSession,
} from "@/lib/auth/session"
import { db } from "@/lib/db"

/** POST /api/auth/register — hesap oluşturur ve oturum açar */
export async function POST(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite

    const limiter = rateLimit(`register:${clientIpOf(req)}`, 5, 60_000)
    if (!limiter.ok) {
        return jsonError(
            `Çok fazla deneme. ${limiter.retryAfterSec} saniye sonra tekrar deneyin.`,
            429,
        )
    }

    const noDb = dbNotConfigured()
    if (noDb) return noDb

    let body: { name?: string; email?: string; password?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }

    const name = (body.name || "").trim().slice(0, 60) || null
    const email = (body.email || "").trim().toLowerCase()
    const password = body.password || ""

    if (!isValidEmail(email))
        return jsonError("Geçerli bir e-posta adresi girin.", 400)
    const passwordError = validatePassword(password)
    if (passwordError) return jsonError(passwordError, 400)

    try {
        await ensurePlans()

        const existing = await db.user.findUnique({ where: { email } })
        if (existing) {
            return jsonError(
                "Bu e-posta adresi ile kayıtlı bir hesap zaten var. Giriş yapmayı deneyin.",
                409,
            )
        }

        // Bootstrap: ilk kullanıcı otomatik yönetici olur; ADMIN_EMAILS
        // listesindeki adresler de yönetici olarak kaydedilir.
        const isFirst = (await db.user.count()) === 0
        const adminEmails =
            process.env.ADMIN_EMAILS?.split(",")
                .map((e) => e.trim().toLowerCase())
                .filter(Boolean) || []
        const role = isFirst || adminEmails.includes(email) ? "ADMIN" : "USER"

        const user = await db.user.create({
            data: {
                email,
                name,
                passwordHash: await hashPassword(password),
                role,
                planId: "free",
            },
        })

        const token = await signSession({
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        })
        const res = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                planId: user.planId,
            },
        })
        res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
        return res
    } catch (err) {
        console.error("[Synora] Kayıt hatası:", err)
        return jsonError(
            "Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
            500,
        )
    }
}
