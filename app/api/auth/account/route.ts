import { NextResponse } from "next/server"
import { rejectCrossSite } from "@/lib/access-code"
import { dbNotConfigured, jsonError, requireSession } from "@/lib/auth/api"
import {
    hashPassword,
    validatePassword,
    verifyPassword,
} from "@/lib/auth/password"
import { clientIpOf, rateLimit } from "@/lib/auth/rate-limit"
import { SESSION_COOKIE } from "@/lib/auth/session"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * PATCH /api/auth/account — { currentPassword, newPassword }
 * Şifre değiştirme: mevcut şifre doğrulanır, yeni şifre politikaya göre
 * denetlenir; verilen tüm oturumlar geçersiz kılınır (çalınmış çerez
 * dahi düşer) ve kullanıcı yeni oturum açar.
 */
export async function PATCH(req: Request) {
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const limiter = rateLimit(`change-password:${clientIpOf(req)}`, 5, 60_000)
    if (!limiter.ok) {
        return jsonError("Çok fazla deneme. Birazdan tekrar deneyin.", 429)
    }

    let body: { currentPassword?: string; newPassword?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }

    const currentPassword = body.currentPassword || ""
    const newPassword = body.newPassword || ""
    const policyError = validatePassword(newPassword)
    if (policyError) return jsonError(policyError, 400)

    const user = await db.user.findUnique({ where: { id: session.sub } })
    if (!user) return jsonError("Kullanıcı bulunamadı.", 404)
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
        return jsonError("Mevcut şifre doğrulanamadı.", 401)
    }
    if (currentPassword === newPassword) {
        return jsonError("Yeni şifre mevcut şifreyle aynı olamaz.", 400)
    }

    await db.user.update({
        where: { id: user.id },
        data: {
            passwordHash: await hashPassword(newPassword),
            // Eski oturumlar düşer: kullanıcı yeniden giriş yapmalı
            sessionsInvalidatedAt: new Date(),
        },
    })

    return Response.json({
        ok: true,
        message:
            "Şifreniz güncellendi. Güvenlik için tüm oturumlar kapatıldı; lütfen yeniden giriş yapın.",
    })
}

/**
 * DELETE /api/auth/account — { password }
 * KVKK m.11: hesabı ve tüm diyagramlarını kalıcı siler (ilişkili kayıtlar
 * şemadaki onDelete kurallarıyla temizlenir), oturum çerezini kapatır.
 */
export async function DELETE(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const limiter = rateLimit(`delete-account:${clientIpOf(req)}`, 3, 60_000)
    if (!limiter.ok) {
        return jsonError("Çok fazla deneme. Birazdan tekrar deneyin.", 429)
    }

    let body: { password?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }

    const user = await db.user.findUnique({ where: { id: session.sub } })
    if (!user) return jsonError("Kullanıcı bulunamadı.", 404)
    if (!(await verifyPassword(body.password || "", user.passwordHash))) {
        return jsonError("Şifre doğrulanamadı.", 401)
    }

    // Son yönetici hesabı silinemesin
    if (user.role === "ADMIN") {
        const admins = await db.user.count({ where: { role: "ADMIN" } })
        if (admins <= 1) {
            return jsonError(
                "Son yönetici hesabı silinemez. Önce başka bir yönetici atayın.",
                400,
            )
        }
    }

    await db.user.delete({ where: { id: user.id } })

    const res = NextResponse.json({
        ok: true,
        message: "Hesabınız ve tüm verileriniz kalıcı olarak silindi.",
    })
    res.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    })
    return res
}
