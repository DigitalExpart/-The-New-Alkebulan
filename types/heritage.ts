export interface DNATestKit {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  features: string[]
  processingTime: string
  reviews: DNAKitReview[]
  averageRating: number
  totalReviews: number
}

export interface DNAKitReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  isVerified: boolean
  createdAt: string
}

export interface DNATestStatus {
  currentStep: number
  steps: DNATestStep[]
  orderedAt?: string
  estimatedCompletion?: string
}

export interface DNATestStep {
  id: string
  name: string
  description: string
  isCompleted: boolean
  completedAt?: string
}

export interface EthnicityResult {
  region: string
  percentage: number
  confidence: number
  description: string
  color: string
}

export interface TribalConnection {
  tribe: string
  region: string
  matchPercentage: number
  description: string
  culturalNotes: string[]
}

export interface HeritageInsight {
  category: "cultural" | "linguistic" | "historical" | "health"
  title: string
  description: string
  details: string[]
  relatedRegions: string[]
}

export interface FamilyMember {
  id: string
  name: string
  relationship: string
  birthDate?: string
  deathDate?: string
  birthPlace?: string
  photo?: string
  biography?: string
  legacyNotes?: string
  generation: number
  parentIds?: string[]
  children?: string[]
}

export interface FamilyTree {
  id: string
  name: string
  members: FamilyMember[]
  createdAt: string
  updatedAt: string
}

export interface HeritageProgress {
  dnaTestCompleted: boolean
  familyTreeStarted: boolean
  heritageInsightsViewed: boolean
  overallCompletion: number
}
