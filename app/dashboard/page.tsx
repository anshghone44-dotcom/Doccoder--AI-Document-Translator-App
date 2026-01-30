"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import { DocumentList } from "@/components/document-list"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard, FileText, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background noise">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background noise text-center px-4">
                <h1 className="text-4xl font-black">Access Denied</h1>
                <p className="text-muted-foreground text-lg">Please sign in to view your dashboard.</p>
                <Link href="/auth/login">
                    <Button size="lg" className="rounded-xl px-8 font-bold">Sign In</Button>
                </Link>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background noise relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/50 to-background pointer-events-none" />
            <Header />

            <div className="mx-auto max-w-7xl px-6 py-12 relative z-10 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-6">
                    <div className="p-6 rounded-3xl bg-card/40 border border-foreground/10 backdrop-blur-xl shadow-xl">
                        <nav className="space-y-2">
                            <Link href="/dashboard">
                                <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary active:scale-95 transition-all">
                                    <LayoutDashboard className="w-5 h-5" />
                                    <span className="font-semibold">Overview</span>
                                </Button>
                            </Link>
                            <Link href="/dashboard/documents">
                                <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary active:scale-95 transition-all">
                                    <FileText className="w-5 h-5" />
                                    <span className="font-semibold">Documents</span>
                                </Button>
                            </Link>
                            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary active:scale-95 transition-all">
                                <Settings className="w-5 h-5" />
                                <span className="font-semibold">Settings</span>
                            </Button>
                        </nav>
                        <div className="pt-6 mt-6 border-t border-foreground/5">
                            <Button
                                variant="ghost"
                                onClick={() => supabase.auth.signOut()}
                                className="w-full justify-start gap-3 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-600 active:scale-95 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-semibold">Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tight">Your Documents</h1>
                            <p className="text-muted-foreground font-medium">Manage and process your files with AI.</p>
                        </div>
                        <FileUploadDialog>
                            <Button size="lg" className="rounded-2xl h-14 px-8 font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                <Plus className="w-6 h-6" />
                                Upload Document
                            </Button>
                        </FileUploadDialog>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl border border-foreground/10 rounded-[2.5rem] shadow-2xl p-8">
                        <DocumentList />
                    </div>
                </div>
            </div>
        </main>
    )
}
