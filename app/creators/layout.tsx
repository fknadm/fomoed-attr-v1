import { Navbar } from "@/components/ui/navbar"

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      {children}
    </div>
  )
} 