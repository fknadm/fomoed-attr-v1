'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, User, Wallet, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const items = [
  {
    title: "Campaigns Feed",
    href: "/creators",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    href: "/creators/profile",
    icon: User,
  },
  {
    title: "My Wallet",
    href: "/creators/wallet",
    icon: Wallet,
  },
]

export function CreatorSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex h-full w-full flex-col gap-2 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between px-3 py-2">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Creator Dashboard</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      </div>
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-white",
              isActive
                ? "bg-[#2A2625] text-white"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        )
      })}
    </div>
  )
} 