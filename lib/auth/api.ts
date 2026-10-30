import { checkAdminAuth } from "@/lib/admin/auth"

import { getSessionFromRequest, type SessionPayload } from "./session"

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
    const session = await getSessionFromRequest(req)
    if (session?.role === "ADMIN") return null
    const passwordResponse = checkAdminAuth(req)
    if (!passwordResponse) return null
    return jsonError("Bu işlem için yönetici yetkisi gerekir.", 401)
}
