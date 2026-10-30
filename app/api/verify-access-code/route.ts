import { checkAccessCode, rejectCrossSite } from "@/lib/access-code"
import { clientIpOf, rateLimit } from "@/lib/auth/rate-limit"

/** POST /api/verify-access-code — erişim kodunu doğrular (hız sınırlı) */
export async function POST(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite

    // Brute-force oraclesını kapat: denemeler IP başına sınırlanır
    const limit = rateLimit(`access-code:${clientIpOf(req)}`, 10, 60_000)
    if (!limit.ok) {
        return Response.json(
            {
                valid: false,
                message: `Too many attempts. Try again in ${limit.retryAfterSec} seconds.`,
            },
            {
                status: 429,
                headers: { "Retry-After": String(limit.retryAfterSec) },
            },
        )
    }

    if (checkAccessCode(req)) {
        return Response.json(
            { valid: false, message: "Invalid or missing access code" },
            { status: 401 },
        )
    }

    return Response.json({ valid: true, message: "Access code is valid" })
}
