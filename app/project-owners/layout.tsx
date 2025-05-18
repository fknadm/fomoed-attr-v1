import { Navbar } from "@/components/ui/navbar"
import { ProjectOwnersSidebar } from "@/components/project-owners/sidebar"

export default function ProjectOwnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="flex">
        <ProjectOwnersSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
} 