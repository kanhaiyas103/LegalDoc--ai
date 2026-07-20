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
          className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-[#6F7682] focus:border-[#14B87A]/60 focus:ring-2 focus:ring-[#14B87A]/20"
          placeholder="Minimum 8 characters"
        />
      </label>
      {error ? <p className="rounded-lg border border-[#FF5C5C]/20 bg-[#FF5C5C]/10 px-3 py-2 text-sm text-[#FFB0B0]">{error}</p> : null}
      <Button disabled={loading} className="h-11 w-full rounded-lg bg-[#14B87A] font-semibold text-[#07120D] hover:bg-[#19D28D]">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Update password
      </Button>
    </form>
  )
}
