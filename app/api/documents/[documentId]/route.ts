import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const response = await fetch(`${apiUrl}/documents/${documentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  return new NextResponse(null, { status: response.status })
}
