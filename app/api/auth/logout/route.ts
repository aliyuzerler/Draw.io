import { NextResponse } from "next/server"

import { rejectCrossSite } from "@/lib/access-code"
import { SESSION_COOKIE } from "@/lib/auth/session"

/** POST /api/auth/logout — oturum çerezini temizler (cross-site istek reddi) */
export async function POST(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite
    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    })
    return res
}
