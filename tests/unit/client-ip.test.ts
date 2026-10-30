import { NextRequest } from "next/server"
import { describe, expect, it, vi } from "vitest"
import { getUserIdFromRequest } from "@/lib/user-id"
import { proxy } from "@/proxy"

const idFor = (ip: string) => `user-${Buffer.from(ip).toString("base64url")}`

describe("getUserIdFromRequest", () => {
    const req = new Request("http://localhost/api/chat", {
        headers: {
            "x-forwarded-for": "203.0.113.9, 198.51.100.7",
            "cf-connecting-ip": "198.51.100.7",
        },
    })

    it("uses the first X-Forwarded-For entry by default", () => {
        expect(getUserIdFromRequest(req)).toBe(idFor("203.0.113.9"))
    })

    it("uses CLIENT_IP_HEADER when set", () => {
        vi.stubEnv("CLIENT_IP_HEADER", "cf-connecting-ip")
        expect(getUserIdFromRequest(req)).toBe(idFor("198.51.100.7"))
    })

    it("is anonymous when the configured header is missing", () => {
        vi.stubEnv("CLIENT_IP_HEADER", "cf-connecting-ip")
        expect(
            getUserIdFromRequest(new Request("http://localhost/api/chat")),
        ).toBe("anonymous")
    })
})

describe("ORIGIN_SECRET", () => {
    const call = (path: string, secret?: string) =>
        proxy(
            new NextRequest(`http://localhost${path}`, {
                headers: secret ? { "x-origin-secret": secret } : {},
            }),
        )

    it("lets every API call through when unset", async () => {
        expect(await call("/api/chat")).toBeUndefined()
    })

    it("refuses API calls without the right header", async () => {
        vi.stubEnv("ORIGIN_SECRET", "s3cret")
        for (const res of [
            await call("/api/chat"),
            await call("/api/chat", "wrong"),
        ]) {
            expect(res?.status).toBe(403)
        }
        expect(await call("/api/chat", "s3cret")).toBeUndefined()
    })

    it("leaves pages alone, such as the health check on /", async () => {
        vi.stubEnv("ORIGIN_SECRET", "s3cret")
        expect((await call("/"))?.status).toBe(307)
        expect(await call("/en")).toBeUndefined()
    })
})
