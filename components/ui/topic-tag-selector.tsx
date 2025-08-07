"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Search, X, Tag, Filter } from "lucide-react"
import { topicTags, tagCategories, getTagsByCategory } from "@/data/topic-tags"
import type { TagSelectorProps, TagCategory } from "@/types/tags"
import { cn } from "@/lib/utils"

export function TopicTagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 10,
  placeholder = "Search tags...",
  disabled = false,
  variant = "default",
  showCategories = true,
  allowMultiple = true,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<TagCategory | "all">("all")

  const filteredTags = useMemo(() => {
    let filtered = topicTags

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = getTagsByCategory(selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tag) => tag.name.toLowerCase().includes(query) || tag.description?.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  const handleTagToggle = (tagId: string) => {
    if (disabled) return

    if (selectedTags.includes(tagId)) {
      // Remove tag
      onTagsChange(selectedTags.filter((id) => id !== tagId))
    } else {
      // Add tag
      if (allowMultiple) {
        if (selectedTags.length < maxTags) {
          onTagsChange([...selectedTags, tagId])
        }
      } else {
        onTagsChange([tagId])
      }
    }
  }

  const clearAllTags = () => {
    if (!disabled) {
      onTagsChange([])
    }
  }

  const getTagColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = "transition-all duration-200 border-2"

    if (isSelected) {
      switch (color) {
        case "blue":
          return `${baseClasses} bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
        case "green":
          return `${baseClasses} bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200`
        case "purple":
          return `${baseClasses} bg-purple-100 border-purple-500 text-purple-800 dark:bg-purple-900 dark:text-purple-200`
        case "red":
          return `${baseClasses} bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200`
        case "yellow":
          return `${baseClasses} bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
        case "pink":
          return `${baseClasses} bg-pink-100 border-pink-500 text-pink-800 dark:bg-pink-900 dark:text-pink-200`
        case "indigo":
          return `${baseClasses} bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200`
        case "orange":
          return `${baseClasses} bg-orange-100 border-orange-500 text-orange-800 dark:bg-orange-900 dark:text-orange-200`
        case "teal":
          return `${baseClasses} bg-teal-100 border-teal-500 text-teal-800 dark:bg-teal-900 dark:text-teal-200`
        case "cyan":
          return `${baseClasses} bg-cyan-100 border-cyan-500 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200`
        case "gray":
          return `${baseClasses} bg-gray-100 border-gray-500 text-gray-800 dark:bg-gray-900 dark:text-gray-200`
        default:
          return `${baseClasses} bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200`
      }
    } else {
      return `${baseClasses} bg-white border-gray-200 text-gray-700 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500`
    }
  }

  const getSizeClasses = () => {
    switch (variant) {
      case "compact":
        return "px-2 py-1 text-xs"
      case "large":
        return "px-4 py-3 text-base"
      default:
        return "px-3 py-2 text-sm"
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-green-600" />
          <Label className="text-base font-medium">Select Topics</Label>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedTags.length}/{maxTags}
            </Badge>
          )}
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllTags}
            disabled={disabled}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      {showCategories && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter by Category
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              disabled={disabled}
              className="rounded-full"
            >
              All Categories
            </Button>
            {Object.entries(tagCategories).map(([category, { name }]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category as TagCategory)}
                disabled={disabled}
                className="rounded-full"
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Tags</Label>
          <div className="flex flex-wrap gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            {selectedTags.map((tagId) => {
              const tag = topicTags.find((t) => t.id === tagId)
              if (!tag) return null

              return (
                <Badge
                  key={tagId}
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1 cursor-pointer",
                    getTagColorClasses(tag.color || "green", true),
                  )}
                  onClick={() => handleTagToggle(tagId)}
                >
                  <Check className="h-3 w-3" />
                  {tag.name}
                  <X className="h-3 w-3 hover:bg-black/10 rounded-full" />
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Tags Grid */}
      <ScrollArea className="h-64">
        <div className="space-y-4">
          {filteredTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id)
                const isMaxReached = selectedTags.length >= maxTags && !isSelected

                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    disabled={disabled || (isMaxReached && allowMultiple)}
                    className={cn(
                      "rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                      getSizeClasses(),
                      getTagColorClasses(tag.color || "green", isSelected),
                    )}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Remove" : "Add"} ${tag.name} tag`}
                  >
                    <span className="flex items-center gap-1">
                      {isSelected && <Check className="h-3 w-3" />}
                      {tag.name}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tags found matching your search.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>
          {allowMultiple
            ? `Select up to ${maxTags} topics to help categorize your content`
            : "Select one topic that best describes your content"}
        </span>
        <span>{filteredTags.length} available</span>
      </div>
    </div>
  )
}
