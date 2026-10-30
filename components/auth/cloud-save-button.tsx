"use client"

import { Check, CloudUpload, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { useDiagram } from "@/contexts/diagram-context"
import { setFileTitle } from "@/lib/drawio/editor-bridge"
import { isRealDiagram } from "@/lib/utils"

/**
 * Editörde buluta kaydetme: StartBar'daki düğme. "?diagram=<id>" ile açılan
 * diyagramı veritabanından yükler ve sonraki kayıtlarda aynı kaydı günceller.
 * Oturum açık değilse hiç görünmez.
 */
export function CloudSaveButton() {
    const { chartXML, chartXMLRef, loadDiagram } = useDiagram()
    const params = useSearchParams()
    const [me, setMe] = useState<{ name: string | null } | null>(null)
    const [cloudId, setCloudId] = useState<string | null>(null)
    const [title, setTitle] = useState<string | null>(null)
    const [state, setState] = useState<"idle" | "saving" | "saved">("idle")
    const loadingDiagram = useRef(false)

    // Oturum durumu
    useEffect(() => {
        fetch("/api/auth/me", { cache: "no-store" })
            .then((r) => r.json())
            .then((data) => setMe(data.user ?? null))
            .catch(() => setMe(null))
    }, [])

    // ?diagram=<id> ile açılan diyagramı buluttan yükle
    useEffect(() => {
        const id = params.get("diagram")
        if (!id || loadingDiagram.current) return
        loadingDiagram.current = true
        fetch(`/api/diagrams/${id}`, { cache: "no-store" })
            .then(async (res) => {
                if (!res.ok) throw new Error("bulunamadı")
                const data = await res.json()
                setCloudId(data.diagram.id)
                setTitle(data.diagram.title)
                setFileTitle(data.diagram.title)
                loadDiagram(data.diagram.xml, true, "load")
                toast.success(`"${data.diagram.title}" buluttan yüklendi.`)
            })
            .catch(() => {
                toast.error("Diyagram buluttan yüklenemedi.")
            })
            .finally(() => {
                // Adresi temizle: yenilemede tekrar yüklenmesin
                window.history.replaceState(null, "", window.location.pathname)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const save = useCallback(async () => {
        const xml = chartXMLRef.current
        if (!isRealDiagram(xml) || state === "saving") return
        setState("saving")
        try {
            const body = { xml, title: title ?? undefined }
            const res = cloudId
                ? await fetch(`/api/diagrams/${cloudId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                  })
                : await fetch("/api/diagrams", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(
                          body.title ? body : { ...body, title: null },
                      ),
                  })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                if (data.diagram?.id) setCloudId(data.diagram.id)
                if (data.diagram?.title) setTitle(data.diagram.title)
                setState("saved")
                toast.success(
                    cloudId
                        ? "Bulut güncellendi."
                        : "Diyagram buluta kaydedildi.",
                )
                setTimeout(() => setState("idle"), 1600)
            } else {
                setState("idle")
                toast.error(data.error || "Diyagram kaydedilemedi.")
            }
        } catch {
            setState("idle")
            toast.error("Diyagram kaydedilemedi.")
        }
    }, [chartXMLRef, cloudId, state, title])

    if (!me) return null

    return (
        <SaveButton
            onClick={save}
            state={state}
            disabled={!isRealDiagram(chartXML)}
        />
    )
}

function SaveButton({
    onClick,
    state,
    disabled = false,
}: {
    onClick: () => void
    state: "idle" | "saving" | "saved"
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={state === "saving" || disabled}
            aria-label="Buluta kaydet"
            title="Buluta kaydet"
            className="flex h-7 items-center gap-1.5 rounded-lg border border-border px-2 text-[12px] font-medium hover:bg-foreground/[0.07] disabled:opacity-60"
        >
            {state === "saving" ? (
                <Loader2 className="size-3.5 animate-spin" />
            ) : state === "saved" ? (
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
                <CloudUpload className="size-3.5" />
            )}
            <span>{state === "saved" ? "Kaydedildi" : "Buluta kaydet"}</span>
        </button>
    )
}
