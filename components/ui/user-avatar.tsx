"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const AVATAR_COLORS = [
  "bg-zinc-900 text-white",
  "bg-rose-500 text-white",
  "bg-cyan-500 text-white",
  "bg-emerald-500 text-white",
  "bg-sky-500 text-white",
  "bg-blue-500 text-white",
  "bg-indigo-500 text-white",
  "bg-blue-500 text-white",
  "bg-teal-500 text-white",
  "bg-lime-500 text-white",
  "bg-cyan-500 text-white",
  "bg-fuchsia-500 text-white",
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

interface UserAvatarProps {
  name: string
  imageUrl?: string | null
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
}

export function UserAvatar({ name, imageUrl, size = "md", className }: UserAvatarProps) {
  const initials = getInitials(name)
  const colorClass = getAvatarColor(name)

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback className={cn(colorClass, sizeClasses[size])}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export { getAvatarColor, getInitials, AVATAR_COLORS }
