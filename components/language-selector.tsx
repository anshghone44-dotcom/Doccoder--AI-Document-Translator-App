"use client"

import * as React from "react"
import { Languages, Check, ChevronDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "./ui/dropdown-menu"
import { useTranslation } from "./language-context"
import { LanguageCode } from "@/lib/translations"

const languages: { code: LanguageCode; name: string; nativeName: string }[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "ja", name: "Japanese", nativeName: "日本語" },
    { code: "ko", name: "Korean", nativeName: "한국어" },
]

export function LanguageSelector() {
    const { language, setLanguage, t } = useTranslation()
    const [open, setOpen] = React.useState(false)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 h-9 px-3 hover:bg-muted font-medium transition-all duration-300 relative group border border-transparent hover:border-border/50 shadow-sm"
                >
                    <div className="relative">
                        <Languages className="h-4 w-4 transition-all duration-300 group-hover:opacity-0 group-hover:scale-50" />
                        <Star className="h-4 w-4 absolute inset-0 transition-all duration-300 text-yellow-500 fill-yellow-500 opacity-0 scale-50 rotate-0 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-[72deg]" />
                    </div>
                    <span className="hidden sm:inline-block border-r border-border/30 pr-2 mr-1">
                        {languages.find((l) => l.code === language)?.nativeName}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 opacity-60 group-hover:opacity-100 ${open ? "rotate-180" : ""}`} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] max-h-[300px] overflow-y-auto p-1 backdrop-blur-xl bg-background/95 border-border/40 shadow-2xl">
                <DropdownMenuLabel className="text-xs font-semibold opacity-70 px-3 py-2">
                    {t.nav.selectLanguage}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-1" />
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        className={`flex items-center justify-between cursor-pointer rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground ${language === lang.code ? "bg-muted font-semibold" : ""
                            }`}
                        onSelect={() => setLanguage(lang.code)}
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
