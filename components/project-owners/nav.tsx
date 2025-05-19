import Link from "next/link"
import { Home, Megaphone, DollarSign, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function ProjectOwnerNav() {
  return (
    <nav className="grid items-start gap-2">
      <Link
        href="/project-owners"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start"
        )}
      >
        <Home className="mr-2 h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/project-owners/campaigns"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start"
        )}
      >
        <Megaphone className="mr-2 h-4 w-4" />
        Campaigns
      </Link>
      <Link
        href="/project-owners/monetization"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start"
        )}
      >
        <DollarSign className="mr-2 h-4 w-4" />
        Monetization
      </Link>
      <Link
        href="/project-owners/settings"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start"
        )}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Link>
    </nav>
  )
} 