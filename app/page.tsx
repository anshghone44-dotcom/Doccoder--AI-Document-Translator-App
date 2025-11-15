import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, FileText, Palette, Check, File as FileIcon, FileSpreadsheet, FileBarChart3, FileType, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import LiveDemo from "@/components/live-demo"
import HowItWorks from "@/components/how-it-works"
import TypewriterRotator from "@/components/typewriter-rotator"

export default function Home() {
  return (
    <main className="min-h-screen relative animated-mesh-gradient">
      {/* Animated floating gradient orbs */}
      <div className="gradient-orb gradient-orb-1" aria-hidden="true"></div>
      <div className="gradient-orb gradient-orb-2" aria-hidden="true"></div>
      <div className="gradient-orb gradient-orb-3" aria-hidden="true"></div>

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        {/* Navigation */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300 ease-out">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2 animate-in fade-in duration-500">
              <h1 className="font-playfair text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent logo-flip cursor-pointer transition-all duration-300">
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
                <a
                  href="#pricing"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  Pricing
                </a>
                <Link href="/ai-transformer">
                  <Button
                    size="sm"
                    className="glassy-btn"
                    data-testid="nav-get-started"
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
        <section className="mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <div className="relative mx-auto max-w-3xl">
            <div className="ai-pulse-glow" aria-hidden="true" />
            <div className="space-y-6 relative">
              <div className="animate-in fade-in inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 hover:scale-105 transition-all duration-300">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">AI-Powered Document Transformation</span>
              </div>
              <h2 className="animate-in fade-in font-playfair text-balance text-5xl font-bold md:text-6xl lg:text-7xl">
                Transform Documents with {" "}
                <span className="gradient-animated-text font-sans">AI Intelligence</span>
              </h2>
              <p className="animate-in fade-in mx-auto max-w-[620px] text-lg text-muted-foreground">
                Convert between PDF and 11+ formats instantly. Upload files, customize templates, and download in seconds.
              </p>
              <div className="flex justify-center">
                <TypewriterRotator prefix="Convert" suffix="instantly" />
              </div>
              <div className="animate-in fade-in flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/ai-transformer">
                  <Button
                    size="lg"
                    className="glassy-btn glow-cta group w-full sm:w-auto"
                    data-testid="hero-start-converting"
                  >
                    Start Converting
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a href="#live-demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    data-testid="hero-learn-more"
                  >
                    See Live Demo
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section id="live-demo" className="mx-auto max-w-7xl px-6 py-8 md:py-10">
          <div className="mb-6 text-center animate-in fade-in duration-500">
            <h3 className="font-playfair text-3xl font-bold md:text-4xl">Live Demo</h3>
            <p className="mt-2 text-muted-foreground max-w-[620px] mx-auto">Upload a file, watch the conversion animation, and preview the result. This is a simulated flow to show the experience.</p>
          </div>
          <LiveDemo />
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-12 text-center animate-in fade-in duration-500">
            <h3 className="font-playfair text-3xl font-bold md:text-4xl">Powerful Features</h3>
            <p className="mt-2 text-muted-foreground">Everything you need for professional document conversion</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[ 
              { icon: Sparkles, title: "OCR Text Extraction", desc: "Extract text from scans with high accuracy" },
              { icon: FileText, title: "Layout Retention", desc: "Preserve structure, fonts, and styling" },
              { icon: FileSpreadsheet, title: "Batch Conversion", desc: "Process multiple files in one go" },
              { icon: Palette, title: "Custom Templates", desc: "Choose themes & margins for PDFs" },
            ].map((f, idx) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur transition-all duration-300 hover:shadow-xl hover:border-primary/50" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold">{f.title}</h4>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
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
          <HowItWorks />
        </section>

        {/* File Format Grid */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 text-center">
            <h3 className="font-playfair text-3xl font-bold md:text-4xl">Supported Formats</h3>
            <p className="mt-2 text-muted-foreground">PDF, DOCX, XLSX, PPTX, TXT, CSV, EPUB</p>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-7">
            {[
              { label: "PDF", Icon: FileText },
              { label: "DOCX", Icon: FileIcon },
              { label: "XLSX", Icon: FileSpreadsheet },
              { label: "PPTX", Icon: FileBarChart3 },
              { label: "TXT", Icon: FileType },
              { label: "CSV", Icon: FileSpreadsheet },
              { label: "EPUB", Icon: FileType },
            ].map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card/50 p-4 backdrop-blur hover:shadow-md">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h3 className="font-playfair text-3xl font-bold md:text-4xl">Loved by professionals</h3>
            <p className="mt-2 text-muted-foreground">Here’s what early users say</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { quote: "Switched from 3 tools to one. The preview is a game-changer.", name: "Alex R.", role: "Product Manager" },
              { quote: "Best conversion quality I’ve seen. Layout stays perfect.", name: "Priya M.", role: "UX Designer" },
              { quote: "The simulated flow sold our team instantly.", name: "Marco D.", role: "Founder" },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border bg-card/50 p-6 backdrop-blur">
                <p className="text-sm">“{t.quote}”</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t.name}</span> — {t.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <h3 className="font-playfair text-3xl font-bold md:text-4xl">Simple Pricing</h3>
            <p className="mt-2 text-muted-foreground">Start free, upgrade anytime</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border bg-card/50 p-6 backdrop-blur">
              <h4 className="text-xl font-semibold">Free</h4>
              <p className="mt-1 text-sm text-muted-foreground">Great for trying things out</p>
              <div className="mt-6 text-4xl font-bold">$0</div>
              <ul className="mt-6 space-y-2 text-sm">
                {["5 conversions/day", "Basic templates", "Email support"].map((i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {i}</li>
                ))}
              </ul>
              <Button className="mt-6 glassy-btn" data-testid="pricing-choose-free">Get Started</Button>
            </div>
            {/* Pro */}
            <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-accent/10 p-6 backdrop-blur ring-1 ring-primary/10">
              <h4 className="text-xl font-semibold">Pro</h4>
              <p className="mt-1 text-sm text-muted-foreground">For teams and power users</p>
              <div className="mt-6 text-4xl font-bold">$19<span className="text-base font-medium text-muted-foreground">/mo</span></div>
              <ul className="mt-6 space-y-2 text-sm">
                {["Unlimited conversions", "OCR + Layout retention", "Batch & templates", "Priority support"].map((i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {i}</li>
                ))}
              </ul>
              <Button className="mt-6 glow-cta" data-testid="pricing-choose-pro">Upgrade</Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-background/50 py-8">
          <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
            <p>© 2025 Doccoder. All rights reserved. Powered by AI.</p>
          </div>
        </footer>
      </div>
    </main>
  )
}
