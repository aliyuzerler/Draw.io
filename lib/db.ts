import { PrismaClient } from "@prisma/client"

// Tek PrismaClient örneği; geliştirmede HMR ile çoğalmayı önler.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

/** Veritabanı yapılandırılmamışsa true (auth özellikleri bu durumda 503 döner) */
export function isDbConfigured(): boolean {
    return !!process.env.DATABASE_URL
}
