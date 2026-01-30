"use client"

import { useEffect, useState } from "react"
import { FileText, MoreVertical, Trash2, Cpu, Eye, Download, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function DocumentList() {
    const router = useRouter()
    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchDocuments()
    }, [])

    async function fetchDocuments() {
        try {
            const response = await fetch("/api/documents")
            if (response.ok) {
                const data = await response.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error("Failed to fetch documents:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredDocuments = documents.filter(doc =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-12 h-14 rounded-2xl bg-background/50 border-foreground/5 shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 rounded-2xl gap-2 font-semibold">
                    <Filter className="w-5 h-5" />
                    Filter
                </Button>
            </div>

            {filteredDocuments.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/30 text-muted-foreground">
                        <FileText className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-bold">No documents found</p>
                        <p className="text-muted-foreground">Upload your first document to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredDocuments.map((doc) => (
                        <div
                            key={doc.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-background/50 border border-foreground/5 hover:border-primary/20 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 gap-4"
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <h3 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">{doc.filename}</h3>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground font-medium">
                                        <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                        <span>•</span>
                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                        <Badge variant="secondary" className={cn(
                                            "rounded-full px-2 py-0 text-[10px] uppercase font-bold tracking-wider",
                                            doc.status === 'completed' && "bg-emerald-500/10 text-emerald-500",
                                            doc.status === 'processing' && "bg-blue-500/10 text-blue-500 animate-pulse",
                                            doc.status === 'error' && "bg-red-500/10 text-red-500"
                                        )}>
                                            {doc.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="h-10 rounded-xl gap-2 font-bold text-xs uppercase tracking-wider hover:bg-primary/5 hover:text-primary">
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-10 rounded-xl gap-2 font-bold text-xs uppercase tracking-wider hover:bg-emerald-500/5 hover:text-emerald-500"
                                    onClick={() => router.push(`/chat?docId=${doc.id}`)}
                                >
                                    <Cpu className="w-4 h-4" />
                                    AI Process
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl border-foreground/10 p-2 shadow-2xl">
                                        <DropdownMenuItem className="rounded-xl gap-3 font-semibold p-3 cursor-pointer">
                                            <Download className="w-4 h-4" />
                                            Download Original
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="rounded-xl gap-3 font-semibold p-3 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-500/5"
                                            onClick={async () => {
                                                if (confirm("Are you sure you want to delete this document?")) {
                                                    await fetch(`/api/documents?id=${doc.id}`, { method: 'DELETE' })
                                                    fetchDocuments()
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
