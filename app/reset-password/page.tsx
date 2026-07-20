import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" description="Set a new password for your LexisAI account.">
      <ResetPasswordForm />
    </AuthShell>
  )
}
