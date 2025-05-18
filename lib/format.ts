/**
 * Format a number with commas as thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
} 