import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, FileText, Palette } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-secondary to-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300 ease-out">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="w-16" />

          <div className="flex items-center gap-2 animate-in fade-in duration-500">
            <h1 className="font-playfair text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Doccoder
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden gap-8 md:flex">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                How It Works
              </a>
              <Link href="/ai-transformer">
                <Button
                  size="sm"
                  className="bg-gradient-to-br from-primary to-accent text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center md:py-32">
        <div className="space-y-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 hover:scale-105 transition-all duration-300">
            <Zap className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">AI-Powered Document Transformation</span>
          </div>
          <h2 className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-playfair text-balance text-5xl font-bold md:text-6xl lg:text-7xl">
            Transform Documents with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h2>
          <p className="animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto max-w-2xl text-lg text-muted-foreground">
            Convert between PDF and 11+ formats instantly. Upload files, customize templates, and download in seconds.
            Powered by advanced AI technology.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/ai-transformer">
              <Button
                size="lg"
                className="bg-gradient-to-br from-primary to-accent text-primary-foreground w-full sm:w-auto hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Start Converting{" "}
                <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center animate-in fade-in duration-500">
          <h3 className="font-playfair text-3xl font-bold md:text-4xl">Powerful Features</h3>
          <p className="mt-2 text-muted-foreground">Everything you need for professional document conversion</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Multiple Formats",
              description: "Convert to PDF, Word, Excel, JSON, XML, Markdown, RTF, and more.",
            },
            {
              icon: Palette,
              title: "Custom Templates",
              description: "Choose from Minimal, Professional, or Photo templates with adjustable margins.",
            },
            {
              icon: Zap,
              title: "Instant Processing",
              description: "Fast AI-powered conversion with real-time preview and editing capabilities.",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur transition-all duration-300 hover:shadow-xl hover:border-primary/50"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 hover:scale-105 transition-all duration-300">
                  <Icon className="h-6 w-6 text-primary transition-all duration-300" />
                </div>
                <h4 className="mb-2 text-lg font-semibold">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center animate-in fade-in duration-500">
          <h3 className="font-playfair text-3xl font-bold md:text-4xl">How It Works</h3>
          <p className="mt-2 text-muted-foreground">Three simple steps to transform your documents</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: "1", title: "Upload", description: "Select files or drag and drop to upload" },
            { step: "2", title: "Customize", description: "Choose format, template, and settings" },
            { step: "3", title: "Download", description: "Get your converted file instantly" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground hover:scale-105 transition-all duration-300">
                {item.step}
              </div>
              <h4 className="mb-2 text-lg font-semibold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {idx < 2 && (
                <div className="absolute -right-4 top-6 hidden h-0.5 w-8 bg-gradient-to-r from-primary to-transparent md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="animate-in fade-in duration-500 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
          <h3 className="font-playfair text-3xl font-bold md:text-4xl">Ready to Transform Your Documents?</h3>
          <p className="mt-4 text-muted-foreground">Start converting files with AI intelligence today</p>
          <Link href="/ai-transformer" className="mt-6 inline-block">
            <Button
              size="lg"
              className="bg-gradient-to-br from-primary to-accent text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Doccoder. All rights reserved. Powered by AI.</p>
        </div>
      </footer>
    </main>
  )
}
