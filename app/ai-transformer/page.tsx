"use client"

import TransformChat from "@/components/transform-chat"
import ReverseTransformChat from "@/components/reverse-transform-chat"
import { useTranslation } from "@/components/language-context"
import Header from "@/components/header"

export default function Page() {
  const { t } = useTranslation()
  return (
    <main className="min-h-screen bg-background noise relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/50 to-background pointer-events-none" />
      {/* Header with Back Button */}
      <Header showBackButton />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center md:py-24">
        <div className="space-y-4">
          <h2 className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans text-balance text-5xl font-black md:text-6xl lg:text-7xl tracking-tighter">
            {t.transformer.hero.title}{" "}
            <span className="bg-gradient-to-br from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent">
              {t.transformer.hero.accent}
            </span>
          </h2>
          <p className="animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto max-w-2xl text-lg text-muted-foreground">
            {t.transformer.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl space-y-24 px-6 pb-24 relative z-10">
        {/* Convert to PDF Section */}
        <section id="convert-to" className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t.transformer.toPdf.title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium">
              {t.transformer.toPdf.description}
            </p>
          </div>
          <TransformChat />
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Convert from PDF Section */}
        <section id="convert-from" className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t.transformer.fromPdf.title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium">
              {t.transformer.fromPdf.description}
            </p>
          </div>
          <ReverseTransformChat />
        </section>
      </div>
    </main>
  )
}
