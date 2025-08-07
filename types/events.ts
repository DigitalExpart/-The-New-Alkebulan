export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  endDate?: string
  endTime?: string
  location: {
    type: "online" | "offline" | "hybrid"
    address?: string
    city?: string
    country?: string
    onlineLink?: string
  }
  coverImage: string
  hostCommunity: {
    id: string
    name: string
    avatar: string
  }
  host: {
    id: string
    name: string
    avatar: string
  }
  category: "wellness" | "tech" | "business" | "culture" | "education" | "networking" | "entertainment" | "sports"
  tags: string[]
  maxParticipants?: number
  currentParticipants: number
  price?: {
    amount: number
    currency: string
    type: "free" | "paid"
  }
  rsvpDeadline?: string
  speakers?: {
    id: string
    name: string
    title: string
    avatar: string
  }[]
  attendees: {
    id: string
    name: string
    avatar: string
  }[]
  isRsvped: boolean
  isFavorited: boolean
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface EventFilters {
  location: string
  dateRange: "today" | "week" | "month" | "custom"
  customDateStart?: string
  customDateEnd?: string
  category: string
  communities: string[]
  friendsAttending: boolean
  sortBy: "newest" | "popular" | "closest" | "soonest"
}

export type ViewMode = "list" | "calendar"

export interface EventStats {
  totalEvents: number
  upcomingEvents: number
  myEvents: number
  rsvpedEvents: number
}
