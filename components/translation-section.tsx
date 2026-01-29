"use client"

import { UploadZone } from "@/components/upload-zone"
import { useTranslation } from "@/components/language-context"
import { Sparkles } from "lucide-react"

export default function TranslationSection() {
    const { t } = useTranslation()

    return (
        <section id="translate-section" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-foreground/[0.02]" />
            <div className="mx-auto max-w-7xl px-6 relative">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold tracking-wider uppercase text-primary/70 mb-4">
                        <Sparkles className="h-3 w-3 fill-current" />
                        Advance Translation
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground/90">
                        {t.formats.title}
                    </h2>
                    <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
                        Upload your document and choose any target format for instant, high-precision translation.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <UploadZone />
                </div>
            </div>
        </section>
    )
}
