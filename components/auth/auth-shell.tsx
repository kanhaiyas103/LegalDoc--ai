import Link from "next/link"
import type { ReactNode } from "react"
import { Scale } from "lucide-react"
import { Logo } from "@/components/layout/logo"

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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <Link href="/dashboard" className="mb-8 w-fit">
        <Logo />
      </Link>
      <section className="rounded-md border border-white/10 bg-zinc-950/78 p-6 shadow-2xl shadow-black/20">
        <div className="flex size-11 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-200">
          <Scale className="size-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  )
}
