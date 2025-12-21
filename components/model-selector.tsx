"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"

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
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const modelDescriptions: Record<AIModel, string> = {
    "openai/gpt-5": "Most advanced - Superior reasoning and creativity",
    "xai/grok-4": "Latest Grok - Fast and efficient processing",
    "anthropic/claude-4.1": "Premium Claude - Excellent for analysis",
    "openai/gpt-4-mini": "Balanced - Cost-effective performance",
    "xai/grok-3": "Reliable - Consistent quality",
    "anthropic/claude-3.1": "Efficient - Quick responses",
  }

  const modelLabels: Record<AIModel, string> = {
    "openai/gpt-5": "GPT-5 (OpenAI)",
    "xai/grok-4": "Grok-4 (xAI)",
    "anthropic/claude-4.1": "Claude 4.1 (Anthropic)",
    "openai/gpt-4-mini": "GPT-4 Mini (OpenAI)",
    "xai/grok-3": "Grok-3 (xAI)",
    "anthropic/claude-3.1": "Claude 3.1 (Anthropic)",
  }

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-br from-secondary to-background p-4 transition-all duration-300">
      <label className="mb-3 block text-sm font-semibold text-foreground flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        AI Model Selection
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as AIModel)}>
        <SelectTrigger className="w-full border-border/50 bg-background/50 transition-all duration-300 hover:bg-background hover:border-primary/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai/gpt-5">{modelLabels["openai/gpt-5"]}</SelectItem>
          <SelectItem value="xai/grok-4">{modelLabels["xai/grok-4"]}</SelectItem>
          <SelectItem value="anthropic/claude-4.1">{modelLabels["anthropic/claude-4.1"]}</SelectItem>
          <SelectItem value="openai/gpt-4-mini">{modelLabels["openai/gpt-4-mini"]}</SelectItem>
          <SelectItem value="xai/grok-3">{modelLabels["xai/grok-3"]}</SelectItem>
          <SelectItem value="anthropic/claude-3.1">{modelLabels["anthropic/claude-3.1"]}</SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-2 text-xs text-muted-foreground">{modelDescriptions[value]}</p>
    </div>
  )
}
