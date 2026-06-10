"use client"

import { FormEvent, useState } from "react"
import { Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    const supabase = createSupabaseBrowserClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setMessage("Password reset instructions have been sent to your email.")
  }

  return (
    <form onSubmit={submit} className="space-y-4">
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
      {error ? <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p> : null}
      {message ? <p className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">{message}</p> : null}
      <Button disabled={loading} className="w-full bg-cyan-300 text-zinc-950 hover:bg-cyan-200">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        Send reset link
      </Button>
    </form>
  )
}
