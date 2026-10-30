import { db } from "@/lib/db"

/**
 * Plan kataloğu — rapordaki Freemium yapısı (Faz 1 tohum verisi).
 * Yalnızca eksik kayıtları oluşturur; admin panelinden yapılan düzenlemeleri
 * her soğuk başlangıçta ezmez (update: {}).
 */

interface PlanSeed {
    id: string
    name: string
    description: string
    priceMonthly: number
    dailyRequestLimit: number
    monthlyRequestLimit: number
    dailyTokenLimit: number
    maxDiagrams: number
    sortOrder: number
    features: string[]
}

export const PLAN_SEEDS: PlanSeed[] = [
    {
        id: "free",
        name: "Ücretsiz",
        description: "Synora'yı denemek için ideal başlangıç.",
        priceMonthly: 0,
        dailyRequestLimit: 10,
        monthlyRequestLimit: 100,
        dailyTokenLimit: 200000,
        maxDiagrams: 5,
        sortOrder: 0,
        features: [
            "Ayda 100 AI diyagramı",
            "Günde 10 AI isteği",
            "5 kayıtlı diyagram",
            "Temel akış şeması ve UML şablonları",
            "Topluluk desteği",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        description: "Profesyoneller ve yoğun kullanıcılar için.",
        priceMonthly: 14900, // 149 TL
        dailyRequestLimit: 500,
        monthlyRequestLimit: 10000,
        dailyTokenLimit: 2000000,
        maxDiagrams: -1,
        sortOrder: 1,
        features: [
            "Ayda 10.000 AI diyagramı",
            "Günde 500 AI isteği",
            "Sınırsız kayıtlı diyagram",
            "Tüm AI sağlayıcıları ve gelişmiş modeller",
            "Diyagram geçmişi ve sürümler",
            "Öncelikli e-posta desteği",
        ],
    },
    {
        id: "team",
        name: "Ekip",
        description: "Birlikte çalışan ekipler için koltuk başına.",
        priceMonthly: 11900, // 119 TL / kişi
        dailyRequestLimit: 1000,
        monthlyRequestLimit: 30000,
        dailyTokenLimit: 2000000,
        maxDiagrams: -1,
        sortOrder: 2,
        features: [
            "Kişi başı ayda 30.000 AI diyagramı",
            "Günde 1.000 AI isteği",
            "Sınırsız kayıtlı diyagram",
            "Ekip çalışma alanı ve paylaşım",
            "Fatura ve toplu ödeme",
            "Öncelikli destek",
        ],
    },
]

let seeded = false

export async function ensurePlans(): Promise<void> {
    if (seeded) return
    for (const plan of PLAN_SEEDS) {
        await db.plan.upsert({
            where: { id: plan.id },
            update: {}, // var olan kaydı ezme
            create: { ...plan, features: JSON.stringify(plan.features) },
        })
    }
    seeded = true
}
