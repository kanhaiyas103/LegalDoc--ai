"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createSupabaseBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-zinc-200">New password</span>
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
      <Button disabled={loading} className="w-full bg-cyan-300 text-zinc-950 hover:bg-cyan-200">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Update password
      </Button>
    </form>
  )
}
