"use client"

import { Badge } from "@/components/ui/badge"
import { getTagsByIds } from "@/data/topic-tags"
import { cn } from "@/lib/utils"

interface TopicTagDisplayProps {
  tagIds: string[]
  variant?: "default" | "compact" | "large"
  maxDisplay?: number
  showAll?: boolean
  className?: string
  onTagClick?: (tagId: string) => void
}

export function TopicTagDisplay({
  tagIds,
  variant = "default",
  maxDisplay = 5,
  showAll = false,
  className,
  onTagClick,
}: TopicTagDisplayProps) {
  const tags = getTagsByIds(tagIds)
  const displayTags = showAll ? tags : tags.slice(0, maxDisplay)
  const remainingCount = tags.length - maxDisplay

  const getTagColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
      case "green":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700"
      case "red":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"
      case "pink":
        return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700"
      case "indigo":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700"
      case "orange":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700"
      case "teal":
        return "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900 dark:text-teal-200 dark:border-teal-700"
      case "cyan":
        return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700"
      case "gray":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
      default:
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
    }
  }

  const getSizeClasses = () => {
    switch (variant) {
      case "compact":
        return "px-2 py-0.5 text-xs"
      case "large":
        return "px-3 py-2 text-base"
      default:
        return "px-2 py-1 text-sm"
    }
  }

  if (tags.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className={cn(
            "rounded-full border cursor-pointer hover:opacity-80 transition-opacity",
            getSizeClasses(),
            getTagColorClasses(tag.color || "green"),
            onTagClick && "cursor-pointer",
          )}
          onClick={() => onTagClick?.(tag.id)}
        >
          {tag.name}
        </Badge>
      ))}

      {!showAll && remainingCount > 0 && (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full border bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600",
            getSizeClasses(),
          )}
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}
