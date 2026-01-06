"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface FileEditorProps {
  content: string
  filename: string
  onSave: (editedContent: string) => void
  onCancel: () => void
}

export default function FileEditor({ content, filename, onSave, onCancel }: FileEditorProps) {
  const [editedContent, setEditedContent] = useState(content)

  return (
    <div className="space-y-4 rounded-lg border-2 border-primary bg-card p-6 shadow-lg">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-semibold">Edit File Content</h3>
          <p className="text-sm text-muted-foreground">{filename}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => onSave(editedContent)}>
            Save & Download
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Edit your content below</span>
          <span>{editedContent.length} characters</span>
        </div>
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[500px] font-mono text-sm leading-relaxed"
          placeholder="Edit your content here..."
        />
      </div>
      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        <strong>Tip:</strong> Make your changes above and click &quot;Save &amp; Download&quot; to update the file. Your edits will be
        applied to the downloaded file.
      </div>
    </div>
  )
}
