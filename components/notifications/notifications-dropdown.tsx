"use client"

import { useState } from "react"
import { Bell, Settings, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { NotificationItem } from "./notification-item"
import type { Notification } from "@/types/notification"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notifications"

export function NotificationsDropdown() {
  const { user } = useAuth()
  const { 
    recentNotifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead,
    markAllAsRead 
  } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  // Debug: Log user state in NotificationsDropdown
  console.log('NotificationsDropdown - User state:', !!user, user?.email)

  // Don't render if user is not logged in
  if (!user || !user.id) {
    console.log('NotificationsDropdown - Returning null, user not logged in or no user.id')
    return null
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
    setIsOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[hsl(var(--navbar-text))] relative p-2 dark:hover:bg-gold"
        >
          <Bell className="w-4 h-4 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center border-2 border-[hsl(var(--navbar-bg))]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-hidden p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-dark-lg"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 h-auto"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="p-1 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Link href="/notifications/settings">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{error}</p>
            </div>
          ) : recentNotifications.length > 0 ? (
            <div>
              {recentNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onClick={handleNotificationClick} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Link href="/notifications">View all notifications</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
