"use client"

import TransformChat from "@/components/transform-chat"
import ReverseTransformChat from "@/components/reverse-transform-chat"
import { useTranslation } from "@/components/language-context"
import Header from "@/components/header"

export default function Page() {
  const { t } = useTranslation()
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-secondary to-background">
      {/* Header with Back Button */}
      <Header showBackButton />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center md:py-24">
        <div className="space-y-4">
          <h2 className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans text-balance text-4xl font-bold md:text-5xl lg:text-6xl">
            {t.transformer.hero.title}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur transition-all duration-300 hover:shadow-xl hover:border-primary/50">
            <TransformChat />
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
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur transition-all duration-300 hover:shadow-xl hover:border-primary/50">
            <ReverseTransformChat />
          </div>
        </section>
      </div>
    </main>
  )
}
