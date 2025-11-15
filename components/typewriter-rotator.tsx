"use client"

import { useEffect, useState } from "react"

const ITEMS = ["PDF", "Word", "Excel", "PPT", "CSV", "TXT"]

export default function TypewriterRotator({
  prefix = "Convert",
  suffix = "instantly",
}: {
  prefix?: string
  suffix?: string
}) {
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState(ITEMS[0])
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    let timeout: any
    if (typing) {
      // type forward
      const next = ITEMS[index]
      const current = display
      if (current.length < next.length) {
        timeout = setTimeout(() => setDisplay(next.slice(0, current.length + 1)), 60)
      } else {
        timeout = setTimeout(() => setTyping(false), 1000)
      }
    } else {
      // delete
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(display.slice(0, -1)), 40)
      } else {
        setIndex((p) => (p + 1) % ITEMS.length)
        setTyping(true)
      }
    }
    return () => clearTimeout(timeout)
  }, [typing, display, index])

  return (
    <span className="inline-flex items-center gap-2 text-base md:text-lg text-muted-foreground">
      <span>{prefix}</span>
      <span className="gradient-animated-text font-semibold" data-testid="typewriter-current">{display}</span>
      <span className="opacity-60">→</span>
      <span className="hidden sm:inline">{suffix}</span>
    </span>
  )
}
