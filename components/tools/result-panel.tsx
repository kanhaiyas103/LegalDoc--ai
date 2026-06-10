"use client"

import { Download, FileType, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownView } from "@/components/tools/markdown-view"
import { downloadText } from "@/lib/downloads"

type Props = {
  title: string
  content: string
  isLoading: boolean
  analysisId?: string | null
  onClear: () => void
}

export function ResultPanel({ title, content, isLoading, analysisId, onClear }: Props) {
  function downloadReport(format: "pdf" | "docx") {
    if (!analysisId) return
    window.location.href = `/api/reports/${analysisId}.${format}`
  }

  return (
    <section className="min-h-[520px] rounded-md border border-white/10 bg-zinc-950/70">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="text-xs text-zinc-400">Review before relying on any output.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="icon-sm" variant="outline" disabled={!content} className="border-white/10 bg-white/5 text-white" onClick={() => downloadText(`${title}.md`, content)}>
            <Download className="size-4" />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" disabled={!analysisId} className="border-white/10 bg-white/5 text-white" onClick={() => downloadReport("pdf")}>
            PDF
          </Button>
          <Button type="button" size="icon-sm" variant="outline" disabled={!analysisId} className="border-white/10 bg-white/5 text-white" onClick={() => downloadReport("docx")}>
            <FileType className="size-4" />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" disabled={!content} className="border-white/10 bg-white/5 text-white" onClick={onClear}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
          </div>
        ) : content ? (
          <MarkdownView content={content} />
        ) : (
          <div className="flex min-h-[420px] items-center justify-center text-center text-sm text-zinc-500">
            Run a tool to generate a lawyer-oriented first pass.
          </div>
        )}
      </div>
    </section>
  )
}
