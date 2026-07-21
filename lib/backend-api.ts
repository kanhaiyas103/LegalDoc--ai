"use client"

import { createSupabaseBrowserClient } from "@/lib/supabase/browser"

export function backendUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://legaldoc-ai-1.onrender.com"
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const supabase = createSupabaseBrowserClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return new Response(JSON.stringify({ detail: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${session.access_token}`)

  return fetch(backendUrl(path), { ...init, headers })
}

export async function responseJson(response: Response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { detail: text.slice(0, 1200) || "Backend returned a non-JSON response" }
  }
}
