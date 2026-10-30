import { jwtVerify, SignJWT } from "jose"

/**
 * Synora oturumu: httpOnly çerezde taşınan imzalı JWT (HS256, 30 gün).
 * Bu dosya bilinçli olarak yalnızca edge-uyumlu bağımlılıklar (jose) kullanır:
 * proxy.ts (edge runtime) da buradan import eder.
 */

export const SESSION_COOKIE = "synora_session"

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 gün

export interface SessionPayload {
    sub: string
    email: string
    name: string | null
    role: string
    /** Tokenın verildiği zaman (unix sn) — oturum invalidasyonu için */
    iat?: number
}

function secretKey(): Uint8Array {
    const secret = process.env.AUTH_SECRET
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error(
                "AUTH_SECRET zorunlu: üretimde rastgele bir gizli anahtar tanımlayın.",
            )
        }
        return new TextEncoder().encode("synora-dev-secret-do-not-use-in-prod")
    }
    return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload): Promise<string> {
    return await new SignJWT({
        email: payload.email,
        name: payload.name,
        role: payload.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(payload.sub)
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(secretKey())
}

export async function verifySessionToken(
    token: string,
): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secretKey(), {
            algorithms: ["HS256"],
        })
        if (!payload.sub) return null
        return {
            sub: payload.sub,
            email: typeof payload.email === "string" ? payload.email : "",
            name:
                typeof payload.name === "string" && payload.name.length > 0
                    ? payload.name
                    : null,
            role: typeof payload.role === "string" ? payload.role : "USER",
            iat: typeof payload.iat === "number" ? payload.iat : undefined,
        }
    } catch {
        return null
    }
}

/** Çerez başlığından tek bir çerezin değerini bulur */
export function parseCookieValue(header: string, name: string): string | null {
    for (const part of header.split(";")) {
        const idx = part.indexOf("=")
        if (idx === -1) continue
        if (part.slice(0, idx).trim() === name) {
            try {
                return decodeURIComponent(part.slice(idx + 1).trim())
            } catch {
                return part.slice(idx + 1).trim()
            }
        }
    }
    return null
}

/** Route handler'larda oturumu okur (plain Request ile) */
export async function getSessionFromRequest(
    req: Request,
): Promise<SessionPayload | null> {
    const token = parseCookieValue(
        req.headers.get("cookie") || "",
        SESSION_COOKIE,
    )
    if (!token) return null
    return verifySessionToken(token)
}

/** NextResponse.cookies.set için paylaşılan seçenekler */
export function sessionCookieOptions() {
    return {
        httpOnly: true,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    }
}
