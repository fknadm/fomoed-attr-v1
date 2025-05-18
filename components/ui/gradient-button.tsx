import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes } from "react"

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  size?: "default" | "lg"
}

export function GradientButton({
  variant = "primary",
  size = "default",
  className,
  children,
  ...props
}: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300",
        size === "default" ? "h-10 px-4 py-2" : "h-12 px-8 py-4 text-lg",
        variant === "primary" 
          ? "bg-gradient-primary hover:opacity-90"
          : "bg-gradient-card hover:border-[#C85627]/50 border border-[#2A2625]",
        "font-medium tracking-wide",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
} 