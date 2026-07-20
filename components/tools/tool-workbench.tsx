"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/tools/file-upload"
import { ResultPanel } from "@/components/tools/result-panel"
import { AnimatedContainer, GlassCard } from "@/components/ui/premium"
import { clearStoredDocument, readStoredDocument, saveStoredDocument, StoredDocument } from "@/lib/document-store"
import { getTool, ToolId } from "@/lib/tools"

export function ToolWorkbench({ toolId }: { toolId: ToolId }) {
  const tool = getTool(toolId)!
  const [document, setDocument] = useState<StoredDocument | null>(null)
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState("")
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const Icon = tool.icon

  useEffect(() => {
    setDocument(readStoredDocument())
  }, [])

  const input = useMemo(() => {
    if (tool.needsDocument) return document?.text || prompt || document?.name || ""
    if (tool.id === "legal-qa" && document?.text) return `${prompt}\n\nLoaded document:\n${document.text}`
    return prompt
  }, [document?.name, document?.text, prompt, tool.id, tool.needsDocument])
  const hasRunnableInput = Boolean(input.trim() || document?.id)

  function updateDocument(next: StoredDocument) {
    setDocument(next)
    saveStoredDocument(next)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!hasRunnableInput) return
    setLoading(true)
    setResult("")
    setAnalysisId(null)
    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: tool.id, input: input.trim() || document?.name || "Uploaded document", prompt: prompt.trim(), documentName: document?.name, document_id: document?.id }),
      })
      const text = await response.text()
      const data = (text ? JSON.parse(text) : {}) as { output?: string; detail?: string; analysis_id?: string }
      setResult(data.output || `# Request failed\n\n${data.detail || "Unable to run this tool."}`)
      setAnalysisId(data.analysis_id || null)
    } catch (error) {
      setResult(`# Request failed\n\n${error instanceof Error ? error.message : "Unable to run this tool."}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#A0A6B1] transition hover:text-white">
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>
      <AnimatedContainer className="mt-6 flex flex-col justify-between gap-5 border-b border-white/8 pb-6 md:flex-row md:items-end">
        <div>
          <Badge variant="outline" className="border-[#14B87A]/25 bg-[#14B87A]/10 text-[#7CE8B8]">
            {tool.category}
          </Badge>
          <h1 className="mt-3 flex items-center gap-3 font-display text-4xl font-semibold tracking-normal text-white">
            <Icon className="size-8 text-[#14B87A]" />
            {tool.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A0A6B1]">{tool.description}</p>
        </div>
        <div className="rounded-full border border-white/8 bg-white/[0.035] px-4 py-2 text-xs font-medium text-[#A0A6B1]">
          AI-assisted review - not legal advice
        </div>
      </AnimatedContainer>
      <form onSubmit={submit} className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <FileUpload
            document={document}
            onChange={updateDocument}
            onClear={() => {
              setDocument(null)
              clearStoredDocument()
            }}
          />
          <GlassCard className="p-5">
            <h2 className="font-display text-lg font-semibold text-white">{tool.needsDocument ? "Review Instructions" : "Drafting Prompt"}</h2>
            <p className="mt-1 text-sm text-[#A0A6B1]">Guide the model with commercial context, negotiation goals, or jurisdiction details.</p>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={tool.placeholder}
              className="mt-4 min-h-32 rounded-xl border-white/10 bg-black/20 text-zinc-100 placeholder:text-[#6F7682] focus-visible:ring-[#14B87A]/30"
            />
            <Button disabled={loading || !hasRunnableInput} className="mt-4 h-11 w-full rounded-lg bg-[#14B87A] font-semibold text-[#07120D] hover:bg-[#19D28D]">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {tool.action}
            </Button>
          </GlassCard>
        </div>
        <ResultPanel title={tool.name} content={result} isLoading={loading} analysisId={analysisId} onClear={() => setResult("")} />
      </form>
    </main>
  )
}
