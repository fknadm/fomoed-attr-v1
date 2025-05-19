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

// Define the form schema
const policyFormSchema = createPolicyServerSchema;

type FormData = z.infer<typeof policyFormSchema>;

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
    resolver: zodResolver(policyFormSchema),
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
      const result = policyId
        ? await updateMonetizationPolicyAction(policyId, {
            ...data,
            milestoneBonuses: data.milestoneBonuses || [],
            kolTierBonuses: data.kolTierBonuses || [],
            campaignIds: data.campaignIds || [],
          })
        : await createMonetizationPolicyAction({
            ...data,
            milestoneBonuses: data.milestoneBonuses || [],
            kolTierBonuses: data.kolTierBonuses || [],
            campaignIds: data.campaignIds || [],
          });
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
                      <FormLabel>Bonus Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., 50.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMilestone(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>KOL Tier Bonuses</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={onAddKolTier}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Tier Bonus
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
                    render={({ field: controllerField }) => (
                        <FormItem className="flex-1">
                        <FormLabel>KOL Tier</FormLabel>
                        <Select onValueChange={controllerField.onChange} value={controllerField.value}>
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
                      <FormLabel>Bonus Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., 5 or 12.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeKolTier(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {campaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Link to Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="campaignIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CampaignSearch
                        campaigns={campaigns}
                        selectedCampaignIds={field.value || []}
                        onSelect={(campaignId) => {
                          const currentValue = field.value || [];
                          if (currentValue.includes(campaignId)) {
                            field.onChange(currentValue.filter((id) => id !== campaignId));
                          } else {
                            field.onChange([...currentValue, campaignId]);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid && form.formState.isSubmitted}>
            {isSubmitting ? 'Saving...' : 'Save Policy'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 