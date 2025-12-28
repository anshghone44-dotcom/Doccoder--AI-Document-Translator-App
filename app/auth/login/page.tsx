"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Star } from "lucide-react"
import { useTranslation } from "@/components/language-context"

export default function LoginPage() {
  const { t } = useTranslation()
  const { login: lt } = t.auth
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const router = useRouter()

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/ai-transformer")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-foreground/[0.02] rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-foreground/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link href="/">
            <h1 className="text-4xl font-black tracking-tighter hover:text-primary transition-colors duration-500" style={{ fontFamily: "var(--font-bodoni)" }}>
              Doccoder
            </h1>
          </Link>
        </div>

        <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-border/50 backdrop-blur-xl bg-card/60 rounded-3xl overflow-hidden animate-in fade-in scale-95 duration-700 delay-200">
          <CardHeader>
            <CardTitle className="text-2xl">{lt.title}</CardTitle>
            <CardDescription>{lt.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full relative transition-all duration-300 hover:bg-primary hover:text-primary-foreground group"
                onClick={() => handleOAuthSignIn("github")}
                onMouseEnter={() => setHoveredButton("github")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {lt.github}
                {hoveredButton === "github" && (
                  <Star className="absolute right-3 h-4 w-4 fill-current" />
                )}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase items-center gap-2">
                <span className="bg-card px-2 text-muted-foreground">
                  {lt.or}
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{lt.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{lt.password}</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      {lt.forgot}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  className="w-full relative transition-all duration-300 hover:bg-primary/90 group"
                  disabled={isLoading}
                  onMouseEnter={() => setHoveredButton("submit")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {isLoading ? lt.submitting : lt.submit}
                  {hoveredButton === "submit" && !isLoading && (
                    <Star className="absolute right-3 h-4 w-4 fill-current" />
                  )}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {lt.noAccount}{" "}
                <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                  {lt.create}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
