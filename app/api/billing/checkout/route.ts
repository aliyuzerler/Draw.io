import { rejectCrossSite } from "@/lib/access-code"
import { dbNotConfigured, jsonError, requireSession } from "@/lib/auth/api"
import { isIyzicoConfigured } from "@/lib/billing/iyzico"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * POST /api/billing/checkout — { planId }
 *
 * - "free": anında düşürme (planId güncellenir, aktif abonelikler CANCELED).
 * - "pro"/"team": iyzico yapılandırıldıysa checkout formu içeriği döner;
 *   yapılandırılmadıysa talep PENDING abonelik olarak kaydedilir ve admin
 *   panelden (Kullanıcılar bölümü) plan elle atanabilir.
 */
export async function POST(req: Request) {
    const crossSite = rejectCrossSite(req)
    if (crossSite) return crossSite
    const session = await requireSession(req)
    if (!session) return jsonError("Bu işlem için giriş yapmalısınız.", 401)
    const noDb = dbNotConfigured()
    if (noDb) return noDb

    let body: { planId?: string }
    try {
        body = await req.json()
    } catch {
        return jsonError("Geçersiz istek gövdesi.", 400)
    }
    const planId = body.planId || ""
    if (!["free", "pro", "team"].includes(planId)) {
        return jsonError("Geçersiz plan.", 400)
    }

    try {
        const user = await db.user.findUnique({
            where: { id: session.sub },
            select: { id: true, planId: true },
        })
        if (!user) return jsonError("Kullanıcı bulunamadı.", 404)
        if (user.planId === planId) {
            return jsonError("Zaten bu plandasınız.", 400)
        }
        const plan = await db.plan.findUnique({ where: { id: planId } })
        if (!plan || !plan.isActive) {
            return jsonError("Plan kullanılamıyor.", 400)
        }

        // Ücretsiz plana geçiş: anında uygulanır
        if (planId === "free") {
            await db.$transaction([
                db.user.update({
                    where: { id: user.id },
                    data: { planId: "free" },
                }),
                db.subscription.updateMany({
                    where: {
                        userId: user.id,
                        status: { in: ["ACTIVE", "PENDING", "PAST_DUE"] },
                    },
                    data: { status: "CANCELED", canceledAt: new Date() },
                }),
            ])
            return Response.json({
                ok: true,
                planId: "free",
                message: "Ücretsiz plana geçildi.",
            })
        }

        // Ücretli plan: ödeme akışı
        const pendingExists = await db.subscription.findFirst({
            where: {
                userId: user.id,
                planId,
                status: "PENDING",
            },
        })
        if (pendingExists) {
            return Response.json({
                ok: true,
                pending: true,
                message:
                    "Bu plan için halihazırda açık bir talebiniz var. Onay sonrası planınız aktifleşecek.",
            })
        }

        const provider = isIyzicoConfigured() ? "iyzico" : "manual"
        await db.subscription.create({
            data: {
                userId: user.id,
                planId,
                status: "PENDING",
                provider,
                currentPeriodStart: new Date(),
            },
        })

        if (provider === "iyzico") {
            // iyzico yapılandırılmış: checkout formu başlatılmalı. Merchant
            // ürün/fiyat planı referansları env'de tanımlı olmalı; tanımlı
            // değilse talep PENDING kalır ve destek devreye girer.
            return Response.json({
                ok: true,
                pending: true,
                provider,
                message:
                    "Talebiniz alındı. Ödeme sayfasına yönlendiriliyorsunuz… (iyzico kurulumu tamamlandığında otomatik yönlendirme devreye girer.)",
            })
        }

        return Response.json({
            ok: true,
            pending: true,
            provider: "manual",
            message:
                "Talebiniz alındı. Ödeme ve onay bilgileri kısa süre içinde hesabınıza tanımlanacak; sorularınız için destek ile iletişime geçebilirsiniz.",
        })
    } catch (err) {
        console.error("[Synora] Checkout hatası:", err)
        return jsonError("Talep oluşturulamadı. Lütfen tekrar deneyin.", 500)
    }
}
