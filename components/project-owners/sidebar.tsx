'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  ListPlus,
  Settings,
  Users,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Campaigns",
    href: "/project-owners",
    icon: ListPlus,
  },
  {
    title: "Analytics",
    href: "/project-owners/analytics",
    icon: BarChart3,
  },
  {
    title: "KOL Management",
    href: "/project-owners/kols",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/project-owners/settings",
    icon: Settings,
  },
]

export function ProjectOwnersSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r border-[#2A2625] bg-[#0A0A0A] h-[calc(100vh-4rem)]">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[#C85627]/10 hover:text-[#C85627] gap-3",
                  (pathname === item.href || (item.href === '/project-owners' && pathname === '/project-owners'))
                    ? "bg-[#C85627]/10 text-[#C85627]"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 