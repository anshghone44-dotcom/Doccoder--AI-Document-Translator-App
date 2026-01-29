"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, FileCheck, Lock, Gauge, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "@/components/language-context"
import { useRef } from "react"
import Header from "@/components/header"
import DocChatbot from "@/components/doc-chatbot"

import TranslationSection from "@/components/translation-section"

export default function Home() {
  const { t } = useTranslation()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden noise">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-semibold tracking-wider uppercase text-primary/70 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Zap className="h-3 w-3 fill-current" />
              {t.hero.zapTitle}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {t.hero.title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/70 to-foreground/30">
                {t.hero.title.split(" ").pop()}
              </span>
            </h1>

            <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              {t.hero.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
              <Link href="/translate">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-bold bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.24)] hover:scale-105 active:scale-95 group"
                >
                  {t.hero.cta}
                  <Star className="ml-2 h-5 w-5 transition-transform duration-500 group-hover:rotate-[144deg] group-hover:scale-110 fill-current" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold border-border bg-transparent hover:bg-muted/50 transition-all duration-300 rounded-2xl"
                >
                  {t.nav.features}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-muted/20 -skew-y-3 origin-right" />
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
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
                className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:border-foreground/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                  <feature.icon className="h-24 w-24" />
                </div>
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground/5 text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Intelligence Section */}
      <section id="chat" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground/[0.02]" />
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground/90">
              {t.hero.title.split(" ").slice(-2).join(" ")} — Grounded
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Upload documents and chat with our grounded reasoning engine.
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-background/50 backdrop-blur-xl rounded-[2.5rem] border border-foreground/5 shadow-2xl overflow-hidden">
            <DocChatbot />
          </div>
        </div>
      </section>

      <TranslationSection />


      <section id="formats" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/2 rounded-full blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent" />

            <div className="text-center mb-16 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                {t.formats.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.formats.subtitle}
              </p>
            </div>

            <div className="relative group/scroll">
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-8 relative z-10 no-scrollbar snap-x scroll-smooth -mx-4 px-4 md:mx-0 md:px-0"
              >
                {[
                  { name: "PDF Documents", ext: ".pdf" },
                  { name: "Word Documents", ext: ".docx" },
                  { name: "PowerPoint", ext: ".pptx" },
                  { name: "Text Files", ext: ".txt" },
                  { name: "Excel Sheets", ext: ".xlsx" },
                  { name: "Google Sheets", ext: "Sheet" },
                  { name: "Google Docs", ext: "Doc" },
                  { name: "MS Excel", ext: ".csv" },
                  { name: "JSON Data", ext: ".json" },
                  { name: "Image File", ext: "IMG" },
                  { name: "PNG Image", ext: ".png" },
                  { name: "GIF Animation", ext: ".gif" },
                  { name: "TIFF Format", ext: ".tiff" },
                  { name: "JPEG Image", ext: ".jpeg" },
                  { name: "JPG Image", ext: ".jpg" },
                  { name: "SVG Vector", ext: ".svg" },
                  { name: "Bitmap", ext: ".bmp" },
                ].map((format, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-background/40 border border-border/50 hover:border-foreground/20 hover:bg-background/60 hover:scale-105 transition-all duration-300 group/item shadow-sm hover:shadow-xl min-w-[200px] snap-center aspect-square"
                  >
                    <div className="text-4xl font-black text-foreground/20 group-hover/item:text-foreground/80 transition-colors duration-500">
                      {format.ext}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover/item:text-foreground transition-colors text-center">
                      {format.name}
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 left-0 z-20 opacity-0 group-hover/scroll:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-background -ml-6 pointer-events-auto"
                  onClick={() => scroll("left")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20 opacity-0 group-hover/scroll:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-background -mr-6 pointer-events-auto"
                  onClick={() => scroll("right")}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
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
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t.footer.privacy}
                </Link>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t.footer.terms}
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookies
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
