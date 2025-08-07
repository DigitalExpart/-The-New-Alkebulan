export interface LearningItem {
  id: string
  title: string
  description: string
  content?: string
  type: "article" | "book" | "video" | "audio" | "program" | "course"
  format: "Video Course" | "E-book" | "Podcast Series" | "Interactive Workshop" | "Article" | "Program"
  topics: Topic[]
  tags: string[]
  author?: string
  instructor?: string
  host?: string
  publishedDate: Date
  duration?: number // in minutes for video/audio
  lessons?: number
  pages?: number
  episodes?: number
  views: number
  rating: number
  reviewCount: number
  students?: number
  readers?: number
  listeners?: number
  thumbnail: string
  featured: boolean
  userHasSeen: boolean
  progress: number
  bookmarked: boolean
  price: number
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  category: string
  image: string
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

export type FileType = "article" | "book" | "video" | "audio" | "program" | "course"

export type DateRange = "today" | "this-week" | "this-month" | "this-year" | "custom"

export type SortOption = "popular" | "most-viewed" | "best-reviewed" | "recently-added" | "progress"

export type ViewMode = "grid" | "modules"

export interface LearningFilters {
  topics: Topic[]
  fileTypes: FileType[]
  dateRange: DateRange
  customDateStart?: Date
  customDateEnd?: Date
  sortBy: SortOption
  searchQuery: string
  showBookmarkedOnly: boolean
  showInProgressOnly: boolean
}

export interface UserPreferences {
  viewMode: ViewMode
  filtersExpanded: boolean
}
