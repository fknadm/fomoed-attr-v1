interface CampaignMetrics {
  budget: string
  startDate: string
  endDate: string
  applications: Array<{
    metrics: Array<{
      impressions: number
      clicks: number
      conversions: number
      engagement: string
    }>
    proposedAmount: string
  }>
}

export function calculateCampaignPerformance(campaign: CampaignMetrics) {
  const budget_total = parseFloat(campaign.budget)
  const start_date = new Date(campaign.startDate)
  const end_date = new Date(campaign.endDate)
  const current_date = new Date()
  
  // Calculate durations
  const duration_total = Math.ceil((end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60 * 24))
  const elapsed_days = Math.max(0, Math.ceil((current_date.getTime() - start_date.getTime()) / (1000 * 60 * 60 * 24)))
  const days_left = Math.max(0, Math.ceil((end_date.getTime() - current_date.getTime()) / (1000 * 60 * 60 * 24)))
  
  // Calculate spend and engagement
  const spend_so_far = campaign.applications?.reduce((sum, app) => 
    sum + parseFloat(app.proposedAmount), 0) || 0
  
  const total_impressions = campaign.applications?.reduce((sum, app) => 
    sum + (app.metrics?.reduce((s, m) => s + m.impressions, 0) || 0), 0) || 0
  
  const total_engagement = campaign.applications?.reduce((sum, app) => 
    sum + (app.metrics?.reduce((s, m) => s + parseFloat(m.engagement), 0) || 0), 0) || 0
  
  // Calculate CPM
  const CPM_current = total_impressions > 0 ? (spend_so_far / total_impressions) * 1000 : 0
  const CPM_budget = total_impressions > 0 ? (budget_total / total_impressions) * 1000 : 0
  
  // Calculate all metrics
  const ideal_daily_spend = budget_total / duration_total
  const actual_daily_spend = elapsed_days > 0 ? spend_so_far / elapsed_days : 0
  const remaining_daily_spend = days_left > 0 ? (budget_total - spend_so_far) / days_left : 0
  const remaining_budget = budget_total - spend_so_far
  const projected_total_spend = elapsed_days > 0 ? (spend_so_far / elapsed_days) * duration_total : 0
  const budget_variance = projected_total_spend - budget_total
  const pacing_index = ideal_daily_spend > 0 ? actual_daily_spend / ideal_daily_spend : 0
  const delivered_impressions = CPM_current > 0 ? (spend_so_far / CPM_current) * 1000 : 0
  const forecasted_impressions_remaining = CPM_current > 0 ? ((budget_total - spend_so_far) / CPM_current) * 1000 : 0
  const cost_per_engagement = total_engagement > 0 ? spend_so_far / total_engagement : 0
  const engagement_rate = total_impressions > 0 ? total_engagement / total_impressions : 0
  const days_coverable = actual_daily_spend > 0 ? (budget_total - spend_so_far) / actual_daily_spend : 0
  const projected_total_engagement = elapsed_days > 0 ? (total_engagement / elapsed_days) * duration_total : 0
  const engagement_forecast_remaining = elapsed_days > 0 ? (total_engagement / elapsed_days) * days_left : 0
  const cpm_variance = CPM_budget > 0 ? ((CPM_current - CPM_budget) / CPM_budget) * 100 : 0

  return {
    ideal_daily_spend,
    actual_daily_spend,
    remaining_daily_spend,
    remaining_budget,
    projected_total_spend,
    budget_variance,
    pacing_index,
    delivered_impressions,
    forecasted_impressions_remaining,
    cost_per_engagement,
    engagement_rate,
    days_coverable,
    projected_total_engagement,
    engagement_forecast_remaining,
    cpm_variance,
    // Additional context values
    duration_total,
    elapsed_days,
    days_left,
    spend_so_far,
    total_impressions,
    total_engagement,
    CPM_current,
    CPM_budget
  }
} 