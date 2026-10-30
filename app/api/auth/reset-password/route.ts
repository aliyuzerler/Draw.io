import { createHash } from "crypto"
import { rejectCrossSite } from "@/lib/access-code"
import { dbNotConfigured, jsonError } from "@/lib/auth/api"
import { hashPassword, validatePassword } from "@/lib/auth/password"
import { clientIpOf, rateLimit } from "@/lib/auth/rate-limit"
import { db } from "@/lib/db"

/**
 * POST /api/auth/reset-password — { token, password }
 * Token sha256 özetiyle eşleştirilir, süresi ve kullanım durumu denetlenir;
 * şifre güncellenir ve tüm sıfırlama tokenları geçersiz kılınır.
 */
export async function POST(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite

    const limiter = rateLimit(`reset:${clientIpOf(req)}`, 10, 60_000)
    if (!limiter.ok) {
        return jsonError(
            `Çok fazla deneme. ${limiter.retryAfterSec} saniye sonra tekrar deneyin.`,
            429,
        )
    }

    const noDb = dbNotConfigured()
    if (noDb) return noDb

    let body: { token?: string; password?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }

    const token = (body.token || "").trim()
    const password = body.password || ""
    if (!token) return jsonError("Sıfırlama bağlantısı geçersiz.", 400)
    const passwordError = validatePassword(password)
    if (passwordError) return jsonError(passwordError, 400)

    try {
        const tokenHash = createHash("sha256").update(token).digest("hex")
        const record = await db.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        })
        if (!record || record.usedAt || record.expiresAt < new Date()) {
            return jsonError(
                "Sıfırlama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı talep edin.",
                400,
            )
        }

        await db.$transaction([
            db.user.update({
                where: { id: record.userId },
                data: {
                    passwordHash: await hashPassword(password),
                    // Şifre değişti: eski oturumlar (çalınmış çerez dahi)
                    // düşsün
                    sessionsInvalidatedAt: new Date(),
                },
            }),
            db.passwordResetToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
        ])

        return Response.json({
            message:
                "Şifreniz güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.",
        })
    } catch (err) {
        console.error("[Synora] Şifre sıfırlama hatası:", err)
        return jsonError("Şifre sıfırlanamadı. Lütfen tekrar deneyin.", 500)
    }
}
