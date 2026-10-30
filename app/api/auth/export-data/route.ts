import { dbNotConfigured, jsonError, requireSession } from "@/lib/auth/api"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/auth/export-data — KVKK m.11 veri taşınabilirliği:
 * hesabın tüm verilerini JSON dosyası olarak indirir.
 */
export async function GET(req: Request) {
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const user = await db.user.findUnique({
        where: { id: session.sub },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            planId: true,
            status: true,
            createdAt: true,
            lastLoginAt: true,
            diagrams: {
                select: {
                    id: true,
                    title: true,
                    xml: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: "desc" },
            },
            usageEvents: {
                select: {
                    kind: true,
                    model: true,
                    promptTokens: true,
                    completionTokens: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                take: 1000,
            },
            subscriptions: {
                select: {
                    planId: true,
                    status: true,
                    provider: true,
                    createdAt: true,
                    currentPeriodEnd: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    })
    if (!user) return jsonError("Kullanıcı bulunamadı.", 404)

    const payload = {
        exportedAt: new Date().toISOString(),
        service: "Synora",
        account: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            plan: user.planId,
            status: user.status,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        },
        diagrams: user.diagrams,
        usageEvents: user.usageEvents,
        subscriptions: user.subscriptions,
    }

    return new Response(JSON.stringify(payload, null, 2), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="synora-verilerim-${new Date()
                .toISOString()
                .slice(0, 10)}.json"`,
        },
    })
}
