"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, Zap, ChevronLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/components/language-context"
import { usePathname } from "next/navigation"

interface HeaderProps {
    showBackButton?: boolean
}

export default function Header({ showBackButton = false }: HeaderProps) {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)
    const { t } = useTranslation()
    const pathname = usePathname()
    const isTransformerPage = pathname === "/ai-transformer"

    return (
        <header className="sticky top-0 z-50 bg-[#F9F9FB] dark:bg-zinc-900/90 border-b border-border/40 backdrop-blur-sm transition-all duration-300">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="transition-all duration-300 hover:bg-primary/10 hover:scale-105"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    <Link href="/" className="flex items-center gap-2">
                        <h1
                            className="text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
                            style={{ fontFamily: "var(--font-bodoni)" }}
                        >
                            Doccoder
                        </h1>
                    </Link>
                    {!showBackButton && (
                        <nav className="hidden gap-6 md:flex items-center ml-4">
                            <a
                                href="/#features"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t.nav.features}
                            </a>
                            <a
                                href="/#pricing"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t.nav.pricing}
                            </a>
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSelector />

                    {!isTransformerPage && (
                        <Link href="/ai-transformer" target="_blank">
                            <Button
                                size="sm"
                                className="hidden md:inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 relative group overflow-hidden shadow-lg hover:scale-105 active:scale-95"
                                onMouseEnter={() => setHoveredButton("start-translating")}
                                onMouseLeave={() => setHoveredButton(null)}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {t.hero.cta}
                                    <Star
                                        className={`h-4 w-4 transition-all duration-300 ${hoveredButton === "start-translating"
                                            ? "fill-current scale-110 rotate-90"
                                            : "scale-0 rotate-0 opacity-0"
                                            }`}
                                    />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Button>
                        </Link>
                    )}

                    <Link href="/auth/login">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:inline-flex items-center gap-2 transition-all duration-300 hover:bg-foreground hover:text-background group"
                            onMouseEnter={() => setHoveredButton("signin")}
                            onMouseLeave={() => setHoveredButton(null)}
                        >
                            {t.nav.signIn}
                            <Star className={`h-3.5 w-3.5 transition-colors ${hoveredButton === "signin" ? "fill-current text-white dark:text-black" : "text-transparent"}`} />
                        </Button>
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
