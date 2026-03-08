"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Globe, HardDrive, Clock } from "lucide-react"

interface VercelProject {
    id: string
    name: string
    framework: string
    updatedAt: number
    link?: string
    targets?: {
        production?: {
            url: string
        }
    }
}

export function VercelProjectList() {
    const [projects, setProjects] = useState<VercelProject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await fetch("/api/projects")
                const data = await response.json()

                if (response.ok) {
                    setProjects(data)
                } else {
                    setError(data.error || "Failed to fetch projects")
                }
            } catch (err) {
                setError("Failed to connect to API")
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 rounded-3xl bg-card/40 animate-pulse border border-foreground/5" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Card className="border-red-500/50 bg-red-500/5">
                <CardHeader>
                    <CardTitle className="text-red-500">Vercel Integration Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (projects.length === 0) {
        return (
            <Card className="bg-card/40 backdrop-blur-xl border-foreground/10">
                <CardHeader>
                    <CardTitle>Vercel Projects</CardTitle>
                    <CardDescription>No projects found in this account.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <Card key={project.id} className="group overflow-hidden rounded-[2rem] bg-card/40 backdrop-blur-xl border-foreground/10 hover:border-primary/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-primary/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                    {project.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="rounded-lg bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-wider px-2">
                                        {project.framework || "Other"}
                                    </Badge>
                                </div>
                            </div>
                            <a
                                href={`https://vercel.com/project/${project.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-foreground/5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-95"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="p-2 rounded-lg bg-foreground/5">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <span className="truncate">
                                    {project.targets?.production?.url || "Not deployed"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="p-2 rounded-lg bg-foreground/5">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <span>
                                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-foreground/5">
                            <a
                                href={project.targets?.production?.url ? `https://${project.targets.production.url}` : "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${project.targets?.production?.url
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02]"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                    }`}
                            >
                                Visit Site
                            </a>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
