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

            <div className="relative pt-20 pb-20 px-6 z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="w-full max-w-5xl mx-auto">

                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <DocChatbot />
                    </div>
                </div>
            </div>
        </main>
    )
}
