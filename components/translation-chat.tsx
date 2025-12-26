"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, Send, Loader2, Globe, Languages, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-context"

type Message = {
    role: "user" | "assistant"
    content: string
}

export default function TranslationChat() {
    const { t } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I am Doccoder AI. Send me any text or document content you'd like translated, and tell me the target language.",
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [targetLang, setTargetLang] = useState("English")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setMessages((prev) => [...prev, { role: "user", content: userMessage }])
        setInput("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/chat-translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }],
                    targetLanguage: targetLang,
                }),
            })

            if (!res.ok) throw new Error("Translation failed")

            const data = await res.json()
            setMessages((prev) => [...prev, data])
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "I'm sorry, I encountered an error while translating. Please try again." },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto glass-dark rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            {/* Header Area */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center border border-white/10">
                        <Zap className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-tight">Doccoder AI Translate</h3>
                        <p className="text-xs text-muted-foreground">Neural Translation Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-2xl border border-white/5">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                    >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Tamil">Tamil</option>
                    </select>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                            m.role === "user" ? "ml-auto items-end" : "items-start"
                        )}
                    >
                        <div
                            className={cn(
                                "px-6 py-4 rounded-3xl text-sm leading-relaxed",
                                m.role === "user"
                                    ? "bg-foreground text-background font-medium shadow-lg"
                                    : "glass border border-white/10 text-foreground"
                            )}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start max-w-[80%]">
                        <div className="glass px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">Doccoder is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-white/5">
                <div className="relative flex items-center gap-4">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Type text to translate..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-black/20 border-white/5 h-14 rounded-2xl pl-6 pr-14 text-sm focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground/50"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Languages className="h-5 w-5 opacity-30" />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="h-14 w-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all active:scale-95 shrink-0"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
            </form>

            <div className="absolute top-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        </div>
    )
}
