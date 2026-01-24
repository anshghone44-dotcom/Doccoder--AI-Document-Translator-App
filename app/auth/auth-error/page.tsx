"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,222,128,0.1),transparent_50%)]" />

            <div className="w-full max-w-md relative z-10">
                <div className="mb-8 text-center">
                    <Link href="/">
                        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-bodoni)" }}>
                            Doccoder
                        </h1>
                    </Link>
                </div>

                <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl">Authentication Error</CardTitle>
                        <CardDescription>There was a problem signing you in</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">
                                We encountered an error while trying to authenticate your account. This could be due to:
                            </p>
                            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                                <li>Network connectivity issues</li>
                                <li>Invalid or expired authentication token</li>
                                <li>OAuth provider configuration error</li>
                            </ul>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                                <Link href="/auth/login">Try Again</Link>
                            </Button>

                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/">Go to Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
