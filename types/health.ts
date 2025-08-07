export interface HealthMetrics {
  physicalHealth: number
  mentalWellbeing: number
  nutrition: number
  sleep: number
  fitness: number
  stress: number
}

export interface HealthGoal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  category: string
  streak: number
  color: string
}

export interface HealthHabit {
  id: string
  name: string
  completed: boolean
  streak: number
  category: string
}

export interface HealthContent {
  id: string
  title: string
  type: "video" | "article" | "meditation" | "exercise"
  category: string
  duration?: string
  readTime?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  thumbnail: string
  author: string
  rating: number
  views: number
}

export interface JournalEntry {
  id: string
  date: string
  mood: number
  energy: number
  sleep: number
  notes: string
  tags: string[]
}

export interface HealthCoach {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  experience: string
  price: string
  avatar: string
  verified: boolean
  languages: string[]
  availability: string
}

export interface HealthData {
  overview: {
    metrics: HealthMetrics
    period: string
  }
  goals: HealthGoal[]
  habits: HealthHabit[]
  content: HealthContent[]
  journal: JournalEntry[]
  coaches: HealthCoach[]
}
