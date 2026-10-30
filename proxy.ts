import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session"
import { i18n } from "./lib/i18n/config"

function getLocale(_request: NextRequest): string {
    // Turkish-first: every visitor landing on a path without a locale goes
    // to the default (Turkish) page. Other languages stay reachable through
    // /en, /ja ... and the language menus.
    return i18n.defaultLocale
}

// Paths that require an active session, and the auth pages that a signed-in
// user has no business revisiting.
const PROTECTED_PAGES = new Set(["dashboard", "billing", "settings"])
const AUTH_PAGES = new Set([
    "login",
    "register",
    "forgot-password",
    "reset-password",
])

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if (pathname.startsWith("/api/")) {
        // With ORIGIN_SECRET set, API calls must come through the CDN that
        // adds this header. A call straight to the origin could fake the
        // CLIENT_IP_HEADER and get a fresh quota for every made-up IP.
        const secret = process.env.ORIGIN_SECRET
        if (secret && request.headers.get("x-origin-secret") !== secret) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        return
    }

    // Skip static files and Next.js internals
    if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/drawio") ||
        pathname.includes("/favicon") ||
        /\.(.*)$/.test(pathname)
    ) {
        return
    }

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) =>
            !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    )

    // Session gate for /{lang}/dashboard & friends, and the reverse gate for
    // the auth pages. Only applies to localized page paths.
    const parts = pathname.split("/").filter(Boolean)
    if (
        !pathnameIsMissingLocale &&
        parts.length >= 2 &&
        (PROTECTED_PAGES.has(parts[1]) || AUTH_PAGES.has(parts[1]))
    ) {
        const token = request.cookies.get(SESSION_COOKIE)?.value
        const session = token ? await verifySessionToken(token) : null
        if (PROTECTED_PAGES.has(parts[1]) && !session) {
            const url = request.nextUrl.clone()
            url.pathname = `/${parts[0]}/login`
            url.search = `next=${encodeURIComponent(pathname)}`
            return NextResponse.redirect(url)
        }
        if (AUTH_PAGES.has(parts[1]) && session) {
            const url = request.nextUrl.clone()
            url.pathname = `/${parts[0]}/dashboard`
            url.search = ""
            return NextResponse.redirect(url)
        }
    }

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)

        // Redirect to localized path. Cloning nextUrl keeps the basePath
        // (NEXT_PUBLIC_BASE_PATH) and query string, which
        // new URL("/...", request.url) would drop.
        const url = request.nextUrl.clone()
        url.pathname = `/${locale}${pathname}`
        // A page is only ever at its localized path, so say so with a
        // permanent redirect; with a temporary one, search engines keep the
        // path without a locale as the page's address. The home page stays
        // temporary: it is the entry point that picks the visitor's language.
        return NextResponse.redirect(url, pathname === "/" ? 307 : 308)
    }
}

export const config = {
    // API routes (for ORIGIN_SECRET), and pages without `/_next/` assets
    matcher: [
        "/api/:path*",
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}
