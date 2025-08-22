"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import type { Notification } from "@/types/notification"

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        type: dbNotif.type as Notification['type'] || 'system',
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

      setNotifications(transformedNotifications)
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

  // Fetch notifications when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    } else {
      setNotifications([])
      setLoading(false)
    }
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
