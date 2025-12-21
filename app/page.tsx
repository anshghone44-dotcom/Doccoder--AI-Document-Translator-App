import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Building2, CheckCircle2, Globe } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
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
                Platform
              </a>
              <a
                href="#solutions"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Solutions
              </a>
              <a
                href="#security"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Security
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
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Try Now
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">Enterprise-Grade Security & Compliance</span>
            </div>

            <h1 className="font-serif text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl text-balance">
              AI-Powered Document Translation for <span className="text-primary">Global Enterprises</span>
            </h1>

            <p className="text-xl text-muted-foreground text-balance leading-relaxed">
              Translate legal contracts, compliance documents, and enterprise content with guaranteed accuracy. Trusted
              by Fortune 500 companies worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/ai-transformer">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </div>

            <div className="pt-12 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-6">Trusted by leading enterprises</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
                {["Microsoft", "Salesforce", "IBM", "SAP", "Oracle", "Adobe"].map((company) => (
                  <div key={company} className="text-lg font-semibold text-muted-foreground">
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold md:text-4xl mb-4">Purpose-Built for Enterprise Needs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Industry-specific solutions with guaranteed accuracy for mission-critical documents
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Legal & Compliance",
                description: "Multi-model validation for contracts and regulatory documents with audit trails.",
                features: ["99.9% accuracy guarantee", "Legal terminology database", "Compliance tracking"],
              },
              {
                icon: Building2,
                title: "Financial Services",
                description: "Secure translation for financial statements, reports, and sensitive documents.",
                features: ["SOC 2 Type II certified", "Real-time validation", "Multi-currency support"],
              },
              {
                icon: Globe,
                title: "Healthcare & Life Sciences",
                description: "HIPAA-compliant translation for medical records and clinical documentation.",
                features: ["Medical terminology AI", "HIPAA compliance", "Clinical accuracy"],
              },
            ].map((solution, idx) => (
              <div
                key={idx}
                className="group rounded-xl border border-border bg-card p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <solution.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                <p className="text-muted-foreground mb-6">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">AI-Powered Accuracy</span>
              </div>
              <h2 className="font-serif text-4xl font-bold">Translation with Legal Accuracy Guarantee</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our multi-model AI system cross-validates every translation, providing line-by-line justification and
                confidence scores. Perfect for contracts, compliance documents, and regulatory filings.
              </p>
              <ul className="space-y-4">
                {[
                  "Multi-model validation (GPT-4, Claude, Grok)",
                  "Domain-specific glossaries and terminology",
                  "Line-by-line translation justification",
                  "Confidence scoring and quality metrics",
                  "Real-time collaboration and review",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/ai-transformer">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Try Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Translation Accuracy</span>
                  <span className="text-sm font-bold text-primary">99.2%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[99.2%]" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { label: "Documents", value: "500K+" },
                    { label: "Languages", value: "150+" },
                    { label: "Uptime", value: "99.99%" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold md:text-4xl mb-4">Enterprise-Grade Security & Compliance</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for organizations that can't afford translation errors
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "SOC 2 Type II", icon: Shield },
              { label: "GDPR Compliant", icon: Shield },
              { label: "HIPAA Ready", icon: Shield },
              { label: "ISO 27001", icon: Shield },
            ].map((cert, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-card p-6">
                <cert.icon className="h-8 w-8 text-primary" />
                <span className="font-semibold">{cert.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center">
            <h3 className="text-2xl font-bold mb-4">99.9% Accuracy Guarantee</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Our multi-model validation system ensures translation accuracy that meets legal and compliance standards.
              Backed by comprehensive audit trails and justification reports.
            </p>
            <Button size="lg" variant="outline">
              Read Security Documentation
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">Ready to Transform Your Enterprise Translation?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join leading enterprises using Doccoder for mission-critical document translation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-transformer">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-bodoni)" }}>
                Doccoder
              </h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade AI translation with guaranteed accuracy</p>
            </div>

            {[
              {
                title: "Product",
                links: ["Platform", "Solutions", "Pricing", "Security"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Partners"],
              },
              {
                title: "Resources",
                links: ["Documentation", "API", "Support", "Status"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
