import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { proxy } from "@/proxy"

// The locale that a page without one redirects to
const redirectFor = async (acceptLanguage?: string, path = "/") => {
    const response = await proxy(
        new NextRequest(`http://localhost${path}`, {
            headers: acceptLanguage
                ? { "accept-language": acceptLanguage }
                : {},
        }),
    )
    return response?.headers.get("location")
}

// Turkish-first: every visitor without a locale path goes to the default
// (Turkish) page, whatever the browser's language; other languages stay
// reachable through their /<locale> paths.
describe("locale redirect", () => {
    it("sends every visitor to Turkish by default", async () => {
        expect(await redirectFor("zh-TW,zh;q=0.9")).toBe("http://localhost/tr")
        expect(await redirectFor("zh-CN,zh;q=0.9")).toBe("http://localhost/tr")
        expect(await redirectFor("ja-JP,ja;q=0.9")).toBe("http://localhost/tr")
        expect(await redirectFor("en-US,en;q=0.9")).toBe("http://localhost/tr")
        expect(await redirectFor("fr-FR,ja;q=0.8,en;q=0.5")).toBe(
            "http://localhost/tr",
        )
    })

    it("sends requests without a language to Turkish", async () => {
        expect(await redirectFor()).toBe("http://localhost/tr")
        expect(await redirectFor("*")).toBe("http://localhost/tr")
        expect(await redirectFor("de-DE")).toBe("http://localhost/tr")
        expect(await redirectFor("en_US,ja;q=0.8")).toBe("http://localhost/tr")
    })

    it("keeps the rest of the path", async () => {
        expect(await redirectFor("zh-TW", "/about")).toBe(
            "http://localhost/tr/about",
        )
    })

    it("redirects the home page temporarily and other pages permanently", async () => {
        const status = async (path: string) =>
            (await proxy(new NextRequest(`http://localhost${path}`)))?.status
        expect(await status("/")).toBe(307)
        expect(await status("/docs/editor")).toBe(308)
        expect(await status("/mcp")).toBe(308)
    })

    it("sends a signed-out visitor from a protected page to login", async () => {
        const response = await proxy(
            new NextRequest("http://localhost/tr/dashboard"),
        )
        expect(response?.status).toBe(307)
        expect(response?.headers.get("location")).toBe(
            "http://localhost/tr/login?next=%2Ftr%2Fdashboard",
        )
    })
})
