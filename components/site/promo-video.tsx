"use client"

import { useEffect, useRef } from "react"
import { getAssetUrl } from "@/lib/base-path"

/**
 * The MCP promo video. It plays by itself only when the system does not ask
 * for reduced motion; otherwise it waits on its poster for a click.
 */
export function PromoVideo({ label }: { label: string }) {
    const video = useRef<HTMLVideoElement>(null)
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return
        }
        // Performans: yalnızca görünürken oynat/pause (~2MB video ilk
        // yüklemede tamamen indirilmez)
        const el = video.current
        if (!el) return
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        el.play().catch(() => {})
                    } else {
                        el.pause()
                    }
                }
            },
            { threshold: 0.4 },
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])
    return (
        <video
            ref={video}
            src={getAssetUrl("/mcp-promo.mp4")}
            poster={getAssetUrl("/mcp-promo-poster.jpg")}
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label={label}
            className="aspect-video w-full"
        />
    )
}
