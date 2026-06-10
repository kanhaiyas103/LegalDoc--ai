import { Suspense } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default function LoginPage() {
  return (
    <AuthShell title="Log in to LegalDoc" description="Access your protected legal workspace, documents, analyses, and chat history.">
      <Suspense fallback={<div className="h-48 rounded-md bg-white/5" />}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  )
}
