export function logError(context: string, error: unknown) {
  console.error(`Error in ${context}:`, error)
  
  if (error instanceof Error) {
    console.error('Stack trace:', error.stack)
  }
} 