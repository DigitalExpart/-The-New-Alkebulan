"use client"

import { AvatarDisplay } from "./avatar/avatar-display"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AvatarOption } from "@/types/avatar"

interface UserAvatarProps {
  avatar?: AvatarOption
  imageUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  fallbackName?: string
}

export function UserAvatar({ avatar, imageUrl, size = "md", className, fallbackName }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  // If there's an uploaded image, use that instead of the custom avatar
  if (imageUrl) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className || ""}`}>
        <AvatarImage src={imageUrl} alt="Profile picture" />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {(fallbackName || "User").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  }

  // Default avatar if none provided
  const defaultAvatar: AvatarOption = {
    id: "default",
    name: fallbackName || "User",
    skinTone: "tone3",
    hairstyle: "afro",
    expression: "happy",
    clothing: "casual",
    background: "green",
    gender: "male",
    region: "Global",
  }

  return <AvatarDisplay avatar={avatar || defaultAvatar} size={size} className={className} />
}
