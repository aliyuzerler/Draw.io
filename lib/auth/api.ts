import { checkAdminAuth } from "@/lib/admin/auth"

import { db } from "@/lib/db"

import { getSessionFromRequest, type SessionPayload } from "./session"
import { getSessionFromRequestVerified } from "./session-server"

/** Tutarlı JSON hata yanıtı */
export function jsonError(
    message: string,
    status: number,
    extra?: Record<string, unknown>,
): Response {
    return Response.json({ error: message, ...extra }, { status })
}

/** Veritabanı yapılandırılmamışsa 503 yanıtı, aksi halde null */
export function dbNotConfigured(): Response | null {
    if (process.env.DATABASE_URL) return null
    return jsonError(
        "Veritabanı yapılandırılmadı. Lütfen DATABASE_URL değişkenini ayarlayın.",
        503,
    )
}

/** Oturum varsa döner; yoksa null (rota 401 döndürür) */
export async function requireSession(
    req: Request,
): Promise<SessionPayload | null> {
    return getSessionFromRequest(req)
}

/**
 * Yönetici yetkisi: geçerli ADMIN oturumu (JWT çerezi) VEYA eski usül
 * x-admin-password başlığı (mevcut admin paneliyle geriye dönük uyumluluk).
 * Yetkisizse gönderilecek yanıtı, yetkiliyse null döndürür.
 */
export async function requireAdmin(req: Request): Promise<Response | null> {
    // Doğrulanmış oturum: JWT imzası + sessionsInvalidatedAt denetimi
    const session = await getSessionFromRequestVerified(req)
    if (session?.role === "ADMIN") {
        // JWT'deki rol bayatlamış olabilir; DB'de güncel rol/durumu doğrula
        if (!process.env.DATABASE_URL) return null
        try {
            const user = await db.user.findUnique({
                where: { id: session.sub },
                select: { role: true, status: true },
            })
            if (user?.role === "ADMIN" && user?.status === "ACTIVE") return null
            return jsonError("Bu işlem için yönetici yetkisi gerekir.", 401)
        } catch {
            // DB hatasında oturum yoluyla yetki verme; şifre akışına düş
        }
    }
    // Şifre akışı: checkAdminAuth'ın yanını (401/403/429) olduğu gibi
    // dön — 429 hız sınırı yanıtı ezilmesin
    return await checkAdminAuth(req)
}
