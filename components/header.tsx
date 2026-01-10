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
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/40 py-3 shadow-lg"
                    : "bg-transparent py-5 border-b border-transparent"
            )}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="transition-all duration-300 hover:bg-primary/10 hover:scale-110 active:scale-90"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    <Link href="/" className="flex items-center gap-2 group">
                        <h1
                            className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-all duration-500 group-hover:scale-105"
                            style={{ fontFamily: "var(--font-bodoni)" }}
                        >
                            Doccoder
                        </h1>
                    </Link>
                    <nav className="hidden gap-8 md:flex items-center ml-8">
                        {["features", "pricing"].map((item) => (
                            <Link
                                key={item}
                                href={`/#${item}`}
                                className="relative text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group/link"
                            >
                                {t.nav[item as keyof typeof t.nav]}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/link:w-full" />
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="#">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:inline-flex items-center gap-2 font-bold transition-all duration-500 hover:bg-primary/10 hover:text-primary hover:scale-105 group"
                        >
                            {t.footer.download}
                            <Star className="h-4 w-4 text-transparent transition-all duration-500 group-hover:fill-primary group-hover:text-primary group-hover:rotate-12" />
                        </Button>
                    </Link>

                    <Link href="/auth/login">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:inline-flex items-center gap-2 font-bold px-4 py-2 rounded-xl transition-all duration-500 hover:bg-foreground hover:text-background hover:scale-105 active:scale-95 group"
                            onMouseEnter={() => setHoveredButton("signin")}
                            onMouseLeave={() => setHoveredButton(null)}
                        >
                            {t.nav.signIn}
                            <Star className={cn("h-4 w-4 transition-all duration-500 group-hover:rotate-[144deg]", hoveredButton === "signin" ? "fill-current" : "opacity-0")} />
                        </Button>
                    </Link>

                    <Link href="/signup">
                        <Button
                            size="sm"
                            className="hidden md:inline-flex items-center gap-2 font-bold px-6 py-2 rounded-xl transition-all duration-500 bg-primary text-primary-foreground hover:bg-white hover:text-black hover:scale-105 active:scale-95 group"
                            onMouseEnter={() => setHoveredButton("signup")}
                            onMouseLeave={() => setHoveredButton(null)}
                        >
                            {t.nav.signUp}
                            <Star className={cn("h-4 w-4 transition-all duration-500 group-hover:rotate-[144deg]", hoveredButton === "signup" ? "fill-current" : "opacity-0")} />
                        </Button>
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
