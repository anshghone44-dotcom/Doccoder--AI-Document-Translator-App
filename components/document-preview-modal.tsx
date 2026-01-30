"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { FileText, Download, X, ExternalLink } from "lucide-react"

interface DocumentPreviewModalProps {
    document: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DocumentPreviewModal({ document: doc, open, onOpenChange }: DocumentPreviewModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && doc) {
            // In a real app, we'd fetch a signed URL or use a viewer.
            // For now, we'll try to get the public URL if possible or show a placeholder.
            setPreviewUrl(doc.preview_url || null)
        }
    }, [open, doc])

    if (!doc) return null

    const isPdf = doc.filename.toLowerCase().endsWith(".pdf")
    const isTxt = doc.filename.toLowerCase().endsWith(".txt")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 rounded-3xl overflow-hidden border-foreground/5 shadow-2xl noise">
                <DialogHeader className="p-6 border-b border-foreground/5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black">{doc.filename}</DialogTitle>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.file_type}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold h-10 px-4">
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => onOpenChange(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-muted/20 relative">
                    {isPdf ? (
                        <iframe
                            src={previewUrl || ""}
                            className="w-full h-full border-none"
                            title="PDF Preview"
                        />
                    ) : isTxt ? (
                        <ScrollArea className="h-full p-8">
                            <div className="max-w-2xl mx-auto bg-card p-12 rounded-2xl shadow-sm border border-foreground/5 min-h-full font-mono text-sm leading-relaxed">
                                {/* Mock content or fetch text */}
                                <p>Content preview for TXT files would be loaded here...</p>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-8">
                            <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/40">
                                <FileText className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">No Preview Available</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    We don't support online previews for this file type yet. Please download the file to view it.
                                </p>
                            </div>
                            <Button className="rounded-xl font-bold gap-2">
                                <Download className="w-4 h-4" />
                                Download Original
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
