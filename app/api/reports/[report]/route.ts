import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ report: string }> }) {
  const { report } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const response = await fetch(`${apiUrl}/reports/${report}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  const contentType = response.headers.get("content-type") || "application/octet-stream"
  const disposition = response.headers.get("content-disposition") || "attachment"
  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      "content-type": contentType,
      "content-disposition": disposition,
    },
  })
}
