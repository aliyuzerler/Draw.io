import { dbNotConfigured, jsonError, requireAdmin } from "@/lib/auth/api"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** GET /api/admin/users — kullanıcı listesi (yönetici) */
export async function GET(req: Request) {
    const denied = await requireAdmin(req)
    if (denied) return denied
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const users = await db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            planId: true,
            status: true,
            createdAt: true,
            lastLoginAt: true,
            _count: { select: { diagrams: true } },
        },
    })
    return Response.json({
        users: users.map(({ _count, ...u }) => ({
            ...u,
            diagramCount: _count.diagrams,
        })),
    })
}

/** PATCH /api/admin/users — { id, role?, status?, planId? } (yönetici) */
export async function PATCH(req: Request) {
    const denied = await requireAdmin(req)
    if (denied) return denied
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    let body: { id?: string; role?: string; status?: string; planId?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }
    const { id, role, status, planId } = body
    if (!id) return jsonError("Kullanıcı kimliği (id) zorunludur.", 400)
    if (role && !["USER", "ADMIN"].includes(role))
        return jsonError("Geçersiz rol.", 400)
    if (status && !["ACTIVE", "SUSPENDED"].includes(status))
        return jsonError("Geçersiz durum.", 400)

    const caller = await requireAdminCaller(req)
    if (caller && caller.sub === id) {
        // Yönetici kendini kilitlemesin
        if ((role && role !== "ADMIN") || (status && status !== "ACTIVE")) {
            return jsonError(
                "Kendi hesabınızın yönetici yetkisini veya durumunu değiştiremezsiniz.",
                400,
            )
        }
    }

    try {
        const user = await db.user.update({
            where: { id },
            data: {
                ...(role ? { role } : {}),
                ...(status ? { status } : {}),
                ...(planId ? { planId } : {}),
            },
            select: { id: true, role: true, status: true, planId: true },
        })
        return Response.json({ user })
    } catch {
        return jsonError("Kullanıcı bulunamadı.", 404)
    }
}

/** DELETE /api/admin/users?id=... (yönetici) */
export async function DELETE(req: Request) {
    const denied = await requireAdmin(req)
    if (denied) return denied
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    const id = new URL(req.url).searchParams.get("id")
    if (!id) return jsonError("Kullanıcı kimliği (id) zorunludur.", 400)

    const caller = await requireAdminCaller(req)
    if (caller && caller.sub === id) {
        return jsonError("Kendi hesabınızı silemezsiniz.", 400)
    }

    try {
        await db.user.delete({ where: { id } })
        return Response.json({ ok: true })
    } catch {
        return jsonError("Kullanıcı bulunamadı.", 404)
    }
}

/** Çağıranın oturumunu döner (yalnızca ADMIN ise); şifre akışında null */
async function requireAdminCaller(req: Request) {
    const { getSessionFromRequest } = await import("@/lib/auth/session")
    const session = await getSessionFromRequest(req)
    return session?.role === "ADMIN" ? session : null
}
