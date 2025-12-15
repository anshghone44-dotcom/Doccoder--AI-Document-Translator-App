import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, FileText, Palette, Upload, Settings, Download } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl transition-all duration-300 ease-out">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 animate-in fade-in duration-500">
            <h1
              className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent logo-flip cursor-pointer transition-all duration-300"
              style={{ fontFamily: "var(--font-bodoni)" }}
            >
              Doccoder
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden gap-8 md:flex items-center">
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
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center md:py-32">
          <div className="space-y-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/30 px-4 py-2 hover:scale-105 transition-all duration-300 shadow-sm">
              <Zap className="h-4 w-4 text-blue-500 fill-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                AI-Powered Document Transformation
              </span>
            </div>
            <h2 className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-serif text-balance text-5xl font-bold md:text-6xl lg:text-7xl text-gray-900 dark:text-white">
              Transform Documents with{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
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
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white w-full sm:w-auto hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  Start Converting
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center animate-in fade-in duration-500">
          <h3 className="font-serif text-3xl font-bold md:text-4xl">Powerful Features</h3>
          <p className="mt-2 text-muted-foreground">Everything you need for professional document conversion</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Multiple Formats",
              description: "Convert to PDF, Word, Excel, JSON, XML, Markdown, RTF, and more.",
              gradient: "from-blue-500 to-cyan-400",
              bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
            },
            {
              icon: Palette,
              title: "Custom Templates",
              description: "Choose from Minimal, Professional, or Photo templates with adjustable margins.",
              gradient: "from-purple-500 to-pink-400",
              bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
            },
            {
              icon: Zap,
              title: "Instant Processing",
              description: "Fast AI-powered conversion with real-time preview and editing capabilities.",
              gradient: "from-orange-500 to-yellow-400",
              bgGradient: "from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className={`animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border border-border/50 bg-gradient-to-br ${feature.bgGradient} p-6 backdrop-blur transition-all duration-300 hover:shadow-xl hover:shadow-${feature.gradient.split("-")[1]}-500/10 hover:-translate-y-1`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div
                  className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg hover:scale-110 transition-all duration-300`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h4 className="mb-2 text-xl font-semibold">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center animate-in fade-in duration-500">
            <h3 className="font-serif text-3xl font-bold md:text-4xl">How It Works</h3>
            <p className="mt-2 text-muted-foreground">Three simple steps to transform your documents</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400" />

            {[
              {
                step: "1",
                title: "Upload",
                description: "Select files or drag and drop to upload",
                icon: Upload,
                gradient: "from-blue-500 to-cyan-400",
              },
              {
                step: "2",
                title: "Customize",
                description: "Choose format, template, and settings",
                icon: Settings,
                gradient: "from-purple-500 to-pink-400",
              },
              {
                step: "3",
                title: "Download",
                description: "Get your converted file instantly",
                icon: Download,
                gradient: "from-orange-500 to-yellow-400",
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative text-center"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-2xl font-bold text-white shadow-lg hover:scale-110 transition-all duration-300 relative z-10`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <div
                    className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-sm font-bold text-white -mt-4 relative z-20`}
                  >
                    {item.step}
                  </div>
                  <h4 className="mb-2 text-xl font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="animate-in fade-in duration-500 rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 p-12 text-center shadow-2xl shadow-blue-500/25">
            <h3 className="font-serif text-3xl font-bold md:text-4xl text-white">Ready to Transform Your Documents?</h3>
            <p className="mt-4 text-blue-100">Start converting files with AI intelligence today</p>
            <Link href="/ai-transformer" className="mt-8 inline-block">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 bg-background py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-4">
          <h2
            className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-bodoni)" }}
          >
            Doccoder
          </h2>
          <p className="text-sm text-muted-foreground">© 2025 Doccoder. All rights reserved. Powered by AI.</p>
        </div>
      </footer>
    </main>
  )
}
