"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { translations, LanguageCode, TranslationType } from "@/lib/translations"

type LanguageContextType = {
    language: LanguageCode
    setLanguage: (lang: LanguageCode) => void
    t: TranslationType
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>("en")

    useEffect(() => {
        const savedLanguage = localStorage.getItem("app-language") as LanguageCode
        if (savedLanguage && translations[savedLanguage]) {
            setLanguageState(savedLanguage)
        }
    }, [])

    const setLanguage = (lang: LanguageCode) => {
        setLanguageState(lang)
        localStorage.setItem("app-language", lang)
        document.documentElement.lang = lang
    }

    const t = translations[language]

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useTranslation must be used within a LanguageProvider")
    }
    return context
}
