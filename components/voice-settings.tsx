"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Volume2, Settings2, Loader2, Play } from "lucide-react"

export interface Voice {
    id: string
    name: string
    preview_url: string
}

interface VoiceSettingsProps {
    selectedVoice: string
    onVoiceChange: (voiceId: string) => void
    autoPlay: boolean
    onAutoPlayChange: (autoPlay: boolean) => void
}

export default function VoiceSettings({
    selectedVoice,
    onVoiceChange,
    autoPlay,
    onAutoPlayChange,
}: VoiceSettingsProps) {
    const [voices, setVoices] = useState<Voice[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null)

    useEffect(() => {
        async function fetchVoices() {
            setIsLoading(true)
            try {
                const res = await fetch("/api/voices")
                const data = await res.json()
                if (data.voices) {
                    setVoices(data.voices)
                }
            } catch (err) {
                console.error("Failed to fetch voices:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchVoices()
    }, [])

    const playPreview = (url: string, id: string) => {
        if (isPlayingPreview === id) return
        const audio = new Audio(url)
        setIsPlayingPreview(id)
        audio.play()
        audio.onended = () => setIsPlayingPreview(null)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-foreground/5">
                    <Settings2 className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 glass-dark border-white/10 p-6 rounded-[2rem] shadow-2xl backdrop-blur-2xl">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="h-4 w-4 text-primary" />
                        <h4 className="font-black text-sm uppercase tracking-widest italic">Voice Interaction</h4>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-mono uppercase opacity-60">Neural Engine Voice</Label>
                            <div className="flex gap-2">
                                <Select value={selectedVoice} onValueChange={onVoiceChange}>
                                    <SelectTrigger className="bg-background/40 border-white/10 rounded-xl h-12">
                                        <SelectValue placeholder="Select a voice" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-xl">
                                        {isLoading ? (
                                            <div className="p-4 flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        ) : (
                                            voices.map((voice) => (
                                                <SelectItem key={voice.id} value={voice.id} className="focus:bg-primary/20">
                                                    {voice.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {selectedVoice && voices.find(v => v.id === selectedVoice)?.preview_url && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-12 w-12 rounded-xl shrink-0"
                                        onClick={() => {
                                            const v = voices.find(v => v.id === selectedVoice)
                                            if (v) playPreview(v.preview_url, v.id)
                                        }}
                                        disabled={isPlayingPreview === selectedVoice}
                                    >
                                        {isPlayingPreview === selectedVoice ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4 fill-current" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Auto-play Response</Label>
                                <p className="text-[10px] text-muted-foreground uppercase font-mono italic">Voice readout on completion</p>
                            </div>
                            <Switch checked={autoPlay} onCheckedChange={onAutoPlayChange} />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
