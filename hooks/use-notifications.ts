"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import type { Notification } from "@/types/notification"

// Minimal settings shape used for filtering notification types
interface DbNotificationSettings {
  friend_requests?: boolean
  messages?: boolean
  comments?: boolean
  likes?: boolean
  mentions?: boolean
  follows?: boolean
  system_updates?: boolean
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<DbNotificationSettings | null>(null)

  // Map a notification type to the corresponding settings key
  const mapTypeToSettingKey = (type: Notification["type"]): keyof DbNotificationSettings | null => {
    switch (type) {
      case "friend_request":
        return "friend_requests"
      case "message":
        return "messages"
      case "comment":
        return "comments"
      case "like":
        return "likes"
      case "mention":
        return "mentions"
      case "follow":
        return "follows"
      case "system":
        return "system_updates"
      default:
        return null
    }
  }

  const isTypeEnabled = (type: Notification["type"]) => {
    if (!settings) return true // If no settings yet, allow all
    const key = mapTypeToSettingKey(type)
    if (!key) return true
    const value = (settings as any)[key]
    return value === undefined ? true : !!value
  }

  // Fetch user notification settings
  const fetchNotificationSettings = async () => {
    if (!user?.id) return
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("notification_settings")
        .select("friend_requests,messages,comments,likes,mentions,follows,system_updates")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching notification settings:", error)
        return
      }

      if (data) setSettings(data as DbNotificationSettings)
    } catch (err) {
      console.error("Error in fetchNotificationSettings:", err)
    }
  }

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      
      // Fetch notifications from the database
      const { data: dbNotifications, error: dbError } = await supabase
        .from('notifications')
        .select(`
          id,
          user_id,
          title,
          message,
          type,
          is_read,
          related_id,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (dbError) {
        console.error('Error fetching notifications:', dbError)
        setError('Failed to fetch notifications')
        return
      }

      // Transform database notifications to match our interface
      const transformedNotifications: Notification[] = (dbNotifications || []).map((dbNotif) => ({
        id: dbNotif.id,
        type: (dbNotif.type as Notification['type']) || 'system',
        title: dbNotif.title,
        message: dbNotif.message,
        timestamp: new Date(dbNotif.created_at),
        isRead: dbNotif.is_read || false,
        userId: dbNotif.related_id, // related_id might contain the user who triggered the notification
        actionUrl: getActionUrl(dbNotif.type, dbNotif.related_id),
        iconColor: getIconColor(dbNotif.type),
        friendRequestId: dbNotif.type === 'friend_request' ? dbNotif.related_id : undefined,
        status: dbNotif.type === 'friend_request' ? 'pending' : undefined,
      }))

      // Apply settings filter if available
      const filtered = transformedNotifications.filter((n) => isTypeEnabled(n.type))
      setNotifications(filtered)
    } catch (err) {
      console.error('Error in fetchNotifications:', err)
      setError('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error marking notification as read:', error)
        toast.error('Failed to mark notification as read')
        return
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
    } catch (err) {
      console.error('Error in markAsRead:', err)
      toast.error('Failed to mark notification as read')
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        toast.error('Failed to mark all notifications as read')
        return
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      )

      toast.success('All notifications marked as read')
    } catch (err) {
      console.error('Error in markAllAsRead:', err)
      toast.error('Failed to mark all notifications as read')
    }
  }

  // Create a new notification
  const createNotification = async (notificationData: {
    userId: string
    title: string
    message: string
    type: Notification['type']
    relatedId?: string
  }) => {
    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          related_id: notificationData.relatedId,
          is_read: false
        })

      if (error) {
        console.error('Error creating notification:', error)
        return false
      }

      // Refresh notifications
      await fetchNotifications()
      return true
    } catch (err) {
      console.error('Error in createNotification:', err)
      return false
    }
  }

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseClient()
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting notification:', error)
        toast.error('Failed to delete notification')
        return
      }

      // Update local state
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      )

      toast.success('Notification deleted')
    } catch (err) {
      console.error('Error in deleteNotification:', err)
      toast.error('Failed to delete notification')
    }
  }

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Get recent notifications (for dropdown)
  const recentNotifications = notifications.slice(0, 6)

  // Setup realtime listeners and initial fetch when user changes
  useEffect(() => {
    if (!user?.id) {
      setNotifications([])
      setLoading(false)
      return
    }

    let notificationsChannel: any | null = null
    let settingsChannel: any | null = null

    const supabase = getSupabaseClient()

    // Initial load
    fetchNotificationSettings().then(fetchNotifications)

    // Realtime: notifications for this user
    try {
      notificationsChannel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const dbNotif: any = payload.new
            const newNotif: Notification = {
              id: dbNotif.id,
              type: (dbNotif.type as Notification['type']) || 'system',
              title: dbNotif.title,
              message: dbNotif.message,
              timestamp: new Date(dbNotif.created_at || Date.now()),
              isRead: dbNotif.is_read || false,
              userId: dbNotif.related_id,
              actionUrl: getActionUrl(dbNotif.type, dbNotif.related_id),
              iconColor: getIconColor(dbNotif.type),
              friendRequestId: dbNotif.type === 'friend_request' ? dbNotif.related_id : undefined,
              status: dbNotif.type === 'friend_request' ? 'pending' : undefined,
            }

            if (!isTypeEnabled(newNotif.type)) return

            setNotifications((prev) => [newNotif, ...prev])
            // Optional toast for live arrival
            toast(newNotif.title || 'New notification', { description: newNotif.message })
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const updated: any = payload.new
            setNotifications((prev) => prev.map((n) => (n.id === updated.id ? { ...n, isRead: !!updated.is_read } : n)))
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const deleted: any = payload.old
            setNotifications((prev) => prev.filter((n) => n.id !== deleted.id))
          }
        )
        .subscribe()
    } catch (err) {
      console.error('Error subscribing to notifications realtime:', err)
    }

    // Realtime: settings changes
    try {
      settingsChannel = supabase
        .channel(`notification_settings:${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notification_settings', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setSettings(payload.new as DbNotificationSettings)
            // Re-apply filters to current list when settings change
            setNotifications((prev) => prev.filter((n) => isTypeEnabled(n.type)))
          }
        )
        .subscribe()
    } catch (err) {
      console.error('Error subscribing to notification settings realtime:', err)
    }

    return () => {
      try {
        if (notificationsChannel) supabase.removeChannel(notificationsChannel)
        if (settingsChannel) supabase.removeChannel(settingsChannel)
      } catch (err) {
        console.error('Error cleaning up realtime channels:', err)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return {
    notifications,
    recentNotifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
  }
}

// Helper function to determine action URL based on notification type
function getActionUrl(type: string, relatedId?: string): string {
  switch (type) {
    case 'message':
      return '/messages'
    case 'comment':
      return '/communities'
    case 'mention':
      return '/communities/my-community'
    case 'like':
      return '/communities'
    case 'follow':
      return '/profile'
    case 'friend_request':
      return '/notifications'
    case 'system':
      return '/dashboard'
    default:
      return '/notifications'
  }
}

// Helper function to determine icon color based on notification type
function getIconColor(type: string): string {
  switch (type) {
    case 'message':
      return 'text-blue-500'
    case 'comment':
      return 'text-green-500'
    case 'mention':
      return 'text-purple-500'
    case 'like':
      return 'text-red-500'
    case 'follow':
      return 'text-blue-600'
    case 'friend_request':
      return 'text-green-500'
    case 'system':
      return 'text-yellow-500'
    default:
      return 'text-gray-500'
  }
}
