import { createHash, timingSafeEqual } from "crypto"

import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

interface IyzicoWebhookBody {
    iyziEventToken?: string
    iyziSubscriptionReference?: string
    status?: string // SUBSCRIPTION_ACTIVE, SUBSCRIPTION_CANCELED, ...
    /** iyzico bazı olay yüklerinde olay zamanını unix ms olarak taşır */
    timestamp?: number | string
    date?: number | string
}

// Aynı olay tekrar gönderildiğinde ikinci işleme düşmesin (replay koruması).
// Bellek-içi pencere yeterli: iyzico yeniden denemeleri dakikalar içindedir.
const seenEvents = new Map<string, number>()
const REPLAY_WINDOW_MS = 10 * 60 * 1000
const MAX_TIMESTAMP_SKEW_MS = 10 * 60 * 1000

function pruneSeen(now: number) {
    for (const [key, at] of seenEvents) {
        if (now - at > REPLAY_WINDOW_MS) seenEvents.delete(key)
    }
}

/** Sabit zamanlı karşılaştırma (zamanlama saldırısına kapalı) */
function safeEqual(a: string, b: string): boolean {
    const ba = Buffer.from(a)
    const bb = Buffer.from(b)
    if (ba.length !== bb.length) {
        // Uzun farkı da sabit maliyetle maskele
        timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32))
        return false
    }
    return timingSafeEqual(ba, bb)
}

/**
 * POST /api/billing/iyzico/webhook
 * iyzico Abonelik olaylarını alır: IYZICO_WEBHOOK_SECRET (iyziEventToken)
 * sabit zamanlı karşılaştırma ile doğrulanır, olay imzası (sha256) replay
 * penceresiyle tekilleştirilir ve abonelik referansı ile eşleşen kayıt
 * senkronlanır.
 *
 * Panelde webhook adresi: https://<siteniz>/api/billing/iyzico/webhook
 */
export async function POST(req: Request) {
    const secret = process.env.IYZICO_WEBHOOK_SECRET
    if (!secret) {
        return Response.json(
            { error: "Webhook yapılandırılmadı." },
            { status: 503 },
        )
    }

    let body: IyzicoWebhookBody
    try {
        body = await req.json()
    } catch {
        return Response.json({ error: "Geçersiz gövde." }, { status: 400 })
    }

    if (!body.iyziEventToken || !safeEqual(body.iyziEventToken, secret)) {
        return Response.json({ error: "Yetkisiz." }, { status: 401 })
    }

    // Timestamp doğrulaması (mevcutsa): pencere dışındaki olaylar reddedilir
    const rawTs = body.timestamp ?? body.date
    if (rawTs !== undefined) {
        const ts = Number(rawTs)
        if (Number.isFinite(ts)) {
            // saniye/ms normalizasyonu
            const ms = ts < 10_000_000_000 ? ts * 1000 : ts
            if (Math.abs(Date.now() - ms) > MAX_TIMESTAMP_SKEW_MS) {
                return Response.json(
                    { error: "Eskimiş olay." },
                    { status: 401 },
                )
            }
        }
    }

    const ref = body.iyziSubscriptionReference
    if (!ref) {
        return Response.json(
            { error: "Abonelik referansı yok." },
            { status: 400 },
        )
    }

    // Replay koruması: aynı olay (token + referans + durum) pencere içinde
    // ikinci kez gelirse yoksay
    const now = Date.now()
    if (seenEvents.size > 5000) pruneSeen(now)
    const eventKey = createHash("sha256")
        .update(`${body.iyziEventToken}|${ref}|${body.status ?? ""}`)
        .digest("hex")
    if (seenEvents.has(eventKey)) {
        return Response.json({ ok: true, duplicate: true })
    }
    seenEvents.set(eventKey, now)

    try {
        const subscription = await db.subscription.findFirst({
            where: { providerRef: ref, provider: "iyzico" },
            include: { user: { select: { id: true } }, plan: true },
        })
        if (!subscription) {
            // Bilinmeyen referans: 200 dön (iyzico yeniden denemesin)
            return Response.json({ ok: true, matched: false })
        }

        const event = body.status || ""
        if (event.includes("ACTIVE") || event.includes("APPROVED")) {
            await db.$transaction([
                db.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: "ACTIVE",
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(Date.now() + 30 * 86400_000),
                    },
                }),
                db.user.update({
                    where: { id: subscription.userId },
                    data: { planId: subscription.planId },
                }),
            ])
        } else if (event.includes("PAST_DUE") || event.includes("FAILED")) {
            await db.subscription.update({
                where: { id: subscription.id },
                data: { status: "PAST_DUE" },
            })
        } else if (event.includes("CANCELED") || event.includes("EXPIRED")) {
            await db.$transaction([
                db.subscription.update({
                    where: { id: subscription.id },
                    data: { status: "CANCELED", canceledAt: new Date() },
                }),
                // Kullanıcı ücretsiz plana döner (hizmet dönemine göre
                // özelleştirilebilir; rapordaki tasarımda sade kural)
                db.user.update({
                    where: { id: subscription.userId },
                    data: { planId: "free" },
                }),
            ])
        }
        return Response.json({ ok: true, matched: true })
    } catch (err) {
        console.error("[Synora] iyzico webhook hatası:", err)
        return Response.json({ error: "İşlenemedi." }, { status: 500 })
    }
}
