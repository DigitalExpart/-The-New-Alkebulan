export interface ManifestingData {
  id: string
  userId: string
  bestLifeVision: {
    description: string
    moodboardImages: string[]
    aiGeneratedVision?: string
    lastUpdated: Date
  }
  longTermGoals: {
    oneYear: Goal[]
    fiveYear: Goal[]
    tenYear: Goal[]
    lastUpdated: Date
  }
  autobiography: {
    content: string
    futureVision: string
    lastUpdated: Date
  }
  meditations: {
    saved: Meditation[]
    bookmarked: string[]
    dailyReminder: boolean
    reminderTime?: string
    lastUpdated: Date
  }
  affirmations: {
    personal: Affirmation[]
    dailyFocus?: string
    aiGenerated: Affirmation[]
    lastUpdated: Date
  }
  visualGallery: {
    images: VisionImage[]
    tags: string[]
    displayMode: "grid" | "slideshow"
    lastUpdated: Date
  }
  visionVideos: {
    videos: VisionVideo[]
    dailyReminder: boolean
    reminderTime?: string
    lastUpdated: Date
  }
  customizedVisuals: {
    artwork: CustomVisual[]
    favorites: string[]
    lastUpdated: Date
  }
  hypnotherapy: {
    sessions: HypnotherapySession[]
    journalEntries: JournalEntry[]
    lastUpdated: Date
  }
  privacy: {
    [key: string]: "private" | "public" | "friends"
  }
  dailyRoutine: {
    enabled: boolean
    reminders: DailyReminder[]
    quickAccess: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  title: string
  description: string
  category: GoalCategory
  priority: "low" | "medium" | "high"
  progress: number
  milestones: Milestone[]
  targetDate?: Date
  completed: boolean
  createdAt: Date
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
  completedAt?: Date
}

export type GoalCategory =
  | "career"
  | "health"
  | "relationships"
  | "financial"
  | "spiritual"
  | "personal"
  | "creative"
  | "travel"

export interface Meditation {
  id: string
  title: string
  description: string
  duration: number
  type: "audio" | "video" | "guided" | "music"
  url?: string
  file?: File
  thumbnail?: string
  isBookmarked: boolean
  tags: string[]
  createdAt: Date
}

export interface Affirmation {
  id: string
  text: string
  category: AffirmationCategory
  isActive: boolean
  createdAt: Date
  source: "personal" | "ai" | "template"
}

export type AffirmationCategory =
  | "abundance"
  | "health"
  | "love"
  | "success"
  | "confidence"
  | "peace"
  | "gratitude"
  | "growth"

export interface VisionImage {
  id: string
  url: string
  title: string
  description?: string
  tags: string[]
  category: VisionCategory
  uploadedAt: Date
}

export type VisionCategory =
  | "abundance"
  | "freedom"
  | "health"
  | "relationships"
  | "career"
  | "travel"
  | "home"
  | "lifestyle"

export interface VisionVideo {
  id: string
  title: string
  description: string
  url?: string
  file?: File
  thumbnail?: string
  duration?: number
  hasBackgroundMusic: boolean
  hasVoiceover: boolean
  tags: string[]
  createdAt: Date
}

export interface CustomVisual {
  id: string
  title: string
  description: string
  imageUrl: string
  type: "ai-generated" | "personal-creation" | "edited"
  prompt?: string
  isFavorite: boolean
  tags: string[]
  createdAt: Date
}

export interface HypnotherapySession {
  id: string
  title: string
  description: string
  duration: number
  url?: string
  file?: File
  provider: string
  type: "self-hypnosis" | "guided" | "binaural" | "subliminal"
  tags: string[]
  completedSessions: Date[]
  createdAt: Date
}

export interface JournalEntry {
  id: string
  sessionId: string
  content: string
  mood: "relaxed" | "energized" | "peaceful" | "focused" | "emotional" | "neutral"
  insights: string[]
  createdAt: Date
}

export interface DailyReminder {
  id: string
  type: "affirmation" | "meditation" | "vision" | "journal"
  time: string
  enabled: boolean
  message: string
}

export interface AIVisionPrompt {
  desires: string[]
  timeframe: string
  focusAreas: GoalCategory[]
  tone: "inspiring" | "practical" | "spiritual" | "ambitious"
}
