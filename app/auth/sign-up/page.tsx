"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Star, Zap, Shield, Users } from "lucide-react"
import { useTranslation } from "@/components/language-context"

export default function SignUpPage() {
  const { t } = useTranslation()
  const { signup: st } = t.auth
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      const fullName = `${firstName} ${lastName}`.trim()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-transparent via-primary/2 to-transparent rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                AI-Powered Platform
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                Join the Future of
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 block mt-2">
                  Document Translation
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create your account and unlock unlimited access to advanced AI translation tools.
                Transform documents instantly with cutting-edge neural technology.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-8">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Enterprise Security</h3>
                  <p className="text-sm text-muted-foreground">Bank-level encryption for all your data</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">Work together seamlessly on translations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <Link href="/" className="inline-block">
                <h2 className="text-3xl font-black tracking-tight text-foreground hover:text-primary transition-colors" style={{ fontFamily: "var(--font-bodoni)" }}>
                  Doccoder
                </h2>
              </Link>
              <h3 className="text-2xl font-bold text-foreground">{st.title}</h3>
              <p className="text-muted-foreground">{st.subtitle}</p>
            </div>

            {/* Sign Up Form */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-8">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group"
                    onMouseEnter={() => setHoveredButton("signup")}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {st.button}
                        {hoveredButton === "signup" && <Star className="h-4 w-4 fill-current animate-pulse" />}
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
