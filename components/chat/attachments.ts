import { MAX_FILES, MAX_FILE_SIZE as MAX_IMAGE_SIZE } from "@/lib/chat-helpers"
import { formatMessage } from "@/lib/i18n/utils"
import { isPdfFile, isTextFile } from "@/lib/pdf-utils"

// Image formats every supported model provider accepts (SVG is read as text)
const SUPPORTED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
]

// Tarayıcıda metne çıkarılan dosyalar (PDF/metin) için de üst sınır:
// sınır yoksa GB'lık bir .txt dosyası tüm dosyayı belleğe alıp sekmeyi
// çökertir (bellek DoS'u)
export const MAX_EXTRACT_FILE_SIZE = 20 * 1024 * 1024 // 20MB

/** Accept list for the attachment picker (.drawio files open as the diagram) */
export const ATTACHMENT_ACCEPT =
    "image/png,image/jpeg,image/gif,image/webp,.svg,.pdf,application/pdf,text/*,.md,.markdown,.json,.csv,.xml,.yaml,.yml,.toml,.drawio"

/** A draw.io file (.drawio or .drawio.svg), opened rather than attached */
export function isDiagramFile(file: File): boolean {
    return /\.drawio(\.svg)?$/i.test(file.name)
}

function isValidFileType(file: File): boolean {
    return (
        SUPPORTED_IMAGE_TYPES.includes(file.type) ||
        isPdfFile(file) ||
        isTextFile(file)
    )
}

function formatFileSize(bytes: number): string {
    const mb = bytes / 1024 / 1024
    if (mb < 0.01) return `${(bytes / 1024).toFixed(0)}KB`
    return `${mb.toFixed(2)}MB`
}

/** Keep the files that can be attached; describe the rest as errors */
export function validateFiles(
    newFiles: File[],
    existingCount: number,
    dict: any,
): { validFiles: File[]; errors: string[] } {
    const errors: string[] = []
    const validFiles: File[] = []
    const availableSlots = MAX_FILES - existingCount

    if (availableSlots <= 0) {
        errors.push(formatMessage(dict.errors.maxFiles, { max: MAX_FILES }))
        return { validFiles, errors }
    }

    for (const file of newFiles) {
        if (validFiles.length >= availableSlots) {
            errors.push(
                formatMessage(dict.errors.onlyMoreAllowed, {
                    slots: availableSlots,
                }),
            )
            break
        }
        if (!isValidFileType(file)) {
            errors.push(
                formatMessage(dict.errors.unsupportedType, { name: file.name }),
            )
            continue
        }
        // Çıkarılan dosyaların (PDF/metin) da boyut sınırı var; görseller
        // sunucuda ayrıca denetlenir
        const isExtractedFile = isPdfFile(file) || isTextFile(file)
        const sizeLimit = isExtractedFile
            ? MAX_EXTRACT_FILE_SIZE
            : MAX_IMAGE_SIZE
        if (file.size > sizeLimit) {
            errors.push(
                formatMessage(dict.errors.fileExceeds, {
                    name: file.name,
                    size: formatFileSize(file.size),
                    max: sizeLimit / 1024 / 1024,
                }),
            )
        } else {
            validFiles.push(file)
        }
    }
    return { validFiles, errors }
}
