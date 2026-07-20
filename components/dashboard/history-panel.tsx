"use client"

import { useEffect, useState } from "react"
import { FileSearch, FileText, RefreshCw, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState, GlassCard, SectionHeader } from "@/components/ui/premium"

type DocumentRow = {
  id: string
  file_name: string
  file_type: string
  file_size: number
  upload_date: string
  status: string
}

type AnalysisRow = {
  id: string
  file_name?: string
  tool_used: string
  risk_score?: number
  created_at: string
}

export function HistoryPanel() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  async function load(nextQuery = query) {
    setLoading(true)
    const [documentsResponse, analysesResponse] = await Promise.all([
      fetch(`/api/documents${nextQuery ? `?query=${encodeURIComponent(nextQuery)}` : ""}`),
      fetch("/api/analyses/recent"),
    ])
    setDocuments(documentsResponse.ok ? await documentsResponse.json() : [])
    setAnalyses(analysesResponse.ok ? await analysesResponse.json() : [])
    setLoading(false)
  }

  async function deleteDocument(id: string) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" })
    await load()
  }

  useEffect(() => {
    void load("")
  }, [])

  return (
    <section className="grid gap-4 border-t border-white/8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <GlassCard tone="solid" className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader eyebrow="History" title="Recent Documents" description="Stored securely in Supabase Storage and indexed for RAG." />
          <div className="flex gap-2">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-[#A0A6B1] shadow-inner shadow-black/20 transition focus-within:border-[#14B87A]/35">
              <Search className="size-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && load(query)}
                className="w-36 bg-transparent outline-none placeholder:text-[#6F7682]"
                placeholder="Search"
              />
            </label>
            <Button type="button" size="icon-sm" variant="outline" className="border-white/10 bg-white/[0.04] text-white" onClick={() => load(query)} title="Refresh history" aria-label="Refresh history">
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {documents.length ? (
            documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 shadow-sm shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.055]">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{document.file_name}</div>
                  <div className="text-xs text-[#A0A6B1]">{document.status} - {(document.file_size / 1024).toFixed(1)} KB</div>
                </div>
                <Button type="button" size="icon-sm" variant="outline" className="border-white/10 bg-white/[0.04] text-white hover:border-[#FF5C5C]/30 hover:bg-[#FF5C5C]/10 hover:text-[#FFB0B0]" onClick={() => deleteDocument(document.id)} title="Delete document" aria-label="Delete document">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          ) : (
            <EmptyState icon={<FileSearch className="size-5" />} title="No documents yet" description="Upload a PDF, DOCX, or TXT file from a workflow to start building your review history." />
          )}
        </div>
      </GlassCard>

      <GlassCard tone="solid" className="p-5">
        <SectionHeader eyebrow="Reports" title="Recent Analyses" description="Risk reports and generated work products." />
        <div className="mt-4 space-y-2">
          {analyses.length ? (
            analyses.map((analysis) => (
              <div key={analysis.id} className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 shadow-sm shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.055]">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <FileText className="size-4 text-[#14B87A]" />
                  {analysis.tool_used.replaceAll("-", " ")}
                </div>
                <div className="mt-1 text-xs text-[#A0A6B1]">
                  {analysis.file_name || "Prompt-based"} {typeof analysis.risk_score === "number" ? `- Risk ${analysis.risk_score}/100` : ""}
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={<FileText className="size-5" />} title="No analyses yet" description="Run an analysis workflow to save reports, risk scores, and exportable legal summaries." />
          )}
        </div>
      </GlassCard>
    </section>
  )
}
