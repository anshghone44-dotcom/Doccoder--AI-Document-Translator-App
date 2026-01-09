"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, X, Volume2, Loader2, Bot, Shield, Sparkles, Languages, Zap, FileText, Download, Copy, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-context"
import { useSearchParams } from "next/navigation"
import VoiceRecorder from "./voice-recorder"
import VoiceSettings from "@/components/voice-settings"
import LanguagePicker from "@/components/language-picker"
import ModelSelector, { type AIModel } from "@/components/model-selector"

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
    const [selectedModel, setSelectedModel] = useState<AIModel>("openai/gpt-4-mini")
    const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM")
    const [autoPlay, setAutoPlay] = useState(false)
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

            const audioBuffer = await res.arrayBuffer()
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
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
        <div className="flex flex-col h-[800px] w-full max-w-5xl mx-auto relative group/chatbot">
            {/* Background Grid Effect - Subtle */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

            {/* Header Area - Discrete */}
            <div className="px-6 py-3 flex items-center justify-between relative z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/5 border border-border/50 backdrop-blur-md">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/70">Translation Engine</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="glass rounded-2xl p-1 flex items-center gap-1 border border-border/50 scale-90 origin-right">
                        <LanguagePicker
                            value={targetLang}
                            onChange={setTargetLang}
                        />
                        <div className="h-4 w-[1px] bg-border/50 mx-1" />
                        <VoiceSettings
                            selectedVoice={selectedVoice}
                            onVoiceChange={setSelectedVoice}
                            autoPlay={autoPlay}
                            onAutoPlayChange={setAutoPlay}
                        />
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 no-scrollbar relative z-10" >
                {messages.length === 1 && messages[0].role === "assistant" && messages[0].content.includes("Interface initialized") && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-[2.5rem] bg-foreground/5 flex items-center justify-center border border-foreground/10 shadow-2xl relative z-10">
                                <Languages className="h-10 w-10 text-primary" />
                            </div>
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                        </div>
                        <div className="space-y-4 max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                                {t.hero.title}
                            </h1>
                            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                                {t.hero.description}
                            </p>
                        </div>
                    </div>
                )}

                {messages.filter(m => !(messages.length === 1 && m.role === "assistant" && m.content.includes("Interface initialized"))).map((m, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "max-w-[85%] relative group transition-all duration-300",
                            m.role === "user" ? "ml-auto" : "mr-auto"
                        )}
                    >
                        <div className={cn(
                            "flex items-center gap-2 mb-2 px-1",
                            m.role === "user" ? "justify-end" : "justify-start"
                        )}>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                {m.role === "user" ? t.chatbot.userLabel : t.chatbot.assistantLabel}
                            </span>
                        </div>

                        <div
                            className={cn(
                                "px-6 py-4 rounded-[2rem] text-sm leading-relaxed shadow-sm transition-all duration-300",
                                m.role === "user"
                                    ? "bg-foreground text-background rounded-tr-sm"
                                    : "bg-card border border-border/50 text-foreground rounded-tl-sm hover:border-primary/20"
                            )}
                        >
                            <div className="whitespace-pre-wrap leading-7">{m.content}</div>

                            {m.role === "assistant" && (
                                <div className="flex items-center gap-1 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => playVoiceResponse(m.content, idx)}
                                        className={cn(
                                            "p-2 rounded-full hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground",
                                            playingMessageIndex === idx && "text-primary bg-primary/5"
                                        )}
                                        title="Play voice response"
                                    >
                                        {playingMessageIndex === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(m.content)}
                                        className="p-2 rounded-full hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground"
                                        title="Copy translation"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start max-w-[80%] animate-in fade-in duration-500">
                        <div className="px-6 py-4 rounded-[2rem] border border-border/50 flex items-center gap-4 bg-card shadow-sm">
                            <div className="relative">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                            <span className="text-sm text-foreground/70 font-bold uppercase tracking-widest">Processing...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input area redesign */}
            <div className="p-6 md:p-10 relative z-20">
                <div className="max-w-4xl mx-auto w-full">
                    <form onSubmit={handleSend} className="relative group">
                        <div className="relative flex items-end gap-2 bg-card border border-border/50 rounded-[2.5rem] p-2 shadow-2xl transition-all duration-500 focus-within:border-primary/50 focus-within:shadow-primary/5">
                            <textarea
                                placeholder="Type text to translate..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                                className="flex-1 bg-transparent min-h-[52px] max-h-[200px] py-4 px-6 outline-none text-base resize-none no-scrollbar placeholder:text-muted-foreground/30 font-medium"
                                rows={1}
                            />

                            <div className="shrink-0 mb-1">
                                <VoiceRecorder onTranscript={handleVoiceTranscript} />
                            </div>

                            <Button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all active:scale-95 shrink-0 group/send disabled:opacity-30"
                                aria-label={t.chatbot.ariaLabels.send}
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 scale-90 origin-left">
                            <ModelSelector value={selectedModel} onChange={setSelectedModel} className="bg-transparent border-none hover:bg-foreground/5" />
                        </div>
                        <div className="flex items-center gap-6 opacity-30">
                            <div className="flex items-center gap-2 text-[8px] font-bold tracking-[0.2em] uppercase">
                                <Shield className="h-3 w-3" /> Secure Connection
                            </div>
                            <div className="flex items-center gap-2 text-[8px] font-bold tracking-[0.2em] uppercase text-green-600">
                                <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> System Ready
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative BG Glows */}
            <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
        </div>
    )
}
