'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Campaign {
  id: string
  name: string
  status: string
}

interface CampaignSearchProps {
  campaigns: Campaign[]
  selectedCampaignIds: string[]
  onSelect: (campaignId: string) => void
}

export function CampaignSearch({ campaigns, selectedCampaignIds, onSelect }: CampaignSearchProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCampaignIds.length > 0
            ? `${selectedCampaignIds.length} campaign${selectedCampaignIds.length !== 1 ? 's' : ''} selected`
            : "Select campaigns..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search campaigns..." />
          <CommandEmpty>No campaign found.</CommandEmpty>
          <CommandGroup>
            {campaigns.map((campaign) => (
              <CommandItem
                key={campaign.id}
                value={campaign.id}
                onSelect={() => {
                  onSelect(campaign.id)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCampaignIds.includes(campaign.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center justify-between w-full">
                  <span>{campaign.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({campaign.status})
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 