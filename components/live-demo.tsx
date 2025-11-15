"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, File, FileText, Image, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import Lottie from "lottie-react"
import { Document, Page, pdfjs } from "react-pdf"

const simplePulse = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 120,
  nm: "pulse",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "dot",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [0, 0, 100] },
            { t: 60, s: [100, 100, 100] },
            { t: 120, s: [0, 0, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [16, 16] }, nm: "Ellipse Path 1" },
        { ty: "fl", c: { a: 0, k: [0.01, 0.48, 1, 1] }, o: { a: 0, k: 1 }, nm: "Fill 1" },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
  ],
}

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
  "application/epub+zip": [".epub"],
}

export default function LiveDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "converting" | "done">("idle")
  const [progress, setProgress] = useState(0)
  const [format, setFormat] = useState("DOCX")

  useEffect(() => {
    // Configure PDF.js worker on client only
    if (typeof window !== "undefined") {
      try {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString()
      } catch (e) {
        // Fallback to CDN if needed
        // @ts-ignore
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
      }
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const f = acceptedFiles[0]
      setFile(f)
      setBlobUrl(URL.createObjectURL(f))
      setStatus("uploading")
      setProgress(10)
      // Simulate upload -> convert
      const steps = [20, 35, 55, 75, 90]
      steps.forEach((p, i) => setTimeout(() => setProgress(p), 300 + i * 200))
      setTimeout(() => {
        setStatus("converting")
        const conv = [92, 96, 100]
        conv.forEach((p, i) => setTimeout(() => setProgress(p), 1200 + i * 350))
        setTimeout(() => setStatus("done"), 2000)
      }, 1200)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: ACCEPT })

  const isPdf = useMemo(() => file?.type === "application/pdf" || (file && file.name.endsWith(".pdf")), [file])

  return (
    <div className="grid gap-6 md:grid-cols-2" data-testid="live-demo">
      {/* Left: Upload and progress */}
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 backdrop-blur">
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/60 p-8 text-center transition-all hover:border-primary/50",
            isDragActive && "ring-2 ring-primary/40",
          )}
          data-testid="live-demo-upload"
        >
          <input {...getInputProps()} />
          <FileText className="h-8 w-8 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Drag & drop your file here</p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX, PPTX, TXT, CSV, EPUB</p>
          </div>
          <Button className="mt-2 glassy-btn" type="button" data-testid="live-demo-choose-file">Choose File</Button>
        </div>

        {/* Status */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{status}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${progress}%` }}
              data-testid="live-demo-progress"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress}%</span>
            {status !== "idle" && (
              <span className="inline-flex items-center gap-1">
                {status !== "done" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Converting
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Ready
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            disabled={!file}
            className="glassy-btn pulse-cta"
            data-testid="live-demo-convert-button"
            onClick={() => {
              if (!file) return
              setStatus("converting")
              setProgress(92)
              setTimeout(() => setProgress(100), 800)
              setTimeout(() => setStatus("done"), 1200)
            }}
          >
            Convert <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            data-testid="live-demo-format-select"
          >
            {"PDF, DOCX, XLSX, PPTX, TXT, CSV".split(", ").map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Before -> After */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h5 className="mb-2 text-sm font-medium">Before</h5>
            <div className="flex h-64 items-center justify-center rounded-lg border bg-background/60">
              {file ? (
                <div className="text-center">
                  <File className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 truncate text-sm font-medium max-w-[220px]">{file.name}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No file selected</p>
              )}
            </div>
          </div>
          <div>
            <h5 className="mb-2 text-sm font-medium">After</h5>
            <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-lg border bg-background/60" data-testid="live-demo-preview">
              {status === "converting" && (
                <div className="flex flex-col items-center gap-2 text-center">
                  <Lottie animationData={simplePulse as any} loop style={{ width: 80, height: 80 }} />
                  <p className="text-sm text-muted-foreground">Converting to {format}…</p>
                </div>
              )}
              {status === "done" && file && (
                isPdf ? (
                  <div className="h-full w-full overflow-auto p-2">
                    <Document file={blobUrl ?? undefined} loading={null} renderMode="canvas">
                      <Page pageNumber={1} width={360} renderAnnotationLayer={false} renderTextLayer={false} />
                    </Document>
                  </div>
                ) : (
                  <div className="text-center">
                    {file.type.startsWith("image/") ? (
                      <img src={blobUrl ?? undefined} alt="preview" className="max-h-56 rounded" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Preview not available</p>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">Converted to {format}</p>
                  </div>
                )
              )}
              {status === "idle" || status === "uploading" ? (
                <p className="text-sm text-muted-foreground">Your converted preview will appear here</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
