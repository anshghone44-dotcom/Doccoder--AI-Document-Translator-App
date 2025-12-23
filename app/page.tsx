"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, FileCheck, Lock, Gauge, Star } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadZone } from "@/components/upload-zone"
import { useState } from "react"

export default function Home() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-muted transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <h1
                className="text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
                style={{ fontFamily: "var(--font-bodoni)" }}
              >
                Doccoder
              </h1>
            </Link>
            <nav className="hidden gap-6 md:flex items-center">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex items-center gap-2 transition-all duration-300 hover:bg-foreground hover:text-background group"
                onMouseEnter={() => setHoveredButton("signin")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                Sign In
                <Star className={`h-3 w-3 transition-colors ${hoveredButton === "signin" ? "fill-current text-white dark:text-black" : "text-transparent"}`} />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,0,0,0.02),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-4 py-1.5 text-sm shadow-lg">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">AI-Powered Translation Technology</span>
            </div>

            <h1 className="font-sans text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl text-balance animate-in fade-in slide-in-from-bottom-4 duration-700">
              Make your work clear with Doccoder
            </h1>

            <p className="text-xl text-muted-foreground text-balance leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Experience lightning-fast document translation with unmatched accuracy and complete privacy.
              Your documents, translated perfectly in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground relative transition-all duration-300"
                asChild
              >
                <a href="#upload">
                  Start Translating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Upload Section */}
          <div id="upload" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <UploadZone />
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-sans text-3xl font-bold md:text-4xl mb-4">
              Why Choose Doccoder?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade translation powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: "AI-Powered Translation",
                description: "Advanced neural networks deliver human-quality translations in seconds.",
              },
              {
                icon: FileCheck,
                title: "Preserves Formatting",
                description: "Maintains your document's original layout, fonts, and styling perfectly.",
              },
              {
                icon: Lock,
                title: "Secure & Private",
                description: "End-to-end encryption ensures your documents remain completely confidential.",
              },
              {
                icon: Gauge,
                title: "Fast Turnaround",
                description: "Get professional translations instantly, no waiting required.",
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
                Supported Document Formats
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We support all major document formats for seamless translation
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


      <section id="pricing" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-sans text-4xl font-bold mb-6">
            Ready to Transform Your Documents?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start translating with AI-powered accuracy today
          </p>

        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-bodoni)" }}>
                Doccoder
              </h3>
              <p className="text-sm text-muted-foreground">
                AI-powered document translation with guaranteed accuracy and privacy
              </p>
            </div>


          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Doccoder. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
