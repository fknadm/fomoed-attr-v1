'use client'

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateCampaignForm } from "./create-campaign-form"

export function CreateCampaignButton() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#C85627] to-[#FF7A42] text-white hover:shadow-[0_0_20px_rgba(200,86,39,0.3)]">
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Configure your campaign settings and requirements.
          </DialogDescription>
        </DialogHeader>
        <CreateCampaignForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
} 