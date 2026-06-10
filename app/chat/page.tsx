import { Navbar } from "@/components/layout/navbar"
import { Badge } from "@/components/ui/badge"
import { LegalChat } from "@/components/chat/legal-chat"

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="mb-6 border-b border-white/10 pb-6">
          <Badge variant="outline" className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            Legal chat
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold text-white">Chat with documents</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Ask questions about uploaded documents. LegalDoc retrieves relevant chunks, sends grounded context to GPT-4o, and returns answers with source references.
          </p>
        </section>
        <LegalChat />
      </main>
    </>
  )
}
