'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  ListPlus,
  Settings,
  Users,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Projects",
    href: "/project-owners/projects",
    icon: Building2,
    isActive: (pathname: string) => 
      pathname.startsWith("/project-owners/projects")
  },
  {
    title: "Campaigns",
    href: "/project-owners",
    icon: ListPlus,
    subItems: [
      {
        title: "All Campaigns",
        href: "/project-owners",
        icon: ListPlus,
        isActive: (pathname: string) => 
          pathname === "/project-owners" || 
          /^\/project-owners\/campaigns\/[^/]+$/.test(pathname)
      },
      {
        title: "Monetization Policies",
        href: "/project-owners/monetization-policies",
        icon: DollarSign,
        isActive: (pathname: string) => 
          pathname.startsWith("/project-owners/monetization-policies")
      },
      {
        title: "Campaign Templates",
        href: "/project-owners/campaign-templates",
        icon: FileText,
        isActive: (pathname: string) => 
          pathname.startsWith("/project-owners/campaign-templates")
      },
    ],
  },
  {
    title: "Analytics",
    href: "/project-owners/analytics",
    icon: BarChart3,
    isActive: (pathname: string) => 
      pathname.startsWith("/project-owners/analytics")
  },
  {
    title: "KOL Management",
    href: "/project-owners/kols",
    icon: Users,
    isActive: (pathname: string) => 
      pathname.startsWith("/project-owners/kols")
  },
  {
    title: "Settings",
    href: "/project-owners/settings",
    icon: Settings,
    isActive: (pathname: string) => 
      pathname.startsWith("/project-owners/settings")
  },
]

export function ProjectOwnersSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const initialExpanded: string[] = []
    sidebarItems.forEach(item => {
      if (item.subItems && item.subItems.some(subItem => subItem.isActive(pathname))) {
        initialExpanded.push(item.href)
      }
    })
    return initialExpanded
  })

  const toggleItem = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  return (
    <div className={cn(
      "relative border-r border-[#2A2625] bg-[#0A0A0A] h-[calc(100vh-4rem)] transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border border-[#2A2625] bg-[#0A0A0A] hover:bg-[#C85627]/10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[#C85627]/10 hover:text-[#C85627] gap-3",
                    (item.subItems ? item.subItems.some(subItem => subItem.isActive(pathname)) : item.isActive?.(pathname))
                      ? "bg-[#C85627]/10 text-[#C85627]"
                      : "text-muted-foreground"
                  )}
                  onClick={(e) => {
                    if (item.subItems) {
                      e.preventDefault()
                      toggleItem(item.href)
                    }
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.subItems && (
                        <ChevronDown 
                          className={cn(
                            "h-4 w-4 transition-transform shrink-0",
                            expandedItems.includes(item.href) && "transform rotate-180"
                          )} 
                        />
                      )}
                    </>
                  )}
                </Link>
                {!isCollapsed && item.subItems && expandedItems.includes(item.href) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[#C85627]/10 hover:text-[#C85627] gap-3",
                          subItem.isActive(pathname)
                            ? "bg-[#C85627]/10 text-[#C85627]"
                            : "text-muted-foreground"
                        )}
                      >
                        <subItem.icon className="h-4 w-4 shrink-0" />
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 