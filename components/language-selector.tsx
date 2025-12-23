"use client"

import * as React from "react"
import { Languages, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "./language-context"
import { LanguageCode } from "@/lib/translations"

const languages: { code: LanguageCode; name: string; nativeName: string }[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "ja", name: "Japanese", nativeName: "日本語" },
    { code: "ko", name: "Korean", nativeName: "한국어" },
]

export function LanguageSelector() {
    const { language, setLanguage } = useTranslation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-3 hover:bg-muted font-medium transition-all duration-300">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline-block">
                        {languages.find((l) => l.code === language)?.nativeName}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] max-h-[300px] overflow-y-auto p-1 backdrop-blur-xl bg-background/95 border-border/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        className={`flex items-center justify-between cursor-pointer rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground ${language === lang.code ? "bg-muted font-semibold" : ""
                            }`}
                        onClick={() => setLanguage(lang.code)}
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{lang.nativeName}</span>
                            <span className="text-[10px] opacity-70 uppercase tracking-wider">{lang.name}</span>
                        </div>
                        {language === lang.code && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
