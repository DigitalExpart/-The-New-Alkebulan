export interface Notification {
  id: string
  type: "message" | "comment" | "mention" | "like" | "follow" | "system" | "friend_request"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  userId?: string
  userAvatar?: string
  userName?: string
  actionUrl?: string
  icon?: string
  iconColor?: string
  // Friend request specific fields
  friendRequestId?: string
  status?: "pending" | "accepted" | "rejected"
}

export interface NotificationGroup {
  date: string
  notifications: Notification[]
}

export interface NotificationSettings {
  messages: boolean
  comments: boolean
  mentions: boolean
  likes: boolean
  follows: boolean
  system: boolean
  friendRequests: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}
