import * as React from "react"
import { cn } from "@/lib/utils"

interface StatBlockProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  className?: string
}

export function StatBlock({ value, label, icon, className }: StatBlockProps) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-0.5 rounded-xl bg-card border border-border p-3 text-center",
      className,
    )}>
      {icon && <div className="mb-1 text-muted-foreground">{icon}</div>}
      <span className="text-xl font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
