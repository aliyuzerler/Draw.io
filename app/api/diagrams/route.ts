import { rejectCrossSite } from "@/lib/access-code"
import { dbNotConfigured, jsonError, requireSession } from "@/lib/auth/api"
import { clientIpOf, rateLimit } from "@/lib/auth/rate-limit"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** GET /api/diagrams — oturum sahibinin diyagram listesi (xml hariç) */
export async function GET(req: Request) {
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const diagrams = await db.diagram.findMany({
        where: { userId: session.sub },
        orderBy: { updatedAt: "desc" },
        take: 200,
        select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
        },
    })
    return Response.json({ diagrams })
}

/** POST /api/diagrams — { title?, xml } yeni kayıt (plan sınırına tabi) */
export async function POST(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const limiter = rateLimit(`diagrams:${clientIpOf(req)}`, 60, 60_000)
    if (!limiter.ok) {
        return jsonError("Çok fazla istek. Birazdan tekrar deneyin.", 429)
    }

    let body: { title?: string; xml?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }
    const xml = body.xml || ""
    if (!xml || xml.length > 5_000_000) {
        return jsonError("Diyagram içeriği boş veya çok büyük.", 400)
    }
    if (typeof body.title !== "undefined" && typeof body.title !== "string") {
        return jsonError("Geçersiz başlık.", 400)
    }
    const title = (body.title || "").trim().slice(0, 120) || "İsimsiz Diyagram"

    try {
        // Plan aramasını kullanıcı sorgusuyla birleştir (tek gidiş-dönüş)
        const user = await db.user.findUnique({
            where: { id: session.sub },
            select: {
                plan: { select: { id: true, name: true, maxDiagrams: true } },
            },
        })
        const plan = user?.plan ?? null
        if (plan && plan.maxDiagrams >= 0) {
            const count = await db.diagram.count({
                where: { userId: session.sub },
            })
            if (count >= plan.maxDiagrams) {
                return jsonError(
                    `${plan.name} planında en fazla ${plan.maxDiagrams} diyagram kaydedebilirsiniz. Bir diyagram silin veya planınızı yükseltin.`,
                    403,
                    {
                        type: "diagram_limit",
                        used: count,
                        limit: plan.maxDiagrams,
                    },
                )
            }
        }

        const diagram = await db.diagram.create({
            data: { userId: session.sub, title, xml },
            select: { id: true, title: true, createdAt: true, updatedAt: true },
        })
        return Response.json({ diagram }, { status: 201 })
    } catch (err) {
        console.error("[Synora] Diyagram kaydı hatası:", err)
        return jsonError("Diyagram kaydedilemedi. Lütfen tekrar deneyin.", 500)
    }
}
