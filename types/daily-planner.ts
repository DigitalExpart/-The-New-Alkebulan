export interface TimeBlock {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  category: "work" | "personal" | "health" | "learning" | "social"
  completed: boolean
  priority?: 1 | 2 | 3
}

export interface Habit {
  id: string
  name: string
  icon: string
  category: "health" | "productivity" | "mindfulness" | "learning" | "social"
  frequency: "daily" | "weekly" | "monthly"
  target?: number
  unit?: string
  streak: number
  completedToday: boolean
  completedDates: string[]
  createdAt: string
}

export interface DailyGoal {
  id: string
  text: string
  priority: 1 | 2 | 3
  completed: boolean
  category: "work" | "personal" | "health" | "learning" | "social"
  createdAt?: string
}

export interface MoodEntry {
  id: string
  date: string
  time: "morning" | "evening"
  mood: number // 1-5 scale
  energy: number // 1-5 scale
  notes?: string
}

export interface ReflectionEntry {
  id: string
  date: string
  wentWell: string
  challenges: string
  grateful: string
  tomorrow: string
}

export interface Routine {
  id: string
  name: string
  description: string
  icon: string
  isCustom: boolean
  timeBlocks: Omit<TimeBlock, "id" | "completed">[]
  habits: string[] // habit IDs
  category?: "morning" | "evening" | "work" | "wellness" | "productivity"
}

export interface DailyPlannerData {
  timeBlocks: TimeBlock[]
  habits: Habit[]
  dailyGoals: DailyGoal[]
  moodEntries: MoodEntry[]
  reflectionEntry?: ReflectionEntry
  routines: Routine[]
  successMessage?: string
}
