"use client"

import { AvatarDisplay } from "./avatar/avatar-display"
import type { AvatarOption } from "@/types/avatar"

interface UserAvatarProps {
  avatar?: AvatarOption
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  fallbackName?: string
}

export function UserAvatar({ avatar, size = "md", className, fallbackName }: UserAvatarProps) {
  // Default avatar if none provided
  const defaultAvatar: AvatarOption = {
    id: "default",
    name: fallbackName || "User",
    skinTone: "tone3",
    hairstyle: "afro",
    expression: "happy",
    clothing: "casual",
    background: "green",
    gender: "non-binary",
    region: "Global",
  }

  return <AvatarDisplay avatar={avatar || defaultAvatar} size={size} className={className} />
}
