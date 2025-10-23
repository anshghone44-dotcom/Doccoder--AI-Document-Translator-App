"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TemplateId = "minimal" | "professional" | "photo"

export type TemplateSelection = {
  id: TemplateId
  orientation: "portrait" | "landscape"
  margin: number // points (e.g., 36 = 0.5in)
}

const templates: Array<{
  id: TemplateId
  title: string
  description: string
  accentClass: string
}> = [
  {
    id: "minimal",
    title: "Minimal",
    description: "Clean cover, balanced text pages. Great for notes and docs.",
    accentClass: "border-primary",
  },
  {
    id: "professional",
    title: "Professional",
    description: "Strong title, subtle accent. Ideal for reports.",
    accentClass: "border-muted-foreground",
  },
  {
    id: "photo",
    title: "Photo",
    description: "Full-bleed images with light captioning.",
    accentClass: "border-accent",
  },
]

export default function TemplatePicker(props: {
  value: TemplateSelection
  onChange: (val: TemplateSelection) => void
}) {
  const { value, onChange } = props
  const [local, setLocal] = useState<TemplateSelection>(value)

  function commit(next: Partial<TemplateSelection>) {
    const merged = { ...local, ...next }
    setLocal(merged)
    onChange(merged)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {templates.map((t) => {
          const active = local.id === t.id
          return (
            <Card
              key={t.id}
              className={cn(
                "cursor-pointer border-2 transition",
                t.accentClass,
                active ? "ring-2 ring-primary" : "opacity-90 hover:opacity-100",
              )}
              onClick={() => commit({ id: t.id })}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="mb-2 h-20 rounded-lg bg-secondary" />
                <p>{t.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Orientation:</span>
          <div className="flex overflow-hidden rounded-md border">
            <Button
              type="button"
              variant={local.orientation === "portrait" ? "default" : "ghost"}
              size="sm"
              onClick={() => commit({ orientation: "portrait" })}
            >
              Portrait
            </Button>
            <Button
              type="button"
              variant={local.orientation === "landscape" ? "default" : "ghost"}
              size="sm"
              onClick={() => commit({ orientation: "landscape" })}
            >
              Landscape
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="margin" className="text-sm font-medium">
            Margin:
          </label>
          <select
            id="margin"
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={String(local.margin)}
            onChange={(e) => commit({ margin: Number(e.target.value) })}
          >
            <option value="24">Narrow (0.33in)</option>
            <option value="36">Comfort (0.5in)</option>
            <option value="48">Roomy (0.66in)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
