export interface Company {
  id: string
  name: string
  description: string
  industry: string
  location: string
  size: string
  founded: number
  website: string
  logo: string
  coverImage: string
  featured: boolean
  verified: boolean
  employees: number
  revenue: string
  tags: string[]
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
    youtube?: string
  }
  contact: {
    email: string
    phone: string
  }
}

export interface CompanyFilters {
  search: string
  industry: string
  location: string
  size: string
  featured: boolean
}
