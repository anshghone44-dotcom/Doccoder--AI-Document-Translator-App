/**
 * Wrap text into lines that fit within maxWidth, using the provided pdf-lib font.
 * - Splits by paragraphs/newlines
 * - Wraps by words
 * - Falls back to character-level splitting for single words that exceed maxWidth
 */
export function wrapText(
  text: string,
  font: { widthOfTextAtSize: (s: string, size: number) => number },
  fontSize: number,
  maxWidth: number,
): string[] {
  const paragraphs = text.split("\n")
  const lines: string[] = []

  for (const p of paragraphs) {
    // If the paragraph is empty, push an empty line to preserve spacing
    if (p.trim() === "") {
      lines.push("")
      continue
    }

    const words = p.split(/\s+/).filter(Boolean)
    let line = ""

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      const width = font.widthOfTextAtSize(candidate, fontSize)

      if (width <= maxWidth) {
        line = candidate
        continue
      }

      // If current line has content, flush it and start a new line with the word
      if (line) {
        lines.push(line)
        line = ""
      }

      // Word itself may be too long; split by characters
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = ""
        for (const ch of word) {
          const candidateChunk = chunk ? `${chunk}${ch}` : ch
          const cWidth = font.widthOfTextAtSize(candidateChunk, fontSize)
          if (cWidth > maxWidth) {
            if (chunk) lines.push(chunk)
            // Start new chunk with current character
            chunk = ch
          } else {
            chunk = candidateChunk
          }
        }
        if (chunk) {
          // Start a new line with the leftover chunk (it might be appended to following words)
          line = chunk
        }
      } else {
        // The word fits by itself on a new line
        line = word
      }
    }

    if (line || p === "") {
      lines.push(line)
    }
  }

  return lines
}
