import type { Notification } from "@/types/notification"

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "friend_request",
    title: "Friend Request",
    message: "Sarah Johnson sent you a friend request",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false,
    userId: "user-1",
    userAvatar: "/placeholder.svg?height=40&width=40",
    userName: "Sarah Johnson",
    actionUrl: "/notifications",
    iconColor: "text-green-500",
    friendRequestId: "fr-1",
    status: "pending",
  },
  {
    id: "2",
    type: "friend_request",
    title: "Friend Request",
    message: "Marcus Williams sent you a friend request",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    userId: "user-2",
    userAvatar: "/placeholder.svg?height=40&width=40",
    userName: "Marcus Williams",
    actionUrl: "/notifications",
    iconColor: "text-green-500",
    friendRequestId: "fr-2",
    status: "pending",
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "You received a message from Sarah Johnson",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    userId: "user-1",
    userAvatar: "/placeholder.svg?height=40&width=40",
    userName: "Sarah Johnson",
    actionUrl: "/communities/messenger",
    iconColor: "text-blue-500",
  },
  {
    id: "4",
    type: "comment",
    title: "New Comment",
    message: "Marcus Williams commented on your post about sustainable farming",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: false,
    userId: "user-2",
    userAvatar: "/placeholder.svg?height=40&width=40",
    userName: "Marcus Williams",
    actionUrl: "/communities",
    iconColor: "text-green-500",
  },
  {
    id: "5",
    type: "mention",
    title: "You were mentioned",
    message: "You've been mentioned in the African Heritage community discussion",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: false,
    actionUrl: "/communities/my-community",
    iconColor: "text-purple-500",
  },
  {
    id: "6",
    type: "like",
    title: "Post Liked",
    message: "Amara Okafor and 12 others liked your marketplace listing",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    isRead: true,
    userId: "user-3",
    userAvatar: "/placeholder.svg?height=40&width=40",
    userName: "Amara Okafor",
    actionUrl: "/marketplace",
    iconColor: "text-red-500",
  },
  {
    id: "7",
    type: "follow",
    title: "New Follower",
    message: "Kwame Asante started following you",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    isRead: true,
    userId: "user-4",
    userAvatar: "/placeholder.svg?height=40&width=40",
    userName: "Kwame Asante",
    actionUrl: "/profile",
    iconColor: "text-blue-600",
  },
  {
    id: "8",
    type: "system",
    title: "Platform Update",
    message: "New features have been added to the learning hub",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    actionUrl: "/learning",
    iconColor: "text-yellow-500",
  },
  {
    id: "9",
    type: "message",
    title: "New Message",
    message: "You received a message from David Chen about your business proposal",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    userId: "user-5",
    userAvatar: "/placeholder.svg?height=40&width=40",
    userName: "David Chen",
    actionUrl: "/communities/messenger",
    iconColor: "text-blue-500",
  },
  {
    id: "10",
    type: "system",
    title: "Investment Opportunity",
    message: "New investment opportunities are available in the funding section",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: true,
    actionUrl: "/funding",
    iconColor: "text-green-600",
  },
]

export const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "message":
      return "MessageCircle"
    case "comment":
      return "MessageSquare"
    case "mention":
      return "AtSign"
    case "like":
      return "Heart"
    case "follow":
      return "UserPlus"
    case "friend_request":
      return "UserPlus"
    case "system":
      return "Bell"
    default:
      return "Bell"
  }
}
