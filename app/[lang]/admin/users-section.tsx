"use client"

import { Loader2, RefreshCw, ShieldAlert, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { adminFetch } from "./admin-shared"

interface AdminUser {
    id: string
    email: string
    name: string | null
    role: string
    planId: string
    status: string
    createdAt: string
    lastLoginAt: string | null
    diagramCount: number
}

const PLAN_OPTIONS = ["free", "pro", "team"] as const

function formatDate(iso: string | null): string {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

/** Admin panelinin "Kullanıcılar" bölümü: liste, rol/plan/durum düzenleme, silme */
export function UsersSection({ password }: { password: string }) {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [busyId, setBusyId] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const data = await adminFetch("/api/admin/users", password)
            setUsers(data.users ?? [])
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Kullanıcılar yüklenemedi.",
            )
        } finally {
            setLoading(false)
        }
    }, [password])

    useEffect(() => {
        void load()
    }, [load])

    const patch = async (id: string, values: Record<string, string>) => {
        setBusyId(id)
        setError("")
        setMessage("")
        try {
            await adminFetch("/api/admin/users", password, {
                method: "PATCH",
                body: JSON.stringify({ id, ...values }),
            })
            setUsers((prev) =>
                prev.map((u) => (u.id === id ? { ...u, ...values } : u)),
            )
            setMessage("Kayıt güncellendi.")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Güncellenemedi.")
        } finally {
            setBusyId(null)
        }
    }

    const remove = async (id: string, email: string) => {
        if (
            !window.confirm(
                `${email} kalıcı olarak silinecek (diyagramlarıyla birlikte). Emin misiniz?`,
            )
        ) {
            return
        }
        setBusyId(id)
        setError("")
        try {
            await adminFetch(
                `/api/admin/users?id=${encodeURIComponent(id)}`,
                password,
                {
                    method: "DELETE",
                },
            )
            setUsers((prev) => prev.filter((u) => u.id !== id))
            setMessage("Kullanıcı silindi.")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Silinemedi.")
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    Toplam {users.length} kullanıcı. Rol, plan ve durumu buradan
                    yönetin.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void load()}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <RefreshCw className="size-4" />
                    )}
                    Yenile
                </Button>
            </div>

            {error && (
                <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <ShieldAlert className="size-4 shrink-0" />
                    {error}
                </p>
            )}
            {message && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                    {message}
                </p>
            )}

            {loading && users.length === 0 ? (
                <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Yükleniyor…
                </div>
            ) : users.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                    Henüz kayıtlı kullanıcı yok. İlk kayıt olan otomatik
                    yönetici olur.
                </p>
            ) : (
                <div className="max-h-[480px] overflow-x-auto overflow-y-auto rounded-xl border border-border">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                            <tr className="text-left text-xs text-muted-foreground">
                                <th className="px-3 py-2.5 font-medium">
                                    Kullanıcı
                                </th>
                                <th className="px-3 py-2.5 font-medium">Rol</th>
                                <th className="px-3 py-2.5 font-medium">
                                    Plan
                                </th>
                                <th className="px-3 py-2.5 font-medium">
                                    Durum
                                </th>
                                <th className="px-3 py-2.5 text-right font-medium">
                                    Diyagram
                                </th>
                                <th className="px-3 py-2.5 font-medium">
                                    Kayıt
                                </th>
                                <th className="px-3 py-2.5 font-medium">
                                    Son giriş
                                </th>
                                <th className="px-3 py-2.5 font-medium" />
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const busy = busyId === u.id
                                return (
                                    <tr
                                        key={u.id}
                                        className="border-t border-border align-middle"
                                    >
                                        <td className="max-w-[220px] px-3 py-2.5">
                                            <p className="truncate font-medium">
                                                {u.name ||
                                                    u.email.split("@")[0]}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {u.email}
                                            </p>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <Select
                                                value={u.role}
                                                disabled={busy}
                                                onValueChange={(role) =>
                                                    void patch(u.id, { role })
                                                }
                                            >
                                                <SelectTrigger className="h-8 w-[110px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USER">
                                                        Üye
                                                    </SelectItem>
                                                    <SelectItem value="ADMIN">
                                                        Yönetici
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <Select
                                                value={u.planId}
                                                disabled={busy}
                                                onValueChange={(planId) =>
                                                    void patch(u.id, { planId })
                                                }
                                            >
                                                <SelectTrigger className="h-8 w-[100px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PLAN_OPTIONS.map((p) => (
                                                        <SelectItem
                                                            key={p}
                                                            value={p}
                                                        >
                                                            {p === "free"
                                                                ? "Ücretsiz"
                                                                : p === "pro"
                                                                  ? "Pro"
                                                                  : "Ekip"}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <Select
                                                value={u.status}
                                                disabled={busy}
                                                onValueChange={(status) =>
                                                    void patch(u.id, { status })
                                                }
                                            >
                                                <SelectTrigger className="h-8 w-[110px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE">
                                                        Aktif
                                                    </SelectItem>
                                                    <SelectItem value="SUSPENDED">
                                                        Askıda
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-3 py-2.5 text-right tabular-nums">
                                            {u.diagramCount}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap text-xs text-muted-foreground">
                                            {formatDate(u.createdAt)}
                                        </td>
                                        <td className="px-3 py-2.5 whitespace-nowrap text-xs text-muted-foreground">
                                            {formatDate(u.lastLoginAt)}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void remove(u.id, u.email)
                                                }
                                                disabled={busy}
                                                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                                aria-label={`${u.email} kullanıcısını sil`}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
