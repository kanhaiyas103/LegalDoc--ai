"use client"

import { FormEvent, useEffect, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

type DocumentRow = { id: string; file_name: string }
type Citation = { document_id: string; chunk_index: number; page_number?: number; excerpt: string; score: number }
type Message = { role: "user" | "assistant"; content: string; citations?: Citation[]; confidence?: number }

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim()) return
    const nextQuestion = question.trim()
    setQuestion("")
    setMessages((current) => [...current, { role: "user", content: nextQuestion }])
    setLoading(true)
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: nextQuestion, document_id: documentId || null, session_id: sessionId }),
    })
    const data = await response.json()
    setLoading(false)
    if (!response.ok) {
      setMessages((current) => [...current, { role: "assistant", content: data.detail || "Unable to answer right now." }])
      return
    }
    setSessionId(data.session_id)
    setMessages((current) => [...current, { role: "assistant", content: data.answer, citations: data.citations, confidence: data.confidence }])
  }

  return (
    <section className="grid min-h-[680px] gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-md border border-white/10 bg-zinc-950/70 p-4">
        <h2 className="text-sm font-semibold text-white">Document</h2>
        <select value={documentId} onChange={(event) => setDocumentId(event.target.value)} className="mt-3 h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none">
          <option value="">All indexed documents</option>
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.file_name}
            </option>
          ))}
        </select>
        <div className="mt-4 rounded-md bg-white/5 p-3 text-xs leading-5 text-zinc-400">
          Answers are grounded in retrieved chunks and include source excerpts.
        </div>
      </aside>
      <div className="flex min-h-[680px] flex-col rounded-md border border-white/10 bg-zinc-950/70">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length ? (
            messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-2xl rounded-md bg-cyan-300 px-4 py-3 text-sm text-zinc-950" : "max-w-3xl rounded-md bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-200"}>
                <div>{message.content}</div>
                {message.citations?.length ? (
                  <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                    <div className="text-xs font-semibold uppercase tracking-normal text-zinc-400">Sources · Confidence {Math.round((message.confidence || 0) * 100)}%</div>
                    {message.citations.map((citation) => (
                      <div key={`${citation.document_id}-${citation.chunk_index}`} className="rounded-md bg-black/20 p-2 text-xs text-zinc-400">
                        Chunk {citation.chunk_index + 1}: {citation.excerpt}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
              Ask about termination, notice periods, payment obligations, liability, jurisdiction, or hidden risks.
            </div>
          )}
          {loading ? <div className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-sm text-zinc-300"><Loader2 className="size-4 animate-spin" /> Retrieving clauses</div> : null}
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t border-white/10 p-4">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} className="h-10 flex-1 rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60" placeholder="What is the termination clause?" />
          <Button disabled={loading || !question.trim()} className="bg-cyan-300 text-zinc-950 hover:bg-cyan-200">
            <Send className="size-4" />
            Ask
          </Button>
        </form>
      </div>
    </section>
  )
}
