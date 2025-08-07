export interface PersonalJourney {
  id: string
  userId: string
  whoAmI: {
    reflection: string
    lifeVision: string
    avatarImage?: string
    lastUpdated: Date
  }
  sovereignty: {
    reflection: string
    isDeclaredSovereign: boolean
    declarationDate?: Date
    lastUpdated: Date
  }
  numerology: {
    birthDate?: Date
    lifePathNumber?: number
    insights?: NumerologyInsight[]
    lastCalculated?: Date
  }
  hobbies: {
    selected: string[]
    custom: string[]
    lastUpdated: Date
  }
  values: {
    selected: CoreValue[]
    ranked: string[]
    customValues: string[]
    reflection: string
    lastUpdated: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface NumerologyInsight {
  number: number
  title: string
  description: string
  traits: string[]
  challenges: string[]
  icon: string
}

export interface CoreValue {
  id: string
  name: string
  description: string
  category: ValueCategory
  icon: string
}

export type ValueCategory = "personal" | "relationships" | "spiritual" | "professional" | "social"

export interface HobbyCategory {
  id: string
  name: string
  icon: string
  hobbies: string[]
}

export interface SovereigntyPrinciple {
  id: string
  title: string
  description: string
  icon: string
}
