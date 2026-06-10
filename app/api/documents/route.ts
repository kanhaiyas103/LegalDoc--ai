import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

async function upstreamJson(response: Response) {
  const text = await response.text()
  if (!text) return { detail: response.ok ? "OK" : "Backend returned an empty response" }
  try {
    return JSON.parse(text)
  } catch {
    return { detail: text.slice(0, 1200) || "Backend returned a non-JSON response" }
  }
}

async function accessToken() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token
}

export async function GET(request: NextRequest) {
  const token = await accessToken()
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const upstream = new URL(`${apiUrl}/documents`)
  const query = request.nextUrl.searchParams.get("query")
  if (query) upstream.searchParams.set("query", query)

  const response = await fetch(upstream, { headers: { Authorization: `Bearer ${token}` } })
  const data = await upstreamJson(response)
  return NextResponse.json(data, { status: response.status })
}

export async function POST(request: NextRequest) {
  const token = await accessToken()
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const formData = await request.formData()
  const response = await fetch(`${apiUrl}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await upstreamJson(response)
  return NextResponse.json(data, { status: response.status })
}
