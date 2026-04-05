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
      "flex flex-col items-center gap-1 rounded-2xl bg-zinc-50 p-3.5 text-center",
      className,
    )}>
      {icon && <div className="mb-0.5">{icon}</div>}
      <span className="text-xl font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  )
}
