"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  imageUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  fallbackName?: string
}

export function UserAvatarFixed({ imageUrl, size = "md", className, fallbackName }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  // Get initials from fallback name
  const getInitials = (name?: string) => {
    if (!name) return "U"
    const parts = name.split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ""}`}>
      {imageUrl ? (
        <AvatarImage 
          src={imageUrl} 
          alt="Profile picture" 
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
        {getInitials(fallbackName)}
      </AvatarFallback>
    </Avatar>
  )
}
