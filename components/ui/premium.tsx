"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function AnimatedContainer({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function GlassCard({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode
  className?: string
  tone?: "default" | "quiet" | "solid"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border shadow-[0_22px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl transition-[border-color,box-shadow,transform,background-color] duration-300 ease-out",
        tone === "default" && "border-white/10 bg-[linear-gradient(145deg,rgba(30,34,44,0.84),rgba(17,21,28,0.78))]",
        tone === "quiet" && "border-white/8 bg-white/[0.03] shadow-none",
        tone === "solid" && "border-white/10 bg-[linear-gradient(180deg,#151821,#11141B)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#14B87A]">{eyebrow}</p> : null}
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-normal text-white sm:text-3xl">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-[#A0A6B1]">{description}</p> : null}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  className,
}: {
  label: string
  value: string
  detail?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <GlassCard className={cn("p-4 hover:-translate-y-0.5 hover:border-[#14B87A]/30 hover:shadow-[0_26px_90px_rgba(0,0,0,0.34)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#A0A6B1]">{label}</p>
          <div className="mt-3 font-display text-3xl font-semibold text-white">{value}</div>
        </div>
        {icon ? <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#D4AF37] shadow-inner shadow-white/[0.03]">{icon}</div> : null}
      </div>
      {detail ? <p className="mt-3 text-xs leading-5 text-[#A0A6B1]">{detail}</p> : null}
    </GlassCard>
  )
}

export function GradientButton({ children, className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#18D890,#D4AF37)] px-5 text-sm font-semibold text-[#06110C] shadow-[0_14px_36px_rgba(20,184,122,0.22)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(20,184,122,0.3)] active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B87A]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0C10] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function RiskBadge({ score }: { score: number }) {
  const level = score < 35 ? "Low" : score < 70 ? "Moderate" : "High"
  const className =
    score < 35
      ? "border-[#14B87A]/25 bg-[#14B87A]/10 text-[#7CE8B8]"
      : score < 70
        ? "border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F0D47A]"
        : "border-[#FF5C5C]/25 bg-[#FF5C5C]/10 text-[#FF9A9A]"

  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold shadow-inner shadow-white/[0.03]", className)}>{level} risk</span>
}

export function ConfidenceMeter({ value }: { value: number }) {
  const percent = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-[#A0A6B1]">Confidence</span>
        <span className="font-medium text-white">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10 shadow-inner shadow-black/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-[linear-gradient(90deg,#14B87A,#D4AF37)] shadow-[0_0_18px_rgba(20,184,122,0.35)]"
        />
      </div>
    </div>
  )
}

export function LoadingTimeline({ active = false }: { active?: boolean }) {
  const items = ["Parsing Document", "Extracting Clauses", "Finding Risks", "Generating Summary", "Building References"]
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item} className="flex items-center gap-3 text-sm">
          <span className={cn("size-2 rounded-full transition duration-300", active && index < 3 ? "bg-[#14B87A] shadow-[0_0_16px_rgba(20,184,122,0.65)]" : "bg-white/15")} />
          <span className={active && index < 3 ? "text-white" : "text-[#A0A6B1]"}>{item}</span>
        </div>
      ))}
    </div>
  )
}

export function IconTile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#14B87A] shadow-inner shadow-white/[0.03]", className)}>
      {children}
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  className,
}: {
  icon?: ReactNode
  title: string
  description: string
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] p-6 text-center shadow-inner shadow-white/[0.02]", className)}>
      {icon ? <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.045] text-[#D4AF37]">{icon}</div> : null}
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#A0A6B1]">{description}</p>
    </div>
  )
}
