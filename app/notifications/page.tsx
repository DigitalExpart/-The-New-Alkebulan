"use client"

import { useState } from "react"
import { Bell, Search, Settings, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NotificationItem } from "@/components/notifications/notification-item"
import { mockNotifications } from "@/data/notifications-data"
import type { Notification } from "@/types/notification"
import { groupNotificationsByDate } from "@/utils/date-utils"
import Link from "next/link"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.userName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || notification.type === filterType
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "unread" && !notification.isRead) ||
      (filterStatus === "read" && notification.isRead)

    return matchesSearch && matchesType && matchesStatus
  })

  const groupedNotifications = groupNotificationsByDate(filteredNotifications)

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)))
    }
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const markSelectedAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (filteredNotifications.some((fn) => fn.id === n.id) && !n.isRead ? { ...n, isRead: true } : n)),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markSelectedAsRead}
                disabled={filteredNotifications.filter((n) => !n.isRead).length === 0}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark visible as read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 bg-transparent"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 bg-transparent"
              >
                <Link href="/notifications/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="mention">Mentions</SelectItem>
                <SelectItem value="like">Likes</SelectItem>
                <SelectItem value="follow">Follows</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all">All notifications</SelectItem>
                <SelectItem value="unread">Unread only</SelectItem>
                <SelectItem value="read">Read only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-6">
          {groupedNotifications.length > 0 ? (
            groupedNotifications.map(({ date, notifications: groupNotifications }) => (
              <div
                key={date}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-dark border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    {date}
                    <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                      {groupNotifications.length}
                    </Badge>
                  </h3>
                </div>
                <div>
                  {groupNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-dark border border-gray-200 dark:border-gray-700">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filterType !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "You're all caught up! New notifications will appear here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
