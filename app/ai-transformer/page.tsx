import TransformChat from "@/components/transform-chat"
import ReverseTransformChat from "@/components/reverse-transform-chat"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-secondary to-background">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="transition-all duration-300 hover:bg-primary/10 hover:scale-105"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 animate-in fade-in duration-500">
              <h1
                className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent logo-flip cursor-pointer transition-all duration-300"
                style={{ fontFamily: "Erstoria Bold Serif Display Font" }}
              >
                Doccoder
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden gap-8 md:flex">
              <a
                href="#convert-to"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                Convert to PDF
              </a>
              <a
                href="#convert-from"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                Convert from PDF
              </a>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center md:py-24">
        <div className="space-y-4">
          <h2 className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-playfair text-balance text-4xl font-bold md:text-5xl lg:text-6xl">
            Transform Documents with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h2>
          <p className="animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto max-w-2xl text-lg text-muted-foreground">
            Convert between PDF and multiple formats instantly. Powered by advanced AI technology.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-16 px-6 pb-16">
        {/* Convert to PDF Section */}
        <section id="convert-to" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Convert to PDF</h2>
            <p className="text-muted-foreground">
              PDF documents can be easily converted and translated. 
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur transition-all duration-300 hover:shadow-xl hover:border-primary/50">
            <TransformChat />
          </div>
        </section>

        {/* Convert from PDF Section */}
        <section id="convert-from" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Convert from PDF</h2>
            <p className="text-muted-foreground">
              All types of files can be converted and translated with AI assistance. 
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
