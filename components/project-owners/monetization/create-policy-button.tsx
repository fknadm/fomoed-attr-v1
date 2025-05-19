'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreatePolicyForm } from './create-policy-form'

export function CreatePolicyButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Create Policy
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Monetization Policy</DialogTitle>
          </DialogHeader>
          <CreatePolicyForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
} 