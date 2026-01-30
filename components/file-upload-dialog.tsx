"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, X, CheckCircle2, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function FileUploadDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        setError(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/documents", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Upload failed")
            }

            setSuccess(true)
            setTimeout(() => {
                setOpen(false)
                setSuccess(false)
                setFile(null)
                window.location.reload() // Simple way to refresh the list
            }, 1500)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2rem] border-foreground/5 shadow-2xl p-0 overflow-hidden noise">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-3xl font-black">Upload Document</DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    {!file ? (
                        <div
                            className="border-2 border-dashed border-foreground/10 rounded-3xl p-12 text-center space-y-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])
                            }}
                            onClick={() => document.getElementById("file-input")?.click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) setFile(e.target.files[0])
                                }}
                            />
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">Click or drag & drop</p>
                                <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT (Max 10MB)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-foreground/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-bold truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-red-500/5 hover:text-red-500"
                                    onClick={() => setFile(null)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-sm font-medium flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-sm font-bold flex gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    Upload Successful! Refreshing...
                                </div>
                            )}

                            <Button
                                className="w-full h-14 rounded-2xl font-bold text-lg gap-3"
                                disabled={isUploading || success}
                                onClick={handleUpload}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Start Upload
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
