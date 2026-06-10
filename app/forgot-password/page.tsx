import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" description="Enter your email and LegalDoc will send a secure reset link through Supabase Auth.">
      <ForgotPasswordForm />
      <Link href="/login" className="mt-4 inline-flex text-sm text-cyan-200 hover:text-cyan-100">
        Return to login
      </Link>
    </AuthShell>
  )
}
