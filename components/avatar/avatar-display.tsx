"use client"

import { type AvatarOption, SKIN_TONES, BACKGROUNDS } from "@/types/avatar"

interface AvatarDisplayProps {
  avatar: AvatarOption
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function AvatarDisplay({ avatar, size = "md", className = "" }: AvatarDisplayProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const skinTone = SKIN_TONES.find((tone) => tone.id === avatar.skinTone)?.color || "#D4A574"
  const background = BACKGROUNDS.find((bg) => bg.id === avatar.background)?.color || "#228B22"

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-2 border-white shadow-lg overflow-hidden ${className}`}
      style={{ background }}
    >
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Avatar illustration placeholder - in a real app, this would be actual avatar graphics */}
        <div className="w-3/4 h-3/4 rounded-full border border-gray-300" style={{ backgroundColor: skinTone }}>
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
            {avatar.name.charAt(0)}
          </div>
        </div>

        {/* Hair indicator */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full opacity-60"></div>

        {/* Expression indicator */}
        <div className="absolute bottom-1 right-1 text-xs">
          {avatar.expression === "happy" && "😊"}
          {avatar.expression === "confident" && "😎"}
          {avatar.expression === "peaceful" && "😌"}
          {avatar.expression === "determined" && "💪"}
          {avatar.expression === "friendly" && "😄"}
          {avatar.expression === "wise" && "🤔"}
        </div>
      </div>
    </div>
  )
}
