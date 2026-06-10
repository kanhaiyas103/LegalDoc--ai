import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const response = await fetch(`${apiUrl}/analyses/recent`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
