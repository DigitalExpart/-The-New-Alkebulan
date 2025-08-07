export interface Community {
  id: string
  name: string
  description: string
  icon: string
  category: "music" | "energy" | "farming" | "real-estate" | "ai" | "business" | "health" | "education" | "other"
  memberCount: number
  unreadMessages: number
  lastActivity: string
  isPinned: boolean
  isJoined: boolean
  color: string
}

export interface CommunityStats {
  totalCommunities: number
  unreadMessages: number
  totalMembers: number
  pinnedCommunities: number
}

export type ViewMode = "grid" | "sidebar"
