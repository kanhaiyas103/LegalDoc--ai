import Link from "next/link"
import { redirect } from "next/navigation"
import { Mail, ShieldCheck, UserRound } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Badge } from "@/components/ui/badge"
import { AnimatedContainer, GlassCard } from "@/components/ui/premium"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login?redirectTo=/profile")

  const fullName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "LexisAI user"

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <AnimatedContainer>
        <GlassCard className="p-6">
          <Badge variant="outline" className="border-[#14B87A]/25 bg-[#14B87A]/10 text-[#7CE8B8]">
            User profile
          </Badge>
          <h1 className="mt-4 font-display text-3xl font-semibold text-white">{fullName}</h1>
          <p className="mt-2 text-sm leading-6 text-[#A0A6B1]">
            Your authenticated LexisAI workspace identity. Documents, analyses, chats, and audit events are scoped to this user.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
              <UserRound className="size-5 text-[#14B87A]" />
              <h2 className="mt-3 text-sm font-semibold text-white">Account ID</h2>
              <p className="mt-2 break-all text-xs leading-5 text-[#A0A6B1]">{user.id}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
              <Mail className="size-5 text-[#D4AF37]" />
              <h2 className="mt-3 text-sm font-semibold text-white">Email</h2>
              <p className="mt-2 break-all text-sm text-[#C7CBD1]">{user.email}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
              <ShieldCheck className="size-5 text-[#7CE8B8]" />
              <h2 className="mt-3 text-sm font-semibold text-white">Session</h2>
              <p className="mt-2 text-sm text-[#C7CBD1]">Protected by Supabase Auth</p>
            </div>
          </div>
          <Link href="/dashboard" className="mt-6 inline-flex text-sm font-medium text-[#7CE8B8] hover:text-[#A8F4D0]">
            Back to workspace
          </Link>
        </GlassCard>
        </AnimatedContainer>
      </main>
    </>
  )
}
