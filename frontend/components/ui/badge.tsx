import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple/30",
        secondary:
          "border-transparent bg-cyber-neon/20 text-cyber-neon hover:bg-cyber-neon/30",
        destructive:
          "border-transparent bg-red-500/20 text-red-500 hover:bg-red-500/30",
        outline: 
          "text-cyber-purple border border-cyber-purple/50 hover:border-cyber-purple",
        success:
          "border-transparent bg-green-500/20 text-green-500 hover:bg-green-500/30",
        warning:
          "border-transparent bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }