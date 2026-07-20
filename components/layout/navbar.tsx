"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileSearch, LayoutDashboard, MessageSquareText, ShieldCheck, UserRound } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tools/document-analyzer", label: "Analyze", icon: FileSearch },
  { href: "/chat", label: "Ask", icon: MessageSquareText },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0B0C10]/88 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center rounded-xl transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B87A]/45" title="Go to dashboard">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-[#14161D]/72 p-1 shadow-2xl shadow-black/20 backdrop-blur-xl lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href.startsWith("/tools") && pathname.startsWith("/tools"))
            return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 items-center gap-2 rounded-full px-3 text-sm text-[#A0A6B1] transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-white",
                active && "bg-white/10 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
              )}
              title={item.label}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-[#14B87A]/20 bg-[#14B87A]/8 px-3 py-1.5 text-xs font-medium text-[#7CE8B8] sm:flex">
            <ShieldCheck className="size-3.5" />
            Secure
          </div>
          <Button asChild variant="outline" size="sm" className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10" title="Open profile">
            <Link href="/profile">
              <UserRound className="size-4" />
              Profile
            </Link>
          </Button>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
