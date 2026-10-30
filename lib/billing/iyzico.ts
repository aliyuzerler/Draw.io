/**
 * iyzico Abonelik entegrasyonu iskeleti (Faz 3).
 *
 * Bu modül, iyzico Abonelik API'si için ortak zemin sağlar. Canlıya almak
 * için iyzico merchant panelinde bir ÜRÜN + FİYAT PLANI tanımlayın ve
 * aşağıdaki env değişkenlerini doldurun:
 *
 *   IYZICO_API_KEY        — merchant paneli > Ayarlar > Güvenlik
 *   IYZICO_SECRET_KEY     — aynı yer
 *   IYZICO_BASE_URL       — üretim: https://api.iyzipay.com
 *                           sandbox: https://sandbox-api.iyzipay.com
 *   IYZICO_WEBHOOK_SECRET — panelde tanımladığınız webhook "iyziEventToken"
 *   IYZICO_PRODUCT_REFERENCE — abonelik başlatacak ürün referansı
 *   IYZICO_PLAN_REFERENCE_MAP — { "pro": "…", "team": "…" } JSON haritası
 *
 * Akış (rapordaki tasarım):
 *   1. Kullanıcı /{lang}/pricing'den plan seçer → POST /api/billing/checkout
 *   2. (iyzico yapılandırıldıysa) checkout formu başlatılır; kullanıcı
 *      iyzico sayfasında öder. Yapılandırılmadıysa talep "manual" olarak
 *      PENDING kaydedilir ve admin panelden plan elle atanır.
 *   3. iyzico webhook'u (/api/billing/iyzico/webhook) abonelik durumunu
 *      ACTIVE/PAST_DUE/CANCELED olarak senkronlar ve kullanıcının planını
 *      günceller.
 */

const AUTH_SEPARATOR = ":"

export function isIyzicoConfigured(): boolean {
    return !!(
        process.env.IYZICO_API_KEY &&
        process.env.IYZICO_SECRET_KEY &&
        process.env.IYZICO_BASE_URL
    )
}

/** iyzico istekleri için Authorization başlığı (base64 apiKey:random+timestamp) */
function authHeader(): string {
    const apiKey = process.env.IYZICO_API_KEY || ""
    const secret = process.env.IYZICO_SECRET_KEY || ""
    const randomString = `${Date.now()}${Math.random()
        .toString(36)
        .slice(2, 10)}`
    return `IYZWS ${Buffer.from(
        `${apiKey}${AUTH_SEPARATOR}${randomString}${AUTH_SEPARATOR}${secret}`,
    ).toString("base64")}`
}

export interface IyzicoResult<T = unknown> {
    ok: boolean
    status: number
    data: T | null
}

/** iyzico REST çağrısı — tüm endpoint'ler için ortak gövde */
export async function iyzicoRequest<T = unknown>(
    path: string,
    body: Record<string, unknown>,
    method: "POST" | "GET" | "PUT" | "DELETE" = "POST",
): Promise<IyzicoResult<T>> {
    const base = process.env.IYZICO_BASE_URL
    if (!base) return { ok: false, status: 500, data: null }
    try {
        const res = await fetch(`${base.replace(/\/$/, "")}${path}`, {
            method,
            headers: {
                Authorization: authHeader(),
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: method === "GET" ? undefined : JSON.stringify(body),
        })
        const data = (await res.json().catch(() => null)) as T | null
        return { ok: res.ok, status: res.status, data }
    } catch (err) {
        console.error("[Synora] iyzico isteği başarısız:", err)
        return { ok: false, status: 502, data: null }
    }
}

/**
 * Abonelik checkout formu başlatır. iyzico Abonelik API'sinde önce merchant
 * panelinden ürün/fiyat planı oluşturulur; burada yalnızca form başlatılır.
 * Dönen `checkoutPageContent` HTML'i kullanıcıya gösterilir (auto-submit form).
 */
export async function initSubscriptionCheckout(input: {
    subscriptionInitial: {
        locale?: string
        conversationId?: string
        callbackUrl: string
        customer: {
            name: string
            surname: string
            email: string
            gsmNumber?: string
        }
        productReference: string
        pricingPlanReference: string
    }
}): Promise<{ content: string; token: string } | null> {
    const result = await iyzicoRequest<{
        status: string
        checkoutPageContent?: string
        token?: string
        errorMessage?: string
    }>("/v2/subscription/checkout-form/initialize", input)
    if (
        result.ok &&
        result.data?.status === "success" &&
        result.data.checkoutPageContent
    ) {
        return {
            content: result.data.checkoutPageContent,
            token: result.data.token ?? "",
        }
    }
    console.error(
        "[Synora] iyzico checkout başlatılamadı:",
        result.status,
        result.data,
    )
    return null
}
