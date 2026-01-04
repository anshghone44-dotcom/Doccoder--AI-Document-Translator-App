"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, Send, Loader2, Globe, Languages, Zap, Copy, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-context"
import { useSearchParams } from "next/navigation"
import VoiceRecorder from "./voice-recorder"
import VoiceSettings from "@/components/voice-settings"
import LanguagePicker from "@/components/language-picker"

type Message = {
    role: "user" | "assistant"
    content: string
}

export default function TranslationChat() {
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Interface initialized. Advanced document synthesis and high-precision translation protocols are active. Input source text or document content to begin processing.",
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [targetLang, setTargetLang] = useState(searchParams.get('lang') || "English")
    const [selectedModel, setSelectedModel] = useState("GPT-4o")
    const scrollRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null)

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    const handleVoiceTranscript = (text: string) => {
        setInput(text)
        // Optionally auto-send the voice input
        // handleSend()
    }

    const playVoiceResponse = async (content: string, index: number) => {
        if (playingMessageIndex === index) {
            // Stop playing
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
            setPlayingMessageIndex(null)
            return
        }

        try {
            setPlayingMessageIndex(index)
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: content }),
            })

            if (!res.ok) throw new Error("TTS failed")

            const audioBlob = await res.blob()
            const audioUrl = URL.createObjectURL(audioBlob)

            if (audioRef.current) {
                audioRef.current.pause()
            }

            audioRef.current = new Audio(audioUrl)
            audioRef.current.onended = () => setPlayingMessageIndex(null)
            audioRef.current.play()
        } catch (error) {
            console.error("TTS error:", error)
            setPlayingMessageIndex(null)
        }
    }

    const AI_MODELS = [
        { id: "gpt-5", name: "GPT-5", provider: "OpenAI" },
        { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
        { id: "grok-3", name: "Grok-3", provider: "X.AI" },
        { id: "grok-4", name: "Grok-4", provider: "X.AI" },
        { id: "claude-sonnet-4", name: "Claude Sonnet-4", provider: "Anthropic" },
        { id: "claude-sonnet-4.5", name: "Claude Sonnet-4.5", provider: "Anthropic" },
        { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek" },
        { id: "deepseek-r3", name: "DeepSeek R3", provider: "DeepSeek" },
        { id: "qwen-3", name: "Qwen 3", provider: "Alibaba" },
        { id: "gemini-2.5", name: "Gemini-2.5", provider: "Google" },
        { id: "gemini-3", name: "Gemini-3", provider: "Google" },
    ]

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                URL.revokeObjectURL(audioRef.current.src)
            }
        }
    }, [])

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
                    model: selectedModel,
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
                    <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/10">
                        <Globe className="h-5 w-5 text-foreground/70" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">Translation Engine</h3>
                        <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest">Enterprise Protocol v4.2</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-xl border border-foreground/10">
                        <Zap className="h-4 w-4 text-primary" />
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none cursor-pointer text-foreground"
                        >
                            {AI_MODELS.map(model => (
                                <option key={model.id} value={model.id} className="bg-background">
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <LanguagePicker
                        value={targetLang}
                        onChange={setTargetLang}
                    />
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar" >
                {
                    messages.map((m, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex flex-col max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                                m.role === "user" ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "px-6 py-4 rounded-3xl text-sm leading-relaxed relative group",
                                    m.role === "user"
                                        ? "bg-foreground text-background font-medium shadow-lg"
                                        : "glass border border-white/10 text-foreground"
                                )}
                            >
                                {m.content}
                                {m.role === "assistant" && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => playVoiceResponse(m.content, idx)}
                                            className="p-1 rounded bg-black/20 hover:bg-black/40"
                                            title="Play voice response"
                                        >
                                            <Volume2 className={cn("h-3 w-3", playingMessageIndex === idx ? "text-primary" : "")} />
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(m.content)}
                                            className="p-1 rounded bg-black/20 hover:bg-black/40"
                                            title="Copy translation"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                }
                {
                    isLoading && (
                        <div className="flex items-start max-w-[80%]">
                            <div className="glass px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-3">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground font-medium">Doccoder is thinking...</span>
                            </div>
                        </div>
                    )
                }
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-white/5" >
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
                    <VoiceRecorder onTranscript={handleVoiceTranscript} />
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
