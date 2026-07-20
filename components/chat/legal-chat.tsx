"use client"

import { FormEvent, useEffect, useState } from "react"
import { BookOpenText, FileText, Loader2, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfidenceMeter, EmptyState, GlassCard } from "@/components/ui/premium"

type DocumentRow = { id: string; file_name: string }
type Citation = { document_id: string; chunk_index: number; page_number?: number; excerpt: string; score: number }
type Message = { role: "user" | "assistant"; content: string; citations?: Citation[]; confidence?: number }

const suggestions = ["What is the termination notice period?", "Which obligations survive expiry?", "Are payment terms one-sided?", "What risks should I negotiate first?"]

export function LegalChat() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [documentId, setDocumentId] = useState("")
  const [question, setQuestion] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/documents")
      .then((response) => (response.ok ? response.json() : []))
      .then(setDocuments)
      .catch(() => setDocuments([]))
  }, [])

  async function ask(nextQuestion: string) {
    if (!nextQuestion.trim()) return
    setQuestion("")
    setMessages((current) => [...current, { role: "user", content: nextQuestion }])
    setLoading(true)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: nextQuestion, document_id: documentId || null, session_id: sessionId }),
      })
      const text = await response.text()
      const data = text ? JSON.parse(text) : { detail: "Empty response from chat API." }
      if (!response.ok) {
        setMessages((current) => [...current, { role: "assistant", content: data.detail || "Unable to answer right now." }])
        return
      }
      setSessionId(data.session_id)
      setMessages((current) => [...current, { role: "assistant", content: data.answer, citations: data.citations, confidence: data.confidence }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: error instanceof Error ? error.message : "Unable to answer right now." },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await ask(question.trim())
  }

  const latestCitations = [...messages].reverse().find((message) => message.citations?.length)?.citations || []

  return (
    <section className="grid min-h-[700px] gap-4 lg:grid-cols-[1fr_340px]">
      <GlassCard tone="solid" className="flex min-h-[700px] flex-col overflow-hidden">
        <div className="border-b border-white/8 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#14B87A]">Document Q&A</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Conversation</h2>
            </div>
            <select value={documentId} onChange={(event) => setDocumentId(event.target.value)} className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#14B87A]/60">
              <option value="">General legal Q&A</option>
              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.file_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length ? (
            messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-2xl rounded-xl bg-[#14B87A] px-4 py-3 text-sm font-medium text-[#07120D]" : "max-w-3xl rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-[#C7CBD1]"}>
                <div>{message.content}</div>
                {typeof message.confidence === "number" ? (
                  <div className="mt-4 border-t border-white/8 pt-3">
                    <ConfidenceMeter value={Math.round(message.confidence * 100)} />
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <EmptyState
                  icon={<BookOpenText className="size-5" />}
                  title="Ask through the document, not around it"
                  description="Ask about termination, notice periods, payment obligations, liability, jurisdiction, or hidden risks."
                  className="border-none bg-transparent"
                />
              </div>
            </div>
          )}
          {loading ? <div className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-[#A0A6B1]"><Loader2 className="size-4 animate-spin text-[#14B87A]" /> Retrieving clauses and references</div> : null}
        </div>

        <div className="border-t border-white/8 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => ask(suggestion)} className="rounded-full border border-white/10 bg-transparent px-3 py-1.5 text-xs text-[#A0A6B1] transition hover:border-[#14B87A]/30 hover:bg-white/[0.035] hover:text-white">
                {suggestion}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="flex gap-2">
            <input value={question} onChange={(event) => setQuestion(event.target.value)} className="h-11 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-[#6F7682] focus:border-[#14B87A]/60" placeholder="What is the termination clause?" />
            <Button disabled={loading || !question.trim()} className="h-11 rounded-lg bg-[#14B87A] font-semibold text-[#07120D] hover:bg-[#19D28D]">
              <Send className="size-4" />
              Ask
            </Button>
          </form>
        </div>
      </GlassCard>

      <aside className="space-y-4">
        <GlassCard tone="quiet" className="p-5">
          <Sparkles className="size-5 text-[#D4AF37]" />
          <h3 className="mt-4 font-display text-lg font-semibold text-white">References</h3>
          <p className="mt-2 text-sm leading-6 text-[#A0A6B1]">Retrieved citations and related clauses appear here after each grounded answer.</p>
        </GlassCard>
        <GlassCard tone="solid" className="p-5">
          <h3 className="font-display text-lg font-semibold text-white">Source Citations</h3>
          <div className="mt-4 space-y-3">
            {latestCitations.length ? (
              latestCitations.map((citation) => (
                <div key={`${citation.document_id}-${citation.chunk_index}`} className="rounded-lg border border-white/8 bg-white/[0.035] p-3 text-xs leading-5 text-[#A0A6B1]">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                    <FileText className="size-4 text-[#14B87A]" />
                    Clause {citation.chunk_index + 1}
                  </div>
                  {citation.excerpt}
                </div>
              ))
            ) : (
              <EmptyState title="No citations yet" description="Grounded source excerpts will appear here after LexisAI retrieves document context." className="p-4" />
            )}
          </div>
        </GlassCard>
      </aside>
    </section>
  )
}
