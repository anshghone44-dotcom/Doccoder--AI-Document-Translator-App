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
      <div className="mx-auto max-w-7xl space-y-16 px-6 pb-16">
        {/* Convert to PDF Section */}
        <section id="convert-to" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">{t.transformer.toPdf.title}</h2>
            <p className="text-muted-foreground">
              {t.transformer.toPdf.description}
            </p>
          </div>
          <div className="glass rounded-[2.5rem] p-1 shadow-2xl transition-all duration-500 hover:shadow-primary/5 group/card">
            <div className="rounded-[2.2rem] bg-card/40 p-8 backdrop-blur-xl border border-white/10">
              <TransformChat />
            </div>
          </div>
        </section>

        {/* Convert from PDF Section */}
        <section id="convert-from" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">{t.transformer.fromPdf.title}</h2>
            <p className="text-muted-foreground">
              {t.transformer.fromPdf.description}
            </p>
          </div>
          <div className="glass rounded-[2.5rem] p-1 shadow-2xl transition-all duration-500 hover:shadow-primary/5 group/card">
            <div className="rounded-[2.2rem] bg-card/40 p-8 backdrop-blur-xl border border-white/10">
              <ReverseTransformChat />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
