import { Suspense } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" description="Start a secure Indian-law document review workspace with persistent document history.">
      <Suspense fallback={<div className="h-56 rounded-md bg-white/5" />}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  )
}
