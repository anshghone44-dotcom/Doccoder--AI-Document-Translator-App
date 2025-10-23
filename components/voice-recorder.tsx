"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  async function startRecording() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Not Supported",
          description:
            "Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.",
          variant: "destructive",
        })
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      setPermissionDenied(false)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      toast({
        title: "Recording Started",
        description: "Speak now. Click the button again to stop.",
      })
    } catch (err: any) {
      console.error("[v0] Error starting recording:", err)

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionDenied(true)
        toast({
          title: "Microphone Permission Denied",
          description:
            "Please allow microphone access in your browser settings to use voice input. Click the lock icon in the address bar to manage permissions.",
          variant: "destructive",
          duration: 8000,
        })
      } else if (err.name === "NotFoundError") {
        toast({
          title: "No Microphone Found",
          description: "Please connect a microphone and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Recording Error",
          description: "Could not start recording. Please check your microphone and try again.",
          variant: "destructive",
        })
      }
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  async function transcribeAudio(audioBlob: Blob) {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Transcription failed: ${res.statusText}`)
      }

      const data = await res.json()
      if (data.text) {
        onTranscript(data.text)
        toast({
          title: "Transcription Complete",
          description: "Your voice has been converted to text.",
        })
      } else {
        throw new Error("No transcription text received")
      }
    } catch (err: any) {
      console.error("[v0] Transcription error:", err)
      toast({
        title: "Transcription Failed",
        description: err.message || "Failed to transcribe audio. Please try again or check your ElevenLabs API key.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !isProcessing && (
        <Button
          type="button"
          variant={permissionDenied ? "destructive" : "outline"}
          size="icon"
          onClick={startRecording}
          title={permissionDenied ? "Microphone permission denied - click to retry" : "Start voice recording"}
          aria-label="Start voice recording"
        >
          {permissionDenied ? <AlertCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}
      {isRecording && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={stopRecording}
          title="Stop recording"
          aria-label="Stop recording"
          className="animate-pulse"
        >
          <MicOff className="h-4 w-4" />
        </Button>
      )}
      {isProcessing && (
        <Button type="button" variant="outline" size="icon" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      )}
    </div>
  )
}
