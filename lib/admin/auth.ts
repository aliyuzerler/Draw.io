import { timingSafeEqual } from "crypto"

import { clientIpOf, rateLimit } from "@/lib/auth/rate-limit"
import { getSessionFromRequestVerified } from "@/lib/auth/session-server"

// Shared auth for admin API routes. Accepts either a valid Synora session
// cookie with the ADMIN role, or the x-admin-password header against the
// ADMIN_PASSWORD env var (legacy panel login). Unset password and no admin
// session = panel disabled.
//
// Hardening (güvenlik denetimi):
// - JWT'deki rol/durum bayatlayabilir (30 gün ömürlü). Oturum yolu, DB
//   erişimi mümkünse her istekte kullanıcının GÜNCEL rol ve durumunu
//   doğrular; askıya alınan veya rolü düşürülen yönetici anında kesilir.
// - Şifre akışı IP başına hız sınırına tabidir (5 hatalı deneme / 5 dk).

const SESSION_FAILURE_LIMIT = 5
const SESSION_FAILURE_WINDOW_MS = 5 * 60 * 1000

async function isSessionAdmin(req: Request): Promise<boolean> {
    try {
        const session = await getSessionFromRequestVerified(req)
        if (!session || session.role !== "ADMIN") return false
        // DB yapılandırılmamışsa (eski self-host kurulumları) JWT'ye güven
        if (!process.env.DATABASE_URL) return true
        const { db } = await import("@/lib/db")
        const user = await db.user.findUnique({
            where: { id: session.sub },
            select: { role: true, status: true },
        })
        // Kullanıcı silinmiş, rolü düşürülmüş veya askıya alınmışsa reddet
        return user?.role === "ADMIN" && user?.status === "ACTIVE"
    } catch {
        // Oturum/DB okunamadıysa oturum yoluyla yetki verme
        return false
    }
}

export async function checkAdminAuth(req: Request): Promise<Response | null> {
    // 1) Synora oturumu (çerez) — rolü ve durumu güncel ADMIN olanlar geçer
    if (await isSessionAdmin(req)) return null

    // 2) Klasik panel şifresi (hız sınırlı)
    const password = process.env.ADMIN_PASSWORD
    if (!password) {
        return Response.json(
            {
                error: "Admin panel is disabled. Set the ADMIN_PASSWORD environment variable or sign in as an admin user.",
            },
            { status: 403 },
        )
    }
    const provided = req.headers.get("x-admin-password") || ""
    const a = Buffer.from(provided)
    const b = Buffer.from(password)
    const matches =
        a.length === b.length && timingSafeEqual(a, b) && provided.length > 0
    if (!matches) {
        // Brute-force koruması: hatalı denemeler IP başına sayılır
        const fail = rateLimit(
            `admin-pw:${clientIpOf(req)}`,
            SESSION_FAILURE_LIMIT,
            SESSION_FAILURE_WINDOW_MS,
        )
        if (!fail.ok) {
            return Response.json(
                { error: "Too many failed attempts. Try again later." },
                {
                    status: 429,
                    headers: { "Retry-After": String(fail.retryAfterSec) },
                },
            )
        }
        return Response.json(
            { error: "Invalid admin password" },
            { status: 401 },
        )
    }
    return null
}

export interface MaskedSecret {
    isSet: true
    hint: string
}

export function maskSecret(value: string): MaskedSecret {
    return {
        isSet: true,
        hint: value.length > 8 ? `…${value.slice(-4)}` : "••••",
    }
}
