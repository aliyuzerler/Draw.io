import { createHash, randomBytes } from "crypto"
import { rejectCrossSite } from "@/lib/access-code"
import { dbNotConfigured, jsonError } from "@/lib/auth/api"
import { passwordResetEmailHtml, sendMail } from "@/lib/auth/mailer"
import { isValidEmail } from "@/lib/auth/password"
import { clientIpOf, rateLimit } from "@/lib/auth/rate-limit"
import { db } from "@/lib/db"

/**
 * POST /api/auth/forgot-password
 * Her yanıtta aynı genel mesaj döner (hesap sayımına karşı). Kullanıcı varsa
 * tek kullanımlık, 1 saatlik token üretilir; e-posta gönderilir. E-posta
 * sağlayıcısı yoksa bağlantı sunucu günlüğüne yazılır; geliştirme ortamında
 * (veya DEMO_RESET_LINK=1 ile) yanıt içinde de döner.
 */
export async function POST(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite

    const limiter = rateLimit(`forgot:${clientIpOf(req)}`, 5, 60_000)
    if (!limiter.ok) {
        return jsonError(
            `Çok fazla deneme. ${limiter.retryAfterSec} saniye sonra tekrar deneyin.`,
            429,
        )
    }

    const noDb = dbNotConfigured()
    if (noDb) return noDb

    let body: { email?: string; lang?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }

    const email = (body.email || "").trim().toLowerCase()
    const lang = body.lang === "en" ? "en" : "tr"
    const genericMessage =
        lang === "en"
            ? "If this email is registered, a password reset link has been sent."
            : "Bu e-posta adresi kayıtlıysa şifre sıfırlama bağlantısı gönderildi."

    if (!isValidEmail(email)) {
        return Response.json({ message: genericMessage })
    }

    let resetUrl: string | undefined
    try {
        const user = await db.user.findUnique({ where: { email } })
        if (user && user.status === "ACTIVE") {
            // Kullanıcının eski kullanılmamış tokenlarını temizle
            await db.passwordResetToken.deleteMany({
                where: { userId: user.id },
            })

            const token = randomBytes(32).toString("hex")
            const tokenHash = createHash("sha256").update(token).digest("hex")
            await db.passwordResetToken.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                },
            })

            // Origin: üretimde yalnızca güvenilir, ortamdan gelen adres.
            // req.url origin'i Host başlığından türetilir; saldırganın Host
            // değeri e-postadaki bağlantıyı kendi alanına çevirebilir (Host
            // header poisoning). Bu yüzden üretimde NEXT_PUBLIC_SITE_URL
            // zorunludur.
            let origin: string | undefined
            if (process.env.NEXT_PUBLIC_SITE_URL) {
                origin = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
            } else if (process.env.NODE_ENV !== "production") {
                origin = new URL(req.url).origin.replace(/\/$/, "")
            }
            if (origin) {
                resetUrl = `${origin}/${lang}/reset-password?token=${token}`
            } else {
                console.error(
                    "[Synora] Şifre sıfırlama: NEXT_PUBLIC_SITE_URL tanımlı değil; bağlantı üretilemedi. Üretimde bu değişkeni ayarlayın.",
                )
            }

            if (resetUrl) {
                const mail = await sendMail(
                    email,
                    "Synora — Şifre sıfırlama bağlantınız",
                    passwordResetEmailHtml(resetUrl),
                )
                if (!mail.sent) {
                    // Token içermez: bağlantı yalnızca talep sahibinin
                    // e-postasına gider, günlüğe yazmak sızdırıdır
                    console.log(
                        `[Synora] E-posta sağlayıcısı yok. ${email} için sıfırlama bağlantısı üretildi (gönderilemedi).`,
                    )
                }
            }
        }
    } catch (err) {
        console.error("[Synora] Şifre sıfırlama talebi hatası:", err)
        // Genel mesajı bozma
    }

    const res: Record<string, unknown> = { message: genericMessage }
    const demoAllowed =
        process.env.NODE_ENV !== "production" ||
        process.env.DEMO_RESET_LINK === "1"
    if (resetUrl && demoAllowed) {
        res.resetUrl = resetUrl
        res.demo = true
    }
    return Response.json(res)
}
