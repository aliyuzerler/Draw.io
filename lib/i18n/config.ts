export const i18n = {
    defaultLocale: "tr",
    locales: ["tr", "en", "zh", "ja", "zh-Hant"],
} as const

export type Locale = (typeof i18n)["locales"][number]
