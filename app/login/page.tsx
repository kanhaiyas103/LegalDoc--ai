import { Suspense } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default function LoginPage() {
  return (
    <AuthShell title="Log in to LexisAI" description="Access your protected legal workspace, documents, analyses, and chat history.">
      <Suspense
        fallback={
          <div className="space-y-4 rounded-xl border border-white/10 bg-[#11151C]/80 p-5">
            <div className="h-11 rounded-lg bg-white/[0.07]" />
            <div className="h-11 rounded-lg bg-white/[0.07]" />
            <div className="h-10 rounded-lg bg-[#D7B46A]/20" />
          </div>
        }
      >
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  )
}
