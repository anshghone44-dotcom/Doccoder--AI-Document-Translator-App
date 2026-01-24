"use client"

import * as React from "react"
import { Search, Globe, X, Check, Terminal, Cpu, Zap } from "lucide-react"
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
    category: string
}

const LANGUAGES: Language[] = [
    // Most Popular
    { name: "English", nativeName: "English", code: "en", region: "United States", category: "most-popular" },
    { name: "Spanish", nativeName: "Español", code: "es", category: "most-popular" },
    { name: "French", nativeName: "Français", code: "fr-FR", region: "France", category: "most-popular" },
    { name: "German", nativeName: "Deutsch", code: "de", category: "most-popular" },
    { name: "Chinese", nativeName: "中文", code: "zh", region: "Simplified", category: "most-popular" },

    // Europe
    { name: "English", nativeName: "English", code: "en-GB", region: "United Kingdom", category: "europe" },
    { name: "Danish", nativeName: "Dansk", code: "da", category: "europe" },
    { name: "Dutch", nativeName: "Nederlands", code: "nl", category: "europe" },
    { name: "Estonian", nativeName: "Eesti", code: "et", category: "europe" },
    { name: "Finnish", nativeName: "Suomi", code: "fi", category: "europe" },
    { name: "Greek", nativeName: "Ελληνικά", code: "el", category: "europe" },
    { name: "Italian", nativeName: "Italiano", code: "it", category: "europe" },
    { name: "Portuguese", nativeName: "Português", code: "pt", category: "europe" },
    { name: "Russian", nativeName: "Русский", code: "ru", category: "europe" },
    { name: "Turkish", nativeName: "Türkçe", code: "tr", category: "europe" },

    // Asia-Pacific
    { name: "Bengali", nativeName: "বাংলা", code: "bn", category: "asia-pacific" },
    { name: "English", nativeName: "English", code: "en-IN", region: "India", category: "asia-pacific" },
    { name: "Filipino", nativeName: "Filipino", code: "fil", category: "asia-pacific" },
    { name: "Gujarati", nativeName: "ગુજરાતી", code: "gu", category: "asia-pacific" },
    { name: "Hindi", nativeName: "हिन्दी", code: "hi", category: "asia-pacific" },
    { name: "Japanese", nativeName: "日本語", code: "ja", category: "asia-pacific" },
    { name: "Korean", nativeName: "한국어", code: "ko", category: "asia-pacific" },
    { name: "Marathi", nativeName: "मराठी", code: "mr", category: "asia-pacific" },
    { name: "Persian", nativeName: "فارسی", code: "fa", region: "Iran", category: "asia-pacific" },
    { name: "Tamil", nativeName: "தமிழ்", code: "ta", category: "asia-pacific" },
    { name: "Telugu", nativeName: "తెలుగు", code: "te", category: "asia-pacific" },
    { name: "Vietnamese", nativeName: "Tiếng Việt", code: "vi", category: "asia-pacific" },

    // Americas
    { name: "French", nativeName: "Français", code: "fr-CA", region: "Canada", category: "americas" },
]

const CATEGORY_LABELS = {
    "most-popular": "Most Popular",
    "europe": "Europe",
    "asia-pacific": "Asia-Pacific",
    "americas": "Americas"
}

const CATEGORY_ICONS = {
    "most-popular": Zap,
    "europe": Globe,
    "asia-pacific": Cpu,
    "americas": Terminal
}

interface LanguagePickerProps {
    value: string
    onChange: (code: string) => void
    className?: string
}

