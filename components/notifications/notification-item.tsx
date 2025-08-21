"use client"

import { formatTimeAgo } from "@/utils/date-utils"
import type { Notification } from "@/types/notification"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, MessageSquare, AtSign, Heart, UserPlus, Bell, Check, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface NotificationItemProps {
  notification: Notification
  onClick?: (notification: Notification) => void
  onFriendRequestAction?: (friendRequestId: string, action: 'accept' | 'reject') => void
}

const getIcon = (type: Notification["type"]) => {
  const iconClass = "w-4 h-4"

  switch (type) {
    case "message":
      return <MessageCircle className={`${iconClass} text-blue-500`} />
    case "comment":
      return <MessageSquare className={`${iconClass} text-green-500`} />
    case "mention":
      return <AtSign className={`${iconClass} text-purple-500`} />
    case "like":
      return <Heart className={`${iconClass} text-red-500`} />
    case "follow":
      return <UserPlus className={`${iconClass} text-blue-600`} />
    case "friend_request":
      return <UserPlus className={`${iconClass} text-green-500`} />
    case "system":
      return <Bell className={`${iconClass} text-yellow-500 dark:text-yellow-400`} />
    default:
      return <Bell className={`${iconClass} text-gray-500`} />
  }
}

export function NotificationItem({ notification, onClick, onFriendRequestAction }: NotificationItemProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick(notification)
    }
  }

  const handleFriendRequestAction = async (action: 'accept' | 'reject') => {
    if (!notification.friendRequestId || !onFriendRequestAction) return
    
    setIsProcessing(true)
    try {
      await onFriendRequestAction(notification.friendRequestId, action)
    } finally {
      setIsProcessing(false)
    }
  }

  const content = (
    <div
      className={`flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
        !notification.isRead
          ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-500 dark:border-l-blue-400"
          : ""
      }`}
      onClick={handleClick}
    >
      {/* Avatar or Icon */}
      <div className="flex-shrink-0 mt-1">
        {notification.userAvatar ? (
          <Avatar className="w-8 h-8">
            <AvatarImage src={notification.userAvatar || "/placeholder.svg"} alt={notification.userName} />
            <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
              {notification.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {!notification.userAvatar && <div className="flex-shrink-0">{getIcon(notification.type)}</div>}
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
          )}
        </div>

        <p
          className={`text-sm leading-5 mb-1 ${
            !notification.isRead ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {notification.message}
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(notification.timestamp)}</p>

        {/* Friend Request Action Buttons */}
        {notification.type === "friend_request" && notification.status === "pending" && (
          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              onClick={() => handleFriendRequestAction('accept')}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-7 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFriendRequestAction('reject')}
              disabled={isProcessing}
              className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 h-7 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  if (notification.actionUrl && notification.type !== "friend_request") {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    )
  }

  return content
}
