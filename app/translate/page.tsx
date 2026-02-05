"use client"

import Header from "@/components/header"
import { useTranslation } from "@/components/language-context"
import { Sparkles } from "lucide-react"
import { UploadZone } from "@/components/upload-zone"

export default function TranslatePage() {
    const { t } = useTranslation()

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Same navigation bar as requested */}
            <Header />

            {/* Content Area */}
            <div className="relative pt-32 pb-20 px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center space-y-4 mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-xs font-semibold tracking-wider uppercase text-foreground/70 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Sparkles className="h-3 w-3 fill-current" />
                            AI-Powered Neural Translation
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            Translate with <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/40">AI Precision</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                            Enter your text or upload content to get instant, accurate translations in any language. Powered by advanced Large Language Models.
                        </p>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
                        <UploadZone />
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
            </div>
        </main>
    )
}
