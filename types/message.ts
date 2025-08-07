export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: Date
  isRead: boolean
  type: "text" | "image" | "file"
}

export interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    avatar: string
    isOnline: boolean
    lastSeen?: Date
  }[]
  lastMessage: Message
  unreadCount: number
  updatedAt: Date
  isTyping?: boolean
}

export interface MessageGroup {
  senderId: string
  senderName: string
  senderAvatar: string
  messages: Message[]
  timestamp: Date
}
