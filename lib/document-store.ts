"use client"

export type StoredDocument = {
  id?: string
  name: string
  type: string
  size?: number
  text: string
  storageUrl?: string
  signedUrl?: string
  updatedAt: string
}

const key = "legaldoc.currentDocument"

export function readStoredDocument(): StoredDocument | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredDocument
  } catch {
    return null
  }
}

export function saveStoredDocument(document: StoredDocument) {
  window.localStorage.setItem(key, JSON.stringify(document))
}

export function clearStoredDocument() {
  window.localStorage.removeItem(key)
}
