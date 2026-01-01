"use client"

import Header from "@/components/header"
import DocChatbot from "@/components/doc-chatbot"
import { useTranslation } from "@/components/language-context"
import { Sparkles, Bot, Shield, Zap } from "lucide-react"

export default function ChatbotPage() {
    const { t } = useTranslation()

    return (
        <main className="min-h-screen bg-background relative overflow-hidden noise">
            <Header showBackButton />

            {/* Background elements to match landing page */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
            </div>

            <div className="relative pt-32 pb-20 px-6 z-10">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center text-center space-y-6 mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase text-foreground/70 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Zap className="h-3 w-3 fill-current text-primary" />
                            Neural Interface Active
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            AI Document <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/70 to-foreground/30 italic">Processor</span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                            The most advanced neural engine for professional document translation and transformation. Upload any format to begin high-fidelity processing.
                        </p>

                        <div className="flex items-center gap-8 pt-4 animate-in fade-in duration-1000 delay-700 opacity-40">
                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                                <Shield className="h-4 w-4" /> Secure Pipeline
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                                <Bot className="h-4 w-4" /> Technical Accuracy
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                                <Sparkles className="h-4 w-4" /> Multi-LLM Support
                            </div>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
                        <DocChatbot />
                    </div>
                </div>
            </div>
        </main>
    )
}
