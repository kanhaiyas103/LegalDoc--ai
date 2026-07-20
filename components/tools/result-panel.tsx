"use client"

import { Download, FileType, ShieldCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownView, reportSectionId } from "@/components/tools/markdown-view"
import { ConfidenceMeter, EmptyState, GlassCard, LoadingTimeline, RiskBadge } from "@/components/ui/premium"
import { backendFetch } from "@/lib/backend-api"
import { downloadText } from "@/lib/downloads"

type Props = {
  title: string
  content: string
  isLoading: boolean
  analysisId?: string | null
  onClear: () => void
}

const fallbackReportSections = ["Overall Risk", "Detected Clauses", "Important Deadlines", "Financial Obligations", "Termination", "Jurisdiction", "Recommendations"]

function extractReportSections(content: string) {
  const sections = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^#{1,3}\s+/.test(line))
    .map((line) => line.replace(/^#+\s+/, "").trim())
    .filter(Boolean)

  return sections.length ? sections : fallbackReportSections
}

export function ResultPanel({ title, content, isLoading, analysisId, onClear }: Props) {
  const reportSections = extractReportSections(content)

  async function downloadReport(format: "pdf" | "docx") {
    if (!analysisId) return
    const response = await backendFetch(`/reports/${analysisId}.${format}`)
    if (!response.ok) return
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${title}.${format}`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <GlassCard tone="solid" className="min-h-[620px] overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.015] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#14B87A]">Analysis Report</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-[#A0A6B1]">Review with counsel before relying on any output.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="icon-sm" variant="outline" disabled={!content} className="border-white/10 bg-transparent text-[#A0A6B1] hover:bg-white/[0.06] hover:text-white" onClick={() => downloadText(`${title}.md`, content)} aria-label="Download markdown" title="Download markdown">
            <Download className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={!analysisId} className="border-[#D4AF37]/24 bg-[#D4AF37]/10 text-[#F0D47A] shadow-[0_10px_28px_rgba(212,175,55,0.08)] hover:border-[#D4AF37]/38 hover:bg-[#D4AF37]/14" onClick={() => downloadReport("pdf")} title="Download PDF report">
            PDF
          </Button>
          <Button type="button" size="icon-sm" variant="outline" disabled={!analysisId} className="border-white/10 bg-transparent text-[#A0A6B1] hover:bg-white/[0.06] hover:text-white" onClick={() => downloadReport("docx")} aria-label="Download DOCX" title="Download DOCX report">
            <FileType className="size-4" />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" disabled={!content} className="border-white/10 bg-transparent text-[#A0A6B1] hover:border-[#FF5C5C]/30 hover:bg-[#FF5C5C]/10 hover:text-[#FFB0B0]" onClick={onClear} aria-label="Clear analysis" title="Clear analysis">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-5 xl:grid-cols-[220px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/18 p-4 shadow-inner shadow-white/[0.02]">
            <div className="flex items-center justify-between">
              <ShieldCheck className="size-5 text-[#14B87A]" />
              <RiskBadge score={content ? 42 : 0} />
            </div>
            <div className="mt-5">
              <ConfidenceMeter value={content ? 86 : 0} />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/18 p-4 shadow-inner shadow-white/[0.02]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A0A6B1]">Report Index</p>
            <div className="mt-3 space-y-2">
              {reportSections.map((section) => (
                <button
                  key={section}
                  type="button"
                  disabled={!content}
                  onClick={() => document.getElementById(reportSectionId(section))?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="w-full rounded-xl bg-white/[0.035] px-3 py-2 text-left text-xs text-[#A0A6B1] transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="rounded-2xl border border-white/10 bg-black/18 p-5 shadow-inner shadow-white/[0.02]">
          {isLoading ? (
            <div>
              <LoadingTimeline active />
              <div className="mt-6 space-y-3">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.12),rgba(255,255,255,0.06))]" />
                <div className="h-4 w-full animate-pulse rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.12),rgba(255,255,255,0.06))]" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.12),rgba(255,255,255,0.06))]" />
              </div>
            </div>
          ) : content ? (
            <MarkdownView content={content} />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center">
              <EmptyState icon={<ShieldCheck className="size-5" />} title="Awaiting legal intelligence" description="Run a workflow to generate risk posture, clauses, recommendations, citations, and exportable reports." />
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