export default function LanguagePicker({ value, onChange, className }: LanguagePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

    const filteredLanguages = LANGUAGES.filter(
        (lang) =>
            lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lang.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lang.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const groupedLanguages = React.useMemo(() => {
        const grouped: Record<string, Language[]> = {}
        filteredLanguages.forEach(lang => {
            if (!grouped[lang.category]) {
                grouped[lang.category] = []
            }
            grouped[lang.category].push(lang)
        })
        return grouped
    }, [filteredLanguages])

    const selectedLanguage = LANGUAGES.find((l) => l.code === value) || LANGUAGES[0]

    const highlightText = (text: string, query: string) => {
        if (!query) return text
        const regex = new RegExp(`(${query})`, 'gi')
        const parts = text.split(regex)
        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-primary/20 text-primary font-semibold">
                    {part}
                </span>
            ) : part
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "flex items-center gap-2 bg-background/40 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm h-10 transition-all hover:bg-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
                        className
                    )}
                >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                        {selectedLanguage.nativeName}
                        {selectedLanguage.region && (
                            <span className="ml-1 opacity-60 text-[10px] uppercase font-mono tracking-tighter">
                                ({selectedLanguage.region})
                            </span>
                        )}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] glass-dark border-white/10 p-0 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-3xl noise">
                <DialogHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-background/80 to-background/60">
                    <DialogTitle className="text-sm font-semibold text-foreground/70 font-mono tracking-wider">
                        LANGUAGE PROTOCOL v4.2
                    </DialogTitle>
                    <button
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors hover:scale-110"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                </DialogHeader>

                <div className="flex flex-col h-[600px]">
                    {/* Terminal-style search */}
                    <div className="p-6 border-b border-white/5 bg-black/20">
                        <div className="relative group">
                            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="> search languages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 bg-black/20 border-white/10 rounded-lg h-12 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/50 text-sm font-mono"
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {Object.entries(groupedLanguages).map(([category, languages]) => {
                                const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                                return (
                                    <div key={category} className="space-y-3">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <IconComponent className="h-4 w-4 text-primary" />
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground/80 font-mono tracking-wider uppercase">
                                                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                                            </h3>
                                            <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {languages.length}
                                            </span>
                                            <div className="h-[1px] flex-1 bg-white/5" />
                                        </div>

                                        <div className="grid gap-1">
                                            {languages.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        onChange(lang.code)
                                                        setOpen(false)
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-4 rounded-xl transition-all group relative overflow-hidden",
                                                        "hover:bg-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                                                        "border border-transparent",
                                                        value === lang.code
                                                            ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/10"
                                                            : ""
                                                    )}
                                                >
                                                    {/* Data grid background effect */}
                                                    <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.02)_50%,transparent_100%)] bg-[length:20px_20px]" />
                                                        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_0%,rgba(255,255,255,0.02)_50%,transparent_100%)] bg-[length:20px_20px]" />
                                                    </div>

                                                    <div className="flex flex-col items-start gap-1 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-[16px] text-foreground tracking-tight">
                                                                {highlightText(lang.nativeName, searchQuery)}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-primary/60 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                                {lang.code}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                                                            <span>{highlightText(lang.name, searchQuery)}</span>
                                                            {lang.region && (
                                                                <>
                                                                    <span className="h-1 w-1 rounded-full bg-current opacity-30" />
                                                                    <span className="opacity-60">{highlightText(lang.region, searchQuery)}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {value === lang.code && (
                                                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 relative z-10">
                                                            <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3px]" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}

                            {filteredLanguages.length === 0 && (
                                <div className="py-20 text-center space-y-4">
                                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mx-auto">
                                        <Terminal className="h-8 w-8 text-primary/60" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground font-mono">
                                            NO MATCHES FOUND
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">
                                            Try adjusting your search query
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Protocol Status Footer */}
                    <div className="p-4 border-t border-white/5 bg-gradient-to-r from-background/60 to-background/40">
                        <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
                            <div className="flex items-center gap-4">
                                <span className="text-primary/60">AI CONTEXT:</span>
                                <span className="text-foreground/70">MULTILINGUAL</span>
                                <div className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
                            </div>
                            <div className="text-muted-foreground/50">
                                PROTOCOL v4.2 • {filteredLanguages.length} LANGUAGES
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between opacity-30">
                            <div className="text-[8px] font-black uppercase tracking-[0.2em] font-mono">
                                System Status: Multilingual_Ready
                            </div>
                            <div className="text-[8px] font-black uppercase tracking-[0.2em] font-mono">
                                AI_CORE: v42.0.1
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
