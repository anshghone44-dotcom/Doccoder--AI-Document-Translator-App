"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, FileSpreadsheet, Presentation, File, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const FILE_TYPES = [
    { icon: FileText, label: "PDF", ext: ".pdf", color: "text-red-500" },
    { icon: FileText, label: "DOCX", ext: ".docx", color: "text-zinc-500" },
    { icon: Presentation, label: "PPTX", ext: ".pptx", color: "text-orange-500" },
    { icon: File, label: "TXT", ext: ".txt", color: "text-gray-500" },
]

const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
]

export function UploadZone() {
    const [isDragging, setIsDragging] = useState(false)
    const [sourceLang, setSourceLang] = useState("en")
    const [targetLang, setTargetLang] = useState("es")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            setSelectedFile(files[0])
        }
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            setSelectedFile(files[0])
        }
    }, [])

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div
                className={cn(
                    "relative rounded-2xl border-2 border-dashed transition-all duration-300",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-border bg-card/50 backdrop-blur-sm hover:border-primary/50",
                    "shadow-xl"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="p-8 md:p-12">
                    {/* Upload Area */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                            <Upload className="w-10 h-10 text-primary" />
                        </div>

                        <h3 className="text-2xl font-bold mb-2">
                            {selectedFile ? selectedFile.name : "Drop your document here"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            or click to browse from your computer
                        </p>

                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".pdf,.docx,.pptx,.txt"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="file-upload">
                            <Button variant="outline" className="cursor-pointer" asChild>
                                <span>Choose File</span>
                            </Button>
                        </label>
                    </div>

                    {/* Supported Formats */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8 pb-8 border-b border-border">
                        {FILE_TYPES.map((type) => (
                            <div
                                key={type.label}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <type.icon className={cn("w-6 h-6", type.color)} />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {type.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Language Selectors */}
                    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Source Language</label>
                            <Select value={sourceLang} onValueChange={setSourceLang}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-center">
                            <ArrowRight className="w-6 h-6 text-muted-foreground rotate-0 md:rotate-0" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Language</label>
                            <Select value={targetLang} onValueChange={setTargetLang}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="text-center">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                            disabled={!selectedFile}
                        >
                            Translate Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
