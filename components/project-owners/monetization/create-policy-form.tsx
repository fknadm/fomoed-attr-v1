'use client'

import * as React from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createMonetizationPolicyAction, updateMonetizationPolicyAction } from '@/actions/monetization-policies';
import { createPolicyServerSchema } from '@/lib/schemas/monetization-policies';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CampaignSearch } from "./campaign-search"
import { toast } from "sonner"

type FormData = z.infer<typeof createPolicyServerSchema>;

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface CreateMonetizationPolicyFormProps {
  campaigns?: Campaign[];
  initialData?: FormData;
  policyId?: string;
}

const defaultValues: FormData = {
  name: '',
  description: '',
  baseRateMultiplier: '1.0',
  milestoneBonuses: [],
  kolTierBonuses: [],
  campaignIds: [],
};

export function CreateMonetizationPolicyForm({ campaigns = [], initialData, policyId }: CreateMonetizationPolicyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createPolicyServerSchema),
    defaultValues: initialData || defaultValues,
    mode: 'onChange',
  });

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control: form.control,
    name: "milestoneBonuses"
  });

  const { fields: kolTierFields, append: appendKolTier, remove: removeKolTier } = useFieldArray({
    control: form.control,
    name: "kolTierBonuses"
  });

  const onAddMilestone = React.useCallback(() => {
    appendMilestone({ impressionGoal: '', bonusAmount: '' });
  }, [appendMilestone]);

  const onAddKolTier = React.useCallback(() => {
    appendKolTier({ tier: 'BRONZE', bonusPercentage: '' });
  }, [appendKolTier]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    console.log('Client: Submitting policy data to server action:', data);
    try {
      const transformedData = {
        name: data.name,
        baseRateMultiplier: data.baseRateMultiplier,
        milestoneBonuses: data.milestoneBonuses?.map(bonus => ({
          impressionGoal: bonus.impressionGoal,
          bonusAmount: bonus.bonusAmount
        })) || [],
        kolTierBonuses: data.kolTierBonuses?.map(bonus => ({
          tier: bonus.tier,
          bonusPercentage: bonus.bonusPercentage
        })) || [],
        campaignIds: data.campaignIds
      };

      const result = policyId
        ? await updateMonetizationPolicyAction(policyId, transformedData)
        : await createMonetizationPolicyAction(transformedData);
      console.log('Client: Received result from server action:', result);

      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success) {
          toast.success(String(result.message) || (policyId ? 'Policy updated successfully!' : 'Policy created successfully!'));
          router.push('/project-owners/monetization-policies');
        } else {
          console.error("Client: Server action returned error. Full result:", result);
          toast.error('Error ' + (policyId ? 'updating' : 'creating') + ' policy: ' + (String(result.message) || 'Unknown server error'));
        }
      } else {
        console.error('Client: Received unexpected result format from server action. Full result:', result);
        toast.error('Received an unexpected response from the server. Check console for details.');
      }
    } catch (error) {
      console.error('Client: Error caught in onSubmit catch block. Error object:', error);
      let errorMessage = 'An unexpected error occurred while submitting the form.';
      if (error instanceof Error) {
        errorMessage += `\nDetails: ${error.message}`;
        console.error('Client: onSubmit catch - Error name:', error.name);
        console.error('Client: onSubmit catch - Error message:', error.message);
        console.error('Client: onSubmit catch - Error stack:', error.stack);
      } else if (typeof error === 'string') {
        errorMessage += `\nDetails: ${error}`;
      } else {
        console.error('Client: onSubmit catch - Caught error is not an Error instance or string. Type:', typeof error);
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Policy Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Policy Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q1 Growth Initiative" {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the purpose or details of this policy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseRateMultiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Rate Multiplier</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g., 1.0 or 1.5" {...field} />
                  </FormControl>
                  <FormDescription>
                    Multiplier for the campaign's base CPM. 1.0 means no change. (e.g., 1.0, 1.5)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Milestone Bonuses</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={onAddMilestone}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Milestone
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(milestoneFields) && milestoneFields.length === 0 && (
              <p className="text-sm text-muted-foreground">No milestone bonuses added yet.</p>
            )}
            {Array.isArray(milestoneFields) && milestoneFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                <FormField
                  control={form.control}
                  name={`milestoneBonuses.${index}.impressionGoal`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Impression Goal</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., 100000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`milestoneBonuses.${index}.bonusAmount`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Bonus Amount</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., 0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMilestone(index)}
                  className="mb-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>KOL Tier Bonuses</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={onAddKolTier}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Tier
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(kolTierFields) && kolTierFields.length === 0 && (
              <p className="text-sm text-muted-foreground">No KOL tier bonuses added yet.</p>
            )}
            {Array.isArray(kolTierFields) && kolTierFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                <FormField
                  control={form.control}
                  name={`kolTierBonuses.${index}.tier`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Tier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BRONZE">Bronze</SelectItem>
                          <SelectItem value="SILVER">Silver</SelectItem>
                          <SelectItem value="GOLD">Gold</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`kolTierBonuses.${index}.bonusPercentage`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Bonus Percentage</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., 0.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeKolTier(index)}
                  className="mb-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Link Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <FormField
                    key={campaign.id}
                    control={form.control}
                    name="campaignIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={campaign.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(campaign.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value || [], campaign.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== campaign.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {campaign.name}
                              <span className="ml-2 text-sm text-muted-foreground">
                                ({campaign.status})
                              </span>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : policyId ? 'Update Policy' : 'Create Policy'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 