import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { proxy } from "@/proxy"

// The locale that a page without one redirects to
const redirectFor = (acceptLanguage?: string, path = "/") => {
    const response = proxy(
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
    it("sends every visitor to Turkish by default", () => {
        expect(redirectFor("zh-TW,zh;q=0.9")).toBe("http://localhost/tr")
        expect(redirectFor("zh-CN,zh;q=0.9")).toBe("http://localhost/tr")
        expect(redirectFor("ja-JP,ja;q=0.9")).toBe("http://localhost/tr")
        expect(redirectFor("en-US,en;q=0.9")).toBe("http://localhost/tr")
        expect(redirectFor("fr-FR,ja;q=0.8,en;q=0.5")).toBe(
            "http://localhost/tr",
        )
    })

    it("sends requests without a language to Turkish", () => {
        expect(redirectFor()).toBe("http://localhost/tr")
        expect(redirectFor("*")).toBe("http://localhost/tr")
        expect(redirectFor("de-DE")).toBe("http://localhost/tr")
        expect(redirectFor("en_US,ja;q=0.8")).toBe("http://localhost/tr")
    })

    it("keeps the rest of the path", () => {
        expect(redirectFor("zh-TW", "/about")).toBe("http://localhost/tr/about")
    })

    it("redirects the home page temporarily and other pages permanently", () => {
        const status = (path: string) =>
            proxy(new NextRequest(`http://localhost${path}`))?.status
        expect(status("/")).toBe(307)
        expect(status("/docs/editor")).toBe(308)
        expect(status("/mcp")).toBe(308)
    })
})
