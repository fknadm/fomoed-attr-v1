'use client'

import * as React from 'react'
import { Button } from './button'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mb-2 text-lg font-semibold">Something went wrong</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
              >
                Try again
              </Button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
} 