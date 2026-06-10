import Link from "next/link"
import { ArrowRight, Database, FileText, Scale, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HistoryPanel } from "@/components/dashboard/history-panel"
import { Navbar } from "@/components/layout/navbar"
import { categoryIcons, tools } from "@/lib/tools"

const stats = [
  { label: "Specialized tools", value: "7" },
  { label: "Jurisdiction", value: "India" },
  { label: "Document sync", value: "Cloud" },
  { label: "Review mode", value: "RAG" },
]

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="w-fit border-amber-300/30 bg-amber-300/10 text-amber-100">
              AI-powered legal workbench
            </Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              LegalDoc
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
              A browser-first workspace for Indian law practitioners, business owners, and teams that need to understand, draft, and review legal documents with a disciplined first pass.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-md border border-white/10 bg-white/5 p-3">
                  <div className="text-xl font-semibold text-white">{stat.value}</div>
                  <div className="mt-1 text-xs text-zinc-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-zinc-950/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Matter Snapshot</h2>
                <p className="text-xs text-zinc-400">Sample risk review output</p>
              </div>
              <Scale className="size-5 text-cyan-300" />
            </div>
            <div className="mt-6 grid gap-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-300">Risk posture</span>
                  <span className="font-medium text-amber-200">62 / 100</span>
                </div>
                <Progress value={62} className="bg-white/10 [&_[data-slot=progress-indicator]]:bg-amber-300" />
              </div>
              {[
                ["Missing liability cap", "22%"],
                ["Broad indemnity", "18%"],
                ["Unilateral termination", "12%"],
                ["Weak confidentiality survival", "10%"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 text-sm">
                  <span className="text-zinc-300">{label}</span>
                  <span className="text-zinc-100">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Tools</h2>
              <p className="mt-1 text-sm text-zinc-400">Upload once, then move between analysis, drafting, and explanation workflows.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon
              const CategoryIcon = categoryIcons[tool.category]
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group rounded-md border border-white/10 bg-zinc-950/70 p-5 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-zinc-900/90"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-md bg-white/8 text-cyan-200">
                      <Icon className="size-5" />
                    </span>
                    <Badge variant="outline" className="border-white/10 text-zinc-300">
                      <CategoryIcon className="size-3" />
                      {tool.category}
                    </Badge>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{tool.name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">{tool.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-cyan-200">
                    Open tool
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <HistoryPanel />

        <section className="grid gap-4 border-t border-white/10 py-8 md:grid-cols-3">
          {[
            [FileText, "Persistent storage", "Documents are stored in Supabase and indexed for secure per-user retrieval."],
            [Database, "RAG pipeline", "The backend combines pgvector semantic search, keyword search, RRF, citations, and confidence scoring."],
            [ShieldAlert, "Legal disclaimer", "Outputs are research and drafting aids, not legal advice."],
          ].map(([Icon, title, text]) => {
            const TypedIcon = Icon as typeof FileText
            return (
              <div key={title as string} className="rounded-md border border-white/10 bg-white/5 p-4">
                <TypedIcon className="size-5 text-amber-200" />
                <h3 className="mt-3 text-sm font-semibold text-white">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{text as string}</p>
              </div>
            )
          })}
        </section>
      </main>
    </>
  )
}
