/**
 * E-posta gönderimi: RESEND_API_KEY tanımlıysa Resend HTTP API üzerinden
 * gönderir (ek bağımlılık gerekmez). Tanımlı değilse gönderim yapılmaz;
 * auth rotaları bunu algılayıp geliştirme bağlantısını yanıta ekler.
 */

export interface MailResult {
    sent: boolean
    reason?: "no-mailer" | "send-failed"
}

export async function sendMail(
    to: string,
    subject: string,
    html: string,
): Promise<MailResult> {
    const key = process.env.RESEND_API_KEY
    if (!key) return { sent: false, reason: "no-mailer" }
    const from = process.env.RESEND_FROM || "Synora <onboarding@resend.dev>"
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ from, to, subject, html }),
        })
        if (!res.ok) {
            console.error(
                "[Synora] E-posta gönderilemedi:",
                res.status,
                await res.text().catch(() => ""),
            )
            return { sent: false, reason: "send-failed" }
        }
        return { sent: true }
    } catch (err) {
        console.error("[Synora] E-posta gönderim hatası:", err)
        return { sent: false, reason: "send-failed" }
    }
}

export function passwordResetEmailHtml(link: string): string {
    return `<!doctype html>
<html lang="tr"><body style="font-family:Arial,Helvetica,sans-serif;background:#f4f5f7;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
    <h1 style="font-size:20px;color:#171d26;margin:0 0 16px">Şifrenizi mi unuttunuz?</h1>
    <p style="font-size:14px;color:#4b5563;line-height:1.6">
      Synora hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki butona tıklayarak
      yeni şifrenizi belirleyebilirsiniz. Bu bağlantı <strong>1 saat</strong> geçerlidir.
    </p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#171d26;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
        Şifremi Sıfırla
      </a>
    </p>
    <p style="font-size:12px;color:#9ca3af;line-height:1.6">
      Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmeyecektir.
    </p>
  </div>
</body></html>`
}
