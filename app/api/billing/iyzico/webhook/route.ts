import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

interface IyzicoWebhookBody {
    iyziEventToken?: string
    iyziSubscriptionReference?: string
    status?: string // SUBSCRIPTION_ACTIVE, SUBSCRIPTION_CANCELED, ...
}

/**
 * POST /api/billing/iyzico/webhook
 * iyzico Abonelik olaylarını alır: IYZICO_WEBHOOK_SECRET (iyziEventToken)
 * doğrulanır, abonelik referansı ile eşleşen kayıt senkronlanır ve
 * kullanıcının planı güncellenir.
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

    if (!body.iyziEventToken || body.iyziEventToken !== secret) {
        return Response.json({ error: "Yetkisiz." }, { status: 401 })
    }
    const ref = body.iyziSubscriptionReference
    if (!ref) {
        return Response.json(
            { error: "Abonelik referansı yok." },
            { status: 400 },
        )
    }

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
