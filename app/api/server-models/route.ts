import { NextResponse } from "next/server"
import { loadFlattenedServerModels } from "@/lib/server-model-config"

// Use dynamic rendering to read AI_MODEL/AI_PROVIDER env vars at runtime
// This ensures Docker users can set these values when starting containers
export const dynamic = "force-dynamic"

export async function GET() {
    const models = await loadFlattenedServerModels()
    // Sunucu tarafı bilgi sızıntısı engeli: anahtar/temel-URL ortam
    // değişkeni ADLARI istemciye gönderilmez (değerler zaten asla gitmez).
    // Model seçimi için id/modelId/provider/label/default yeterlidir;
    // çözümleme sunucuda findServerModelById ile yapılır.
    const safeModels = models.map(({ apiKeyEnv, baseUrlEnv, ...rest }) => rest)
    return NextResponse.json({ models: safeModels })
}
