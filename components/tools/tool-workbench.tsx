"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/tools/file-upload"
import { ResultPanel } from "@/components/tools/result-panel"
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
    const response = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: tool.id, input: input.trim() || document?.name || "Uploaded document", prompt: prompt.trim(), documentName: document?.name, document_id: document?.id }),
    })
    const data = (await response.json()) as { output?: string; detail?: string; analysis_id?: string }
    setResult(data.output || `# Request failed\n\n${data.detail || "Unable to run this tool."}`)
    setAnalysisId(data.analysis_id || null)
    setLoading(false)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>
      <div className="mt-6 flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
        <div>
          <Badge variant="outline" className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            {tool.category}
          </Badge>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-semibold text-white">
            <Icon className="size-8 text-cyan-300" />
            {tool.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{tool.description}</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <FileUpload
            document={document}
            onChange={updateDocument}
            onClear={() => {
              setDocument(null)
              clearStoredDocument()
            }}
          />
          <section className="rounded-md border border-white/10 bg-zinc-950/70 p-4">
            <h2 className="text-sm font-semibold text-white">{tool.needsDocument ? "Instructions" : "Prompt"}</h2>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={tool.placeholder}
              className="mt-4 min-h-32 border-white/10 bg-black/20 text-zinc-100 placeholder:text-zinc-500"
            />
            <Button disabled={loading || !hasRunnableInput} className="mt-4 w-full bg-cyan-300 text-zinc-950 hover:bg-cyan-200">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {tool.action}
            </Button>
          </section>
        </div>
        <ResultPanel title={tool.name} content={result} isLoading={loading} analysisId={analysisId} onClear={() => setResult("")} />
      </form>
    </main>
  )
}
