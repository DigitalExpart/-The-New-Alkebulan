export interface Friend {
  id: string
  name: string
  avatar: string
  location?: string
  bio?: string
  tags: string[]
  mutualCommunities: string[]
  sharedProjects: string[]
  friendSince: string
  lastActive: string
  isOnline: boolean
  relationship: "friend" | "mentor" | "collaborator" | "family" | "colleague"
  profileUrl: string
  messageUrl: string
}

export interface FriendFilters {
  searchQuery: string
  community: string
  location: string
  relationship: string
  recentlyAdded: boolean
  onlineOnly: boolean
}

export type ViewMode = "grid" | "list"

export interface FriendStats {
  totalFriends: number
  onlineFriends: number
  mutualConnections: number
  recentlyAdded: number
}
