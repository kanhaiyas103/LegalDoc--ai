import { Navbar } from "@/components/layout/navbar"
import { Badge } from "@/components/ui/badge"
import { LegalChat } from "@/components/chat/legal-chat"
import { AnimatedContainer } from "@/components/ui/premium"

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AnimatedContainer className="mb-6 border-b border-white/8 pb-6">
          <Badge variant="outline" className="border-[#14B87A]/25 bg-[#14B87A]/10 text-[#7CE8B8]">
            Legal intelligence
          </Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-normal text-white">Ask documents with citations.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A0A6B1]">
            LexisAI retrieves relevant clauses, sends grounded context to GPT-4o, and returns answers with source references and confidence signals.
          </p>
        </AnimatedContainer>
        <LegalChat />
      </main>
    </>
  )
}
