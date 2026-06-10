"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquareText, UserRound } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"
import { Logo } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { tools } from "@/lib/tools"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/86 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/dashboard"
            className={cn(
              "flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 transition hover:bg-white/8 hover:text-white",
              pathname === "/dashboard" && "bg-white/10 text-white",
            )}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/chat"
            className={cn(
              "flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 transition hover:bg-white/8 hover:text-white",
              pathname === "/chat" && "bg-white/10 text-white",
            )}
          >
            <MessageSquareText className="size-4" />
            Chat
          </Link>
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className={cn(
                "h-9 rounded-md px-3 pt-2 text-sm text-zinc-300 transition hover:bg-white/8 hover:text-white",
                pathname === `/tools/${tool.id}` && "bg-white/10 text-white",
              )}
            >
              {tool.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
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
