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

const campaignFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
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
}

interface CreateCampaignFormProps {
  onSuccess: () => void
}

export function CreateCampaignForm({ onSuccess }: CreateCampaignFormProps) {
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues,
  })

  async function onSubmit(data: CampaignFormValues) {
    try {
      // TODO: Implement campaign creation API call
      console.log(data)
      onSuccess()
    } catch (error) {
      console.error(error)
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

        <Button type="submit" className="w-full">
          Create Campaign
        </Button>
      </form>
    </Form>
  )
} 