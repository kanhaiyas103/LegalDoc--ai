"use client"

import { ChangeEvent, useRef, useState } from "react"
import { FileUp, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StoredDocument } from "@/lib/document-store"

type Props = {
  document: StoredDocument | null
  onChange: (document: StoredDocument) => void
  onClear: () => void
}

export function FileUpload({ document, onChange, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError("")
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await fetch("/api/documents", { method: "POST", body: formData })
      const text = await response.text()
      const data = text ? JSON.parse(text) : {}
      if (!response.ok) {
        setError(data.detail || "Upload failed")
        return
      }
      onChange({
        id: data.id,
        name: data.file_name,
        type: data.file_type,
        size: data.file_size,
        text: "",
        storageUrl: data.storage_url,
        signedUrl: data.signed_url,
        updatedAt: new Date().toISOString(),
      })
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  return (
    <section className="rounded-md border border-white/10 bg-zinc-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Source Document</h2>
          <p className="text-xs text-zinc-400">{document ? document.name : "Upload or paste once, then use it across tools."}</p>
        </div>
        <div className="flex gap-2">
          <input ref={inputRef} type="file" accept=".txt,.docx,.pdf" className="hidden" onChange={handleFile} />
          <Button type="button" size="icon-sm" variant="outline" disabled={uploading} className="border-white/10 bg-white/5 text-white" onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
          </Button>
          <Button type="button" size="icon-sm" variant="outline" className="border-white/10 bg-white/5 text-white" onClick={onClear}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {error ? <p className="mt-3 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-100">{error}</p> : null}
      <Textarea
        value={document?.text || ""}
        onChange={(event) =>
          onChange({
            name: document?.name || "Pasted document",
            type: "text/plain",
            text: event.target.value,
            updatedAt: new Date().toISOString(),
          })
        }
        placeholder="Paste legal document text here."
        className="mt-4 min-h-[280px] resize-y border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
      />
    </section>
  )
}
