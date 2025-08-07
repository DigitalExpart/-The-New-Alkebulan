export interface TopicTag {
  id: string
  name: string
  category: TagCategory
  description?: string
  color?: string
}

export type TagCategory =
  | "personal-development"
  | "health-wellness"
  | "business-career"
  | "relationships"
  | "spirituality"
  | "learning"
  | "lifestyle"
  | "culture"

export interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
  disabled?: boolean
  variant?: "default" | "compact" | "large"
  showCategories?: boolean
  allowMultiple?: boolean
}
