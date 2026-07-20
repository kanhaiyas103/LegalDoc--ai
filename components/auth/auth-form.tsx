"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"
import { Loader2, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

type Mode = "login" | "signup"

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const isSignup = mode === "signup"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    const supabase = createSupabaseBrowserClient()

    const result = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    if (isSignup && !result.data.session) {
      setMessage("Check your email to confirm your account, then sign in.")
      return
    }

    router.replace(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {isSignup ? (
        <label className="block">
          <span className="text-sm font-medium text-zinc-200">Full name</span>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-[#6F7682] focus:border-[#14B87A]/60 focus:ring-2 focus:ring-[#14B87A]/20"
            placeholder="Kanhaiya Kumar"
          />
        </label>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-zinc-200">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-[#6F7682] focus:border-[#14B87A]/60 focus:ring-2 focus:ring-[#14B87A]/20"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-200">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-[#6F7682] focus:border-[#14B87A]/60 focus:ring-2 focus:ring-[#14B87A]/20"
          placeholder="Minimum 8 characters"
        />
      </label>
      {error ? <p className="rounded-lg border border-[#FF5C5C]/20 bg-[#FF5C5C]/10 px-3 py-2 text-sm text-[#FFB0B0]">{error}</p> : null}
      {message ? <p className="rounded-lg border border-[#14B87A]/20 bg-[#14B87A]/10 px-3 py-2 text-sm text-[#7CE8B8]">{message}</p> : null}
      <Button disabled={loading} className="h-11 w-full rounded-lg bg-[#14B87A] font-semibold text-[#07120D] hover:bg-[#19D28D]">
        {loading ? <Loader2 className="size-4 animate-spin" /> : isSignup ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}
        {isSignup ? "Create account" : "Log in"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href={isSignup ? "/login" : "/signup"} className="text-[#7CE8B8] hover:text-[#A8F4D0]">
          {isSignup ? "Already have an account?" : "Create an account"}
        </Link>
        {!isSignup ? (
          <Link href="/forgot-password" className="text-[#A0A6B1] hover:text-white">
            Forgot password?
          </Link>
        ) : null}
      </div>
    </form>
  )
}
