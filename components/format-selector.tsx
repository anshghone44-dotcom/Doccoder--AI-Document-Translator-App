"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Table, FileSpreadsheet, FileBox, Presentation, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type OutputFormat =
    | "pdf"
    | "xlsx"
    | "csv"
    | "docx"
    | "txt"
    | "pptx"
    | "gdoc"
    | "gsheet"
    | "png"
    | "bmp"
    | "tiff"
    | "gif"
    | "jpeg"
    | "jpg"
    | "svg"

interface FormatSelectorProps {
    value: OutputFormat
    onChange: (format: OutputFormat) => void
    className?: string
}

export default function FormatSelector({ value, onChange, className }: FormatSelectorProps) {
    const formatLabels: Record<OutputFormat, string> = {
        pdf: "PDF Document",
        xlsx: "Excel Sheet",
        csv: "CSV File",
        docx: "Word Doc",
        txt: "Text File",
        pptx: "PowerPoint",
        gdoc: "Google Doc",
        gsheet: "Google Sheet",
        png: "PNG Image",
        bmp: "Bitmap BMP",
        tiff: "TIFF Image",
        gif: "GIF Animation",
        jpeg: "JPEG Image",
        jpg: "JPG Image",
        svg: "SVG Vector",
    }

    const formatIcons: Record<OutputFormat, any> = {
        pdf: FileText,
        xlsx: FileSpreadsheet,
        csv: Table,
        docx: FileBox,
        txt: FileText,
        pptx: Presentation,
        gdoc: FileText,
        gsheet: FileSpreadsheet,
        png: ImageIcon,
        bmp: ImageIcon,
        tiff: ImageIcon,
        gif: ImageIcon,
        jpeg: ImageIcon,
        jpg: ImageIcon,
        svg: ImageIcon,
    }

    const SelectedIcon = formatIcons[value]

    return (
        <Select value={value} onValueChange={(v) => onChange(v as OutputFormat)}>
            <SelectTrigger className={cn(
                "h-10 border border-border/50 bg-card/50 backdrop-blur-md hover:bg-foreground/5 rounded-xl px-4 transition-all focus:ring-0 focus:ring-offset-0 gap-3 min-w-[140px] shadow-sm",
                className
            )}>
                <div className="flex items-center gap-2">
                    <SelectedIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                        {formatLabels[value]}
                    </span>
                </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 bg-background/80 backdrop-blur-xl p-1">
                {(Object.keys(formatLabels) as OutputFormat[]).map((fmt) => {
                    const Icon = formatIcons[fmt]
                    return (
                        <SelectItem
                            key={fmt}
                            value={fmt}
                            className="rounded-xl focus:bg-primary/10 focus:text-foreground py-2.5 px-3"
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{formatLabels[fmt]}</span>
                            </div>
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}
