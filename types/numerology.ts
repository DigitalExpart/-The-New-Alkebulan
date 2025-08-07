export interface NumerologyProfile {
  id: string
  userId: string
  fullNameAtBirth: string
  birthDate: Date
  coreNumbers: CoreNumbers
  currentCycles: CurrentCycles
  createdAt: Date
  updatedAt: Date
}

export interface CoreNumbers {
  lifePathNumber: number
  destinyNumber: number
  soulUrgeNumber: number
  personalityNumber: number
  birthdayNumber: number
}

export interface CurrentCycles {
  personalYear: number
  personalMonth: number
  personalDay: number
  year: number
}

export interface NumberMeaning {
  number: number
  title: string
  description: string
  strengths: string[]
  challenges: string[]
  purpose: string
  famousPeople: string[]
  keywords: string[]
  element?: string
  color?: string
  icon: string
}

export interface PersonalYearMeaning {
  number: number
  title: string
  description: string
  themes: string[]
  focus: string[]
  opportunities: string[]
  challenges: string[]
  advice: string
}

export interface DailyVibe {
  date: Date
  personalDay: number
  mood: "aligned" | "neutral" | "challenging" | null
  notes: string
  energy: number // 1-10 scale
}

export interface JournalingPrompt {
  id: string
  numberType: "lifePath" | "destiny" | "soulUrge" | "personality" | "birthday" | "personalYear"
  number: number
  prompt: string
  category: "reflection" | "growth" | "purpose" | "relationships"
}
