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
    category: "Popular" | "Americas" | "Europe" | "Asia-Pacific" | "Middle East" | "Global"
}

const LANGUAGES: Language[] = [
    { name: "English", nativeName: "English", code: "en", region: "United States", category: "Popular" },
    { name: "Hindi", nativeName: "हिन्दी", code: "hi", category: "Popular" },
    { name: "Spanish", nativeName: "Español", code: "es", category: "Popular" },
    { name: "Chinese", nativeName: "中文", code: "zh", region: "Simplified", category: "Popular" },
    { name: "French", nativeName: "Français", code: "fr-FR", region: "France", category: "Popular" },

    { name: "English", nativeName: "English", code: "en-GB", region: "United Kingdom", category: "Europe" },
    { name: "German", nativeName: "Deutsch", code: "de", category: "Europe" },
    { name: "French", nativeName: "Français", code: "fr-CA", region: "Canada", category: "Americas" },
    { name: "Italian", nativeName: "Italiano", code: "it", category: "Europe" },
    { name: "Dutch", nativeName: "Nederlands", code: "nl", category: "Europe" },
    { name: "Russian", nativeName: "Русский", code: "ru", category: "Europe" },
    { name: "Greek", nativeName: "Ελληνικά", code: "el", category: "Europe" },
    { name: "Danish", nativeName: "Dansk", code: "da", category: "Europe" },
    { name: "Finnish", nativeName: "Suomi", code: "fi", category: "Europe" },
    { name: "Estonian", nativeName: "Eesti", code: "et", category: "Europe" },

    { name: "Japanese", nativeName: "日本語", code: "ja", category: "Asia-Pacific" },
    { name: "Korean", nativeName: "한국어", code: "ko", category: "Asia-Pacific" },
    { name: "Marathi", nativeName: "मराठी", code: "mr", category: "Asia-Pacific" },
    { name: "Gujarati", nativeName: "ગુજરાતી", code: "gu", category: "Asia-Pacific" },
    { name: "Bengali", nativeName: "বাংলা", code: "bn", category: "Asia-Pacific" },
    { name: "Tamil", nativeName: "தமிழ்", code: "ta", category: "Asia-Pacific" },
    { name: "Telugu", nativeName: "తెలుగు", code: "te", category: "Asia-Pacific" },
    { name: "Vietnamese", nativeName: "Tiếng Việt", code: "vi", category: "Asia-Pacific" },
    { name: "Filipino", nativeName: "Filipino", code: "fil", category: "Asia-Pacific" },

    { name: "Persian", nativeName: "فارسی", code: "fa", region: "Iran", category: "Middle East" },
    { name: "Turkish", nativeName: "Türkçe", code: "tr", category: "Middle East" },
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

                <div className="flex flex-col h-[600px] relative overflow-hidden">
                    {/* Data Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {["Popular", "Europe", "Asia-Pacific", "Americas", "Middle East"].map((cat) => {
                                const catLangs = filteredLanguages.filter(l => l.category === cat)
                                if (catLangs.length === 0) return null

                                return (
                                    <div key={cat} className="space-y-3">
                                        <div className="flex items-center gap-3 px-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 font-mono">
                                                [{cat === 'Popular' ? 'Priority_Nodes' : cat.replace('-', '_').toUpperCase()}]
                                            </span>
                                            <div className="h-[1px] flex-1 bg-white/5" />
                                        </div>

                                        <div className="grid grid-cols-1 gap-1">
                                            {catLangs.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        onChange(lang.code)
                                                        setOpen(false)
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-4 rounded-xl transition-all group relative border border-transparent",
                                                        value === lang.code
                                                            ? "bg-white/5 border-white/10 shadow-lg"
                                                            : "hover:bg-white/5 hover:border-white/5"
                                                    )}
                                                >
                                                    <div className="flex flex-col items-start gap-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-[17px] text-foreground tracking-tight">
                                                                {lang.nativeName}
                                                            </span>
                                                            <span className="text-[10px] font-mono opacity-20 uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded leading-none">
                                                                {lang.code}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.05em] opacity-40 font-mono">
                                                            <span>{lang.name}</span>
                                                            {lang.region && (
                                                                <>
                                                                    <span className="opacity-30 self-center">|</span>
                                                                    <span>{lang.region}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {value === lang.code && (
                                                        <div className="h-6 w-6 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                                                            <Check className="h-3.5 w-3.5 text-primary stroke-[3px]" />
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
                                    <div className="inline-flex p-4 rounded-full bg-white/5 animate-pulse">
                                        <Search className="h-8 w-8 text-muted-foreground/20" />
                                    </div>
                                    <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground/40">No matching nodes found</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md relative overflow-hidden">
                        {/* Terminal Scanning Effect */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 animate-scan pointer-events-none" />

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-500" />
                            <Input
                                placeholder="PROTOCOL SEARCH / ENTER QUERY"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 bg-white/5 border-white/5 rounded-xl h-12 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/20 transition-all duration-500 placeholder:text-muted-foreground/20 text-xs font-mono tracking-widest"
                            />
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
