'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateMonetizationPolicyForm } from './create-policy-form'

export function CreatePolicyButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-[#C85627] to-[#FF7A42] text-white hover:shadow-[0_0_20px_rgba(200,86,39,0.3)]"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Policy
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Monetization Policy</DialogTitle>
          </DialogHeader>
          <CreateMonetizationPolicyForm />
        </DialogContent>
      </Dialog>
    </>
  )
} 