export interface DevelopmentArea {
  id: string
  name: string
  level: number
  maxLevel: number
  color: string
  description: string
  motivationalQuote: string
  lastUpdated: string
  relatedContent?: string[]
}

export interface PersonalDevelopmentData {
  areas: DevelopmentArea[]
  focusArea?: string
  lastOverallUpdate: string
}

export type ViewMode = "bars" | "pentagon"
