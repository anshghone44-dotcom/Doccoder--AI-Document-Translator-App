"use client"

import TransformChat from "@/components/transform-chat"
import { useTranslation } from "@/components/language-context"
import { Sparkles, Mic } from "lucide-react"

export default function TranslationSection() {
    const { t } = useTranslation()

    return (
        <section id="translate-section" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-foreground/[0.02]" />
            <div className="mx-auto max-w-7xl px-6 relative">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold tracking-wider uppercase text-primary/70 mb-4">
                        <Mic className="h-3 w-3 fill-current" />
                        AI Voice Translator
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground/90">
                        Ask AI to Translate
                    </h2>
                    <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
                        Speak or upload your document. Our AI handles the rest with neural precision.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <TransformChat />
                </div>
            </div>
        </section>
    )
}
