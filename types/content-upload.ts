export interface ContentUpload {
  id?: string
  title: string
  description: string
  contentType: ContentType
  subject: Subject
  language: Language
  tags: string[]
  visibility: VisibilityLevel
  allowComments: boolean
  allowRatings: boolean
  allowSharing: boolean
  file?: File
  socialMediaUrl?: string
  socialMediaData?: SocialMediaContent
  createdAt?: Date
  updatedAt?: Date
  authorId?: string
}

export interface SocialMediaContent {
  platform: SocialPlatform
  originalUrl: string
  title?: string
  description?: string
  thumbnail?: string
  author?: string
  duration?: number
  publishedAt?: Date
  embedCode?: string
}

export type ContentType = "article" | "video" | "audio" | "image" | "link" | "document"

export type Subject =
  | "business"
  | "wellness"
  | "culture"
  | "education"
  | "spirituality"
  | "finance"
  | "society"
  | "parenting"
  | "legal"
  | "autonomy"

export type Language = "en" | "nl" | "fr" | "af" | "es" | "pt" | "sw" | "ar"

export type VisibilityLevel = "public" | "community" | "private"

export type SocialPlatform = "instagram" | "tiktok" | "youtube" | "facebook" | "pinterest"

export interface UploadProgress {
  percentage: number
  status: "idle" | "uploading" | "processing" | "complete" | "error"
  message?: string
}

export interface AIEnhancement {
  suggestedTags: string[]
  suggestedCategory: Subject
  generatedSummary?: string
  confidence: number
}
