"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, Send, Loader2, Globe, Languages, Zap, Copy, Paperclip, X, FileText, Sparkles, Download, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-context"
import ModelSelector, { type AIModel } from "@/components/model-selector"
import VoiceSettings from "@/components/voice-settings"
import LanguagePicker from "@/components/language-picker"

type Message = {
    role: "user" | "assistant"
    content: string
    files?: { name: string; url?: string; type?: string }[]
    downloadUrl?: string
    filename?: string
}


export default function DocChatbot() {
    const { t } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "NEURAL ENGINE INITIALIZED: Doccoder Advanced Context Engine is online. High-fidelity document synthesis and technical translation protocols are active. Optimized for complex enterprise documentation and architectural integrity.",
        },
    ])
    const [input, setInput] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [targetLang, setTargetLang] = useState("en")
    const [selectedModel, setSelectedModel] = useState<AIModel>("openai/gpt-5")
    const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM") // Rachel
    const [autoPlay, setAutoPlay] = useState(false)
    const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

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

    const handlePlayTTS = async (text: string, index: number) => {
        if (playingMessageIndex === index) {
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
    }

    useEffect(() => {
        if (autoPlay && messages.length > 0) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage.role === "assistant" && !isLoading) {
                handlePlayTTS(lastMessage.content, messages.length - 1)
            }
        }
    }, [messages.length, isLoading])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if ((!input.trim() && files.length === 0) || isLoading) return

        const userMessage = input.trim() || (files.length > 0 ? `Process and translate ${files.length} document(s)` : "")
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
                form.set("prompt", userMessage + ` (Target Language: ${targetLang})`)
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

                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: `NEURAL PROCESSING COMPLETE. Translated document(s) have been synthesized. Model: ${selectedModel}. Integrity: 99.9%.`,
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
                { role: "assistant", content: "CRITICAL ERROR: Neural link disrupted. Failed to process translation request. Please check connectivity and retry." },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[700px] w-full max-w-5xl mx-auto glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative noise">
            {/* Header / Control Bar */}
            <div className="p-6 border-b border-white/5 bg-background/40 backdrop-blur-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-white/10">
                        <Zap className="h-5 w-5 text-foreground/50" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground opacity-50">Interface Control Panel</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-foreground/80">
                        <ModelSelector value={selectedModel} onChange={setSelectedModel} />

                        <VoiceSettings
                            selectedVoice={selectedVoice}
                            onVoiceChange={setSelectedVoice}
                            autoPlay={autoPlay}
                            onAutoPlayChange={setAutoPlay}
                        />

                        <LanguagePicker
                            value={targetLang}
                            onChange={setTargetLang}
                        />
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-700",
                            m.role === "user" ? "ml-auto items-end" : "items-start"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-2 opacity-50">
                            <div className={cn("h-1.5 w-1.5 rounded-full", m.role === "user" ? "bg-primary" : "bg-foreground")} />
                            <span className="text-[10px] font-mono uppercase tracking-tighter">
                                {m.role === "user" ? "Authorized User" : m.role.toUpperCase()}
                            </span>
                        </div>

                        <div
                            className={cn(
                                "px-8 py-5 rounded-[2rem] text-sm leading-relaxed relative group shadow-lg transition-all duration-300",
                                m.role === "user"
                                    ? "bg-foreground text-background font-medium hover:scale-[1.01]"
                                    : "glass border border-white/10 text-foreground hover:bg-white/5"
                            )}
                        >
                            <div className="whitespace-pre-wrap">{m.content}</div>

                            {m.files && m.files.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                                    {m.files.map((file, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/5 text-xs">
                                            <FileText className="h-3.5 w-3.5" />
                                            {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {m.downloadUrl && (
                                <div className="mt-6 flex flex-col gap-4 p-4 rounded-2xl bg-foreground/5 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-500/10">
                                                <FileText className="h-5 w-5 text-green-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold">{m.filename}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">Neural Output Alpha</div>
                                            </div>
                                        </div>
                                        <a
                                            href={m.downloadUrl}
                                            download={m.filename}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-bold text-xs hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            DOWNLOAD
                                        </a>
                                    </div>
                                </div>
                            )}

                            {m.role === "assistant" && (
                                <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                                    <button
                                        onClick={() => handlePlayTTS(m.content, idx)}
                                        className={cn(
                                            "opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 border border-white/10",
                                            playingMessageIndex === idx && "opacity-100 bg-primary/20 text-primary border-primary/50"
                                        )}
                                        title="Play Synthesis"
                                    >
                                        {playingMessageIndex === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(m.content)}
                                        className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 border border-white/10"
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
                        <div className="glass px-8 py-5 rounded-[2rem] border border-white/10 flex items-center gap-4 bg-white/5">
                            <div className="relative">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <div className="absolute inset-0 bg-primary/20 blur-lg" />
                            </div>
                            <span className="text-sm text-foreground/70 font-mono italic tracking-tight">ENGINE PROCESSING...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input / Upload Area */}
            <div className="p-8 border-t border-white/5 bg-background/40 backdrop-blur-xl">
                {files.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-300">
                        {files.map((file, i) => (
                            <div key={i} className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 border border-white/10 text-xs font-medium">
                                <FileText className="h-3.5 w-3.5 opacity-50" />
                                <span className="max-w-[150px] truncate">{file.name}</span>
                                <button
                                    onClick={() => removeFile(i)}
                                    className="p-1 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSend} className="relative group">
                    <div className="absolute inset-0 bg-foreground/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex items-end gap-3 glass-dark border-white/10 rounded-[2rem] p-3 shadow-2xl transition-all duration-500 group-focus-within:border-primary/50 group-focus-within:shadow-primary/5">
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
                            className="h-12 w-12 rounded-2xl hover:bg-foreground/5 hover:text-primary transition-all active:scale-95 group/upload"
                        >
                            <Paperclip className="h-5 w-5 transition-transform group-hover/upload:rotate-12" />
                        </Button>

                        <textarea
                            placeholder="Input directives or upload files for neural processing..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            className="flex-1 bg-transparent min-h-[48px] max-h-[200px] py-4 px-2 outline-none text-sm resize-none no-scrollbar placeholder:text-muted-foreground/30"
                            rows={1}
                        />

                        <Button
                            type="submit"
                            disabled={(!input.trim() && files.length === 0) || isLoading}
                            className="h-12 w-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all active:scale-95 shrink-0 group/send disabled:opacity-30"
                        >
                            <Send className="h-5 w-5 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />
                        </Button>
                    </div>
                </form>

                <div className="mt-4 flex items-center justify-center gap-8 opacity-20 hover:opacity-40 transition-opacity duration-1000">
                    <div className="flex items-center gap-2 text-[8px] font-mono tracking-[0.2em] uppercase">
                        SECURE_LINK: ACTIVE
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-mono tracking-[0.2em] uppercase text-green-500">
                        <div className="h-1 w-1 rounded-full bg-current animate-pulse" /> SYSTEM: OPTIMIZED
                    </div>
                </div>
            </div>

            {/* Decorative BG Glows */}
            <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
        </div>
    )
}
