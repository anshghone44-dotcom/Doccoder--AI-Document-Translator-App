"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Github, Star } from "lucide-react"
import { useTranslation } from "@/components/language-context"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

const COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "India", "Japan", "China", "Brazil", "Mexico", "Spain",
    "Italy", "Netherlands", "Sweden", "Switzerland", "Singapore", "Other"
]

const COUNTRY_CODES = [
    { country: "United States", code: "+1" },
    { country: "United Kingdom", code: "+44" },
    { country: "Canada", code: "+1" },
    { country: "Australia", code: "+61" },
    { country: "Germany", code: "+49" },
    { country: "France", code: "+33" },
    { country: "India", code: "+91" },
    { country: "Japan", code: "+81" },
    { country: "China", code: "+86" },
    { country: "Brazil", code: "+55" },
    { country: "Mexico", code: "+52" },
    { country: "Spain", code: "+34" },
    { country: "Italy", code: "+39" },
    { country: "Netherlands", code: "+31" },
    { country: "Sweden", code: "+46" },
    { country: "Switzerland", code: "+41" },
    { country: "Singapore", code: "+65" },
    { country: "Other", code: "+" },
]

export default function SignupPage() {
    const { t } = useTranslation()
    const { signup: st, login: lt } = t.auth
    const [currentStep, setCurrentStep] = useState(1)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneCode, setPhoneCode] = useState("+91")
    const [phone, setPhone] = useState("")
    const [country, setCountry] = useState("")
    const [dob, setDob] = useState("")
    const [password, setPassword] = useState("")
    const [repeatPassword, setRepeatPassword] = useState("")
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

    const nextStep = () => {
        setError(null)
        if (currentStep === 1) {
            if (!firstName || !lastName || !email) {
                setError("Please fill in all personal details")
                return
            }
            if (!email.includes("@")) {
                setError("Please enter a valid email address")
                return
            }
        } else if (currentStep === 2) {
            if (!password || !repeatPassword) {
                setError("Please set your security credentials")
                return
            }
            if (password !== repeatPassword) {
                setError("Passwords do not match")
                return
            }
            if (password.length < 8) {
                setError("Password must be at least 8 characters")
                return
            }
        }
        setCurrentStep(prev => prev + 1)
    }

    const prevStep = () => {
        setError(null)
        setCurrentStep(prev => prev - 1)
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            const fullName = `${firstName} ${lastName}`.trim()
            const fullPhone = phone ? `${phoneCode}${phone}` : ""
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        full_name: fullName,
                        phone: fullPhone,
                        country: country,
                        date_of_birth: dob,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (signUpError) throw signUpError
            router.push("/translate")
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const steps = [
        { title: "Profile", description: "Identity setup" },
        { title: "Security", description: "Account protection" },
        { title: "Finalize", description: "Linguistic region" }
    ]

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-[#0a0a0a] relative overflow-hidden">
            {/* Professional Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />

            <div className="w-full max-w-lg relative z-10">
                <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
                    <Link href="/">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                                <Star className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                                Doccoder
                            </h1>
                        </div>
                    </Link>
                    <p className="text-muted-foreground/60 text-sm font-medium tracking-widest uppercase">
                        Enterprise Document Intelligence
                    </p>
                </div>

                <Card className="shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-white/5 bg-black/40 backdrop-blur-2xl rounded-[2rem] overflow-hidden">
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 flex">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-full transition-all duration-700 ease-in-out",
                                    currentStep > i ? "bg-primary flex-1" : "w-0"
                                )}
                            />
                        ))}
                    </div>

                    <CardHeader className="pt-8 px-8 pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                    Step {currentStep} of 3
                                </span>
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                                {steps[currentStep - 1].title}
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-white">{st.title}</CardTitle>
                        <CardDescription className="text-muted-foreground font-medium">{steps[currentStep - 1].description}</CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 pt-0">
                        {/* Error Handling */}
                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 animate-in shake-in duration-300">
                                <p className="text-xs font-bold text-destructive flex items-center gap-2 uppercase tracking-wide">
                                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                                    {error}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSignUp} className="space-y-6">
                            {/* STEP 1: PERSONAL INFO */}
                            {currentStep === 1 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="firstName">{st.firstName}</Label>
                                            <Input
                                                id="firstName"
                                                className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/20"
                                                placeholder="John"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="lastName">{st.lastName}</Label>
                                            <Input
                                                id="lastName"
                                                className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/20"
                                                placeholder="Doe"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="email">{lt.email}</Label>
                                        <Input
                                            id="email"
                                            className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/20"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="relative pt-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-white/5" />
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                            <span className="bg-black/20 px-3 text-muted-foreground/60 backdrop-blur-xl rounded-full border border-white/5 py-1">Secure Sign-Up Options</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-2xl h-12 border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest"
                                            onClick={() => handleOAuthSignIn("google")}
                                        >
                                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Google
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-2xl h-12 border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest"
                                            onClick={() => handleOAuthSignIn("github")}
                                        >
                                            <Github className="mr-2 h-4 w-4" />
                                            GitHub
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: SECURITY */}
                            {currentStep === 2 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="password">{lt.password}</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/20"
                                            placeholder="Minimum 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        {password && (
                                            <div className="flex gap-1 pt-1 ml-1">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "h-1 flex-1 rounded-full transition-all duration-500",
                                                            password.length >= i * 2 ? "bg-primary" : "bg-white/5"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="repeatPassword">{st.confirmPassword}</Label>
                                        <Input
                                            id="repeatPassword"
                                            type="password"
                                            className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/20"
                                            placeholder="Confirm password"
                                            value={repeatPassword}
                                            onChange={(e) => setRepeatPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: REGION & PREFERENCES */}
                            {currentStep === 3 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{st.phone}</Label>
                                        <div className="flex gap-2">
                                            <Select value={phoneCode} onValueChange={setPhoneCode}>
                                                <SelectTrigger className="w-[100px] bg-white/5 border-white/10 rounded-2xl h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0a0a0a] border-white/10 rounded-2xl">
                                                    {COUNTRY_CODES.map((item) => (
                                                        <SelectItem key={item.code + item.country} value={item.code}>
                                                            <span className="text-[10px] font-bold">{item.code} {item.country}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                id="phone"
                                                className="flex-1 bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/20 font-bold tracking-tight"
                                                placeholder="Mobile Number"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="country">{st.country}</Label>
                                        <Select value={country} onValueChange={setCountry}>
                                            <SelectTrigger id="country" className="bg-white/5 border-white/10 rounded-2xl h-12">
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0a0a0a] border-white/10 rounded-2xl">
                                                <ScrollArea className="h-48">
                                                    {COUNTRIES.map((c) => (
                                                        <SelectItem key={c} value={c} className="text-xs font-medium">
                                                            {c}
                                                        </SelectItem>
                                                    ))}
                                                </ScrollArea>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="dob">{st.dob}</Label>
                                        <Input
                                            id="dob"
                                            type="date"
                                            className="bg-white/5 border-white/10 rounded-2xl h-12 focus:ring-primary/20 text-xs font-bold uppercase tracking-widest invert dark:invert-0"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Navigation Controls */}
                            <div className="flex gap-3 pt-6">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="rounded-2xl h-14 border border-white/5 text-muted-foreground hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-[0.2em]"
                                        onClick={prevStep}
                                        disabled={isLoading}
                                    >
                                        Back
                                    </Button>
                                )}

                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        className="flex-1 rounded-2xl h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_8px_30px_-12px_rgba(var(--primary),0.5)]"
                                        onClick={nextStep}
                                    >
                                        Proceed
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="flex-1 rounded-2xl h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_8px_30px_-12px_rgba(var(--primary),0.5)]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? st.submitting : st.submit}
                                    </Button>
                                )}
                            </div>

                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                    <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em] leading-relaxed">
                        Protected by Doccoder Global Security Protocols<br />
                        &copy; 2026 Doccoder Intelligence Systems
                    </p>
                </div>
            </div>
        </div>
    )
}
