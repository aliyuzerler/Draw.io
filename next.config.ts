import type { NextConfig } from "next"
import packageJson from "./package.json"

// ── Güvenlik başlıkları (güvenlik denetimi Y1) ─────────────────────────────
// Not: CSP, draw.io çerçevesi (aynı kaynak statik paket) için iki ayrı
// kuralda tanımlıdır; genel kural /drawio/* yollarını dışlar, böylece
// tarayıcı iki CSP'yi kesiştirip editörü kırmaz. next/font ve Next.js'in
// kendi satır içi betikleri nedeniyle script-src 'unsafe-inline' gerekir;
// GA etkinse sağlayıcısı da eklenir.
const isDev = process.env.NODE_ENV !== "production"
const gaSrc = process.env.NEXT_PUBLIC_GA_ID
    ? " https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com"
    : ""
const devWs = isDev
    ? " ws://localhost:* ws://127.0.0.1:* http://localhost:*"
    : ""

const securityHeaders = [
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), usb=(), hid=(), serial=(), payment=(), interest-cohort=()",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
    },
]

const csp =
    `default-src 'self'; ` +
    `script-src 'self' 'unsafe-inline'${gaSrc}; ` +
    `style-src 'self' 'unsafe-inline'; ` +
    `img-src 'self' data: blob: https:; ` +
    `font-src 'self' data:; ` +
    `connect-src 'self'${gaSrc}${devWs}; ` +
    `frame-src 'self'; ` +
    `worker-src 'self' blob:; ` +
    `media-src 'self' blob: data:; ` +
    `object-src 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self'; ` +
    `frame-ancestors 'self'`

// draw.io editör belgesi: rahat ama yine sınırlı politika (eklenti/mxGraph
// çalışma biçimi nedeniyle eval serbest; frame-ancestors yine 'self')
const drawioCsp =
    `default-src 'self'; ` +
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'; ` +
    `style-src 'self' 'unsafe-inline'; ` +
    `img-src 'self' data: blob:; ` +
    `font-src 'self' data:; ` +
    `connect-src 'self'; ` +
    `worker-src 'self' blob:; ` +
    `media-src 'self' blob: data:; ` +
    `object-src 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self'; ` +
    `frame-ancestors 'self'`

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    reactStrictMode: true,
    poweredByHeader: false,
    // Support for subdirectory deployment (e.g., https://example.com/nextaidrawio)
    // Set NEXT_PUBLIC_BASE_PATH environment variable to your subdirectory path (e.g., /nextaidrawio)
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    env: {
        APP_VERSION: packageJson.version,
    },
    async headers() {
        return [
            {
                // Genel politika: tüm yollar. /drawio/* için aşağıdaki kural
                // aynı başlıkları kendi değerleriyle EZER (Next'te son
                // eşleşen kural kazanır), böylece editör kendi rahat
                // CSP'sini alır.
                source: "/:path*",
                headers: [
                    ...securityHeaders,
                    { key: "Content-Security-Policy", value: csp },
                ],
            },
            {
                // draw.io paketi: sürüm sabitlendi (fetch-drawio.mjs) →
                // ömür boyu önbellek + rahat CSP
                source: "/drawio/:path*",
                headers: [
                    ...securityHeaders,
                    { key: "Content-Security-Policy", value: drawioCsp },
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            {
                // Küçük ama tekrar ziyaretlerde yeniden doğrulanmasın
                source: "/gallery/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=604800, stale-while-revalidate=86400",
                    },
                ],
            },
            {
                source: "/:file(mcp-promo.mp4|mcp-promo-poster.jpg|architecture.png|example.png)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=604800, stale-while-revalidate=86400",
                    },
                ],
            },
        ]
    },
    // Include instrumentation.ts in standalone build for Langfuse telemetry,
    // the shape library docs get_shape_library reads at run time, and the
    // docs pages' Markdown
    outputFileTracingIncludes: {
        "*": ["./instrumentation.ts"],
        "/api/chat": ["./docs/shape-libraries/*.md"],
        "/[lang]/docs/[[...slug]]": [
            "./docs/en/*.md",
            "./docs/cn/*.md",
            "./docs/ja/*.md",
            "./docs/tw/*.md",
        ],
        "/sitemap.xml": [
            "./docs/en/*.md",
            "./docs/cn/*.md",
            "./docs/ja/*.md",
            "./docs/tw/*.md",
        ],
    },
    // The Chinese and Japanese About pages used to be separate routes. The
    // addresses without a language, which Google still has, go there in one
    // step instead of through the language redirect first.
    async redirects() {
        return [
            { source: "/about/cn", destination: "/zh/about", permanent: true },
            { source: "/about/ja", destination: "/ja/about", permanent: true },
            {
                source: "/:lang/about/cn",
                destination: "/zh/about",
                permanent: true,
            },
            {
                source: "/:lang/about/ja",
                destination: "/ja/about",
                permanent: true,
            },
        ]
    },
}

export default nextConfig
