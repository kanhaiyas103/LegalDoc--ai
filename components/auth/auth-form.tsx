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
            className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
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
          className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
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
          className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          placeholder="Minimum 8 characters"
        />
      </label>
      {error ? <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
      {message ? <p className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">{message}</p> : null}
      <Button disabled={loading} className="w-full bg-cyan-300 text-zinc-950 hover:bg-cyan-200">
        {loading ? <Loader2 className="size-4 animate-spin" /> : isSignup ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}
        {isSignup ? "Create account" : "Log in"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link href={isSignup ? "/login" : "/signup"} className="text-cyan-200 hover:text-cyan-100">
          {isSignup ? "Already have an account?" : "Create an account"}
        </Link>
        {!isSignup ? (
          <Link href="/forgot-password" className="text-zinc-400 hover:text-white">
            Forgot password?
          </Link>
        ) : null}
      </div>
    </form>
  )
}
