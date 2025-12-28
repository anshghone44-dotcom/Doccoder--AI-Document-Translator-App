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
import { Star, Zap, Shield, Users, User, Mail, Lock, Eye, EyeOff, Globe, Cpu, Layers, ArrowRight } from "lucide-react"
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
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
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="max-w-md space-y-8 relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-xs font-semibold tracking-widest uppercase text-primary">
                <Cpu className="h-4 w-4" />
                Next-Gen AI Core
              </div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Neural Document
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/40 block mt-2">
                  Intelligence
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                Architecting the future of global communication.
                Deploy advanced neural translation models with enterprise-grade precision.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-8">
              <div className="group flex items-center gap-4 p-5 rounded-3xl bg-card/30 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/50">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Military-Grade Security</h3>
                  <p className="text-sm text-muted-foreground/80">End-to-end encryption for sensitive data</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 p-5 rounded-3xl bg-card/30 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/50">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Global Scalability</h3>
                  <p className="text-sm text-muted-foreground/80">Optimized for 100+ languages and formats</p>
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
            <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group/card px-1 pt-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />

              {/* Tech-inspired background pattern */}
              <div className="absolute inset-0 opacity-[0.05]">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M30 30h2v2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[64px] rounded-full -mr-16 -mt-16 animate-pulse" />

              <CardContent className="p-8 relative z-10">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                      {error}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        First Name
                      </Label>
                      <div className={`relative transition-all duration-300 ${focusedField === 'firstName' ? 'transform scale-[1.02]' : ''}`}>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onFocus={() => setFocusedField('firstName')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className={`h-12 pl-4 pr-4 bg-background/30 border-2 backdrop-blur-sm transition-all duration-300 rounded-xl text-foreground placeholder:text-muted-foreground/50 ${focusedField === 'firstName'
                              ? 'border-primary/60 shadow-lg shadow-primary/10 bg-background/50'
                              : 'border-border/30 hover:border-border/60'
                            }`}
                        />
                        {focusedField === 'firstName' && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent pointer-events-none animate-pulse" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Last Name
                      </Label>
                      <div className={`relative transition-all duration-300 ${focusedField === 'lastName' ? 'transform scale-[1.02]' : ''}`}>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          onFocus={() => setFocusedField('lastName')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className={`h-12 pl-4 pr-4 bg-background/30 border-2 backdrop-blur-sm transition-all duration-300 rounded-xl text-foreground placeholder:text-muted-foreground/50 ${focusedField === 'lastName'
                              ? 'border-primary/60 shadow-lg shadow-primary/10 bg-background/50'
                              : 'border-border/30 hover:border-border/60'
                            }`}
                        />
                        {focusedField === 'lastName' && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent pointer-events-none animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`h-12 pl-4 pr-4 bg-background/30 border-2 backdrop-blur-sm transition-all duration-300 rounded-xl text-foreground placeholder:text-muted-foreground/50 ${focusedField === 'email'
                            ? 'border-primary/60 shadow-lg shadow-primary/10 bg-background/50'
                            : 'border-border/30 hover:border-border/60'
                          }`}
                      />
                      {focusedField === 'email' && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent pointer-events-none animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`h-12 pl-4 pr-12 bg-background/30 border-2 backdrop-blur-sm transition-all duration-300 rounded-xl text-foreground placeholder:text-muted-foreground/50 ${focusedField === 'password'
                            ? 'border-primary/60 shadow-lg shadow-primary/10 bg-background/50'
                            : 'border-border/30 hover:border-border/60'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {focusedField === 'password' && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent pointer-events-none animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'transform scale-[1.02]' : ''}`}>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`h-12 pl-4 pr-12 bg-background/30 border-2 backdrop-blur-sm transition-all duration-300 rounded-xl text-foreground placeholder:text-muted-foreground/50 ${focusedField === 'confirmPassword'
                            ? 'border-primary/60 shadow-lg shadow-primary/10 bg-background/50'
                            : 'border-border/30 hover:border-border/60'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {focusedField === 'confirmPassword' && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent pointer-events-none animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 text-lg font-black relative overflow-hidden bg-primary text-primary-foreground shadow-[0_0_25px_-5px_rgba(var(--primary),0.4)] hover:shadow-primary/40 transition-all duration-500 rounded-2xl group/btn border border-primary/20"
                      onMouseEnter={() => setHoveredButton("signup")}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      {/* Animated scan line */}
                      <div className="absolute inset-0 w-full h-[2px] bg-white/20 -translate-y-[100px] group-hover/btn:animate-[scan_2s_infinite] pointer-events-none" />

                      {/* Gradient glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                      <div className="relative flex items-center justify-center gap-3">
                        {isLoading ? (
                          <>
                            <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            <span className="tracking-widest uppercase text-sm">Initializing Profile...</span>
                          </>
                        ) : (
                          <>
                            <Layers className={`h-5 w-5 transition-all duration-500 ${hoveredButton === "signup" ? "scale-110 rotate-180" : ""}`} />
                            <span className="tracking-widest uppercase text-sm">{st.button}</span>
                            <ArrowRight className={`h-5 w-5 transition-all duration-500 ${hoveredButton === "signup" ? "translate-x-1 opacity-100" : "opacity-0 -translate-x-2"}`} />
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-primary hover:text-primary/80 font-semibold transition-all duration-300 hover:underline underline-offset-4 relative group"
                    >
                      Sign in here
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
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
