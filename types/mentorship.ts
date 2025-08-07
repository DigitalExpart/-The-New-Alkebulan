export interface Mentor {
  id: string
  name: string
  title: string
  profilePicture: string
  bio: string
  specializations: string[]
  languages: string[]
  location: string
  distance?: number
  rating: number
  reviewCount: number
  credentials: Credential[]
  experience: string
  isVerified: boolean
  isActive: boolean
  hourlyRate?: number
  responseTime: string
  totalSessions: number
  reviews: Review[]
  availability: string[]
  tags: string[]
}

export interface Credential {
  id: string
  title: string
  issuer: string
  year: number
  verified: boolean
}

export interface Review {
  id: string
  menteeId: string
  menteeName: string
  menteeAvatar: string
  rating: number
  comment: string
  date: string
  sessionType: string
}

export interface MentorshipFilters {
  specializations: string[]
  languages: string[]
  location: string
  maxDistance: number
  minRating: number
  availability: string[]
  priceRange: [number, number]
  isVerified: boolean
}

export type SortOption = "topRated" | "mostActive" | "closest" | "newest" | "priceAsc" | "priceDesc"
