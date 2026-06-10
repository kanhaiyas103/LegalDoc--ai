import Link from "next/link"
import { redirect } from "next/navigation"
import { Mail, ShieldCheck, UserRound } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Badge } from "@/components/ui/badge"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login?redirectTo=/profile")

  const fullName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "LegalDoc user"

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="rounded-md border border-white/10 bg-zinc-950/70 p-6">
          <Badge variant="outline" className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            User profile
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold text-white">{fullName}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Your authenticated LegalDoc workspace identity. Documents, analyses, chats, and audit events are scoped to this user.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <UserRound className="size-5 text-cyan-200" />
              <h2 className="mt-3 text-sm font-semibold text-white">Account ID</h2>
              <p className="mt-2 break-all text-xs leading-5 text-zinc-400">{user.id}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <Mail className="size-5 text-amber-200" />
              <h2 className="mt-3 text-sm font-semibold text-white">Email</h2>
              <p className="mt-2 break-all text-sm text-zinc-300">{user.email}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="size-5 text-emerald-200" />
              <h2 className="mt-3 text-sm font-semibold text-white">Session</h2>
              <p className="mt-2 text-sm text-zinc-300">Protected by Supabase Auth</p>
            </div>
          </div>
          <Link href="/dashboard" className="mt-6 inline-flex text-sm font-medium text-cyan-200 hover:text-cyan-100">
            Back to workspace
          </Link>
        </section>
      </main>
    </>
  )
}
