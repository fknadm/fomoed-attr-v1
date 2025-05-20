import { Navbar } from "@/components/ui/navbar"
import { CreatorSidebar } from "@/components/creators/sidebar"

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="flex">
        <CreatorSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
} 