"use client"

import type React from "react"
import FileEditor from "@/components/file-editor"
import VoiceRecorder from "@/components/voice-recorder"
import ModelSelector, { type AIModel } from "@/components/model-selector"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paperclip, Send, X, Volume2, Loader2, Bot, Shield, Sparkles, Languages, Zap, FileText, Download, Copy } from "lucide-react"
import VoiceSettings from "@/components/voice-settings"
import LanguagePicker from "@/components/language-picker"
import { useTranslation } from "@/components/language-context"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  downloadUrl?: string
  filename?: string
  editableContent?: string
}

type ToneOption = "formal" | "casual" | "legal" | "academic"

export default function ReverseTransformChat() {
  const { t, language, setLanguage } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel>("openai/gpt-4-mini")
  const [targetFormat, setTargetFormat] = useState<
    "txt" | "docx" | "images" | "csv" | "xlsx" | "jpg" | "png" | "pptx" | "json" | "xml" | "md" | "rtf"
  >("txt")
  const [selectedTone, setSelectedTone] = useState<ToneOption>("formal")
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM")
  const [autoPlay, setAutoPlay] = useState(false)
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null)
  const [targetLang, setTargetLang] = useState(language)

  // Sync with global language
  useEffect(() => {
    setTargetLang(language)
  }, [language])
  const inputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }
    }
  }, [])

  const recommendations = t.chatbot.recommendations

  const toneDescriptions: Record<ToneOption, string> = t.chatbot.tones

  function removeFileAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
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

  async function onFilesSelected(selected: FileList | null) {
    if (!selected) return
    const incoming = Array.from(selected)

    const pdfFiles = incoming.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase()
      return ext === "pdf" || f.type === "application/pdf"
    })

    if (pdfFiles.length !== incoming.length) {
      alert(t.chatbot.pdfOnly)
    }

    setFiles((prev) => [...prev, ...pdfFiles])
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleSaveEdit(index: number, editedContent: string) {
    setMessages((prev) =>
      prev.map((msg, i) => {
        if (i === index) {
          const blob = new Blob([editedContent], { type: "text/plain" })
          const newUrl = URL.createObjectURL(blob)
          return {
            ...msg,
            editableContent: editedContent,
            downloadUrl: newUrl,
          }
        }
        return msg
      }),
    )
    setEditingMessageIndex(null)
  }

  function handleRecommendationClick(recommendation: string) {
    setPrompt((prev) => (prev ? `${prev} ${recommendation}` : recommendation))
    setShowRecommendations(false)
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (files.length === 0) return

    const userMessage = prompt.trim() || t.chatbot.processAndTranslate
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setPrompt("")
    setShowRecommendations(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    setIsLoading(true)
    try {
      const form = new FormData()
      form.set("prompt", userMessage)
      form.set("targetFormat", targetFormat)
      form.set("tone", selectedTone)
      form.set("aiModel", selectedModel)
      form.set("targetLanguage", targetLang)
      files.forEach((f) => form.append("files", f, f.name))

      const res = await fetch("/api/reverse-transform", {
        method: "POST",
        body: form,
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => t.chatbot.unknownError)
        throw new Error(errText || `Request failed with status ${res.status}`)
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)

      let filename = `output.${targetFormat}`
      const cd = res.headers.get("Content-Disposition") || ""
      const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i)
      if (match) {
        filename = decodeURIComponent(match[1] || match[2])
      } else if (res.headers.get("Content-Type") === "application/zip") {
        filename = "converted-files.zip"
      }

      let editableContent: string | undefined
      if (targetFormat === "txt" || targetFormat === "csv") {
        editableContent = await blob.text()
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t.chatbot.reverseTransformSuccess,
          downloadUrl: objectUrl,
          filename,
          editableContent,
        },
      ])

      setFiles([])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `${t.chatbot.error}: ${err?.message || t.chatbot.unknownError}` },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value)
    setShowRecommendations(e.target.value.length === 0)
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  return (
    <div className="flex flex-col h-[800px] w-full max-w-5xl mx-auto relative group/chatbot">
      {/* Background Grid Effect - Subtle */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Header Area - Discrete */}
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
            <LanguagePicker
              value={targetLang}
              onChange={(code) => {
                setTargetLang(code as any)
                setLanguage(code as any)
              }}
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

      <div className="flex-1 p-6 md:p-12 flex flex-col overflow-hidden relative z-10">
        <div className="mb-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md p-6 shadow-sm">
          <details className="cursor-pointer group/details">
            <summary className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t.chatbot.reverseTransformSettings}
            </summary>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.chatbot.targetFormat}</label>
                <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as any)}>
                  <SelectTrigger className="w-full rounded-xl border-border/50 bg-background/50 transition-all duration-300 hover:bg-background hover:border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/50">
                    <SelectItem value="txt">Text (.txt)</SelectItem>
                    <SelectItem value="csv">Spreadsheet (.csv)</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="docx">Word Document (.docx)</SelectItem>
                    <SelectItem value="pptx">PowerPoint (.pptx)</SelectItem>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                    <SelectItem value="xml">XML (.xml)</SelectItem>
                    <SelectItem value="md">Markdown (.md)</SelectItem>
                    <SelectItem value="rtf">Rich Text (.rtf)</SelectItem>
                    <SelectItem value="jpg">Image - JPEG (.jpg)</SelectItem>
                    <SelectItem value="png">Image - PNG (.png)</SelectItem>
                    <SelectItem value="images">Extract All Images (.zip)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  {t.chatbot.tone}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["formal", "casual", "legal", "academic"] as ToneOption[]).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={cn(
                        "rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                        selectedTone === tone
                          ? "bg-foreground text-background shadow-lg"
                          : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10",
                      )}
                      title={toneDescriptions[tone]}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 font-medium px-1">{toneDescriptions[selectedTone]}</p>
              </div>
            </div>
          </details>
        </div>

        <div className="flex-1 overflow-y-auto space-y-10 no-scrollbar pb-10">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
              <div className="relative">
                <div className="h-20 w-20 rounded-[2.5rem] bg-foreground/5 flex items-center justify-center border border-foreground/10 shadow-2xl relative z-10">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
              </div>
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  {language === "en" ? "PDF Neural Analysis" : t.chatbot.architect}
                </h1>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                  {language === "en" ? "Upload PDF objects for structural decomposition and multi-format synthesis." : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl pt-8">
                {recommendations.slice(0, 4).map((rec, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecommendationClick(rec)}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.05] hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="p-2 rounded-xl bg-foreground/5 text-muted-foreground group-hover:text-primary transition-colors">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">{rec}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={cn(
              "max-w-[85%] relative group transition-all duration-300",
              m.role === "user" ? "ml-auto" : "mr-auto"
            )}>
              {editingMessageIndex === idx && m.editableContent ? (
                <FileEditor
                  content={m.editableContent}
                  filename={m.filename || "file"}
                  onSave={(edited) => handleSaveEdit(idx, edited)}
                  onCancel={() => setEditingMessageIndex(null)}
                />
              ) : (
                <>
                  <div className={cn(
                    "flex items-center gap-2 mb-2 px-1",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      {m.role === "user" ? t.chatbot.userLabel : t.chatbot.assistantLabel}
                    </span>
                  </div>

                  <div className={cn(
                    "px-6 py-4 rounded-[2rem] text-sm leading-relaxed shadow-sm transition-all duration-300",
                    m.role === "user"
                      ? "bg-foreground text-background rounded-tr-sm"
                      : "bg-card border border-border/50 text-foreground rounded-tl-sm hover:border-primary/20"
                  )}>
                    <div className="whitespace-pre-wrap leading-7">{m.content}</div>

                    {m.role === "assistant" && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playVoiceResponse(m.content, idx)}
                          className={cn(
                            "h-8 rounded-xl bg-foreground/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 px-3",
                            playingMessageIndex === idx ? "text-primary bg-primary/5" : ""
                          )}
                        >
                          {playingMessageIndex === idx ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
                          {playingMessageIndex === idx ? t.chatbot.stop : t.chatbot.playVoice}
                        </Button>
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
                          <div className="flex items-center gap-2">
                            {m.editableContent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMessageIndex(idx)}
                                className="h-8 rounded-xl bg-foreground/5 text-[10px] font-bold uppercase tracking-widest px-3"
                              >
                                {t.chatbot.editBeforeDownload}
                              </Button>
                            )}
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
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Input area redesign */}
        <div className="pt-4">
          {files.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-300">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 border border-border/10 text-[10px] font-bold uppercase tracking-widest">
                  <FileText className="h-3 w-3 text-primary" />
                  <span className="max-w-[150px] truncate">{f.name}</span>
                  <button
                    onClick={() => removeFileAt(i)}
                    className="p-1 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
                    aria-label={t.chatbot.ariaLabels.remove}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative group">
            <div className="relative flex items-end gap-2 bg-card border border-border/50 rounded-[2.5rem] p-2 shadow-2xl transition-all duration-500 focus-within:border-primary/50 focus-within:shadow-primary/5">
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => onFilesSelected(e.target.files)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => inputRef.current?.click()}
                className="h-12 w-12 rounded-full hover:bg-foreground/5 hover:text-primary transition-all active:scale-95 group/upload"
                aria-label={t.chatbot.ariaLabels.upload}
              >
                <Paperclip className="h-5 w-5 transition-transform group-hover/upload:rotate-12" />
              </Button>

              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={t.chatbot.reverseTransformPlaceholder}
                className="flex-1 bg-transparent min-h-[52px] max-h-[200px] py-4 px-4 outline-none text-base resize-none no-scrollbar placeholder:text-muted-foreground/30 font-medium"
                rows={1}
              />

              <div className="shrink-0 mb-1">
                <VoiceRecorder onTranscript={(text) => setPrompt((prev) => (prev ? `${prev} ${text}` : text))} />
              </div>

              <Button
                type="submit"
                size="icon"
                onClick={() => onSubmit()}
                disabled={isLoading || files.length === 0}
                className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all active:scale-95 shrink-0 group/send disabled:opacity-30"
                aria-label={t.chatbot.ariaLabels.send}
              >
                <Send className="h-5 w-5 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 opacity-30">
            <div className="flex items-center gap-2 text-[8px] font-bold tracking-[0.2em] uppercase">
              <Shield className="h-3 w-3" /> {t.chatbot.secureConnection}
            </div>
            <div className="flex items-center gap-2 text-[8px] font-bold tracking-[0.2em] uppercase text-green-600">
              <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> {t.chatbot.systemReady}
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
