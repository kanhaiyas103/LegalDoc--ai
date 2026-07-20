import Link from "next/link"
import { ArrowRight, FileCheck2, FileText, Scale, ShieldCheck, Sparkles } from "lucide-react"
import { AnimatedContainer, GlassCard, IconTile, RiskBadge, SectionHeader } from "@/components/ui/premium"
import { Logo } from "@/components/layout/logo"

const features = [
  { title: "Clause Intelligence", text: "Find payment, termination, confidentiality, IP, indemnity, jurisdiction, and governance terms instantly.", icon: FileCheck2 },
  { title: "Risk Decisions", text: "Convert dense legal language into prioritized risk scores, recommendations, and negotiation moves.", icon: ShieldCheck },
  { title: "Grounded References", text: "Ask document questions with citations, related clauses, and context-aware follow-ups.", icon: Scale },
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[#14B87A]/14 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between">
          <Link href="/dashboard" aria-label="Open LexisAI dashboard">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-[#A0A6B1] transition hover:bg-[#11151C] hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="rounded-lg bg-[#14B87A] px-4 py-2 text-sm font-semibold text-[#07120D] transition hover:bg-[#19D28D]">
              Start review
            </Link>
          </nav>
        </header>

        <section className="grid min-h-[calc(100vh-92px)] items-center gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr]">
          <AnimatedContainer>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#D4AF37]">
              <Sparkles className="size-3.5" />
              AI Legal Intelligence Platform
            </div>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Understand Legal Documents in Minutes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#A0A6B1]">
              Upload contracts, NDAs, agreements, policies, and instantly receive AI-powered legal insights, clause explanations, summaries, and risk analysis.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#14B87A] px-6 text-sm font-semibold text-[#07120D] shadow-[0_0_28px_rgba(20,184,122,0.28)] transition hover:-translate-y-0.5 hover:bg-[#19D28D]">
                Analyze a document
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/10">
                Open workspace
              </Link>
            </div>
          </AnimatedContainer>

          <AnimatedContainer delay={0.12}>
            <GlassCard tone="solid" className="relative overflow-hidden p-5">
              <div className="absolute right-8 top-8 size-24 rounded-full bg-[#D4AF37]/10 blur-2xl" />
              <div className="flex items-start justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-3">
                  <IconTile>
                    <FileText className="size-5" />
                  </IconTile>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-white">Master Services Agreement</h2>
                    <p className="text-xs text-[#A0A6B1]">12 pages - indexed 2 min ago</p>
                  </div>
                </div>
                <RiskBadge score={62} />
              </div>
              <div className="grid gap-4 pt-5 md:grid-cols-[1fr_220px]">
                <div className="space-y-3">
                  {[
                    ["Termination", "30-day cure period detected; unilateral convenience termination needs review."],
                    ["Financial Obligations", "Payment cycle is defined, but late fee treatment is incomplete."],
                    ["Jurisdiction", "Indian law present; dispute venue requires clearer seat language."],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-lg border border-white/8 bg-white/[0.035] p-3">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-[#A0A6B1]">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-white/8 bg-black/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A0A6B1]">Review Pipeline</p>
                  <div className="mt-4 space-y-3">
                    {["Parsed", "Clauses mapped", "Risks scored", "References built"].map((item, index) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-[#A0A6B1]">
                        <span className={index < 3 ? "size-2 rounded-full bg-[#14B87A]" : "size-2 rounded-full bg-[#D4AF37]"} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </AnimatedContainer>
        </section>

        <section className="pb-16">
          <SectionHeader eyebrow="Why LexisAI" title="Built for legal decisions, not chatbot theatre." description="Every workflow is designed around document evidence, risk posture, and review momentum." />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <AnimatedContainer key={feature.title} delay={0.08 * index}>
                  <GlassCard tone={index === 1 ? "solid" : "quiet"} className="h-full p-5">
                    <Icon className="size-5 text-[#D4AF37]" />
                    <h3 className="mt-5 font-display text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#A0A6B1]">{feature.text}</p>
                  </GlassCard>
                </AnimatedContainer>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
