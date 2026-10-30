/**
 * Kimlik panellerinin metinleri. Ana dil Türkçe; diğer diller İngilizce
 * yedeğe düşer (SaaS pazarı öncelikle Türkiye).
 */

export interface AuthTexts {
    brand: string
    loginTitle: string
    loginSubtitle: string
    registerTitle: string
    registerSubtitle: string
    forgotTitle: string
    forgotSubtitle: string
    resetTitle: string
    resetSubtitle: string
    name: string
    nameOptional: string
    email: string
    password: string
    newPassword: string
    passwordHint: string
    loginBtn: string
    registerBtn: string
    forgotBtn: string
    resetBtn: string
    working: string
    haveAccount: string
    noAccount: string
    forgotLink: string
    backToLogin: string
    backToHome: string
    forgotGeneric: string
    resetSuccess: string
    demoResetTitle: string
    demoResetHint: string
    termsNote: string
    gotoDashboard: string
    dashboardTitle: string
    dashboardSubtitle: string
    accountCard: string
    planCard: string
    usageCard: string
    quickActions: string
    role: string
    adminRole: string
    userRole: string
    status: string
    activeStatus: string
    suspendedStatus: string
    memberSince: string
    lastLogin: string
    requestsThisMonth: string
    savedDiagrams: string
    dailyLimit: string
    monthlyLimit: string
    maxDiagrams: string
    unlimited: string
    newDiagram: string
    adminPanel: string
    logout: string
    logoutWorking: string
    loginRequired: string
    featuresList: string
    usageHint: string
    myDiagrams: string
}

const tr: AuthTexts = {
    brand: "Synora",
    loginTitle: "Giriş yap",
    loginSubtitle: "Hesabınıza erişin ve diyagramlarınıza devam edin.",
    registerTitle: "Ücretsiz hesap oluştur",
    registerSubtitle: "Saniyeler içinde başlayın, kredi kartı gerekmez.",
    forgotTitle: "Şifremi unuttum",
    forgotSubtitle:
        "E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.",
    resetTitle: "Yeni şifre belirle",
    resetSubtitle: "Hesabınız için yeni bir şifre seçin.",
    name: "Ad Soyad",
    nameOptional: "isteğe bağlı",
    email: "E-posta",
    password: "Şifre",
    newPassword: "Yeni şifre",
    passwordHint: "En az 8 karakter; harf ve rakam içermeli.",
    loginBtn: "Giriş yap",
    registerBtn: "Hesap oluştur",
    forgotBtn: "Sıfırlama bağlantısı gönder",
    resetBtn: "Şifreyi güncelle",
    working: "İşleniyor…",
    haveAccount: "Hesabın var mı?",
    noAccount: "Hesabın yok mu?",
    forgotLink: "Şifremi unuttum",
    backToLogin: "Girişe dön",
    backToHome: "Editöre dön",
    forgotGeneric:
        "Bu e-posta adresi kayıtlıysa şifre sıfırlama bağlantısı gönderildi.",
    resetSuccess: "Şifreniz güncellendi. Artık giriş yapabilirsiniz.",
    demoResetTitle: "Geliştirme bağlantısı",
    demoResetHint:
        "E-posta sağlayıcısı yapılandırılmadığı için sıfırlama bağlantısı burada gösteriliyor. Üretimde bu bağlantı yalnızca e-posta ile iletilir.",
    termsNote:
        "Kayıt olarak kullanım koşullarını ve gizlilik politikasını kabul etmiş olursunuz.",
    gotoDashboard: "Panele git",
    dashboardTitle: "Panelim",
    dashboardSubtitle: "Hesap, plan ve kullanım özetiniz.",
    accountCard: "Hesap",
    planCard: "Plan",
    usageCard: "Kullanım",
    quickActions: "Hızlı işlemler",
    role: "Rol",
    adminRole: "Yönetici",
    userRole: "Üye",
    status: "Durum",
    activeStatus: "Aktif",
    suspendedStatus: "Askıda",
    memberSince: "Katılım",
    lastLogin: "Son giriş",
    requestsThisMonth: "Bu ayki AI istekleri",
    savedDiagrams: "Kayıtlı diyagram",
    dailyLimit: "Günlük istek",
    monthlyLimit: "Aylık istek",
    maxDiagrams: "Diyagram sınırı",
    unlimited: "Sınırsız",
    newDiagram: "Yeni diyagram",
    adminPanel: "Yönetim paneli",
    logout: "Çıkış yap",
    logoutWorking: "Çıkış yapılıyor…",
    loginRequired: "Bu sayfayı görmek için giriş yapmalısınız.",
    featuresList: "Dahil olanlar",
    usageHint:
        "Editörde 'Buluta kaydet' düğmesiyle sakladığınız diyagramlar aşağıda listelenir; AI istekleriniz plan kotasından düşülür.",
    myDiagrams: "Diyagramlarım",
}

const en: AuthTexts = {
    brand: "Synora",
    loginTitle: "Sign in",
    loginSubtitle: "Access your account and continue your diagrams.",
    registerTitle: "Create a free account",
    registerSubtitle: "Get started in seconds, no credit card required.",
    forgotTitle: "Forgot your password",
    forgotSubtitle: "Enter your email and we will send a reset link.",
    resetTitle: "Set a new password",
    resetSubtitle: "Choose a new password for your account.",
    name: "Full name",
    nameOptional: "optional",
    email: "Email",
    password: "Password",
    newPassword: "New password",
    passwordHint: "At least 8 characters with letters and digits.",
    loginBtn: "Sign in",
    registerBtn: "Create account",
    forgotBtn: "Send reset link",
    resetBtn: "Update password",
    working: "Working…",
    haveAccount: "Already have an account?",
    noAccount: "No account yet?",
    forgotLink: "Forgot your password?",
    backToLogin: "Back to sign in",
    backToHome: "Back to editor",
    forgotGeneric:
        "If this email is registered, a password reset link has been sent.",
    resetSuccess: "Your password has been updated. You can sign in now.",
    demoResetTitle: "Development link",
    demoResetHint:
        "No email provider is configured, so the reset link is shown here. In production it is only delivered by email.",
    termsNote:
        "By signing up you agree to the terms of use and the privacy policy.",
    gotoDashboard: "Go to dashboard",
    dashboardTitle: "My dashboard",
    dashboardSubtitle: "Your account, plan and usage summary.",
    accountCard: "Account",
    planCard: "Plan",
    usageCard: "Usage",
    quickActions: "Quick actions",
    role: "Role",
    adminRole: "Admin",
    userRole: "Member",
    status: "Status",
    activeStatus: "Active",
    suspendedStatus: "Suspended",
    memberSince: "Joined",
    lastLogin: "Last sign-in",
    requestsThisMonth: "AI requests this month",
    savedDiagrams: "Saved diagrams",
    dailyLimit: "Daily requests",
    monthlyLimit: "Monthly requests",
    maxDiagrams: "Diagram limit",
    unlimited: "Unlimited",
    newDiagram: "New diagram",
    adminPanel: "Admin panel",
    logout: "Sign out",
    logoutWorking: "Signing out…",
    loginRequired: "You need to sign in to view this page.",
    featuresList: "Included",
    usageHint:
        "Diagrams you save with 'Save to cloud' in the editor are listed below; your AI requests count against the plan quota.",
    myDiagrams: "My diagrams",
}

export function authText(lang: string): AuthTexts {
    return lang === "tr" ? tr : en
}
