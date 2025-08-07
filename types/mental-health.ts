export interface MentalHealthProfessional {
  id: string
  name: string
  title: string
  profileImage: string
  credentials: string[]
  specializations: string[]
  languages: string[]
  location: string
  availability: "online" | "in-person" | "both"
  rating: number
  reviewCount: number
  hourlyRate: number
  currency: string
  responseTime: string
  verified: boolean
  about: string
  therapeuticApproach: string
  experience: number
  acceptedPayments: string[]
  contactInfo: {
    email?: string
    phone?: string
    website?: string
  }
  calendar?: string
  culturalSpecialties?: string[]
  sessionTypes: string[]
}

export interface MentalHealthFilters {
  professionalType: string[]
  specializations: string[]
  languages: string[]
  availability: string[]
  location: string
  maxDistance: number
  minRating: number
  maxPrice: number
  verified: boolean
}

export interface JournalEntry {
  id: string
  date: string
  mood: number
  feelings: string[]
  notes: string
  questionsForTherapist?: string
  userId: string
}

export interface MentalHealthStats {
  totalSessions: number
  averageMoodRating: number
  mostCommonFeelings: string[]
  progressTrend: "improving" | "stable" | "declining"
  journalEntries: number
}
