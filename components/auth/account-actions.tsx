"use client"

import { Download, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

/**
 * KVKK hesap işlemleri: veri dışa aktarma ve şifre onaylı kalıcı hesap silme.
 * Panelim > Hesap kartında gösterilir.
 */
export function AccountActions({ lang }: { lang: string }) {
    const [deleting, setDeleting] = useState(false)
    const [password, setPassword] = useState("")
    const [busy, setBusy] = useState(false)

    const exportData = () => {
        window.location.assign("/api/auth/export-data")
    }

    const deleteAccount = async () => {
        setBusy(true)
        try {
            const res = await fetch("/api/auth/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                toast.success(data.message || "Hesabınız silindi.", {
                    duration: 5000,
                })
                window.location.assign(`/${lang}`)
                return
            }
            toast.error(data.error || "Hesap silinemedi.")
        } catch {
            toast.error("Hesap silinemedi.")
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
            <button
                type="button"
                onClick={exportData}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium hover:bg-foreground/[0.06]"
            >
                <Download className="size-4" />
                Verilerimi indir (JSON)
            </button>

            {deleting ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                    <p className="text-[13px] font-medium text-destructive">
                        Bu işlem geri alınamaz: hesabınız, diyagramlarınız ve
                        kullanım kayıtlarınız kalıcı olarak silinir.
                    </p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifrenizi girin"
                        autoComplete="current-password"
                        className="mt-2 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="mt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => void deleteAccount()}
                            disabled={busy || password.length === 0}
                            className="flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-50"
                        >
                            <Trash2 className="size-4" />
                            Hesabımı kalıcı sil
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setDeleting(false)
                                setPassword("")
                            }}
                            className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium hover:bg-foreground/[0.06]"
                        >
                            Vazgeç
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setDeleting(true)}
                    className="flex items-center gap-2 text-[13px] font-medium text-destructive hover:underline"
                >
                    <Trash2 className="size-4" />
                    Hesabımı sil
                </button>
            )}
        </div>
    )
}
