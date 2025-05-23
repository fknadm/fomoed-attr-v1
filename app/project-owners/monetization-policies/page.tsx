import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { MonetizationPoliciesList } from '@/components/project-owners/monetization/policies-list'

export default async function MonetizationPoliciesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monetization Policies</h1>
          <p className="text-muted-foreground">
            Manage and create monetization policies for your campaigns.
          </p>
        </div>
        <Link href="/project-owners/monetization-policies/create">
          <Button className="bg-gradient-to-r from-[#C85627] to-[#FF7A42] text-white hover:shadow-[0_0_20px_rgba(200,86,39,0.3)]">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Policy
          </Button>
        </Link>
      </div>

      <MonetizationPoliciesList />
    </div>
  );
}