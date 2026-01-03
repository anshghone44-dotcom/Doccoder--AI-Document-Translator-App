"use client"

import * as React from "react"
import { Search, Globe, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Language {
    name: string
    nativeName: string
    code: string
    region?: string
}

const LANGUAGES: Language[] = [
    { name: "Bengali", nativeName: "বাংলা", code: "bn" },
    { name: "Chinese", nativeName: "中文", code: "zh", region: "Simplified" },
    { name: "Danish", nativeName: "Dansk", code: "da" },
    { name: "Dutch", nativeName: "Nederlands", code: "nl" },
    { name: "English", nativeName: "English", code: "en", region: "United States" },
    { name: "English", nativeName: "English", code: "en-GB", region: "United Kingdom" },
    { name: "English", nativeName: "English", code: "en-IN", region: "India" },
    { name: "Estonian", nativeName: "Eesti", code: "et" },
    { name: "Filipino", nativeName: "Filipino", code: "fil" },
    { name: "Finnish", nativeName: "Suomi", code: "fi" },
    { name: "French", nativeName: "Français", code: "fr-CA", region: "Canada" },
    { name: "French", nativeName: "Français", code: "fr-FR", region: "France" },
    { name: "German", nativeName: "Deutsch", code: "de" },
    { name: "Greek", nativeName: "Ελληνικά", code: "el" },
    { name: "Gujarati", nativeName: "ગુજરાતી", code: "gu" },
    { name: "Hindi", nativeName: "हिन्दी", code: "hi" },
    { name: "Italian", nativeName: "Italiano", code: "it" },
    { name: "Japanese", nativeName: "日本語", code: "ja" },
    { name: "Korean", nativeName: "한국어", code: "ko" },
    { name: "Marathi", nativeName: "मराठी", code: "mr" },
    { name: "Persian", nativeName: "فارسی", code: "fa", region: "Iran" },
    { name: "Portuguese", nativeName: "Português", code: "pt" },
    { name: "Russian", nativeName: "Русский", code: "ru" },
    { name: "Spanish", nativeName: "Español", code: "es" },
    { name: "Tamil", nativeName: "தமிழ்", code: "ta" },
    { name: "Telugu", nativeName: "తెలుగు", code: "te" },
    { name: "Turkish", nativeName: "Türkçe", code: "tr" },
    { name: "Vietnamese", nativeName: "Tiếng Việt", code: "vi" },
]

interface LanguagePickerProps {
    value: string
    onChange: (code: string) => void
    className?: string
}

export default function LanguagePicker({ value, onChange, className }: LanguagePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredLanguages = LANGUAGES.filter(
        (lang) =>
            lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lang.region?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedLanguage = LANGUAGES.find((l) => l.code === value) || LANGUAGES[2] // Default to US English

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "flex items-center gap-2 bg-background/40 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm h-10 transition-all hover:bg-white/5",
                        className
                    )}
                >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                        {selectedLanguage.nativeName}
                        {selectedLanguage.region && <span className="ml-1 opacity-60 text-[10px] uppercase font-mono tracking-tighter">({selectedLanguage.region})</span>}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-dark border-white/10 p-0 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-3xl">
                <DialogHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-sm font-semibold text-foreground/70">
                        Select language
                    </DialogTitle>
                    <button
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                </DialogHeader>

                <div className="flex flex-col h-[500px]">
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-0.5">
                            {filteredLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        onChange(lang.code)
                                        setOpen(false)
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all group relative",
                                        value === lang.code
                                            ? "bg-white/5"
                                            : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[16px] text-foreground tracking-tight">
                                                {lang.nativeName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-tight opacity-50">
                                            <span>{lang.name}</span>
                                            {lang.region && (
                                                <>
                                                    <span className="h-1 w-1 rounded-full bg-current opacity-30" />
                                                    <span>{lang.region}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {value === lang.code && (
                                        <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                                            <Check className="h-3.5 w-3.5 text-black stroke-[3px]" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            {filteredLanguages.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-sm font-medium text-muted-foreground">No languages found</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
                            <Input
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 bg-white/5 border-white/5 rounded-full h-12 focus-visible:ring-0 focus-visible:border-white/20 transition-all placeholder:text-muted-foreground/30 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
