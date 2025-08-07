export interface Tribe {
  id: string
  name: string
  region: string
  country: string
  population: number
  language: string
  greeting: string
  description: string
  history: string
  values: string[]
  customs: string[]
  image: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface SpiritualPractice {
  id: string
  name: string
  category: "belief" | "ceremony" | "ritual" | "healing" | "symbol"
  description: string
  significance: string
  regions: string[]
  image: string
  relatedPractices: string[]
}

export interface AfricanProverb {
  id: string
  proverb: string
  meaning: string
  origin: string
  category: "wisdom" | "life" | "community" | "nature" | "leadership"
  language: string
  isFavorited?: boolean
}

export interface CulturalLeader {
  id: string
  name: string
  title: string
  country: string
  era: string
  contribution: string
  quote: string
  biography: string
  image: string
  achievements: string[]
}

export interface CulturalMilestone {
  id: string
  year: number
  title: string
  description: string
  significance: string
  region: string
  category: "political" | "cultural" | "spiritual" | "educational" | "artistic"
}

export interface Language {
  id: string
  name: string
  nativeName: string
  family: string
  speakers: number
  countries: string[]
  greetings: {
    hello: string
    goodbye: string
    thankYou: string
    welcome: string
  }
  phrases: {
    phrase: string
    translation: string
  }[]
}

export interface PersonalConnection {
  favoriteProverbs: string[]
  favoriteTribes: string[]
  culturalReflections: {
    id: string
    date: string
    reflection: string
    category: string
  }[]
  ancestryConnections: {
    region: string
    tribe?: string
    confidence: number
  }[]
}
