import { NextResponse } from "next/server"
import { rejectCrossSite } from "@/lib/access-code"
import { dbNotConfigured, jsonError } from "@/lib/auth/api"
import { verifyPassword } from "@/lib/auth/password"
import { clientIpOf, rateLimit } from "@/lib/auth/rate-limit"
import { ensurePlans } from "@/lib/auth/seed"
import {
    SESSION_COOKIE,
    sessionCookieOptions,
    signSession,
} from "@/lib/auth/session"
import { db } from "@/lib/db"

/** POST /api/auth/login — e-posta + şifre ile oturum açar */
export async function POST(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite

    const ip = clientIpOf(req)
    const ipLimit = rateLimit(`login:${ip}`, 10, 60_000)
    if (!ipLimit.ok) {
        return jsonError(
            `Çok fazla deneme. ${ipLimit.retryAfterSec} saniye sonra tekrar deneyin.`,
            429,
        )
    }

    const noDb = dbNotConfigured()
    if (noDb) return noDb

    let body: { email?: string; password?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }

    const email = (body.email || "").trim().toLowerCase()
    const password = body.password || ""
    if (!email || !password) {
        return jsonError("E-posta ve şifre zorunludur.", 400)
    }

    const emailLimit = rateLimit(`login-email:${email}`, 10, 60_000)
    if (!emailLimit.ok) {
        return jsonError(
            `Çok fazla deneme. ${emailLimit.retryAfterSec} saniye sonra tekrar deneyin.`,
            429,
        )
    }

    try {
        await ensurePlans()
        const user = await db.user.findUnique({ where: { email } })
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return jsonError("E-posta veya şifre hatalı.", 401)
        }
        if (user.status === "SUSPENDED") {
            return jsonError(
                "Hesabınız askıya alınmış. Destek ile iletişime geçin.",
                403,
            )
        }

        await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
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
        console.error("[Synora] Giriş hatası:", err)
        return jsonError(
            "Giriş sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
            500,
        )
    }
}
