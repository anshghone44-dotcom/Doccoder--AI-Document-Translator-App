"use client"

import type React from "react"
import FileEditor from "@/components/file-editor"
import VoiceRecorder from "@/components/voice-recorder"
import ModelSelector, { type AIModel } from "@/components/model-selector"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paperclip, Send, X, Sparkles, Volume2, Loader2, Globe, Bot } from "lucide-react"
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
    <section aria-label={t.chatbot.ariaLabels.pdfTransformer} className="flex h-[700px] flex-col bg-card/40 backdrop-blur-xl rounded-3xl border border-border/50 shadow-xl overflow-hidden group/chatbot">
      {/* Header Area */}
      <div className="p-4 border-b border-border/10 bg-background/20 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase text-foreground">{t.chatbot.architect}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <LanguagePicker
            value={targetLang}
            onChange={(code) => {
              setTargetLang(code as any)
              setLanguage(code as any)
            }}
          />
          <VoiceSettings
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            autoPlay={autoPlay}
            onAutoPlayChange={setAutoPlay}
          />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-hidden">

        <div className="mb-6 rounded-xl border border-border/50 bg-gradient-to-br from-secondary to-background p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(85,_100,_200,_0.3)]">
          <label className="mb-3 block text-sm font-semibold text-foreground">{t.chatbot.targetFormat}</label>
          <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as any)}>
            <SelectTrigger className="w-full border-border/50 bg-background/50 transition-all duration-300 hover:bg-background hover:border-primary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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

        <div className="mb-6 rounded-xl border border-border/50 bg-gradient-to-br from-secondary to-background p-4 transition-all duration-300">
          <label className="mb-3 block text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t.chatbot.tone}
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(["formal", "casual", "legal", "academic"] as ToneOption[]).map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                  selectedTone === tone
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
                title={toneDescriptions[tone]}
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{toneDescriptions[selectedTone]}</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((m, idx) => (
            <div key={idx} className="transition-all duration-300">
              {editingMessageIndex === idx && m.editableContent ? (
                <FileEditor
                  content={m.editableContent}
                  filename={m.filename || "file"}
                  onSave={(edited) => handleSaveEdit(idx, edited)}
                  onCancel={() => setEditingMessageIndex(null)}
                />
              ) : (
                <div
                  className={cn(
                    "rounded-xl p-4 transition-all duration-300",
                    m.role === "user"
                      ? "bg-primary/10 border border-primary/20 ml-8"
                      : "bg-accent/10 border border-accent/20 mr-8 ai-glow",
                  )}
                >
                  <div className="text-sm">
                    <strong className="mr-2 text-foreground">{m.role === "user" ? t.chatbot.userLabel : t.chatbot.assistantLabel}:</strong>
                    <span className="whitespace-pre-wrap text-muted-foreground">{m.content}</span>
                  </div>
                  {m.role === "assistant" && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playVoiceResponse(m.content, idx)}
                        className={cn(
                          "flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                          playingMessageIndex === idx && "bg-primary/20 text-primary border-primary/30"
                        )}
                      >
                        <Volume2 className={cn("h-4 w-4", playingMessageIndex === idx ? "text-primary" : "")} />
                        {playingMessageIndex === idx ? t.chatbot.stop : t.chatbot.playVoice}
                      </Button>
                    </div>
                  )}
                  {m.downloadUrl && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={m.downloadUrl}
                        download={m.filename}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        {t.chatbot.download} {m.filename}
                      </a>
                      {m.editableContent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMessageIndex(idx)}
                          className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                          {t.chatbot.editBeforeDownload}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur pt-4 transition-all duration-300">
          {files.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-3 py-1.5 text-sm border border-primary/30 transition-all duration-300 hover:shadow-md"
                >
                  <span className="max-w-[200px] truncate font-medium">{f.name}</span>
                  <button
                    onClick={() => removeFileAt(i)}
                    className="rounded-full p-0.5 hover:bg-destructive/20 transition-all duration-300"
                    aria-label={t.chatbot.ariaLabels.remove}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showRecommendations && prompt.length === 0 && (
            <div className="mb-3 rounded-lg border border-border/50 bg-card/50 p-3 backdrop-blur">
              <p className="mb-2 text-xs font-medium text-muted-foreground">{t.chatbot.suggestedActions}:</p>
              <div className="flex flex-wrap gap-2">
                {recommendations.map((rec, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecommendationClick(rec)}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-all duration-300 hover:scale-105"
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-md">
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
              className="shrink-0 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
              aria-label={t.chatbot.ariaLabels.upload}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={t.chatbot.reverseTransformPlaceholder}
              className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 outline-none text-foreground placeholder:text-muted-foreground"
              rows={1}
            />

            <div className="shrink-0">
              <VoiceRecorder onTranscript={(text) => setPrompt((prev) => (prev ? `${prev} ${text}` : text))} />
            </div>

            <Button
              type="submit"
              size="icon"
              onClick={() => onSubmit()}
              disabled={isLoading || files.length === 0}
              className="shrink-0 bg-gradient-to-br from-primary to-accent text-primary-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 pulse-cta"
              aria-label={t.chatbot.ariaLabels.send}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
