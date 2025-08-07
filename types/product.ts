export interface Product {
  id: number
  title: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  rating: number
  reviews: number
  tags: string[]
  featured?: boolean
  creator: {
    name: string
    avatar: string
    location: string
    rating: number
    totalSales?: number
    responseTime?: string
  }
  stock: {
    status: "in-stock" | "limited-stock" | "out-of-stock"
    quantity?: number
  }
  shipping: {
    type: "instant" | "standard" | "express"
    estimate: string
    cost?: number
  }
  specifications?: Record<string, string>
  faqs?: Array<{
    question: string
    answer: string
    date: string
  }>
}

export interface ProductReview {
  id: number
  userId: string
  userName: string
  userAvatar: string
  rating: number
  title: string
  comment: string
  date: string
  verified: boolean
  helpful: number
  images?: string[]
  reply?: {
    author: string
    message: string
    date: string
  }
}
