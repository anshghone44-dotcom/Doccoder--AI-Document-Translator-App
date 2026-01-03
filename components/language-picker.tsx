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
    { name: "Danish", nativeName: "Dansk", code: "da" },
    { name: "Dutch", nativeName: "Nederlands", code: "nl" },
    { name: "English", nativeName: "English", code: "en", region: "United States" },
    { name: "English", nativeName: "English", code: "en-GB", region: "United Kingdom" },
    { name: "Estonian", nativeName: "Eesti", code: "et" },
    { name: "Filipino", nativeName: "Filipino", code: "fil" },
    { name: "Finnish", nativeName: "Suomi", code: "fi" },
    { name: "French", nativeName: "Français", code: "fr-CA", region: "Canada" },
    { name: "French", nativeName: "Français", code: "fr-FR", region: "France" },
    { name: "German", nativeName: "Deutsch", code: "de" },
    { name: "Hindi", nativeName: "हिन्दी", code: "hi" },
    { name: "Marathi", nativeName: "मराठी", code: "mr" },
    { name: "Gujarati", nativeName: "ગુજરાતી", code: "gu" },
    { name: "Bengali", nativeName: "বাংলা", code: "bn" },
    { name: "Japanese", nativeName: "日本語", code: "ja" },
    { name: "Korean", nativeName: "한국어", code: "ko" },
    { name: "Chinese", nativeName: "中文", code: "zh", region: "Simplified" },
    { name: "Spanish", nativeName: "Español", code: "es" },
    { name: "Italian", nativeName: "Italiano", code: "it" },
    { name: "Portuguese", nativeName: "Português", code: "pt" },
    { name: "Russian", nativeName: "Русский", code: "ru" },
    { name: "Arabic", nativeName: "العربية", code: "ar" },
    { name: "Turkish", nativeName: "Türkçe", code: "tr" },
    { name: "Vietnamese", nativeName: "Tiếng Việt", code: "vi" },
    { name: "Tamil", nativeName: "தமிழ்", code: "ta" },
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
            <DialogContent className="sm:max-w-[425px] glass-dark border-white/10 p-0 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-2xl">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-lg font-black uppercase tracking-widest italic flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Select Language
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-6 pt-2 space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search languages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 rounded-2xl h-12 focus-visible:ring-primary/50 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    <ScrollArea className="h-[350px] pr-4 -mr-4">
                        <div className="space-y-1">
                            {filteredLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        onChange(lang.code)
                                        setOpen(false)
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-2xl transition-all group",
                                        value === lang.code
                                            ? "bg-primary/20 text-primary border border-primary/20"
                                            : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm tracking-tight">{lang.nativeName}</span>
                                            {lang.region && (
                                                <span className="text-[10px] font-mono uppercase opacity-40 group-hover:opacity-60 transition-opacity">
                                                    {lang.region}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] opacity-60 font-medium">
                                            {lang.name} {lang.region && <span className="italic font-normal">({lang.region})</span>}
                                        </span>
                                    </div>
                                    {value === lang.code && (
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                            <Check className="h-4 w-4 text-primary-foreground stroke-[3px]" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            {filteredLanguages.length === 0 && (
                                <div className="py-12 text-center space-y-2">
                                    <div className="bg-white/5 h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Globe className="h-6 w-6 text-muted-foreground opacity-20" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">No languages found</p>
                                    <p className="text-xs text-muted-foreground/60">Try searching for something else</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
