export interface Notification {
  id: string
  type: "message" | "comment" | "mention" | "like" | "follow" | "system"
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
  emailNotifications: boolean
  pushNotifications: boolean
}
