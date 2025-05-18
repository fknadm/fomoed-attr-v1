import { SideNav } from "./sidenav"

interface DashboardShellProps {
  children: React.ReactNode
}

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/project-owners",
  },
  {
    title: "Projects",
    href: "/project-owners/projects",
  },
  {
    title: "Campaigns",
    href: "/project-owners/campaigns",
  },
  {
    title: "Analytics",
    href: "/project-owners/analytics",
  },
  {
    title: "Settings",
    href: "/project-owners/settings",
  },
]

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {children}
      </div>
    </div>
  )
} 