"use client"

import { Zap, FileCheck, Lock, Gauge } from "lucide-react"
import { useTranslation } from "@/components/language-context"
import Header from "@/components/header"

export default function Home() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section id="features" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-sans text-3xl font-bold md:text-4xl mb-4">
              {t.features.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: t.features.ai.title,
                description: t.features.ai.description,
              },
              {
                icon: FileCheck,
                title: t.features.format.title,
                description: t.features.format.description,
              },
              {
                icon: Lock,
                title: t.features.secure.title,
                description: t.features.secure.description,
              },
              {
                icon: Gauge,
                title: t.features.fast.title,
                description: t.features.fast.description,
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8 hover:border-primary/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="formats" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-12 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="font-sans text-3xl font-bold md:text-4xl mb-4">
                {t.formats.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.formats.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { name: "PDF Documents", ext: ".pdf" },
                { name: "Word Documents", ext: ".docx" },
                { name: "PowerPoint", ext: ".pptx" },
                { name: "Text Files", ext: ".txt" },
              ].map((format, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="text-4xl font-bold text-primary">{format.ext}</div>
                  <div className="text-sm font-medium text-center">{format.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-bodoni)" }}>
                Doccoder
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {t.footer.tagline}
              </p>
            </div>

            <div className="pt-4 border-t border-border w-full flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="md:w-1/3" /> {/* Spacer for centering */}

              <p className="text-sm text-muted-foreground order-2 md:order-1">
                {t.footer.rights}
              </p>

              <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 order-1 md:order-2 md:w-1/3">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t.footer.privacy}
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t.footer.terms}
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookies
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t.footer.download}
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t.footer.settings}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
