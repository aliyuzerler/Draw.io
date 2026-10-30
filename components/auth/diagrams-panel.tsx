"use client"

import { Cloud, Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface DiagramRow {
    id: string
    title: string
    createdAt: string
    updatedAt: string
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

/** Panelim'deki "Diyagramlarım": bulut kayıtlarını listeler, açar, adlandırır, siler */
export function DiagramsPanel({ lang }: { lang: string }) {
    const [diagrams, setDiagrams] = useState<DiagramRow[]>([])
    const [loading, setLoading] = useState(true)
    const [renameOpen, setRenameOpen] = useState(false)
    const [renameTarget, setRenameTarget] = useState<DiagramRow | null>(null)
    const [renameValue, setRenameValue] = useState("")
    const [busy, setBusy] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/diagrams", { cache: "no-store" })
            const data = await res.json()
            if (res.ok) setDiagrams(data.diagrams ?? [])
        } catch {
            // sessiz: panel boş görünür
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    const remove = async (row: DiagramRow) => {
        if (
            !window.confirm(
                `"${row.title}" kalıcı olarak silinecek. Emin misiniz?`,
            )
        ) {
            return
        }
        try {
            const res = await fetch(`/api/diagrams/${row.id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                setDiagrams((prev) => prev.filter((d) => d.id !== row.id))
                toast.success("Diyagram silindi.")
            } else {
                const data = await res.json().catch(() => ({}))
                toast.error(data.error || "Diyagram silinemedi.")
            }
        } catch {
            toast.error("Diyagram silinemedi.")
        }
    }

    const submitRename = async () => {
        if (!renameTarget) return
        setBusy(true)
        try {
            const res = await fetch(`/api/diagrams/${renameTarget.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: renameValue }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                setDiagrams((prev) =>
                    prev.map((d) =>
                        d.id === renameTarget.id
                            ? { ...d, title: data.diagram.title }
                            : d,
                    ),
                )
                setRenameOpen(false)
                toast.success("Diyagram yeniden adlandırıldı.")
            } else {
                toast.error(data.error || "Yeniden adlandırılamadı.")
            }
        } catch {
            toast.error("Yeniden adlandırılamadı.")
        } finally {
            setBusy(false)
        }
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold">
                        <Cloud className="size-4" /> Diyagramlarım
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Buluta kaydedilen diyagramlarınız. Editörde
                        <span className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">
                            Buluta kaydet
                        </span>
                        düğmesiyle kaydedilir.
                    </p>
                </div>
                <Link
                    href={`/${lang}`}
                    className="flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-[13px] font-medium hover:bg-foreground/[0.06]"
                >
                    <PlusCircle className="size-4" />
                    Yeni diyagram
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Yükleniyor…
                </div>
            ) : diagrams.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Henüz kayıtlı diyagramınız yok. Editörde bir diyagram
                        çizip <strong>Buluta kaydet</strong>'e basın.
                    </p>
                </div>
            ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {diagrams.map((d) => (
                        <li
                            key={d.id}
                            className="group flex flex-col justify-between rounded-xl border border-border p-4 transition-colors hover:border-foreground/25"
                        >
                            <div className="min-w-0">
                                <p
                                    className="truncate text-sm font-medium"
                                    title={d.title}
                                >
                                    {d.title}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {formatDate(d.updatedAt)}
                                </p>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5">
                                <Link
                                    href={`/${lang}?diagram=${d.id}`}
                                    className="flex-1 rounded-lg bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background"
                                >
                                    Düzenle
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Yeniden adlandır"
                                    onClick={() => {
                                        setRenameTarget(d)
                                        setRenameValue(d.title)
                                        setRenameOpen(true)
                                    }}
                                >
                                    <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 hover:text-destructive"
                                    aria-label="Sil"
                                    onClick={() => void remove(d)}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Diyagramı yeniden adlandır</DialogTitle>
                    </DialogHeader>
                    <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !busy) void submitRename()
                        }}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        maxLength={120}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRenameOpen(false)}
                            disabled={busy}
                        >
                            Vazgeç
                        </Button>
                        <Button
                            onClick={() => void submitRename()}
                            disabled={busy}
                        >
                            {busy && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            Kaydet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    )
}
