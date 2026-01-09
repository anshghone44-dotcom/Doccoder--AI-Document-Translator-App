"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, Send, Loader2, Globe, Languages, Zap, Copy, Paperclip, X, FileText, Sparkles, Download, Volume2, Bot, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-context"
import ModelSelector, { type AIModel } from "@/components/model-selector"
import VoiceSettings from "@/components/voice-settings"
import VoiceRecorder from "@/components/voice-recorder"

type Message = {
    role: "user" | "assistant"
    content: string
    files?: { name: string; url?: string; type?: string }[]
    downloadUrl?: string
    filename?: string
}


export default function DocChatbot() {
    const { t, language, setLanguage } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([])

    // Update initial message when language changes and only welcome message exists
    useEffect(() => {
        setMessages(prev => {
            if (prev.length === 0) {
                return [{
                    role: "assistant",
                    content: t.chatbot.welcome,
                }]
            }
            if (prev.length === 1 && prev[0].role === "assistant" && prev[0].content !== t.chatbot.welcome) {
                return [{
                    role: "assistant",
                    content: t.chatbot.welcome,
                }]
            }
            return prev
        })
    }, [t.chatbot.welcome])
    const [input, setInput] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [targetLang, setTargetLang] = useState(language)

    // Sync local targetLang with global language
    useEffect(() => {
        setTargetLang(language)
    }, [language])
    const [selectedModel, setSelectedModel] = useState<AIModel>("openai/gpt-4-mini")
    const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM") // Rachel
    const [autoPlay, setAutoPlay] = useState(false)
    const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const playingMessageIndexRef = useRef<number | null>(null)

    // Sync ref with state
    useEffect(() => {
        playingMessageIndexRef.current = playingMessageIndex
    }, [playingMessageIndex])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    const handlePlayTTS = useCallback(async (text: string, index: number) => {
        if (playingMessageIndexRef.current === index) {
            audioRef.current?.pause()
            setPlayingMessageIndex(null)
            return
        }

        setPlayingMessageIndex(index)
        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, voiceId: selectedVoice }),
            })

            if (!res.ok) throw new Error("TTS failed")

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)

            if (audioRef.current) {
                audioRef.current.src = url
                audioRef.current.play()
                audioRef.current.onended = () => setPlayingMessageIndex(null)
            } else {
                const audio = new Audio(url)
                audioRef.current = audio
                audio.play()
                audio.onended = () => setPlayingMessageIndex(null)
            }
        } catch (err) {
            console.error("TTS Error:", err)
            setPlayingMessageIndex(null)
        }
    }, [selectedVoice])

    useEffect(() => {
        if (autoPlay && messages.length > 0) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage.role === "assistant" && !isLoading) {
                handlePlayTTS(lastMessage.content, messages.length - 1)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlay, handlePlayTTS, isLoading, messages.length])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if ((!input.trim() && files.length === 0) || isLoading) return

        const userMessage = input.trim() || (files.length > 0 ? t.chatbot.processAndTranslate : "")
        const currentFiles = [...files]

        setMessages(prev => [...prev, {
            role: "user",
            content: userMessage,
            files: currentFiles.map(f => ({ name: f.name, type: f.type }))
        }])

        setInput("")
        setFiles([])
        setIsLoading(true)

        try {
            if (currentFiles.length > 0) {
                // Handle file translation/transformation
                const form = new FormData()
                form.set("prompt", userMessage)
                form.set("targetLanguage", targetLang)
                form.set("aiModel", selectedModel)
                currentFiles.forEach(f => form.append("files", f, f.name))

                const res = await fetch("/api/transform", {
                    method: "POST",
                    body: form,
                })

                if (!res.ok) throw new Error("Processing failed")

                const blob = await res.blob()
                const objectUrl = URL.createObjectURL(blob)

                let filename = "translated-output.pdf"
                const cd = res.headers.get("Content-Disposition") || ""
                const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i)
                if (match) {
                    filename = decodeURIComponent(match[1] || match[2])
                }

                // Try to get dynamic assistant message from header
                const headerMsg = res.headers.get("X-Assistant-Message")
                const assistantMessage = headerMsg ? decodeURIComponent(headerMsg) : t.chatbot.processingComplete

                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: assistantMessage,
                    downloadUrl: objectUrl,
                    filename
                }])
            } else {
                // Handle plain text translation
                const res = await fetch("/api/chat-translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: [...messages, { role: "user", content: userMessage }],
                        targetLanguage: targetLang, // Passing the code directly, or could map if needed
                        model: selectedModel,
                    }),
                })

                if (!res.ok) throw new Error("Translation failed")

                const data = await res.json()
                setMessages(prev => [...prev, data])
            }
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: t.chatbot.error },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[900px] w-full max-w-5xl mx-auto relative group/chatbot">
            {/* Background Grid Effect - Subtle */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

            {/* Header / Control Bar - More Discrete */}
            <div className="px-6 py-3 flex items-center justify-between relative z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/5 border border-border/50 backdrop-blur-md">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/70">{t.chatbot.architect}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="glass rounded-2xl p-1 flex items-center gap-1 border border-border/50 scale-90 origin-right">
                        <ModelSelector value={selectedModel} onChange={setSelectedModel} />
                        <div className="h-4 w-[1px] bg-border/50 mx-1" />
                        <VoiceRecorder onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))} />
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
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 no-scrollbar scroll-smooth relative z-10">
                {messages.length === 1 && messages[0].role === "assistant" && messages[0].content === t.chatbot.welcome && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                        <div className="relative group/logo transition-transform duration-500 hover:scale-110">
                            <h1
                                className="text-5xl md:text-6xl font-black tracking-tighter text-foreground group-hover/logo:text-primary transition-colors duration-500"
                                style={{ fontFamily: "var(--font-bodoni)" }}
                            >
                                Doccoder
                            </h1>
                        </div>
                        <div className="space-y-4 max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                                {language === "en" ? "How can i help you today?" : t.chatbot.welcome}
                            </h1>
                            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                                {language === "en" ? "I can help you translate documents, sync data, or provide contextual analysis." : ""}
                            </p>
                        </div>
                    </div>
                )}

                {messages.filter(m => !(messages.length === 1 && m.role === "assistant" && m.content === t.chatbot.welcome)).map((m, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-700",
                            m.role === "user" ? "ml-auto items-end" : "items-start"
                        )}
                    >
                        <div
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

                                {m.files && m.files.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border/10 flex flex-wrap gap-2">
                                        {m.files.map((file, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/5 border border-border/10 text-[10px] font-bold uppercase tracking-widest">
                                                <FileText className="h-3 w-3 text-primary" />
                                                {file.name}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {m.downloadUrl && (
                                    <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-primary/10">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-xs font-bold truncate">{m.filename}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t.chatbot.processedDocument}</div>
                                                </div>
                                            </div>
                                            <a
                                                href={m.downloadUrl}
                                                download={m.filename}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background font-bold text-[10px] tracking-widest uppercase hover:opacity-90 transition-opacity whitespace-nowrap"
                                            >
                                                <Download className="h-3 w-3" />
                                                {t.chatbot.download}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {m.role === "assistant" && (
                                <div className="flex items-center gap-1 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handlePlayTTS(m.content, idx)}
                                        className={cn(
                                            "p-2 rounded-full hover:bg-foreground/5 transition-all",
                                            playingMessageIndex === idx && "text-primary bg-primary/5"
                                        )}
                                        title="Play Synthesis"
                                    >
                                        {playingMessageIndex === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(m.content)}
                                        className="p-2 rounded-full hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground"
                                        title="Copy to terminal"
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
                            <span className="text-sm text-foreground/70 font-bold uppercase tracking-widest">{t.chatbot.processing}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input / Upload Area - Fixed Pill Design */}
            <div className="p-6 md:p-10 relative z-20">
                <div className="max-w-4xl mx-auto w-full">
                    {files.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-300">
                            {files.map((file, i) => (
                                <div key={i} className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 border border-white/10 text-xs font-medium">
                                    <FileText className="h-3.5 w-3.5 opacity-50" />
                                    <span className="max-w-[150px] truncate">{file.name}</span>
                                    <button
                                        onClick={() => removeFile(i)}
                                        className="p-1 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
                                        aria-label={t.chatbot.ariaLabels.remove}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSend} className="relative group">
                        <div className="relative flex items-end gap-2 bg-card border border-border/50 rounded-[2.5rem] p-2 shadow-2xl transition-all duration-500 focus-within:border-primary/50 focus-within:shadow-primary/5">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={onFilesSelected}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-12 w-12 rounded-full hover:bg-foreground/5 hover:text-primary transition-all active:scale-95 group/upload"
                                aria-label={t.chatbot.ariaLabels.upload}
                            >
                                <Paperclip className="h-5 w-5 transition-transform group-hover/upload:rotate-12" />
                            </Button>

                            <textarea
                                placeholder={t.chatbot.placeholder}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                                className="flex-1 bg-transparent min-h-[52px] max-h-[200px] py-4 px-4 outline-none text-base resize-none no-scrollbar placeholder:text-muted-foreground/30 font-medium"
                                rows={1}
                            />

                            <Button
                                type="submit"
                                disabled={(!input.trim() && files.length === 0) || isLoading}
                                className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all active:scale-95 shrink-0 group/send disabled:opacity-30"
                                aria-label={t.chatbot.ariaLabels.send}
                            >
                                <Send className="h-5 w-5 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Decorative BG Glows - More Subtle */}
                <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
            </div>
        </div>
    )
}
