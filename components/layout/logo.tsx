import { Scale } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg border border-[#14B87A]/30 bg-[#14B87A] text-[#07120D] shadow-[0_0_24px_rgba(20,184,122,0.26)]">
        <Scale className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-sm font-semibold text-white">LexisAI</span>
        <span className="block text-xs text-[#A0A6B1]">Legal intelligence platform</span>
      </span>
    </div>
  )
}
