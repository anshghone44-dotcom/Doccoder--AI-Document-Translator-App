"use client"

import { motion } from "framer-motion"
import { Upload, Settings, Download } from "lucide-react"

const steps = [
  { icon: Upload, title: "Upload your document", desc: "Drag & drop or use the picker" },
  { icon: Settings, title: "Choose output format", desc: "PDF, Word, Excel, PPT, and more" },
  { icon: Download, title: "Download instantly", desc: "Get your file in seconds" },
]

export default function HowItWorks() {
  return (
    <div className="grid gap-8 md:grid-cols-3" data-testid="how-it-works">
      {steps.map((s, idx) => {
        const Icon = s.icon
        return (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur hover:shadow-xl hover:border-primary/50"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h4 className="mb-2 text-lg font-semibold">{s.title}</h4>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
