"use client"

import { Loader2, LogOut } from "lucide-react"
import { useState } from "react"

/** Oturumu kapatıp editöre döner */
export function LogoutButton({ lang, label }: { lang: string; label: string }) {
    const [busy, setBusy] = useState(false)

    const logout = async () => {
        setBusy(true)
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}",
            })
        } finally {
            window.location.assign(`/${lang}`)
        }
    }

    return (
        <button
            type="button"
            onClick={logout}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-[13px] font-medium hover:bg-foreground/[0.06] disabled:opacity-60"
        >
            {busy ? (
                <Loader2 className="size-4 animate-spin" />
            ) : (
                <LogOut className="size-4" />
            )}
            {busy ? "…" : label}
        </button>
    )
}
