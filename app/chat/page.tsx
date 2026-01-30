"use client"

import { Suspense } from "react"
import Header from "@/components/header"
import DocChatbot from "@/components/doc-chatbot"
import { useTranslation } from "@/components/language-context"
import { Sparkles, MessageSquare, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function ChatContent() {
    const { t } = useTranslation()

    return (
        <div className="relative pt-32 pb-20 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="rounded-xl gap-2 font-bold mb-2">
                                <ChevronLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold tracking-wider uppercase text-primary/70">
                            <Sparkles className="h-3 w-3 fill-current" />
                            Grounded Intelligence Mode
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                            Chat with <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40">Knowledge</span>
                        </h1>
                        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                            Analyze, summarize, and query your uploaded documents with precision-driven AI.
                        </p>
                    </div>

                    <div className="hidden lg:flex items-center gap-4 p-6 rounded-3xl bg-card/40 border border-foreground/5 backdrop-blur-xl shadow-xl">
                        <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-black uppercase tracking-widest text-foreground/60">Session Active</p>
                            <p className="text-xs text-muted-foreground font-medium">Neural processing synchronized</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto bg-card/40 backdrop-blur-3xl rounded-[2.5rem] border border-foreground/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                    <DocChatbot />
                </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
        </div>
    )
}

export default function ChatPage() {
    return (
        <main className="min-h-screen bg-background relative overflow-hidden noise">
            <Header />
            <Suspense fallback={
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }>
                <ChatContent />
            </Suspense>
        </main>
    )
}
