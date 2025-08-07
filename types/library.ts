export interface LibraryItem {
  id: string
  title: string
  description: string
  content: string
  type: "article" | "image" | "book" | "video" | "program"
  topics: Topic[]
  tags: string[]
  author: string
  publishedDate: Date
  duration?: number // in minutes for video/audio
  views: number
  rating: number
  reviewCount: number
  thumbnail: string
  featured: boolean
  userHasSeen: boolean
}

export type Topic =
  | "manifest"
  | "business"
  | "energy-healing"
  | "food-nutrition"
  | "sport-movement"
  | "financial"
  | "spiritual"
  | "parenting"
  | "society"
  | "legal"
  | "autonomy"

export type FileType = "article" | "image" | "book" | "video" | "program"

export type DateRange = "today" | "this-week" | "this-month" | "this-year" | "custom"

export type SortOption = "most-popular" | "most-views" | "best-reviewed" | "seen-before" | "not-seen-before"

export interface LibraryFilters {
  topics: Topic[]
  fileTypes: FileType[]
  dateRange: DateRange
  customDateStart?: Date
  customDateEnd?: Date
  sortBy: SortOption
  searchQuery: string
}
