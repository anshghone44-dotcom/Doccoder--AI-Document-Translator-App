"use client"

import { useState, useCallback } from "react"
import {
    Upload,
    FileText,
    FileSpreadsheet,
    Presentation,
    File,
    ArrowRight,
    ImageIcon,
    FileJson,
    CheckCircle2,
    XCircle,
    Download,
    Cpu,
    Zap,
    Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const FILE_TYPES = [
    { icon: FileText, label: "PDF", ext: ".pdf", color: "text-red-500", bgColor: "bg-red-500/10" },
    { icon: FileText, label: "DOCX", ext: ".docx", color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { icon: FileSpreadsheet, label: "XLSX", ext: ".xlsx", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { icon: Presentation, label: "PPTX", ext: ".pptx", color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { icon: FileJson, label: "JSON", ext: ".json", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    { icon: File, label: "CSV", ext: ".csv", color: "text-zinc-500", bgColor: "bg-zinc-500/10" },
    { icon: ImageIcon, label: "PNG", ext: ".png", color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { icon: ImageIcon, label: "SVG", ext: ".svg", color: "text-pink-500", bgColor: "bg-pink-500/10" },
    { icon: ImageIcon, label: "JPG", ext: ".jpg", color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
    { icon: FileText, label: "TXT", ext: ".txt", color: "text-slate-500", bgColor: "bg-slate-500/10" },
    { icon: ImageIcon, label: "BMP", ext: ".bmp", color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
    { icon: ImageIcon, label: "TIFF", ext: ".tiff", color: "text-teal-500", bgColor: "bg-teal-500/10" },
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
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
]

const TARGET_FORMATS = [
    { value: "pdf", label: "PDF Document" },
    { value: "docx", label: "Word Document" },
    { value: "xlsx", label: "Excel Spreadsheet" },
    { value: "pptx", label: "PowerPoint" },
    { value: "txt", label: "Plain Text" },
    { value: "json", label: "JSON Data" },
    { value: "png", label: "PNG Image" },
    { value: "jpg", label: "JPG Image" },
    { value: "svg", label: "SVG Vector" },
    { value: "bmp", label: "BMP Bitmap" },
    { value: "tiff", label: "TIFF Format" },
    { value: "gif", label: "GIF Animation" },
    { value: "gdoc", label: "Google Doc" },
    { value: "gsheet", label: "Google Sheet" },
]

export function UploadZone() {
    const [isDragging, setIsDragging] = useState(false)
    const [sourceLang, setSourceLang] = useState("en")
    const [targetLang, setTargetLang] = useState("es")
    const [targetFormat, setTargetFormat] = useState("pdf")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processError, setProcessError] = useState<string | null>(null)
    const [processSuccess, setProcessSuccess] = useState(false)

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
            setProcessError(null)
            setProcessSuccess(false)
        }
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            setSelectedFile(files[0])
            setProcessError(null)
            setProcessSuccess(false)
        }
    }, [])

    const clearSelection = () => {
        setSelectedFile(null)
        setProcessError(null)
        setProcessSuccess(false)
    }

    const handleProcess = async () => {
        if (!selectedFile || isProcessing) return

        setIsProcessing(true)
        setProcessError(null)
        setProcessSuccess(false)

        try {
            const formData = new FormData()
            formData.append("files", selectedFile)
            formData.append("targetLanguage", targetLang)
            formData.append("targetFormat", targetFormat)
            formData.append("prompt", `Translate this ${selectedFile.name} into ${targetLang} and output as ${targetFormat}`)
            formData.append("aiModel", "openai/gpt-4-mini") // Default for high precision

            const response = await fetch("/api/transform", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "System interrupt detected." }))
                throw new Error(errorData.message || "Transformation module failure.")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url

            // Try to extract filename from Content-Disposition
            let filename = `translated_${selectedFile.name}`
            const disposition = response.headers.get("Content-Disposition")
            if (disposition && disposition.includes("filename=")) {
                const match = disposition.match(/filename="(.+)"/)
                if (match && match[1]) filename = match[1]
            } else {
                // Fallback extensions based on targetFormat
                const baseName = selectedFile.name.split('.').slice(0, -1).join('.')
                filename = `${baseName}_translated.${targetFormat}`
            }

            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setProcessSuccess(true)
        } catch (err: any) {
            console.error("Translation error:", err)
            setProcessError(err.message || "An unexpected error occurred during processing.")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            <div
                className={cn(
                    "relative rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden",
                    isDragging
                        ? "border-primary/50 bg-primary/5 scale-[1.01] shadow-2xl shadow-primary/10"
                        : "border-foreground/10 bg-card/40 backdrop-blur-xl hover:border-primary/30 shadow-xl",
                    selectedFile && "border-primary/30 bg-primary/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Background Glow Effect */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

                <div className="relative p-8 md:p-14">
                    {!selectedFile ? (
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-2 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
                                <Upload className="w-12 h-12 text-primary" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">
                                    Drop your document here
                                </h3>
                                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                                    Upload PDF, Word, Excel, Images, and more. AI handles the rest.
                                </p>
                            </div>

                            <div className="pt-4">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.json,.csv,.png,.jpg,.jpeg,.svg,.bmp,.tiff,.gif"
                                    onChange={handleFileSelect}
                                />
                                <label htmlFor="file-upload">
                                    <Button size="lg" variant="secondary" className="cursor-pointer font-semibold rounded-xl h-14 px-8 border border-foreground/10 hover:bg-foreground/5 shadow-sm" asChild>
                                        <span>Select from Computer</span>
                                    </Button>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <FileText className="w-10 h-10 text-primary" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h3 className="text-2xl font-bold text-foreground truncate max-w-sm">
                                        {selectedFile.name}
                                    </h3>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </div>
                                <p className="text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for translation
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSelection}
                                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/5"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Remove
                            </Button>
                        </div>
                    )}

                    {/* Supported Formats Grid */}
                    {!selectedFile && (
                        <div className="mt-14 pt-10 border-t border-foreground/5">
                            <div className="text-center mb-8">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">SUPPORTED FORMATS</span>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                                {FILE_TYPES.map((type) => (
                                    <div
                                        key={type.label}
                                        className="flex flex-col items-center gap-2 group cursor-default"
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border border-transparent group-hover:border-foreground/10",
                                            type.bgColor
                                        )}>
                                            <type.icon className={cn("w-6 h-6", type.color)} />
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                            {type.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Panel */}
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="p-6 rounded-2xl bg-card/40 border border-foreground/10 backdrop-blur-md space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Globe className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Source Language</span>
                    </div>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                        <SelectTrigger className="h-12 rounded-xl bg-background/50 border-foreground/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Auto Detect</SelectItem>
                            {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                    {lang.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="p-6 rounded-2xl bg-card/40 border border-foreground/10 backdrop-blur-md space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Target Language</span>
                    </div>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger className="h-12 rounded-xl bg-background/50 border-foreground/10">
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

                <div className="p-6 rounded-2xl bg-card/40 border border-foreground/10 backdrop-blur-md space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Output Format</span>
                    </div>
                    <Select value={targetFormat} onValueChange={setTargetFormat}>
                        <SelectTrigger className="h-12 rounded-xl bg-background/50 border-foreground/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TARGET_FORMATS.map((format) => (
                                <SelectItem key={format.value} value={format.value}>
                                    {format.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Error and Success States */}
            {(processError || processSuccess) && (
                <div className={cn(
                    "p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300",
                    processError ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                )}>
                    <div className="flex items-center gap-3">
                        {processError ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        <p className="text-sm font-medium">
                            {processError ? processError : "Document processed successfully. Your download should start automatically."}
                        </p>
                    </div>
                </div>
            )}

            {/* Large Action Button */}
            <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                <Button
                    size="lg"
                    onClick={handleProcess}
                    className={cn(
                        "h-16 px-12 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg shadow-primary/20 min-w-[280px]",
                        selectedFile && !isProcessing
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 active:scale-100"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    disabled={!selectedFile || isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <div className="mr-3 h-6 w-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Synchronizing...
                        </>
                    ) : (
                        <>
                            <Cpu className="mr-3 h-6 w-6" />
                            Process Translation
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </>
                    )}
                </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground font-medium flex items-center justify-center gap-2 opacity-60">
                <Zap className="w-3 h-3" />
                Powered by next-gen neural processing for maximum accuracy
                <Zap className="w-3 h-3" />
            </p>
        </div>
    )
}
