"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <Button
      type="button"
      disabled={loading}
      onClick={logout}
      variant="outline"
      size="sm"
      className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
    >
      <LogOut className="size-4" />
      Logout
    </Button>
  )
}
