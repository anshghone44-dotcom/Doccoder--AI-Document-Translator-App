"use client"

import type React from "react"
import TemplatePicker, { type TemplateSelection } from "@/components/template-picker"
import FileEditor from "@/components/file-editor"
import VoiceRecorder from "@/components/voice-recorder"
import ModelSelector, { type AIModel } from "@/components/model-selector"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Paperclip, Send, X, Volume2, Loader2 } from "lucide-react"
import VoiceSettings from "@/components/voice-settings"
import { useEffect, useCallback } from "react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  downloadUrl?: string
  filename?: string
  editableContent?: string
}

export default function TransformChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel>("openai/gpt-5")
  const [template, setTemplate] = useState<TemplateSelection>({
    id: "minimal",
    orientation: "portrait",
    margin: 36,
  })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM")
  const [autoPlay, setAutoPlay] = useState(false)
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null)

  function removeFileAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function convertImageToPng(file: File): Promise<File> {
    const url = URL.createObjectURL(file)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = "anonymous"
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("Image load error"))
        image.src = url
      })
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.floor((img as any).naturalWidth || img.width || 1))
      canvas.height = Math.max(1, Math.floor((img as any).naturalHeight || img.height || 1))
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context unavailable")
      ctx.drawImage(img, 0, 0)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("PNG conversion failed")
      const safeBase = file.name.replace(/\.[^.]+$/, "")
      return new File([blob], `${safeBase}.png`, { type: "image/png" })
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function onFilesSelected(selected: FileList | null) {
    if (!selected) return
    const incoming = Array.from(selected)
    const processed: File[] = []
    for (const f of incoming) {
      const isImage = f.type.startsWith("image/")
      const isPngOrJpeg = f.type === "image/png" || f.type === "image/jpeg" || f.type === "image/jpg"
      if (isImage && !isPngOrJpeg) {
        try {
          const converted = await convertImageToPng(f)
          processed.push(converted)
        } catch {
          processed.push(f)
        }
      } else {
        processed.push(f)
      }
    }
    setFiles((prev) => [...prev, ...processed])
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

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (files.length === 0 && !prompt.trim()) return

    const userMessage = prompt.trim() || "Transform files to PDF"
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setPrompt("")

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    setIsLoading(true)
    try {
      const form = new FormData()
      form.set("prompt", userMessage)
      form.set("template", JSON.stringify(template))
      form.set("aiModel", selectedModel)
      files.forEach((f) => form.append("files", f, f.name))

      const res = await fetch("/api/transform", {
        method: "POST",
        body: form,
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error")
        throw new Error(errText || `Request failed with status ${res.status}`)
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)

      let filename = "output.pdf"
      const cd = res.headers.get("Content-Disposition") || ""
      const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i)
      if (match) {
        filename = decodeURIComponent(match[1] || match[2])
      } else if (res.headers.get("Content-Type") === "application/zip") {
        filename = "transformed-pdfs.zip"
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: files.length > 1 ? "Your PDFs are ready. Download the ZIP." : "Your PDF is ready. Download below.",
          downloadUrl: objectUrl,
          filename,
        },
      ])

      setFiles([])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `There was an error: ${err?.message || "Unknown error"}` },
      ])
    } finally {
      setIsLoading(false)
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value)
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  return (
    <section aria-label="AI transformer chat" className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        <VoiceSettings
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          autoPlay={autoPlay}
          onAutoPlayChange={setAutoPlay}
        />
      </div>

      <div className="mb-4 rounded-lg border bg-card p-3">
        <details className="cursor-pointer">
          <summary className="text-sm font-medium">Template Settings</summary>
          <div className="mt-3">
            <TemplatePicker value={template} onChange={setTemplate} />
          </div>
        </details>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((m, idx) => (
          <div key={idx}>
            {editingMessageIndex === idx && m.editableContent ? (
              <FileEditor
                content={m.editableContent}
                filename={m.filename || "file"}
                onSave={(edited) => handleSaveEdit(idx, edited)}
                onCancel={() => setEditingMessageIndex(null)}
              />
            ) : (
              <>
                <div className="text-sm flex flex-col gap-2">
                  <div>
                    <strong className="mr-2">{m.role === "user" ? "You" : "Assistant"}:</strong>
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  </div>
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 px-2 text-[10px] font-bold uppercase tracking-widest gap-2",
                          playingMessageIndex === idx && "bg-primary/10 text-primary"
                        )}
                        onClick={() => handlePlayTTS(m.content, idx)}
                      >
                        {playingMessageIndex === idx ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                        {playingMessageIndex === idx ? "Listening..." : "Listen"}
                      </Button>
                    </div>
                  )}
                </div>
                {m.downloadUrl && (
                  <div className="mt-2 flex gap-2">
                    <a href={m.downloadUrl} download={m.filename} className="underline">
                      Download {m.filename}
                    </a>
                    {m.editableContent && (
                      <Button variant="outline" size="sm" onClick={() => setEditingMessageIndex(idx)}>
                        Edit Before Download
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 border-t bg-background pt-4">
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm">
                <span className="max-w-[200px] truncate">{f.name}</span>
                <button
                  onClick={() => removeFileAt(i)}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 rounded-lg border bg-card p-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onFilesSelected(e.target.files)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => inputRef.current?.click()}
            className="shrink-0"
            aria-label="Upload files"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your instructions or press Enter to convert..."
            className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 outline-none"
            rows={1}
          />

          <div className="shrink-0">
            <VoiceRecorder onTranscript={(text) => setPrompt((prev) => (prev ? `${prev} ${text}` : text))} />
          </div>

          <Button
            type="submit"
            size="icon"
            onClick={() => onSubmit()}
            disabled={isLoading || (files.length === 0 && !prompt.trim())}
            className="shrink-0"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section >
  )
}
