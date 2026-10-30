"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

/** Fiyat kartındaki CTA: talebi oluşturur, sonucu bildirir */
export function UpgradeButton({
    lang,
    planId,
    label,
    outline = false,
}: {
    lang: string
    planId: string
    label: string
    outline?: boolean
}) {
    const router = useRouter()
    const [busy, setBusy] = useState(false)

    const go = async () => {
        // Oturum yoksa önce giriş
        const me = await fetch("/api/auth/me", { cache: "no-store" })
            .then((r) => r.json())
            .catch(() => ({ user: null }))
        if (!me.user) {
            router.push(`/${lang}/login?next=/${lang}/pricing`)
            return
        }
        setBusy(true)
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                toast.success(data.message || "Talebiniz alındı.", {
                    duration: 6000,
                })
                router.push(`/${lang}/dashboard`)
                router.refresh()
            } else {
                toast.error(data.error || "Talep oluşturulamadı.")
            }
        } catch {
            toast.error("Talep oluşturulamadı.")
        } finally {
            setBusy(false)
        }
    }

    return (
        <Button
            className="w-full"
            variant={outline ? "outline" : "default"}
            onClick={() => void go()}
            disabled={busy}
        >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {label}
        </Button>
    )
}
