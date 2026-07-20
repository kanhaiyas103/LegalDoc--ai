"use client"

import { ChangeEvent, DragEvent, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, FileUp, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState, LoadingTimeline } from "@/components/ui/premium"
import { backendFetch, responseJson } from "@/lib/backend-api"
import { StoredDocument } from "@/lib/document-store"
import { cn } from "@/lib/utils"

type Props = {
  document: StoredDocument | null
  onChange: (document: StoredDocument) => void
  onClear: () => void
}

export function FileUpload({ document, onChange, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState("")

  async function uploadFile(file: File) {
    setError("")
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await backendFetch("/documents", { method: "POST", body: formData })
      const data = await responseJson(response)
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
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    await uploadFile(file)
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void uploadFile(file)
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#151821,#11141B)] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Source Document</h2>
          <p className="text-sm text-[#A0A6B1]">{document ? document.name : "Upload a legal file or paste text for analysis."}</p>
        </div>
        <Button type="button" size="icon-sm" variant="outline" className="border-white/10 bg-transparent text-[#A0A6B1] hover:border-[#FF5C5C]/30 hover:bg-[#FF5C5C]/10 hover:text-[#FFB0B0]" onClick={onClear} aria-label="Clear document" title="Clear document">
          <Trash2 className="size-4" />
        </Button>
      </div>

      <input ref={inputRef} type="file" accept=".txt,.docx,.pdf" className="hidden" onChange={handleFile} />
      <motion.div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        animate={{
          borderColor: dragging ? "rgba(20,184,122,0.72)" : "rgba(255,255,255,0.1)",
          scale: dragging ? 1.01 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "mt-5 rounded-2xl border border-dashed bg-black/18 p-6 text-center shadow-inner shadow-white/[0.02] transition",
          dragging && "bg-[#14B87A]/10 shadow-[0_18px_45px_rgba(20,184,122,0.12)]",
        )}
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-[#14B87A]/25 bg-[#14B87A]/10 text-[#7CE8B8] shadow-[0_12px_34px_rgba(20,184,122,0.14)]">
          {uploading ? <Loader2 className="size-7 animate-spin" /> : <FileUp className="size-7" />}
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-white">Drop PDF, DOCX, or TXT</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#A0A6B1]">Files are validated, stored securely, parsed, chunked, and indexed for grounded review.</p>
        <Button type="button" disabled={uploading} className="mt-5 h-10 rounded-xl bg-[#14B87A] px-5 font-semibold text-[#07120D] hover:bg-[#19D28D]" onClick={() => inputRef.current?.click()} title="Select a document">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
          Select document
        </Button>
      </motion.div>

      <AnimatePresence>
        {document ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-sm shadow-black/10">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-[#D4AF37]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{document.name}</p>
                <p className="text-xs text-[#A0A6B1]">{document.type || "text/plain"} {document.size ? `- ${(document.size / 1024).toFixed(1)} KB` : ""}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {uploading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 shadow-inner shadow-white/[0.02]">
          <LoadingTimeline active />
        </div>
      ) : null}

      {error ? <p className="mt-3 rounded-xl border border-[#FF5C5C]/20 bg-[#FF5C5C]/10 px-3 py-2 text-xs text-[#FFB0B0] shadow-[0_10px_30px_rgba(255,92,92,0.08)]">{error}</p> : null}
      {!document && !uploading && !error ? (
        <EmptyState
          className="mt-4 py-4"
          title="Review starts with source material"
          description="Upload a file for permanent storage, or paste clause text below for a quick workflow."
        />
      ) : null}
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
        placeholder="Or paste legal document text here."
        className="mt-4 min-h-[220px] resize-y rounded-2xl border-white/10 bg-black/20 text-zinc-100 shadow-inner shadow-black/20 placeholder:text-[#6F7682] focus-visible:border-[#14B87A]/45 focus-visible:ring-[#14B87A]/30"
      />
    </section>
  )
}
