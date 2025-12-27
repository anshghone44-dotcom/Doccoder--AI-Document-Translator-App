"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Zap, ChevronLeft, Globe } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/components/language-context"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
    showBackButton?: boolean
}

export default function Header({ showBackButton = false }: HeaderProps) {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)
    const [scrolled, setScrolled] = useState(false)
    const { t } = useTranslation()
    const pathname = usePathname()
    const router = useRouter()
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden md:inline-flex items-center gap-2 transition-all duration-300 hover:bg-foreground hover:text-background group"
                            >
                                <Globe className="h-4 w-4" />
                                Translate
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=English')}>
                                English
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=Hindi')}>
                                Hindi
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=Marathi')}>
                                Marathi
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=Gujarati')}>
                                Gujarati
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=Korean')}>
                                Korean
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=Tamil')}>
                                Tamil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=French')}>
                                French
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=Spanish')}>
                                Spanish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=German')}>
                                German
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/translate?lang=Swiss German')}>
                                Swiss German
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <LanguageSelector />

                    <Link href="#">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:inline-flex items-center gap-2 transition-all duration-300 hover:bg-foreground hover:text-background group"
                        >
                            {t.footer.download}
                            <Star className="h-3.5 w-3.5 text-transparent transition-colors group-hover:fill-current group-hover:text-white dark:group-hover:text-black" />
                        </Button>
                    </Link>

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
