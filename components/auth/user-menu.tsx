"use client"

import {
    ChevronDown,
    LayoutDashboard,
    LogIn,
    LogOut,
    Shield,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MeUser {
    id: string
    email: string
    name: string | null
    role: string
    planId: string
    status?: string
}

/**
 * Oturum menüsü: giriş yapmamışsa "Giriş" bağlantısı, yapmışsa avatar +
 * açılır menü (Panelim, Yönetim, Çıkış). Hem editör başlangıç çubuğunda hem
 * site başlığında kullanılır.
 */
export function UserMenu({
    lang,
    compact = false,
    className,
}: {
    lang: string
    compact?: boolean
    className?: string
}) {
    const [user, setUser] = useState<MeUser | null>(null)
    const [loaded, setLoaded] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        let cancelled = false
        fetch("/api/auth/me", { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) {
                    setUser(data.user ?? null)
                    setLoaded(true)
                }
            })
            .catch(() => {
                if (!cancelled) setLoaded(true)
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (!loaded) {
        return <span className={cn("inline-block size-7", className)} />
    }

    if (!user) {
        return (
            <Link
                href={`/${lang}/login`}
                className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 font-medium text-foreground hover:bg-foreground/[0.07] h-8 text-[13px] whitespace-nowrap",
                    compact ? "px-2" : "min-w-0",
                    className,
                )}
                aria-label="Giriş yap"
            >
                <LogIn className="size-4 shrink-0" />
                {!compact && <span>Giriş</span>}
            </Link>
        )
    }

    const initial = (user.name || user.email)[0]?.toUpperCase() || "S"

    const logout = async () => {
        setLoggingOut(true)
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } finally {
            window.location.assign(`/${lang}`)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                className={cn(
                    "flex h-8 items-center gap-1.5 rounded-lg px-1.5 hover:bg-foreground/[0.07]",
                    className,
                )}
                aria-label="Hesap menüsü"
            >
                <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                    {initial}
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 p-2">
                <div className="border-b border-border px-2 pb-2.5 pt-1">
                    <p className="truncate text-[13px] font-medium">
                        {user.name || user.email.split("@")[0]}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </p>
                </div>
                <nav className="flex flex-col py-1 text-[13px]">
                    <Link
                        href={`/${lang}/dashboard`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-foreground/[0.06]"
                    >
                        <LayoutDashboard className="size-4 text-muted-foreground" />
                        Panelim
                    </Link>
                    {user.role === "ADMIN" && (
                        <Link
                            href={`/${lang}/admin`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-foreground/[0.06]"
                        >
                            <Shield className="size-4 text-muted-foreground" />
                            Yönetim paneli
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={logout}
                        disabled={loggingOut}
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-foreground/[0.06] disabled:opacity-60"
                    >
                        <LogOut className="size-4 text-muted-foreground" />
                        {loggingOut ? "Çıkış yapılıyor…" : "Çıkış yap"}
                    </button>
                </nav>
            </PopoverContent>
        </Popover>
    )
}
