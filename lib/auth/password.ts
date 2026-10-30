import bcrypt from "bcryptjs"

const ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, ROUNDS)
}

export async function verifyPassword(
    plain: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(plain, hash)
}

/** Şifre politikası: en az 8 karakter, harf ve rakam içermeli. Uygunsa null döner. */
export function validatePassword(plain: string): string | null {
    if (!plain || plain.length < 8) return "Şifre en az 8 karakter olmalıdır."
    if (plain.length > 128) return "Şifre en fazla 128 karakter olabilir."
    // bcrypt girdiyi sessizce 72 baytta keser; kesilmesini istemediğimizden
    // sınırı açıkça zorunlu kılıyoruz
    if (Buffer.byteLength(plain, "utf8") > 72)
        return "Şifre en fazla 72 bayt olabilir (Türkçe karakterler daha fazla yer kaplar)."
    if (!/[a-zA-ZğüşıöçGÜŞİÖÇ]/.test(plain) || !/\d/.test(plain))
        return "Şifre en az bir harf ve bir rakam içermelidir."
    return null
}

/** E-posta biçimi temel doğrulama */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}
