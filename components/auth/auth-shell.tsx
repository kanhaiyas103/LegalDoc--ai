import Link from "next/link"
import type { ReactNode } from "react"
import { ShieldCheck } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { AnimatedContainer } from "@/components/ui/premium"

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_440px]">
      <div className="pointer-events-none absolute left-1/4 top-16 size-72 rounded-full bg-[#14B87A]/12 blur-3xl" />
      <AnimatedContainer className="hidden lg:block">
        <Link href="/dashboard" className="inline-flex">
          <Logo />
        </Link>
        <h1 className="mt-10 max-w-2xl font-display text-5xl font-semibold leading-tight tracking-normal text-white">
          Transform Legal Complexity Into Clear Decisions.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#A0A6B1]">
          A secure AI legal intelligence workspace for reviewing contracts, surfacing risks, and preserving every decision trail.
        </p>
      </AnimatedContainer>
      <AnimatedContainer delay={0.08}>
        <Link href="/dashboard" className="mb-8 inline-flex lg:hidden">
          <Logo />
        </Link>
        <section className="rounded-xl border border-white/8 bg-[#1A1D25]/82 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex size-11 items-center justify-center rounded-lg border border-[#14B87A]/25 bg-[#14B87A]/10 text-[#7CE8B8]">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#A0A6B1]">{description}</p>
          <div className="mt-6">{children}</div>
        </section>
      </AnimatedContainer>
    </main>
  )
}
