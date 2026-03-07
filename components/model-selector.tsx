"use client"
import React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Brain, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export type AIModel =
  | "google/gemini-1.5-pro"

interface ModelSelectorProps {
  value: AIModel
  onChange: (model: AIModel) => void
  className?: string
}

export default function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  const modelLabels: Record<AIModel, string> = {
    "google/gemini-1.5-pro": "Gemini 1.5 Pro",
  }

  const modelProviders: Record<AIModel, string> = {
    "google/gemini-1.5-pro": "Google",
  }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as AIModel)}>
      <SelectTrigger className={cn(
        "h-10 border border-border/50 bg-card/50 backdrop-blur-md hover:bg-foreground/5 rounded-xl px-4 transition-all focus:ring-0 focus:ring-offset-0 gap-3 min-w-[140px] shadow-sm",
        className
      )}>
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
            {modelLabels[value]}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-2xl border-border/50 bg-background/80 backdrop-blur-xl p-1">
        {(Object.keys(modelLabels) as AIModel[]).map((model) => (
          <SelectItem
            key={model}
            value={model}
            className="rounded-xl focus:bg-primary/10 focus:text-foreground py-2.5 px-3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">{modelLabels[model]}</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{modelProviders[model]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
