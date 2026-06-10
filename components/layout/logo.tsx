import { Scale } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-md bg-cyan-400 text-zinc-950">
        <Scale className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">LegalDoc</span>
        <span className="block text-xs text-zinc-400">Indian law workbench</span>
      </span>
    </div>
  )
}
