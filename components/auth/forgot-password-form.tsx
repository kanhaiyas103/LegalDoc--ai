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
          className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-[#6F7682] focus:border-[#14B87A]/60 focus:ring-2 focus:ring-[#14B87A]/20"
          placeholder="you@example.com"
        />
      </label>
      {error ? <p className="rounded-lg border border-[#FF5C5C]/20 bg-[#FF5C5C]/10 px-3 py-2 text-sm text-[#FFB0B0]">{error}</p> : null}
      {message ? <p className="rounded-lg border border-[#14B87A]/20 bg-[#14B87A]/10 px-3 py-2 text-sm text-[#7CE8B8]">{message}</p> : null}
      <Button disabled={loading} className="h-11 w-full rounded-lg bg-[#14B87A] font-semibold text-[#07120D] hover:bg-[#19D28D]">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        Send reset link
      </Button>
    </form>
  )
}
