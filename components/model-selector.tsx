"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

export type AIModel =
  | "openai/gpt-5"
  | "xai/grok-4"
  | "anthropic/claude-4.1"
  | "openai/gpt-4-mini"
  | "xai/grok-3"
  | "anthropic/claude-3.1"

interface ModelSelectorProps {
  value: AIModel
  onChange: (model: AIModel) => void
  className?: string
}

export default function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  const modelLabels: Record<AIModel, string> = {
    "openai/gpt-5": "GPT-5",
    "xai/grok-4": "Grok-4",
    "anthropic/claude-4.1": "Claude 4.1",
    "openai/gpt-4-mini": "GPT-4 Mini",
    "xai/grok-3": "Grok-3",
    "anthropic/claude-3.1": "Claude 3.1",
  }

  const modelProviders: Record<AIModel, string> = {
    "openai/gpt-5": "OpenAI",
    "xai/grok-4": "xAI",
    "anthropic/claude-4.1": "Anthropic",
    "openai/gpt-4-mini": "OpenAI",
    "xai/grok-3": "xAI",
    "anthropic/claude-3.1": "Anthropic",
  }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as AIModel)}>
      <SelectTrigger className={cn(
        "h-8 border-none bg-transparent hover:bg-foreground/5 rounded-xl px-3 transition-all focus:ring-0 focus:ring-offset-0 gap-2 min-w-[120px]",
        className
      )}>
        <Brain className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
          {modelLabels[value]}
        </span>
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
