export interface BusinessProfile {
  id: string
  name: string
  logo?: string
  description: string
  tagline: string
  category: BusinessCategory
  location: {
    address: string
    city: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  languages: string[]
  socialLinks: {
    website?: string
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
  }
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface BusinessMetrics {
  totalRevenue: number
  revenueChange: number
  orders: number
  ordersChange: number
  activeProducts: number
  productsChange: number
  customerRating: number
  ratingChange: number
  visits: number
  visitsChange: number
}

export interface BusinessProduct {
  id: string
  title: string
  description: string
  price: number
  currency: string
  images: string[]
  category: string
  status: "live" | "draft" | "unpublished"
  inventory?: number
  createdAt: string
  updatedAt: string
}

export interface BusinessOrder {
  id: string
  customer: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  products: {
    id: string
    title: string
    quantity: number
    price: number
  }[]
  total: number
  currency: string
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface BusinessInquiry {
  id: string
  customer: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  subject: string
  message: string
  status: "new" | "replied" | "resolved"
  createdAt: string
  updatedAt: string
}

export interface BusinessFinance {
  totalEarnings: number
  availableBalance: number
  pendingPayouts: number
  monthlyFees: number
  payoutSettings: {
    method: "bank" | "paypal" | "stripe"
    isVerified: boolean
    nextPayoutDate?: string
  }
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: "owner" | "admin" | "manager" | "lead" | "member" | "viewer"
  functionTitle: string
  department: string
  location: string
  description: string
  specialization: string[]
  reportsTo?: string
  directReports: string[]
  status: "active" | "pending" | "inactive"
  joinedAt: string
  hierarchyLevel: number
  contactPreferences: {
    email: boolean
    directMessage: boolean
    phone?: string
  }
}

export interface Department {
  id: string
  name: string
  description: string
  color: string
  leadId: string
  memberCount: number
}

export interface BusinessGoal {
  id: string
  type: "revenue" | "orders" | "products" | "customers"
  title: string
  target: number
  current: number
  deadline: string
  isCompleted: boolean
  createdAt: string
}

export type BusinessCategory =
  | "retail"
  | "coaching"
  | "events"
  | "services"
  | "consulting"
  | "education"
  | "food"
  | "technology"
  | "health"
  | "arts"
  | "other"
