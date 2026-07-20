import Link from "next/link"
import { ArrowRight, Database, FileSearch, FileText, ShieldAlert, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { HistoryPanel } from "@/components/dashboard/history-panel"
import { Navbar } from "@/components/layout/navbar"
import { categoryIcons, tools } from "@/lib/tools"
import { AnimatedContainer, GlassCard, IconTile, RiskBadge, SectionHeader } from "@/components/ui/premium"

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <AnimatedContainer>
            <GlassCard className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-10 top-8 size-36 rounded-full bg-[#14B87A]/12 blur-3xl" />
              <Badge variant="outline" className="w-fit border-[#14B87A]/25 bg-[#14B87A]/10 text-[#7CE8B8]">
                LexisAI workspace
              </Badge>
              <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl">
                Transform Legal Complexity Into Clear Decisions.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#A0A6B1]">
                Review documents, extract clauses, understand obligations, and build risk-aware reports from a single secure legal intelligence workspace.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/tools/document-analyzer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#14B87A] px-5 text-sm font-semibold text-[#07120D] transition hover:-translate-y-0.5 hover:bg-[#19D28D]">
                  Analyze document
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/chat" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                  Ask with citations
                  <Sparkles className="size-4 text-[#D4AF37]" />
                </Link>
              </div>
            </GlassCard>
          </AnimatedContainer>

          <AnimatedContainer delay={0.08}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">Matter Snapshot</h2>
                  <p className="text-sm text-[#A0A6B1]">Sample risk review output</p>
                </div>
                <RiskBadge score={62} />
              </div>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#A0A6B1]">Overall risk</span>
                  <span className="font-medium text-[#F0D47A]">62 / 100</span>
                </div>
                <Progress value={62} className="bg-white/10 [&_[data-slot=progress-indicator]]:bg-[#D4AF37]" />
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  ["Missing liability cap", "22%"],
                  ["Broad indemnity", "18%"],
                  ["Unilateral termination", "12%"],
                  ["Weak confidentiality survival", "10%"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.035] px-3 py-2 text-sm">
                    <span className="text-[#A0A6B1]">{label}</span>
                    <span className="font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </AnimatedContainer>
        </section>

        <DashboardMetrics />

        <section className="py-10">
          <SectionHeader eyebrow="Quick actions" title="Choose the legal decision workflow." description="Upload once, then move between analysis, drafting, explanation, risk scoring, and cited Q&A." />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              const CategoryIcon = categoryIcons[tool.category]
              return (
                <AnimatedContainer key={tool.id} delay={0.04 * index}>
                  <Link
                    href={`/tools/${tool.id}`}
                    className="group block h-full rounded-xl border border-white/8 bg-[#1A1D25]/78 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#14B87A]/35 hover:bg-[#1E222C]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <IconTile>
                        <Icon className="size-5" />
                      </IconTile>
                      <Badge variant="outline" className="border-white/10 text-[#A0A6B1]">
                        <CategoryIcon className="size-3" />
                        {tool.category}
                      </Badge>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-white">{tool.name}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-[#A0A6B1]">{tool.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#7CE8B8]">
                      Open workflow
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                </AnimatedContainer>
              )
            })}
          </div>
        </section>

        <HistoryPanel />

        <section className="grid gap-4 border-t border-white/8 py-8 md:grid-cols-3">
          {[
            [FileText, "Persistent storage", "Documents are stored in Supabase and indexed for secure per-user retrieval."],
            [Database, "RAG pipeline", "The backend combines pgvector semantic search, keyword search, RRF, citations, and confidence scoring."],
            [ShieldAlert, "Legal disclaimer", "Outputs are research and drafting aids, not legal advice."],
          ].map(([Icon, title, text]) => {
            const TypedIcon = Icon as typeof FileSearch
            return (
              <GlassCard key={title as string} className="p-4">
                <TypedIcon className="size-5 text-[#D4AF37]" />
                <h3 className="mt-3 font-display text-sm font-semibold text-white">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-[#A0A6B1]">{text as string}</p>
              </GlassCard>
            )
          })}
        </section>
      </main>
    </>
  )
}
