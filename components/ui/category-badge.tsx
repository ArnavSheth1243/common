import * as React from "react"
import { cn } from "@/lib/utils"

const CATEGORY_COLORS: Record<string, string> = {
  running:      "bg-rose-50 text-rose-600",
  cycling:      "bg-cyan-50 text-cyan-600",
  swimming:     "bg-blue-50 text-blue-600",
  yoga:         "bg-teal-50 text-teal-700",
  strength:     "bg-zinc-100 text-zinc-700",
  hiking:       "bg-emerald-50 text-emerald-700",
  reading:      "bg-violet-50 text-violet-700",
  writing:      "bg-violet-50 text-violet-700",
  journaling:   "bg-purple-50 text-purple-700",
  meditation:   "bg-sky-50 text-sky-700",
  cooking:      "bg-rose-50 text-rose-700",
  learning:     "bg-indigo-50 text-indigo-700",
  music:        "bg-pink-50 text-pink-700",
  art:          "bg-fuchsia-50 text-fuchsia-700",
  photography:  "bg-cyan-50 text-cyan-700",
  finance:      "bg-green-50 text-green-700",
  fitness:      "bg-rose-50 text-rose-700",
  mindfulness:  "bg-sky-50 text-sky-700",
  productivity: "bg-indigo-50 text-indigo-700",
  creativity:   "bg-fuchsia-50 text-fuchsia-700",
  other:        "bg-zinc-100 text-zinc-600",
}

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      colorClass,
      className,
    )}>
      {category}
    </span>
  )
}

export { CATEGORY_COLORS }
