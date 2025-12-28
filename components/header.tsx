"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Zap, ChevronLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTranslation } from "@/components/language-context"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface HeaderProps {
    showBackButton?: boolean
}

export default function Header({ showBackButton = false }: HeaderProps) {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)
    const [scrolled, setScrolled] = useState(false)
    const { t } = useTranslation()
    const pathname = usePathname()
    const isTransformerPage = pathname === "/ai-transformer"

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "sticky top-0 z-50 transition-all duration-500",
                scrolled
                    ? "bg-background/80 backdrop-blur-lg border-b border-border/40 py-3 shadow-sm"
                    : "bg-transparent py-5 border-b border-transparent"
            )}
        >
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
                </div>

                <div className="flex items-center gap-4">
                    <Link href="#">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:inline-flex items-center gap-2 transition-all duration-300 hover:bg-primary/15 hover:text-primary hover:scale-105 group"
                        >
                            {t.footer.download}
                            <Star className="h-3.5 w-3.5 text-transparent transition-colors group-hover:fill-primary group-hover:text-primary" />
                        </Button>
                    </Link>

                    <Link href="/auth/login">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:inline-flex items-center gap-2 transition-all duration-300 hover:bg-primary/15 hover:text-primary hover:scale-105 group"
                            onMouseEnter={() => setHoveredButton("signin")}
                            onMouseLeave={() => setHoveredButton(null)}
                        >
                            {t.nav.signIn}
                            <Star className={`h-3.5 w-3.5 transition-colors ${hoveredButton === "signin" ? "fill-primary text-primary" : "text-transparent"}`} />
                        </Button>
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
