import { DashboardShell } from '@/components/ui/dashboard-shell'
import { Wallet } from 'lucide-react'

export default function WalletPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your earnings and payments.
          </p>
        </div>
      </div>
      <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-[#2A2625] p-8 text-center">
        <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Coming Soon</h2>
        <p className="text-muted-foreground">
          We're working on bringing you a seamless payment experience.
          Stay tuned for updates!
        </p>
      </div>
    </DashboardShell>
  )
} 