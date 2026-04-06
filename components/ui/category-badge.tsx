import * as React from "react"
import { cn } from "@/lib/utils"

const CATEGORY_COLORS: Record<string, string> = {
  running:      "bg-rose-50 text-rose-600",
  cycling:      "bg-cyan-50 text-cyan-600",
  swimming:     "bg-blue-50 text-blue-600",
  yoga:         "bg-teal-50 text-teal-700",
  strength:     "bg-zinc-100 text-zinc-700",
  hiking:       "bg-emerald-50 text-emerald-700",
  reading:      "bg-blue-50 text-blue-800",
  writing:      "bg-blue-50 text-blue-800",
  journaling:   "bg-purple-50 text-purple-700",
  meditation:   "bg-sky-50 text-sky-700",
  cooking:      "bg-rose-50 text-rose-700",
  learning:     "bg-indigo-50 text-indigo-700",
  music:        "bg-blue-50 text-blue-800",
  art:          "bg-fuchsia-50 text-fuchsia-700",
  photography:  "bg-cyan-50 text-cyan-700",
  finance:      "bg-green-50 text-green-700",
  fitness:      "bg-rose-50 text-rose-700",
  mindfulness:  "bg-sky-50 text-sky-700",
  productivity: "bg-indigo-50 text-indigo-700",
  creativity:   "bg-fuchsia-50 text-fuchsia-700",
  pickleball:   "bg-lime-50 text-lime-700",
  tennis:       "bg-green-50 text-green-700",
  basketball:   "bg-rose-50 text-rose-600",
  soccer:       "bg-emerald-50 text-emerald-600",
  golf:         "bg-teal-50 text-teal-700",
  volleyball:   "bg-sky-50 text-sky-600",
  martial_arts: "bg-red-50 text-red-700",
  climbing:     "bg-stone-100 text-stone-700",
  surfing:      "bg-cyan-50 text-cyan-600",
  skating:      "bg-blue-50 text-blue-700",
  dance:        "bg-blue-50 text-blue-700",
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
