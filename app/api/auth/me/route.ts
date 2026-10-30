import { getSessionFromRequest } from "@/lib/auth/session"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** GET /api/auth/me — oturum sahibinin güncel hesap bilgisi */
export async function GET(req: Request) {
    const session = await getSessionFromRequest(req)
    if (!session) return Response.json({ user: null })

    // Rol/plan JWT'de bayatlamış olabilir; veritabanı varsa güncelini döndür.
    try {
        if (process.env.DATABASE_URL) {
            const user = await db.user.findUnique({
                where: { id: session.sub },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    planId: true,
                    status: true,
                },
            })
            if (!user || user.status === "SUSPENDED") {
                return Response.json({ user: null })
            }
            return Response.json({ user })
        }
    } catch {
        // DB erişilemezse JWT bilgisiyle devam
    }
    return Response.json({
        user: {
            id: session.sub,
            email: session.email,
            name: session.name,
            role: session.role,
            planId: "free",
            status: "ACTIVE",
        },
    })
}
