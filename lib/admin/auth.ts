import { timingSafeEqual } from "crypto"

import { getSessionFromRequest } from "@/lib/auth/session"

// Shared auth for admin API routes. Accepts either a valid Synora session
// cookie with the ADMIN role, or the x-admin-password header against the
// ADMIN_PASSWORD env var (legacy panel login). Unset password and no admin
// session = panel disabled.
export async function checkAdminAuth(req: Request): Promise<Response | null> {
    // 1) Synora oturumu (çerez) — rolü ADMIN olanlar geçer
    try {
        const session = await getSessionFromRequest(req)
        if (session?.role === "ADMIN") return null
    } catch {
        // Oturum okunamadıysa şifre akışıyla devam
    }
    // 2) Klasik panel şifresi
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
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
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
