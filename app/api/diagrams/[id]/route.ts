import { rejectCrossSite } from "@/lib/access-code"
import { dbNotConfigured, jsonError, requireSession } from "@/lib/auth/api"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Yalnızca kendi diyagramını getirir; yoksa null */
async function ownDiagram(id: string, userId: string) {
    return db.diagram.findFirst({ where: { id, userId } })
}

/** GET /api/diagrams/[id] — diyagramın tamamı (xml dahil) */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const { id } = await params
    try {
        const diagram = await ownDiagram(id, session.sub)
        if (!diagram) return jsonError("Diyagram bulunamadı.", 404)
        return Response.json({
            diagram: {
                id: diagram.id,
                title: diagram.title,
                xml: diagram.xml,
                createdAt: diagram.createdAt,
                updatedAt: diagram.updatedAt,
            },
        })
    } catch {
        return jsonError("Diyagram alınamadı.", 500)
    }
}

/** PATCH /api/diagrams/[id] — { title?, xml? } güncelleme */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const { id } = await params
    let body: { title?: string; xml?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }
    if (body.xml !== undefined && (!body.xml || body.xml.length > 5_000_000)) {
        return jsonError("Diyagram içeriği boş veya çok büyük.", 400)
    }
    if (
        body.title !== undefined &&
        (typeof body.title !== "string" || body.title.trim().length === 0)
    ) {
        return jsonError("Geçersiz başlık.", 400)
    }

    try {
        // updateMany sahiplik koşuluyla tek gidiş-dönüş: yarış güvenli ve
        // başkasının diyagramına dokunamaz
        const result = await db.diagram.updateMany({
            where: { id, userId: session.sub },
            data: {
                ...(body.title !== undefined
                    ? {
                          title:
                              body.title.trim().slice(0, 120) ||
                              "İsimsiz Diyagram",
                      }
                    : {}),
                ...(body.xml !== undefined ? { xml: body.xml } : {}),
            },
        })
        if (result.count === 0) return jsonError("Diyagram bulunamadı.", 404)
        const diagram = await db.diagram.findUnique({
            where: { id },
            select: { id: true, title: true, updatedAt: true },
        })
        return Response.json({ diagram })
    } catch (err) {
        console.error("[Synora] Diyagram güncelleme hatası:", err)
        return jsonError("Diyagram güncellenemedi.", 500)
    }
}

/** DELETE /api/diagrams/[id] */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const { id } = await params
    try {
        // deleteMany sahiplik koşuluyla tek gidiş-dönüş
        const result = await db.diagram.deleteMany({
            where: { id, userId: session.sub },
        })
        if (result.count === 0) return jsonError("Diyagram bulunamadı.", 404)
        return Response.json({ ok: true })
    } catch (err) {
        console.error("[Synora] Diyagram silme hatası:", err)
        return jsonError("Diyagram silinemedi.", 500)
    }
}
