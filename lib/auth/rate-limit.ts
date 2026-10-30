/**
 * Basit bellek-içi hız sınırlama (tek örnek başına).
 * SaaS üretime geçişte çoklu örnek için paylaşımlı depoya (örn. Neon + Upstash)
 * taşınabilir; Faz 1 için yeterli.
 */

interface Bucket {
    count: number
    resetAt: number
}

const buckets = new Map<string, Bucket>()

function cleanup(now: number) {
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key)
    }
}

export function rateLimit(
    key: string,
    limit: number,
    windowMs: number,
): { ok: boolean; retryAfterSec: number } {
    const now = Date.now()
    if (buckets.size > 10000) cleanup(now)
    const bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs })
        return { ok: true, retryAfterSec: 0 }
    }
    bucket.count += 1
    if (bucket.count > limit) {
        return {
            ok: false,
            retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
        }
    }
    return { ok: true, retryAfterSec: 0 }
}

/** İsteğin istemci IP'si (lib/user-id.ts ile aynı öncelik sırası) */
export function clientIpOf(req: Request): string {
    const ipHeader = process.env.CLIENT_IP_HEADER
    return (
        (ipHeader
            ? req.headers.get(ipHeader)?.trim()
            : req.headers.get("x-forwarded-for")?.split(",")[0].trim()) ||
        "unknown"
    )
}
