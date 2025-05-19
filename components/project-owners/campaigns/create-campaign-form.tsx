'use client'

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { ProjectSearch } from "./project-search"
import { useState } from "react"
import { toast } from "sonner"

const campaignFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  heroImage: z.string().min(1, "Hero image is required"),
  socialLinks: z.object({
    twitter: z.string().optional(),
    discord: z.string().optional(),
    telegram: z.string().optional(),
    website: z.string().optional(),
  }),
  budget: z.string().min(1, "Budget is required"),
  cpmValue: z.string().min(1, "CPM value is required"),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  requirements: z.object({
    minFollowers: z.string(),
    verifiedOnly: z.boolean(),
    tier: z.enum(["GOLD", "SILVER", "BRONZE"]),
  }),
  deliverables: z.string().min(1, "Deliverables are required"),
  guidelines: z.string().min(1, "Guidelines are required"),
})

type CampaignFormValues = z.infer<typeof campaignFormSchema>

const defaultValues: Partial<CampaignFormValues> = {
  platforms: [],
  requirements: {
    minFollowers: "",
    verifiedOnly: false,
    tier: "SILVER",
  },
  socialLinks: {
    twitter: "",
    discord: "",
    telegram: "",
    website: "",
  },
}

interface CreateCampaignFormProps {
  onSuccess: () => void
}

export function CreateCampaignForm({ onSuccess }: CreateCampaignFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues,
  })

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload file')
    }

    const data = await response.json()
    return data.url
  }

  async function onSubmit(data: CampaignFormValues) {
    try {
      setIsSubmitting(true)
      console.log('Submitting campaign data:', data)
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Campaign creation failed:', error)
        throw new Error(error.error || 'Failed to create campaign')
      }

      const result = await response.json()
      console.log('Campaign created successfully:', result)
      toast.success('Campaign created successfully')
      onSuccess()
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Failed to create campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  const platforms = [
    { label: "TikTok", value: "tiktok" },
    { label: "Twitter", value: "twitter" },
    { label: "YouTube", value: "youtube" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <FormControl>
                <ProjectSearch
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter campaign title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter campaign description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="heroImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        try {
                          setIsUploading(true)
                          const url = await uploadFile(file)
                          field.onChange(url)
                          toast.success('Image uploaded successfully')
                        } catch (error) {
                          console.error(error)
                          toast.error('Failed to upload image')
                        } finally {
                          setIsUploading(false)
                        }
                      }
                    }}
                  />
                  {field.value && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                      <img
                        src={field.value}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload a high-quality image for your campaign banner (recommended size: 1920x600px)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Budget</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter budget"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpmValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPM Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter CPM value"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Cost per thousand impressions
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="platforms"
          render={() => (
            <FormItem>
              <FormLabel>Target Platforms</FormLabel>
              <div className="flex gap-4">
                {platforms.map((platform) => (
                  <FormField
                    key={platform.value}
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(platform.value)}
                            onCheckedChange={(checked) => {
                              const value = field.value || []
                              return checked
                                ? field.onChange([...value, platform.value])
                                : field.onChange(
                                    value.filter((val) => val !== platform.value)
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {platform.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Duration</FormLabel>
              <FormControl>
                <DatePickerWithRange
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>KOL Requirements</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="requirements.minFollowers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Followers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter minimum followers"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements.tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Tier</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GOLD">Gold</SelectItem>
                      <SelectItem value="SILVER">Silver</SelectItem>
                      <SelectItem value="BRONZE">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="requirements.verifiedOnly"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Verified KOLs Only
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deliverables"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deliverables</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter campaign deliverables"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guidelines"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Media & CTA Guidelines</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter campaign guidelines"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Social Links</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="socialLinks.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <Input placeholder="https://twitter.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.discord"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord</FormLabel>
                  <FormControl>
                    <Input placeholder="https://discord.gg/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.telegram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram</FormLabel>
                  <FormControl>
                    <Input placeholder="https://t.me/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
        </Button>
      </form>
    </Form>
  )
} 