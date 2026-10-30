/**
 * Fiyatlandırma sayfasının sabit metinleri. Ana dil Türkçe; diğer diller
 * İngilizce yedeğe düşer (authTexts ile aynı politika — SaaS pazarı
 * öncelikle Türkiye). Plan adları ve özellik listeleri veritabanından
 * gelir ve Türkçedir.
 */

interface PricingTexts {
    title: string
    lede: string
    popular: string
    perMonth: string
    currentPlan: string
    startFree: string
    backToFree: string
    upgrade: string
    choose: string
    note: string
}

const TR: PricingTexts = {
    title: "Sizin için doğru plan",
    lede: "Synora ile AI'ı gerçek draw.io tuvalinde kullanın. Ücretsiz başlayın; ihtiyacınız büyüdüğünde yükseltin. Tüm planlar Türkçe desteklidir, dilediğiniz an iptal edebilirsiniz.",
    popular: "En popüler",
    perMonth: "/ay",
    currentPlan: "Mevcut planınız",
    startFree: "Ücretsiz başla",
    backToFree: "Ücretsiz plana dön",
    upgrade: "Yükselt",
    choose: "Bu planı seç",
    note: "Ödemeler iyzico altyapısı ile 3D Secure üzerinden alınır. Faturalar e-posta ile iletilir. Plan değişiklikleri bir sonraki dönemde işler. Kurumsal ihtiyaçlar için satış ile iletişime geçin.",
}

const EN: PricingTexts = {
    title: "The right plan for you",
    lede: "Use AI on a real draw.io canvas with Synora. Start for free and upgrade as your needs grow. Cancel anytime.",
    popular: "Most popular",
    perMonth: "/mo",
    currentPlan: "Your current plan",
    startFree: "Start for free",
    backToFree: "Back to the free plan",
    upgrade: "Upgrade",
    choose: "Choose this plan",
    note: "Payments are processed through iyzico with 3D Secure. Invoices are delivered by e-mail. Plan changes apply from the next period. Contact sales for enterprise needs.",
}

export function pricingText(lang: string): PricingTexts {
    return lang === "tr" ? TR : EN
}
